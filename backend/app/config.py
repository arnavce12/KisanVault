from pydantic_settings import BaseSettings
from functools import lru_cache
from pathlib import Path

# Resolve .env from the project root (one level above this file's package)
_BASE_DIR = Path(__file__).resolve().parent.parent
_ENV_FILE = _BASE_DIR.parent / ".env"  # c:\KisanVault\.env
if not _ENV_FILE.exists():
    _ENV_FILE = _BASE_DIR / ".env"  # fallback: c:\KisanVault\backend\.env


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./kisanvault.db"

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # AI / LLM
    GROQ_API_KEY: str = ""

    # Pinecone
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "kisanvault"

    # Embedding model
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # CORS
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]

    class Config:
        env_file = str(_ENV_FILE)
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
