"""
Application configuration via pydantic-settings.

Design decision: All configuration flows through this single module.
Environment variables are the source of truth, with sensible defaults
for local development. This avoids scattered os.getenv() calls and
provides type validation at startup.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class LLMProvider(str, Enum):
    OPENAI = "openai"
    OLLAMA = "ollama"


class Settings(BaseSettings):
    """
    Central configuration. All values can be overridden via environment
    variables (case-insensitive). See .env.example for documentation.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ──────────────────────────────────────────────
    environment: Environment = Environment.DEVELOPMENT
    log_level: str = "INFO"

    # ── Database ─────────────────────────────────────────────────
    postgres_user: str = "lenny"
    postgres_password: str = "lenny_dev_password"
    postgres_db: str = "lenny_growth"
    postgres_host: str = "db"
    postgres_port: int = 5432

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def database_url_sync(self) -> str:
        """Sync URL for Alembic migrations."""
        return (
            f"postgresql://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    # ── OpenAI ───────────────────────────────────────────────────
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    # ── Ollama ───────────────────────────────────────────────────
    ollama_base_url: str = "http://ollama:11434"
    ollama_chat_model: str = "llama3.1:8b"
    ollama_embedding_model: str = "nomic-embed-text"

    # ── LLM Provider ─────────────────────────────────────────────
    default_llm_provider: LLMProvider = LLMProvider.OPENAI
    llm_fallback_enabled: bool = True

    # ── RAG ──────────────────────────────────────────────────────
    chunk_size: int = 800
    chunk_overlap: int = 100
    retrieval_top_k: int = 20
    rerank_top_k: int = 5
    min_similarity_threshold: float = 0.3

    # ── Application ──────────────────────────────────────────────
    backend_port: int = 8000
    frontend_port: int = 3000

    @property
    def is_openai_configured(self) -> bool:
        return bool(self.openai_api_key and self.openai_api_key != "sk-your-openai-api-key-here")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Cached settings singleton. Call this instead of constructing
    Settings() directly to avoid re-reading env on every request.
    """
    return Settings()
