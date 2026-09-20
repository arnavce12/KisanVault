"""
main.py — FastAPI application entry point for KisanVault
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# Import all models so SQLAlchemy registers them with Base
import app.models  # noqa: F401

# Import routers
from app.routes import auth, records, search, summary

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup: create all DB tables if they don't exist.
    In production, use Alembic migrations instead.
    """
    logger.info("KisanVault backend starting up...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ensured.")
    yield
    logger.info("KisanVault backend shutting down.")


app = FastAPI(
    title="KisanVault API",
    description=(
        "AI-powered digital farm history platform. "
        "Store, organize, search, and retrieve farming records using natural language."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(records.router)
app.include_router(search.router)
app.include_router(summary.router)


# ─── Health Check ─────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "service": "KisanVault API", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health():
    from app.services.vector_service import collection_count
    return {
        "status": "healthy",
        "chroma_documents": collection_count(),
    }
