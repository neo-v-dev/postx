"""Rate limit management service."""
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from ..models import Stats

logger = logging.getLogger(__name__)


class LimitService:
    """Service for managing rate limits."""

    def __init__(
        self,
        stats: Stats,
        daily_limit: int = 17,
        monthly_limit: int = 500,
        timezone: str = "Asia/Tokyo"
    ):
        self.stats = stats
        self.daily_limit = daily_limit
        self.monthly_limit = monthly_limit
        self.tz = ZoneInfo(timezone)
        self._check_reset()

    def _check_reset(self) -> None:
        """Check and reset counters if needed."""
        now = datetime.now(self.tz)

        # Check daily reset
        daily_reset = self.stats.daily_reset_at
        if daily_reset.tzinfo is None:
            daily_reset = daily_reset.replace(tzinfo=self.tz)

        if now >= daily_reset:
            self.stats.daily_count = 0
            # Set next reset to tomorrow midnight
            tomorrow = now.date() + timedelta(days=1)
            self.stats.daily_reset_at = datetime.combine(
                tomorrow,
                datetime.min.time(),
                tzinfo=self.tz
            )
            logger.info("Daily counter reset")

        # Check monthly reset
        monthly_reset = self.stats.monthly_reset_at
        if monthly_reset.tzinfo is None:
            monthly_reset = monthly_reset.replace(tzinfo=self.tz)

        if now >= monthly_reset:
            self.stats.monthly_count = 0
            # Set next reset to 1st of next month
            if now.month == 12:
                next_month = datetime(now.year + 1, 1, 1, tzinfo=self.tz)
            else:
                next_month = datetime(now.year, now.month + 1, 1, tzinfo=self.tz)
            self.stats.monthly_reset_at = next_month
            logger.info("Monthly counter reset")

    def can_post(self) -> bool:
        """Check if posting is allowed within limits."""
        self._check_reset()

        if self.stats.daily_count >= self.daily_limit:
            logger.warning(f"Daily limit reached: {self.stats.daily_count}/{self.daily_limit}")
            return False

        if self.stats.monthly_count >= self.monthly_limit:
            logger.warning(f"Monthly limit reached: {self.stats.monthly_count}/{self.monthly_limit}")
            return False

        return True

    def increment(self) -> None:
        """Increment the post counters."""
        self.stats.daily_count += 1
        self.stats.monthly_count += 1
        logger.debug(f"Post count: daily={self.stats.daily_count}, monthly={self.stats.monthly_count}")

    def get_remaining(self) -> dict:
        """Get remaining post counts."""
        self._check_reset()
        return {
            "daily": self.daily_limit - self.stats.daily_count,
            "monthly": self.monthly_limit - self.stats.monthly_count,
        }
