"""Configuration management for the X scheduler."""
import json
import os
from pathlib import Path
from typing import Optional

from .models import PostsData, Config, Stats


class SchedulerConfig:
    """Scheduler configuration manager."""

    def __init__(self, data_path: Optional[str] = None):
        """Initialize scheduler config.

        Args:
            data_path: Path to posts.json. If None, uses default path.
        """
        self.data_path = Path(data_path or self._get_default_path())
        self._data: Optional[PostsData] = None

    @staticmethod
    def _get_default_path() -> str:
        """Get the default path for posts.json.

        Returns:
            Absolute path to data/posts.json
        """
        # Look for data/posts.json relative to project root
        current = Path(__file__).parent.parent
        return str(current / "data" / "posts.json")

    def load(self) -> PostsData:
        """Load posts data from file.

        Returns:
            Validated PostsData instance

        Raises:
            FileNotFoundError: If data file does not exist
            ValidationError: If data validation fails
        """
        if not self.data_path.exists():
            raise FileNotFoundError(f"Data file not found: {self.data_path}")

        with open(self.data_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        self._data = PostsData.model_validate(raw_data)
        return self._data

    def save(self) -> None:
        """Save posts data to file.

        Raises:
            ValueError: If no data has been loaded
        """
        if self._data is None:
            raise ValueError("No data to save. Call load() first.")

        with open(self.data_path, "w", encoding="utf-8") as f:
            json.dump(
                self._data.model_dump(mode="json"),
                f,
                indent=2,
                ensure_ascii=False,
                default=str
            )

    @property
    def data(self) -> PostsData:
        """Get the loaded data.

        Returns:
            PostsData instance
        """
        if self._data is None:
            self.load()
        return self._data

    @property
    def config(self) -> Config:
        """Get the config section.

        Returns:
            Config instance
        """
        return self.data.config

    def get_env_credentials(self) -> dict:
        """Get X API credentials from environment variables.

        Returns:
            Dictionary with OAuth 1.0a credentials for tweepy
        """
        return {
            # OAuth 1.0a (required for posting)
            "consumer_key": os.environ.get("X_API_KEY", ""),
            "consumer_secret": os.environ.get("X_API_KEY_SECRET", ""),
            "access_token": os.environ.get("X_ACCESS_TOKEN", ""),
            "access_token_secret": os.environ.get("X_ACCESS_TOKEN_SECRET", ""),
        }

    def is_dry_run(self) -> bool:
        """Check if running in dry run mode.

        Returns:
            True if DRY_RUN environment variable is set to "true"
        """
        return os.environ.get("DRY_RUN", "false").lower() == "true"
