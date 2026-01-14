"""User settings configuration service."""
import yaml
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

# Data directory for user settings
DATA_DIR = Path(__file__).parent.parent.parent.parent / "data"
CONFIG_FILE = DATA_DIR / "settings.yaml"


class UserSettings(BaseModel):
    """User preferences model."""
    user_name: str = "User"
    wallpaper: str = "default-1"
    dock_apps: list[str] = []
    theme: str = "dark"


def ensure_data_dir() -> None:
    """Ensure the data directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_settings() -> UserSettings:
    """Load user settings from YAML file."""
    if not CONFIG_FILE.exists():
        return UserSettings()

    try:
        with open(CONFIG_FILE, 'r') as f:
            data = yaml.safe_load(f) or {}
        return UserSettings(**data)
    except Exception:
        return UserSettings()


def save_settings(settings: UserSettings) -> None:
    """Save user settings to YAML file."""
    ensure_data_dir()
    with open(CONFIG_FILE, 'w') as f:
        yaml.dump(settings.model_dump(), f, default_flow_style=False)


def update_settings(updates: dict) -> UserSettings:
    """Update specific settings fields."""
    current = get_settings()
    updated_data = current.model_dump()
    updated_data.update(updates)
    new_settings = UserSettings(**updated_data)
    save_settings(new_settings)
    return new_settings
