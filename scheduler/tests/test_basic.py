"""Basic tests for scheduler module."""


def test_import_main():
    """Test that main module can be imported."""
    from scheduler import main
    assert main is not None


def test_import_config():
    """Test that config module can be imported."""
    from scheduler import config
    assert config is not None


def test_import_models():
    """Test that models module can be imported."""
    from scheduler import models
    assert models is not None
