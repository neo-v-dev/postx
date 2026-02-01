"""X API authentication test script."""
import os
import sys
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

# Load .env file
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                os.environ[key] = value

import tweepy
from tweepy.errors import TweepyException
from dataclasses import dataclass


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
    """Minimal X API client for testing."""

    def __init__(self, credentials: XCredentials):
        self.credentials = credentials
        self._client = None

    def _get_client(self) -> tweepy.Client:
        if self._client is None:
            self._client = tweepy.Client(
                consumer_key=self.credentials.consumer_key,
                consumer_secret=self.credentials.consumer_secret,
                access_token=self.credentials.access_token,
                access_token_secret=self.credentials.access_token_secret,
                wait_on_rate_limit=True
            )
        return self._client


def test_auth():
    """Test X API authentication."""
    print("=" * 50)
    print("X API Authentication Test")
    print("=" * 50)

    # Check environment variables
    required_vars = [
        "X_API_KEY",
        "X_API_KEY_SECRET",
        "X_ACCESS_TOKEN",
        "X_ACCESS_TOKEN_SECRET"
    ]

    print("\n[1] Checking environment variables...")
    missing = []
    for var in required_vars:
        value = os.environ.get(var, "")
        if not value or value.startswith("your_"):
            missing.append(var)
            print(f"  ❌ {var}: NOT SET")
        else:
            masked = value[:4] + "..." + value[-4:] if len(value) > 8 else "****"
            print(f"  ✅ {var}: {masked}")

    if missing:
        print(f"\n❌ Missing credentials: {', '.join(missing)}")
        print("Please set these in .env file")
        return False

    # Create credentials
    print("\n[2] Creating API client...")
    credentials = XCredentials(
        consumer_key=os.environ["X_API_KEY"],
        consumer_secret=os.environ["X_API_KEY_SECRET"],
        access_token=os.environ["X_ACCESS_TOKEN"],
        access_token_secret=os.environ["X_ACCESS_TOKEN_SECRET"]
    )

    client = XApiClient(credentials)

    # Test authentication by getting current user
    print("\n[3] Testing authentication (get current user)...")
    try:
        tweepy_client = client._get_client()
        me = tweepy_client.get_me(user_fields=["username", "name", "created_at"])

        if me.data:
            print(f"  ✅ Authenticated as: @{me.data.username}")
            print(f"     Name: {me.data.name}")
            print(f"     User ID: {me.data.id}")
            print(f"     Created: {me.data.created_at}")
        else:
            print("  ❌ Could not get user data")
            return False

    except XApiError as e:
        print(f"  ❌ API Error: {e}")
        return False
    except Exception as e:
        print(f"  ❌ Unexpected error: {e}")
        return False

    print("\n" + "=" * 50)
    print("✅ Authentication successful!")
    print("=" * 50)
    return True


if __name__ == "__main__":
    sys.exit(0 if test_auth() else 1)
