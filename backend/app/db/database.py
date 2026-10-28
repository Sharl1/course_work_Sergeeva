from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings
import urllib

# --- Фабрика URL в зависимости от движка ---
def build_database_url() -> str:
    if settings.DB_ENGINE == "sqlite":
        # check_same_thread=False нужен для FastAPI (многопоточность)
        return f"sqlite:///{settings.DB_PATH}"

    elif settings.DB_ENGINE == "mssql":
        params = urllib.parse.quote_plus(
            f"DRIVER={{{settings.DB_DRIVER}}};"
            f"SERVER={settings.DB_SERVER};"
            f"DATABASE={settings.DB_NAME};"
            f"UID={settings.DB_USER};"
            f"PWD={settings.DB_PASSWORD};"
            f"TrustServerCertificate=yes"
        )
        return f"mssql+pyodbc:///?odbc_connect={params}"

    raise ValueError(f"Неизвестный DB_ENGINE: {settings.DB_ENGINE}")

SQLALCHEMY_DATABASE_URL = build_database_url()

# --- Создаём движок ---
if settings.DB_ENGINE == "sqlite":
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )

    # Включаем поддержку внешних ключей в SQLite
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()