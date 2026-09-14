"""
OpenAI embedding provider.
"""

from __future__ import annotations

from openai import AsyncOpenAI

from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.embeddings.base_embedder import BaseEmbedder

logger = get_logger(__name__)


class OpenAIEmbedder(BaseEmbedder):
    """Generate embeddings using OpenAI's text-embedding models."""

    def __init__(self, model: str | None = None):
        settings = get_settings()
        self._model = model or settings.openai_embedding_model
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)
        # text-embedding-3-small = 1536, text-embedding-3-large = 3072
        self._dimension = 1536

    @property
    def dimension(self) -> int:
        return self._dimension

    async def embed_text(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        response = await self._client.embeddings.create(
            model=self._model,
            input=text,
        )
        return response.data[0].embedding

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for a batch of texts.

        OpenAI supports batch embedding natively, which is more efficient
        than individual calls. We batch in groups of 100 to stay within
        API limits.
        """
        all_embeddings = []
        batch_size = 100

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            logger.info(
                "embedding_batch",
                batch_start=i,
                batch_size=len(batch),
                total=len(texts),
            )

            response = await self._client.embeddings.create(
                model=self._model,
                input=batch,
            )
            all_embeddings.extend([d.embedding for d in response.data])

        return all_embeddings
