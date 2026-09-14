"""
LLM provider factory with graceful fallback.

Design decision: Factory pattern encapsulates provider selection logic,
including the fallback chain. The service layer calls get_provider()
and receives a working provider, or a clear error explaining why no
provider is available.

Fallback chain:
1. Try requested provider
2. If unavailable and fallback enabled → try alternate provider
3. If both unavailable → raise descriptive error
"""

from __future__ import annotations

from app.config import LLMProvider, get_settings
from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider
from app.infrastructure.llm.ollama_provider import OllamaProvider
from app.infrastructure.llm.openai_provider import OpenAIProvider

logger = get_logger(__name__)


class NoProviderAvailableError(Exception):
    """Raised when no LLM provider is available."""

    pass


class ProviderFactory:
    """Creates and manages LLM provider instances with fallback support."""

    @staticmethod
    def create_provider(
        provider: str | LLMProvider, model: str | None = None
    ) -> BaseLLMProvider:
        """Create a specific provider instance."""
        provider_str = provider.value if isinstance(provider, LLMProvider) else provider

        if provider_str == "openai":
            return OpenAIProvider(model=model)
        elif provider_str == "ollama":
            return OllamaProvider(model=model)
        else:
            raise ValueError(f"Unknown provider: {provider_str}")

    @staticmethod
    async def get_provider(
        preferred_provider: str | None = None,
        preferred_model: str | None = None,
    ) -> BaseLLMProvider:
        """
        Get an available LLM provider, with fallback logic.

        Args:
            preferred_provider: The provider to try first.
            preferred_model: The model to use (provider-specific).

        Returns:
            An available BaseLLMProvider instance.

        Raises:
            NoProviderAvailableError: If no provider is available.
        """
        settings = get_settings()
        provider_name = preferred_provider or settings.default_llm_provider.value

        # Try the preferred provider first
        primary = ProviderFactory.create_provider(provider_name, preferred_model)
        if await primary.is_available():
            logger.info(
                "provider_selected",
                provider=primary.provider_name,
                model=primary.model_name,
            )
            return primary

        logger.warning(
            "primary_provider_unavailable",
            provider=provider_name,
        )

        # Try fallback if enabled
        if settings.llm_fallback_enabled:
            fallback_name = "ollama" if provider_name == "openai" else "openai"
            fallback = ProviderFactory.create_provider(fallback_name)

            if await fallback.is_available():
                logger.info(
                    "fallback_provider_selected",
                    primary=provider_name,
                    fallback=fallback.provider_name,
                    model=fallback.model_name,
                )
                return fallback

            logger.error("fallback_provider_also_unavailable", fallback=fallback_name)

        raise NoProviderAvailableError(
            f"No LLM provider is available. "
            f"Primary ({provider_name}) is unavailable. "
            f"Please check your API keys and Ollama status. "
            f"Run /health to diagnose."
        )

    @staticmethod
    async def list_available_models() -> list[dict]:
        """List all available models across all providers."""
        models = []
        settings = get_settings()

        # OpenAI models
        if settings.is_openai_configured:
            models.append({
                "provider": "openai",
                "model": settings.openai_chat_model,
                "status": "available",
            })

        # Ollama models
        try:
            import httpx

            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(f"{settings.ollama_base_url}/api/tags")
                if resp.status_code == 200:
                    for m in resp.json().get("models", []):
                        models.append({
                            "provider": "ollama",
                            "model": m.get("name", ""),
                            "status": "available",
                            "size": m.get("size", 0),
                        })
        except Exception:
            pass

        return models
