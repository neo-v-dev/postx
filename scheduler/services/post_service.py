"""Post processing service."""
import logging
from datetime import datetime
from typing import Optional
from zoneinfo import ZoneInfo

from ..models import Post, PostStatus, PostType, HistoryEntry, PostsData
from .x_api_client import XApiClient
from .media_service import MediaService
from .limit_service import LimitService

logger = logging.getLogger(__name__)


class PostResult:
    """Result of a post operation."""

    def __init__(
        self,
        post_id: str,
        success: bool,
        tweet_id: Optional[str] = None,
        error: Optional[str] = None
    ):
        self.post_id = post_id
        self.success = success
        self.tweet_id = tweet_id
        self.error = error


class PostService:
    """Service for processing scheduled posts."""

    def __init__(
        self,
        x_client: XApiClient,
        media_service: MediaService,
        limit_service: LimitService,
        timezone: str = "Asia/Tokyo"
    ):
        self.x_client = x_client
        self.media_service = media_service
        self.limit_service = limit_service
        self.tz = ZoneInfo(timezone)

    def get_due_posts(self, posts: list[Post]) -> list[Post]:
        """Get posts that are due for execution."""
        now = datetime.now(self.tz)
        due_posts = []

        for post in posts:
            if post.status != PostStatus.PENDING:
                continue

            # Make scheduled_at timezone-aware if needed
            scheduled_at = post.scheduled_at
            if scheduled_at.tzinfo is None:
                scheduled_at = scheduled_at.replace(tzinfo=self.tz)

            if scheduled_at <= now:
                due_posts.append(post)

        return due_posts

    def execute_post(self, post: Post, dry_run: bool = False) -> PostResult:
        """Execute a single post.

        Args:
            post: The post to execute
            dry_run: If True, don't actually post

        Returns:
            PostResult with execution status
        """
        try:
            # Check limits
            if not self.limit_service.can_post():
                return PostResult(
                    post_id=post.id,
                    success=False,
                    error="Daily or monthly limit exceeded"
                )

            if dry_run:
                logger.info(f"[DRY RUN] Would post: {post.id}")
                return PostResult(post_id=post.id, success=True, tweet_id="dry-run")

            # Execute based on type
            if post.type == PostType.TWEET:
                tweet_id = self._execute_tweet(post)
            elif post.type == PostType.THREAD:
                tweet_id = self._execute_thread(post)
            elif post.type == PostType.REPOST:
                tweet_id = self._execute_repost(post)
            else:
                raise ValueError(f"Unknown post type: {post.type}")

            # Update limit
            self.limit_service.increment()

            return PostResult(post_id=post.id, success=True, tweet_id=tweet_id)

        except Exception as e:
            logger.error(f"Failed to execute post {post.id}: {e}")
            return PostResult(post_id=post.id, success=False, error=str(e))

    def _execute_tweet(self, post: Post) -> str:
        """Execute a single tweet."""
        media_ids = None
        if post.media:
            media_ids = self.media_service.upload_all(post.media)

        return self.x_client.post_tweet(text=post.text, media_ids=media_ids)

    def _execute_thread(self, post: Post) -> str:
        """Execute a thread."""
        if not post.thread:
            raise ValueError("Thread post has no thread items")

        items = []
        for item in post.thread:
            media_ids = None
            if item.media:
                media_ids = self.media_service.upload_all(item.media)
            items.append({"text": item.text, "media_ids": media_ids})

        tweet_ids = self.x_client.post_thread(items)
        return tweet_ids[0] if tweet_ids else None

    def _execute_repost(self, post: Post) -> str:
        """Execute a repost."""
        if not post.target_tweet_id:
            raise ValueError("Repost has no target tweet ID")

        self.x_client.repost(post.target_tweet_id)
        return post.target_tweet_id

    def update_post_status(
        self,
        data: PostsData,
        result: PostResult,
        retry_max: int = 3
    ) -> None:
        """Update post status based on result."""
        for post in data.posts:
            if post.id != result.post_id:
                continue

            post.updated_at = datetime.now(self.tz)

            if result.success:
                post.status = PostStatus.POSTED
                post.posted_tweet_id = result.tweet_id
            else:
                post.retry_count += 1
                post.error_message = result.error

                if post.retry_count >= retry_max:
                    post.status = PostStatus.FAILED
                # Keep as pending for retry

            # Add history entry
            data.history.append(HistoryEntry(
                post_id=post.id,
                action="posted" if result.success else "failed",
                tweet_id=result.tweet_id,
                error=result.error
            ))
            break
