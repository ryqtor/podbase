"""
Tests for RAG Retriever.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from app.persistence.models import ChunkModel
from app.retrieval.retriever import Retriever


@pytest.mark.asyncio
async def test_retriever_success(mock_embedder):
    """Test standard retrieval pipeline returns formatted sources."""
    mock_repo = AsyncMock()
    chunk_1 = ChunkModel(
        chunk_index=0,
        content="Brian Chesky explains Founder Mode at Airbnb...",
        token_count=100,
    )
    mock_repo.similarity_search.return_value = [
        {
            "chunk": chunk_1,
            "similarity_score": 0.89,
            "episode_title": "Brian Chesky on Founder Mode",
            "episode_number": 142,
            "guest_name": "Brian Chesky",
        }
    ]

    retriever = Retriever(transcript_repo=mock_repo, embedder=mock_embedder)
    sources, context_chunks, latency = await retriever.retrieve(
        query="What is Founder Mode?", top_k=5, rerank_top_k=3
    )

    assert len(sources) == 1
    assert sources[0].guest_name == "Brian Chesky"
    assert sources[0].similarity_score == 0.89
    assert len(context_chunks) == 1
    assert "Founder Mode" in context_chunks[0]["content"]
    assert latency >= 0


@pytest.mark.asyncio
async def test_retriever_empty_results(mock_embedder):
    """Test retriever when vector search returns no results."""
    mock_repo = AsyncMock()
    mock_repo.similarity_search.return_value = []

    retriever = Retriever(transcript_repo=mock_repo, embedder=mock_embedder)
    sources, context_chunks, latency = await retriever.retrieve(query="Unknown random query")

    assert sources == []
    assert context_chunks == []
