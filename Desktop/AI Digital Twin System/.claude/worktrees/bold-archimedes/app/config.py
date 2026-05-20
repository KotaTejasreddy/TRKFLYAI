"""Application configuration via pydantic-settings."""

from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class LLMProvider(str, Enum):
    CLAUDE = "claude"
    OPENAI = "openai"


class VectorDBProvider(str, Enum):
    CHROMA = "chroma"
    QDRANT = "qdrant"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # App
    app_env: Environment = Environment.DEVELOPMENT
    app_debug: bool = False
    app_secret_key: str = "change-me"

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/digital_twin"
    database_echo: bool = False

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # LLM
    anthropic_api_key: str = ""
    openai_api_key: str = ""
    default_llm_provider: LLMProvider = LLMProvider.CLAUDE
    default_model: str = "claude-sonnet-4-20250514"

    # Vector DB
    vector_db_provider: VectorDBProvider = VectorDBProvider.CHROMA
    chroma_persist_dir: str = "./data/chroma"
    qdrant_url: str = "http://localhost:6333"

    # Embeddings
    embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536

    # Auth
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60

    # Rate limiting
    rate_limit_per_minute: int = 30

    @property
    def is_production(self) -> bool:
        return self.app_env == Environment.PRODUCTION


@lru_cache
def get_settings() -> Settings:
    return Settings()
