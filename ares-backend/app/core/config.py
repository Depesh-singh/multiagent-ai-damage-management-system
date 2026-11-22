"""Application configuration via pydantic-settings."""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loads settings from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ───────────────────────────────────────────────
    # Canonical SQLite path anchored to ares-backend directory; PostgreSQL when DATABASE_URL is explicitly set
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ares.db').replace('\\', '/')}"
    )

    # ── Redis ──────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379"

    # ── n8n Integration ────────────────────────────────────────
    N8N_BASE_URL: str = os.getenv("N8N_BASE_URL", "http://localhost:5678")
    N8N_WEBHOOK_URL: str = os.getenv(
        "N8N_WEBHOOK_URL", "http://localhost:5678/webhook/ares-emergency"
    )
    N8N_EVENT_WEBHOOK_URL: str = os.getenv(
        "N8N_EVENT_WEBHOOK_URL", "http://localhost:5678/webhook/ares-event"
    )

    # ── Auth / JWT ─────────────────────────────────────────────
    SECRET_KEY: str = "ares-emergency-super-secret-key-2026-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    # ── CORS ───────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:8501,http://127.0.0.1:3000,http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


settings = Settings()
