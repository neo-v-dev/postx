"""X API client wrapper using tweepy."""
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import tweepy
from tweepy.errors import TweepyException

logger = logging.getLogger(__name__)


@dataclass
class XCredentials:
    """X API credentials for OAuth 1.0a."""
    consumer_key: str
    consumer_secret: str
    access_token: str
    access_token_secret: str


class XApiError(Exception):
    """X API operation error."""
    pass


class XApiClient:
    """X API v2 client wrapper with comprehensive error handling."""

    def __init__(self, credentials: XCredentials):
        """Initialize X API client.

        Args:
            credentials: X API OAuth 1.0a credentials
        """
        self.credentials = credentials
        self._client: Optional[tweepy.Client] = None
        self._api: Optional[tweepy.API] = None

    def _get_client(self) -> tweepy.Client:
        """Get or create the tweepy Client (for v2 API)."""
        if self._client is None:
            try:
                self._client = tweepy.Client(
                    consumer_key=self.credentials.consumer_key,
                    consumer_secret=self.credentials.consumer_secret,
                    access_token=self.credentials.access_token,
                    access_token_secret=self.credentials.access_token_secret,
                    wait_on_rate_limit=True
                )
                logger.debug("Initialized tweepy Client")
            except Exception as e:
                logger.error(f"Failed to initialize tweepy Client: {e}")
                raise XApiError(f"Client initialization failed: {e}") from e
        return self._client

    def _get_api(self) -> tweepy.API:
        """Get or create the tweepy API (for v1.1 media upload)."""
        if self._api is None:
            try:
                auth = tweepy.OAuth1UserHandler(
                    consumer_key=self.credentials.consumer_key,
                    consumer_secret=self.credentials.consumer_secret,
                    access_token=self.credentials.access_token,
                    access_token_secret=self.credentials.access_token_secret
                )
                self._api = tweepy.API(auth, wait_on_rate_limit=True)
                logger.debug("Initialized tweepy API")
            except Exception as e:
                logger.error(f"Failed to initialize tweepy API: {e}")
                raise XApiError(f"API initialization failed: {e}") from e
        return self._api

    def post_tweet(
        self,
        text: str,
        media_ids: Optional[list[str]] = None,
        reply_to: Optional[str] = None
    ) -> str:
        """Post a tweet.

        Args:
            text: Tweet text (max 280 characters)
            media_ids: List of media IDs to attach (max 4)
            reply_to: Tweet ID to reply to (for threads)

        Returns:
            The posted tweet ID

        Raises:
            XApiError: If posting fails
            ValueError: If parameters are invalid
        """
        if not text or len(text) > 280:
            raise ValueError(f"Tweet text must be 1-280 characters, got {len(text)}")

        if media_ids and len(media_ids) > 4:
            raise ValueError(f"Maximum 4 media items allowed, got {len(media_ids)}")

        client = self._get_client()

        try:
            kwargs = {"text": text}
            if media_ids:
                kwargs["media_ids"] = media_ids
            if reply_to:
                kwargs["in_reply_to_tweet_id"] = reply_to

            logger.debug(f"Posting tweet: text_len={len(text)}, media={len(media_ids or [])}, reply_to={reply_to}")
            response = client.create_tweet(**kwargs)
            tweet_id = str(response.data["id"])
            logger.info(f"Posted tweet: {tweet_id} (text: {text[:50]}...)")
            return tweet_id

        except TweepyException as e:
            logger.error(f"Failed to post tweet: {e}, text: {text[:50]}...")
            raise XApiError(f"Tweet posting failed: {e}") from e

    def post_thread(self, items: list[dict]) -> list[str]:
        """Post a thread of tweets.

        Args:
            items: List of dicts with 'text' and optional 'media_ids'
                   Example: [{"text": "...", "media_ids": ["..."]}]

        Returns:
            List of posted tweet IDs in order

        Raises:
            XApiError: If posting fails
            ValueError: If items structure is invalid
        """
        if not items:
            raise ValueError("Thread must contain at least one item")

        tweet_ids = []
        reply_to = None

        for idx, item in enumerate(items, 1):
            if "text" not in item:
                raise ValueError(f"Thread item {idx} missing 'text' field")

            try:
                tweet_id = self.post_tweet(
                    text=item["text"],
                    media_ids=item.get("media_ids"),
                    reply_to=reply_to
                )
                tweet_ids.append(tweet_id)
                reply_to = tweet_id

            except XApiError as e:
                logger.error(f"Thread posting failed at item {idx}/{len(items)}: {e}")
                # Rollback: delete successfully posted tweets
                for tid in tweet_ids:
                    try:
                        self.delete_tweet(tid)
                        logger.info(f"Rolled back tweet: {tid}")
                    except Exception as rollback_err:
                        logger.warning(f"Failed to rollback tweet {tid}: {rollback_err}")
                raise XApiError(f"Thread posting failed at item {idx}: {e}") from e

        logger.info(f"Posted thread with {len(tweet_ids)} tweets: {tweet_ids}")
        return tweet_ids

    def repost(self, tweet_id: str) -> bool:
        """Repost (retweet) a tweet.

        Args:
            tweet_id: The tweet ID to repost

        Returns:
            True if successful

        Raises:
            XApiError: If reposting fails
        """
        if not tweet_id:
            raise ValueError("tweet_id cannot be empty")

        client = self._get_client()

        try:
            # Get authenticated user ID
            me = client.get_me()
            user_id = me.data.id

            client.retweet(tweet_id=tweet_id, user_auth=True)
            logger.info(f"Reposted tweet: {tweet_id} by user {user_id}")
            return True

        except TweepyException as e:
            logger.error(f"Failed to repost tweet {tweet_id}: {e}")
            raise XApiError(f"Repost failed: {e}") from e

    def upload_media(self, file_path: str) -> str:
        """Upload media file.

        Args:
            file_path: Path to the media file

        Returns:
            The media ID string

        Raises:
            XApiError: If upload fails
            FileNotFoundError: If file doesn't exist
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Media file not found: {file_path}")

        # Validate file size (X API limit: 5MB for images, 512MB for videos)
        file_size = path.stat().st_size
        if file_size > 512 * 1024 * 1024:  # 512MB
            raise ValueError(f"File too large: {file_size} bytes (max 512MB)")

        api = self._get_api()

        try:
            logger.debug(f"Uploading media: {file_path} ({file_size} bytes)")
            media = api.media_upload(filename=str(path))
            media_id = str(media.media_id)
            logger.info(f"Uploaded media: {media_id} from {path.name}")
            return media_id

        except TweepyException as e:
            logger.error(f"Failed to upload media {file_path}: {e}")
            raise XApiError(f"Media upload failed: {e}") from e

    def delete_tweet(self, tweet_id: str) -> bool:
        """Delete a tweet.

        Args:
            tweet_id: The tweet ID to delete

        Returns:
            True if successful

        Raises:
            XApiError: If deletion fails
        """
        if not tweet_id:
            raise ValueError("tweet_id cannot be empty")

        client = self._get_client()

        try:
            client.delete_tweet(id=tweet_id, user_auth=True)
            logger.info(f"Deleted tweet: {tweet_id}")
            return True

        except TweepyException as e:
            logger.error(f"Failed to delete tweet {tweet_id}: {e}")
            raise XApiError(f"Tweet deletion failed: {e}") from e
