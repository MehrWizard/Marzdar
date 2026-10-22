from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import (
    SQLALCHEMY_DATABASE_URL,
    SQLALCHEMY_POOL_SIZE,
    SQLIALCHEMY_MAX_OVERFLOW,
)

IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith('sqlite')

if IS_SQLITE:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=SQLALCHEMY_POOL_SIZE,
        max_overflow=SQLIALCHEMY_MAX_OVERFLOW,
        pool_recycle=3600,
        pool_timeout=10,
        pool_pre_ping=True
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db_indexes() -> None:
    """
    Safely create composite indexes for high-throughput scaling without modifying Alembic revisions.
    """
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            for idx_sql in [
                "CREATE INDEX ix_users_online_at ON users (online_at)",
                "CREATE INDEX ix_users_created_at ON users (created_at)",
                "CREATE INDEX ix_node_user_usages_node_created ON node_user_usages (node_id, created_at)",
                "CREATE INDEX ix_node_usages_node_created ON node_usages (node_id, created_at)",
            ]:
                try:
                    conn.execute(text(idx_sql))
                    conn.commit()
                except Exception:
                    pass
    except Exception:
        pass
