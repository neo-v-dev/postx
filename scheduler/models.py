"""Data models for the X scheduler."""
from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
import uuid


class PostType(str, Enum):
    """Post type enumeration."""
    TWEET = "tweet"
    THREAD = "thread"
    REPOST = "repost"


class PostStatus(str, Enum):
    """Post status enumeration."""
    PENDING = "pending"
    POSTING = "posting"
    POSTED = "posted"
    FAILED = "failed"
    CANCELLED = "cancelled"


class RepeatType(str, Enum):
    """Repeat type enumeration."""
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class MediaItem(BaseModel):
    """Media item model (image/video/gif)."""
    type: str = Field(..., pattern="^(image|video|gif)$")
    path: str
    media_id: Optional[str] = None


class ThreadItem(BaseModel):
    """Thread item model."""
    text: str = Field(..., max_length=280)
    media: list[MediaItem] = Field(default_factory=list)
    posted_tweet_id: Optional[str] = None


class RepeatConfig(BaseModel):
    """Repeat configuration model."""
    type: RepeatType
    days: Optional[list[str]] = None  # For weekly: ["monday", "friday"]
    day_of_month: Optional[int] = Field(None, ge=1, le=31)
    time: str  # "HH:MM" format
    end_date: Optional[str] = None
    end_count: Optional[int] = None
    executed_count: int = 0


class Post(BaseModel):
    """Post model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: PostType
    status: PostStatus = PostStatus.PENDING
    scheduled_at: datetime
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # For tweet/thread
    text: Optional[str] = Field(None, max_length=280)
    media: list[MediaItem] = Field(default_factory=list)

    # For thread
    thread: Optional[list[ThreadItem]] = None

    # For repost
    target_tweet_id: Optional[str] = None

    # For repeat
    repeat: Optional[RepeatConfig] = None

    # Execution info
    retry_count: int = 0
    error_message: Optional[str] = None
    posted_tweet_id: Optional[str] = None


class Config(BaseModel):
    """Configuration model."""
    timezone: str = "Asia/Tokyo"
    interval_minutes: int = Field(15, ge=5, le=60)
    daily_limit: int = 17
    monthly_limit: int = 500
    retry_max: int = 3


class Stats(BaseModel):
    """Statistics model."""
    daily_count: int = 0
    daily_reset_at: datetime
    monthly_count: int = 0
    monthly_reset_at: datetime


class HistoryEntry(BaseModel):
    """History entry model."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    post_id: str
    action: str = Field(..., pattern="^(posted|failed|cancelled)$")
    executed_at: datetime = Field(default_factory=datetime.now)
    tweet_id: Optional[str] = None
    error: Optional[str] = None


class PostsData(BaseModel):
    """Root data model."""
    config: Config
    posts: list[Post] = Field(default_factory=list)
    history: list[HistoryEntry] = Field(default_factory=list)
    stats: Stats
