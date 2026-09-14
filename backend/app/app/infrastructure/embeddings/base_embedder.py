"""
Base embedding provider interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod


class BaseEmbedder(ABC):
    """Interface for embedding providers."""

    @property
    @abstractmethod
    def dimension(self) -> int:
        """Return the embedding dimension."""
        ...

    @abstractmethod
    async def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        ...

    @abstractmethod
    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for a batch of texts."""
        ...
