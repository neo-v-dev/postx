"""Media upload service."""
import logging
from pathlib import Path
from typing import Optional

from ..models import MediaItem

logger = logging.getLogger(__name__)

# Supported media types and size limits
MEDIA_LIMITS = {
    "image": {
        "extensions": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
        "max_size": 5 * 1024 * 1024,  # 5MB
    },
    "gif": {
        "extensions": [".gif"],
        "max_size": 15 * 1024 * 1024,  # 15MB
    },
    "video": {
        "extensions": [".mp4", ".mov"],
        "max_size": 512 * 1024 * 1024,  # 512MB
    },
}


class MediaService:
    """Service for handling media uploads."""

    def __init__(self, x_client, base_path: Optional[str] = None):
        self.x_client = x_client
        self.base_path = Path(base_path) if base_path else Path.cwd()

    def validate(self, media: MediaItem) -> tuple[bool, Optional[str]]:
        """Validate a media item.

        Returns:
            Tuple of (is_valid, error_message)
        """
        path = self.base_path / media.path

        if not path.exists():
            return False, f"File not found: {media.path}"

        ext = path.suffix.lower()
        limits = MEDIA_LIMITS.get(media.type)

        if not limits:
            return False, f"Unknown media type: {media.type}"

        if ext not in limits["extensions"]:
            return False, f"Invalid extension {ext} for type {media.type}"

        size = path.stat().st_size
        if size > limits["max_size"]:
            max_mb = limits["max_size"] / (1024 * 1024)
            return False, f"File too large: {size} bytes (max {max_mb}MB)"

        return True, None

    def upload(self, media: MediaItem) -> str:
        """Upload a single media item.

        Returns:
            The media ID
        """
        is_valid, error = self.validate(media)
        if not is_valid:
            raise ValueError(error)

        path = self.base_path / media.path
        return self.x_client.upload_media(str(path))

    def upload_all(self, media_list: list[MediaItem]) -> list[str]:
        """Upload all media items.

        Returns:
            List of media IDs
        """
        media_ids = []
        for media in media_list:
            media_id = self.upload(media)
            media_ids.append(media_id)
        return media_ids
