"""
Base LLM provider interface.

Design decision: Abstract base class defines the contract for all LLM
providers. This enables runtime provider switching — the service layer
depends on the interface, not a specific implementation. New providers
can be added by implementing this interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import AsyncIterator


@dataclass
class LLMMessage:
    """A message in a conversation."""

    role: str  # "system", "user", "assistant"
    content: str


@dataclass
class LLMResponse:
    """A complete (non-streaming) LLM response."""

    content: str
    model: str
    provider: str
    usage: dict | None = None


class BaseLLMProvider(ABC):
    """Interface for LLM providers (OpenAI, Ollama, etc.)."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider identifier (e.g., 'openai', 'ollama')."""
        ...

    @property
    @abstractmethod
    def model_name(self) -> str:
        """Return the current model name."""
        ...

    @abstractmethod
    async def generate(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate a complete response."""
        ...

    @abstractmethod
    async def generate_stream(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncIterator[str]:
        """Generate a streaming response, yielding tokens."""
        ...

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if this provider is currently available."""
        ...
