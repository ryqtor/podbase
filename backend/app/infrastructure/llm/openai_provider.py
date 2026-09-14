"""
OpenAI LLM provider implementation.
"""

from __future__ import annotations

from typing import AsyncIterator

from openai import AsyncOpenAI

from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage, LLMResponse

logger = get_logger(__name__)


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT model provider."""

    def __init__(self, model: str | None = None):
        settings = get_settings()
        self._model = model or settings.openai_chat_model
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    @property
    def provider_name(self) -> str:
        return "openai"

    @property
    def model_name(self) -> str:
        return self._model

    async def generate(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate a complete response via OpenAI."""
        logger.info(
            "openai_generate",
            model=self._model,
            message_count=len(messages),
        )

        response = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
        )

        usage = None
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

        return LLMResponse(
            content=response.choices[0].message.content or "",
            model=response.model,
            provider="openai",
            usage=usage,
        )

    async def generate_stream(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncIterator[str]:
        """Stream tokens from OpenAI."""
        logger.info(
            "openai_generate_stream",
            model=self._model,
            message_count=len(messages),
        )

        stream = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def is_available(self) -> bool:
        """Check if OpenAI is configured and reachable."""
        settings = get_settings()
        if not settings.is_openai_configured:
            return False
        try:
            # Quick model list check
            await self._client.models.list()
            return True
        except Exception as e:
            logger.warning("openai_unavailable", error=str(e))
            return False
