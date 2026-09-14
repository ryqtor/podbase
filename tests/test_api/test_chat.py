"""
Tests for chat API streaming endpoint.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_chat_stream_endpoint(client: AsyncClient, mock_db_session):
    """Test SSE chat stream endpoint returning token events."""
    session_id = str(uuid.uuid4())

    async def fake_process_message(*args, **kwargs):
        yield {"event": "token", "data": {"content": "Hello"}}
        yield {"event": "token", "data": {"content": " world"}}
        yield {"event": "done", "data": {}}

    with patch("app.api.routes.chat.ChatService") as mock_chat_service:
        service_instance = AsyncMock()
        service_instance.process_message = fake_process_message
        mock_chat_service.return_value = service_instance

        response = await client.post(
            "/api/chat",
            json={
                "session_id": session_id,
                "message": "What is Founder Mode?",
                "model_provider": "openai",
                "model_name": "gpt-4o-mini",
            },
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        content = response.text
        assert "event: token" in content
        assert "Hello" in content
