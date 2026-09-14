"""
Tests for LLM Provider Factory and Fallback Routing.
"""

from unittest.mock import AsyncMock, patch

import pytest

from app.infrastructure.llm.openai_provider import OpenAIProvider
from app.infrastructure.llm.ollama_provider import OllamaProvider
from app.infrastructure.llm.provider_factory import NoProviderAvailableError, ProviderFactory


def test_create_provider_instances():
    p1 = ProviderFactory.create_provider("openai", "gpt-4o-mini")
    assert isinstance(p1, OpenAIProvider)
    assert p1.model_name == "gpt-4o-mini"

    p2 = ProviderFactory.create_provider("ollama", "llama3.1:8b")
    assert isinstance(p2, OllamaProvider)
    assert p2.model_name == "llama3.1:8b"


@pytest.mark.asyncio
async def test_fallback_routing_when_primary_fails():
    with patch.object(OpenAIProvider, "is_available", new_callable=AsyncMock) as mock_openai_avail:
        with patch.object(OllamaProvider, "is_available", new_callable=AsyncMock) as mock_ollama_avail:
            # Primary OpenAI fails, fallback Ollama succeeds
            mock_openai_avail.return_value = False
            mock_ollama_avail.return_value = True

            provider = await ProviderFactory.get_provider(preferred_provider="openai")
            assert isinstance(provider, OllamaProvider)


@pytest.mark.asyncio
async def test_no_provider_available_raises_error():
    with patch.object(OpenAIProvider, "is_available", new_callable=AsyncMock) as mock_openai_avail:
        with patch.object(OllamaProvider, "is_available", new_callable=AsyncMock) as mock_ollama_avail:
            # Both fail
            mock_openai_avail.return_value = False
            mock_ollama_avail.return_value = False

            with pytest.raises(NoProviderAvailableError):
                await ProviderFactory.get_provider(preferred_provider="openai")
