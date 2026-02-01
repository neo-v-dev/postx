"""Repeat post handling service."""
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import uuid

from ..models import Post, PostStatus, RepeatConfig, RepeatType

logger = logging.getLogger(__name__)

WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


class RepeatService:
    """Service for handling repeat posts."""

    def __init__(self, timezone: str = "Asia/Tokyo"):
        self.tz = ZoneInfo(timezone)

    def calculate_next(self, repeat: RepeatConfig, from_date: datetime) -> datetime | None:
        """Calculate the next scheduled time for a repeat config.

        Returns:
            Next datetime or None if repeat is complete
        """
        # Check end conditions
        if repeat.end_date:
            end = datetime.fromisoformat(repeat.end_date)
            if end.tzinfo is None:
                end = end.replace(tzinfo=self.tz)
            if from_date >= end:
                return None

        if repeat.end_count and repeat.executed_count >= repeat.end_count:
            return None

        # Parse time
        hour, minute = map(int, repeat.time.split(":"))

        if repeat.type == RepeatType.DAILY:
            next_date = from_date.date() + timedelta(days=1)
            return datetime.combine(next_date, datetime.min.time().replace(hour=hour, minute=minute), tzinfo=self.tz)

        elif repeat.type == RepeatType.WEEKLY:
            if not repeat.days:
                return None

            current_weekday = from_date.weekday()
            target_weekdays = [WEEKDAYS.index(d.lower()) for d in repeat.days]

            # Find next weekday
            for i in range(1, 8):
                check_day = (current_weekday + i) % 7
                if check_day in target_weekdays:
                    next_date = from_date.date() + timedelta(days=i)
                    return datetime.combine(next_date, datetime.min.time().replace(hour=hour, minute=minute), tzinfo=self.tz)

            return None

        elif repeat.type == RepeatType.MONTHLY:
            if not repeat.day_of_month:
                return None

            # Next month
            year = from_date.year
            month = from_date.month + 1
            if month > 12:
                month = 1
                year += 1

            # Handle months with fewer days
            day = min(repeat.day_of_month, 28)  # Safe default
            try:
                next_date = datetime(year, month, repeat.day_of_month, hour, minute, tzinfo=self.tz)
            except ValueError:
                # Day doesn't exist in month, use last day
                if month == 12:
                    next_month = datetime(year + 1, 1, 1, tzinfo=self.tz)
                else:
                    next_month = datetime(year, month + 1, 1, tzinfo=self.tz)
                next_date = next_month - timedelta(days=1)
                next_date = next_date.replace(hour=hour, minute=minute)

            return next_date

        return None

    def generate_next_post(self, original: Post) -> Post | None:
        """Generate the next repeat post.

        Returns:
            New post or None if repeat is complete
        """
        if not original.repeat:
            return None

        next_time = self.calculate_next(original.repeat, original.scheduled_at)
        if not next_time:
            return None

        # Create new post
        new_post = Post(
            id=str(uuid.uuid4()),
            type=original.type,
            status=PostStatus.PENDING,
            scheduled_at=next_time,
            text=original.text,
            media=original.media,
            thread=original.thread,
            target_tweet_id=original.target_tweet_id,
            repeat=RepeatConfig(
                type=original.repeat.type,
                days=original.repeat.days,
                day_of_month=original.repeat.day_of_month,
                time=original.repeat.time,
                end_date=original.repeat.end_date,
                end_count=original.repeat.end_count,
                executed_count=original.repeat.executed_count + 1
            )
        )

        logger.info(f"Generated next repeat post: {new_post.id} at {next_time}")
        return new_post
