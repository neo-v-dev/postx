"""Datetime utilities for the scheduler."""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Optional


def now(timezone: str = "Asia/Tokyo") -> datetime:
    """Get current datetime in specified timezone."""
    tz = ZoneInfo(timezone)
    return datetime.now(tz)


def parse_datetime(dt_str: str, timezone: str = "Asia/Tokyo") -> datetime:
    """Parse an ISO format datetime string.

    Args:
        dt_str: ISO format datetime string
        timezone: Default timezone if not specified in string

    Returns:
        Timezone-aware datetime
    """
    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(timezone))
    return dt


def format_datetime(dt: datetime, fmt: str = "%Y-%m-%d %H:%M:%S %Z") -> str:
    """Format a datetime object."""
    return dt.strftime(fmt)


def is_past(dt: datetime, timezone: str = "Asia/Tokyo") -> bool:
    """Check if a datetime is in the past."""
    current = now(timezone)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo(timezone))
    return dt <= current


def add_minutes(dt: datetime, minutes: int) -> datetime:
    """Add minutes to a datetime."""
    return dt + timedelta(minutes=minutes)


def get_next_interval(
    interval_minutes: int,
    timezone: str = "Asia/Tokyo"
) -> datetime:
    """Get the next interval time (rounded up to interval)."""
    current = now(timezone)
    minute = current.minute
    next_minute = ((minute // interval_minutes) + 1) * interval_minutes

    if next_minute >= 60:
        return current.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)

    return current.replace(minute=next_minute, second=0, microsecond=0)
