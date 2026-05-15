from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGO_URI: str = "mongodb://localhost:27017"
    DB_NAME: str = "TRKFLY_ai"
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]
    APP_ENV: str = "development"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    JWT_SECRET: str = ""
    RATE_LIMIT_PER_MIN: int = 60
    RATE_LIMIT_AI_PER_MIN: int = 15

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
