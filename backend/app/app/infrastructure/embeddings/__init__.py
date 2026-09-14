"""Embeddings infrastructure package."""

from app.infrastructure.embeddings.base_embedder import BaseEmbedder
from app.infrastructure.embeddings.openai_embedder import OpenAIEmbedder

__all__ = ["BaseEmbedder", "OpenAIEmbedder"]
