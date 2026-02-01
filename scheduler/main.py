"""Main entry point for the X scheduler."""
import logging
import sys
from datetime import datetime
from pathlib import Path

# Load .env file if exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, use system env vars

from .config import SchedulerConfig
from .models import PostStatus
from .services.x_api_client import XApiClient, XCredentials
from .services.post_service import PostService
from .services.media_service import MediaService
from .services.limit_service import LimitService
from .services.repeat_service import RepeatService
from .utils.datetime_utils import now

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)


def should_run(config: SchedulerConfig) -> bool:
    """Check if scheduler should run based on interval settings."""
    interval = config.config.interval_minutes
    current = now(config.config.timezone)

    # Check if current minute aligns with interval
    if current.minute % interval != 0:
        logger.info(f"Skipping: current minute {current.minute} not aligned with {interval}-minute interval")
        return False

    return True


def main() -> int:
    """Main scheduler function.

    Returns:
        Exit code (0 for success, 1 for error)
    """
    logger.info("Starting X Scheduler")

    try:
        # Load configuration
        config = SchedulerConfig()
        config.load()
        logger.info(f"Loaded {len(config.data.posts)} posts")

        # Check if should run
        if not should_run(config):
            return 0

        # Check for dry run
        dry_run = config.is_dry_run()
        if dry_run:
            logger.info("Running in DRY RUN mode")

        # Get credentials
        creds = config.get_env_credentials()
        if not all([creds["consumer_key"], creds["consumer_secret"],
                    creds["access_token"], creds["access_token_secret"]]):
            logger.error("Missing X API credentials. Required: X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET")
            return 1

        # Initialize services
        x_credentials = XCredentials(
            consumer_key=creds["consumer_key"],
            consumer_secret=creds["consumer_secret"],
            access_token=creds["access_token"],
            access_token_secret=creds["access_token_secret"]
        )
        x_client = XApiClient(x_credentials)
        media_service = MediaService(x_client)
        limit_service = LimitService(
            stats=config.data.stats,
            daily_limit=config.config.daily_limit,
            monthly_limit=config.config.monthly_limit,
            timezone=config.config.timezone
        )
        post_service = PostService(
            x_client=x_client,
            media_service=media_service,
            limit_service=limit_service,
            timezone=config.config.timezone
        )
        repeat_service = RepeatService(timezone=config.config.timezone)

        # Get due posts
        due_posts = post_service.get_due_posts(config.data.posts)
        logger.info(f"Found {len(due_posts)} due posts")

        if not due_posts:
            logger.info("No posts to process")
            return 0

        # Process each post
        for post in due_posts:
            logger.info(f"Processing post: {post.id} (type={post.type})")

            result = post_service.execute_post(post, dry_run=dry_run)
            post_service.update_post_status(
                config.data,
                result,
                retry_max=config.config.retry_max
            )

            # Generate next repeat post if applicable
            if result.success and post.repeat:
                next_post = repeat_service.generate_next_post(post)
                if next_post:
                    config.data.posts.append(next_post)

        # Save changes
        config.save()
        logger.info("Saved updated posts data")

        return 0

    except Exception as e:
        logger.exception(f"Scheduler error: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
