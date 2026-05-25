import os


class Settings:
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./ignitenow.db")
    admin_token: str = os.getenv("ADMIN_TOKEN", "demo-admin-token")
    static_base_url: str = os.getenv("STATIC_BASE_URL", "http://localhost:8000/static")


settings = Settings()
