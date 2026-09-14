"""
Ollama LLM provider implementation.

Design decision: Uses Ollama's HTTP API directly via httpx rather than
a third-party library. This avoids an extra dependency and gives us
full control over error handling and streaming.
"""

from __future__ import annotations

import json
from typing import AsyncIterator

import httpx

from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage, LLMResponse

logger = get_logger(__name__)


class OllamaProvider(BaseLLMProvider):
    """Ollama local model provider."""

    def __init__(self, model: str | None = None):
        settings = get_settings()
        self._model = model or settings.ollama_chat_model
        self._base_url = settings.ollama_base_url

    @property
    def provider_name(self) -> str:
        return "ollama"

    @property
    def model_name(self) -> str:
        return self._model

    async def generate(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate a complete response via Ollama."""
        logger.info(
            "ollama_generate",
            model=self._model,
            message_count=len(messages),
        )

        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self._base_url}/api/chat",
                json={
                    "model": self._model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    },
                },
            )
            response.raise_for_status()
            data = response.json()

        return LLMResponse(
            content=data.get("message", {}).get("content", ""),
            model=self._model,
            provider="ollama",
            usage={
                "prompt_tokens": data.get("prompt_eval_count", 0),
                "completion_tokens": data.get("eval_count", 0),
                "total_tokens": (
                    data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                ),
            },
        )

    async def generate_stream(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncIterator[str]:
        """Stream tokens from Ollama."""
        logger.info(
            "ollama_generate_stream",
            model=self._model,
            message_count=len(messages),
        )

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self._base_url}/api/chat",
                json={
                    "model": self._model,
                    "messages": [{"role": m.role, "content": m.content} for m in messages],
                    "stream": True,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    },
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    async def is_available(self) -> bool:
        """Check if Ollama is running and the model is available."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(f"{self._base_url}/api/tags")
                if response.status_code == 200:
                    models = response.json().get("models", [])
                    model_names = [m.get("name", "") for m in models]
                    # Check if our configured model is available
                    # Ollama model names can include tags like ":latest"
                    is_model_available = any(
                        self._model in name or name.startswith(self._model.split(":")[0])
                        for name in model_names
                    )
                    if not is_model_available:
                        logger.warning(
                            "ollama_model_not_found",
                            model=self._model,
                            available_models=model_names,
                        )
                    return True  # Ollama is running, even if model needs pulling
                return False
        except Exception as e:
            logger.debug("ollama_unavailable", error=str(e))
            return False
