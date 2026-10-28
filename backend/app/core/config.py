from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Движок БД: "sqlite" или "mssql"
    DB_ENGINE: str = "sqlite"

    # Параметры для SQLite
    DB_PATH: Optional[str] = "./digital_concierge.db"

    DB_SERVER: Optional[str] = None
    DB_NAME: Optional[str] = None
    DB_USER: Optional[str] = None
    DB_PASSWORD: Optional[str] = None
    DB_DRIVER: Optional[str] = "ODBC Driver 17 for SQL Server"

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    model_config = ConfigDict(env_file=".env", extra="ignore")

settings = Settings()