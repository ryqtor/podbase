"""
Models API route — list available LLM models.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.config import get_settings
from app.infrastructure.llm import ProviderFactory

router = APIRouter(prefix="/models", tags=["models"])


@router.get("")
async def list_models():
    """List all available models across all providers."""
    models = await ProviderFactory.list_available_models()
    return {"models": models}


@router.get("/current")
async def get_current_model():
    """Get the current default model configuration."""
    settings = get_settings()
    return {
        "provider": settings.default_llm_provider.value,
        "model": (
            settings.openai_chat_model
            if settings.default_llm_provider.value == "openai"
            else settings.ollama_chat_model
        ),
    }
