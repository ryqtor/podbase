"""
Health check endpoint.

Design decision: The health endpoint checks all critical dependencies:
- Database connectivity (PostgreSQL)
- Ollama availability (optional)
- OpenAI configuration status

This gives evaluators and operators immediate visibility into system
status. Returns detailed per-component health, not just a boolean.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.infrastructure import get_logger
from app.persistence.database import get_db_session

router = APIRouter(tags=["health"])
logger = get_logger(__name__)


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db_session)):
    """
    Comprehensive health check.

    Returns status of all dependencies:
    - database: PostgreSQL + pgvector connectivity
    - ollama: Local LLM availability
    - openai: API key configuration status
    """
    settings = get_settings()
    status = "healthy"
    checks = {}

    # ── Database check ───────────────────────────────────────
    try:
        result = await db.execute(text("SELECT 1"))
        result.scalar()
        checks["database"] = {"status": "healthy", "type": "postgresql+pgvector"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "error": str(e)}
        status = "degraded"
        logger.error("health_check_db_failed", error=str(e))

    # ── OpenAI check ─────────────────────────────────────────
    if settings.is_openai_configured:
        checks["openai"] = {
            "status": "configured",
            "model": settings.openai_chat_model,
        }
    else:
        checks["openai"] = {"status": "not_configured"}

    # ── Ollama check ─────────────────────────────────────────
    try:
        import httpx

        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{settings.ollama_base_url}/api/tags")
            if resp.status_code == 200:
                models = resp.json().get("models", [])
                model_names = [m.get("name", "") for m in models]
                checks["ollama"] = {
                    "status": "available",
                    "models": model_names[:5],  # Limit to first 5
                }
            else:
                checks["ollama"] = {"status": "unavailable", "reason": "non-200 response"}
    except Exception:
        checks["ollama"] = {"status": "unavailable", "reason": "connection_failed"}

    # ── Overall ──────────────────────────────────────────────
    # If no LLM providers are available, mark as degraded
    openai_ok = checks["openai"]["status"] == "configured"
    ollama_ok = checks.get("ollama", {}).get("status") == "available"
    if not openai_ok and not ollama_ok:
        status = "degraded"

    return {
        "status": status,
        "version": "1.0.0",
        "checks": checks,
    }
