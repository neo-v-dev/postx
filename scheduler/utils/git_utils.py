"""Git utilities for the scheduler."""
import logging
import subprocess
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


def run_git_command(
    args: list[str],
    cwd: Optional[str] = None
) -> tuple[bool, str]:
    """Run a git command.

    Args:
        args: Git command arguments (without 'git')
        cwd: Working directory

    Returns:
        Tuple of (success, output)
    """
    try:
        result = subprocess.run(
            ["git"] + args,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        return True, result.stdout.strip()
    except subprocess.CalledProcessError as e:
        logger.error(f"Git command failed: {e.stderr}")
        return False, e.stderr.strip()


def commit_changes(
    file_path: str,
    message: str,
    cwd: Optional[str] = None
) -> bool:
    """Stage and commit changes to a file.

    Args:
        file_path: Path to the file to commit
        message: Commit message
        cwd: Working directory

    Returns:
        True if successful
    """
    # Stage the file
    success, _ = run_git_command(["add", file_path], cwd=cwd)
    if not success:
        return False

    # Check if there are changes to commit
    success, output = run_git_command(["diff", "--staged", "--quiet"], cwd=cwd)
    if success:
        # No changes to commit
        logger.info("No changes to commit")
        return True

    # Commit
    success, _ = run_git_command(["commit", "-m", message], cwd=cwd)
    return success


def push_changes(cwd: Optional[str] = None) -> bool:
    """Push changes to remote.

    Args:
        cwd: Working directory

    Returns:
        True if successful
    """
    success, _ = run_git_command(["push"], cwd=cwd)
    return success


def get_repo_root(cwd: Optional[str] = None) -> Optional[str]:
    """Get the repository root directory.

    Returns:
        Path to repo root or None if not in a git repo
    """
    success, output = run_git_command(
        ["rev-parse", "--show-toplevel"],
        cwd=cwd
    )
    return output if success else None
