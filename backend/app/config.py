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
    # Payments (Razorpay)
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    MOCK_PAYMENTS: bool = False        # set True to simulate successful payments without Razorpay
    TRIAL_DAYS: int = 3
    # Google Sign-In — OAuth 2.0 Client ID from console.cloud.google.com
    GOOGLE_CLIENT_ID: str = ""
    # Admin gate — JWT user with this email can access /admin/stats
    ADMIN_EMAIL: str = ""

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
