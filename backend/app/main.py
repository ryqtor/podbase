"""
FastAPI application entry point.
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.middleware.error_handler import (
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware,
)
from app.api.routes import (
    health,
    sessions,
    chat,
    ingest,
    artifacts,
    models,
)
from app.config import get_settings
from app.infrastructure import setup_logging
from app.persistence.database import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle."""
    setup_logging()

    # Startup
    await init_db()

    yield

    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title="Lenny Growth Assistant",
        description="AI-powered conversational assistant built on Lenny's Podcast transcripts",
        version="1.0.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Middleware
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",
            "http://frontend:3000",
            f"http://localhost:{settings.frontend_port}",
            "https://frontend-opal-nu-q78iu79xa9.vercel.app",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(health.router)
    app.include_router(sessions.router, prefix="/api")
    app.include_router(chat.router, prefix="/api")
    app.include_router(ingest.router, prefix="/api")
    app.include_router(artifacts.router, prefix="/api")
    app.include_router(models.router, prefix="/api")

    return app


app = create_app()