"""
Pytest configuration and fixtures.
"""

from __future__ import annotations

import asyncio
from typing import AsyncGenerator
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import Settings, get_settings
from app.main import create_app
from app.persistence.database import get_db_session
from app.persistence.models import Base


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def test_settings() -> Settings:
    """Test settings override."""
    return Settings(
        postgres_host="localhost",
        postgres_port=5432,
        postgres_user="test_user",
        postgres_password="test_password",
        postgres_db="test_db",
        openai_api_key="sk-test-key-12345",
        default_model_provider="openai",
        default_model_name="gpt-4o-mini",
        embedding_model="text-embedding-3-small",
        ollama_base_url="http://localhost:11434",
    )


@pytest.fixture
async def mock_db_session() -> AsyncGenerator[AsyncMock, None]:
    """Mock database session for unit tests."""
    session = AsyncMock(spec=AsyncSession)
    yield session


@pytest.fixture
def mock_openai_provider():
    """Mock OpenAI provider for unit tests."""
    provider = AsyncMock()
    provider.name = "openai"
    provider.model_name = "gpt-4o-mini"
    provider.is_available = AsyncMock(return_value=True)

    async def mock_generate(prompt, system_prompt=None, max_tokens=None, temperature=0.7):
        return "This is a test response backed by Lenny's Podcast insights."

    async def mock_stream(prompt, system_prompt=None, max_tokens=None, temperature=0.7):
        for token in ["This ", "is ", "a ", "streamed ", "response."]:
            yield token

    provider.generate = mock_generate
    provider.stream = mock_stream
    return provider


@pytest.fixture
def mock_embedder():
    """Mock embedding generator."""
    embedder = AsyncMock()
    embedder.dimension = 1536
    embedder.embed_text = AsyncMock(return_value=[0.01] * 1536)
    embedder.embed_batch = AsyncMock(return_value=[[0.01] * 1536, [0.02] * 1536])
    return embedder


@pytest.fixture
async def client(mock_db_session) -> AsyncGenerator[AsyncClient, None]:
    """Async test client with dependency overrides."""
    app = create_app()
    app.dependency_overrides[get_db_session] = lambda: mock_db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
