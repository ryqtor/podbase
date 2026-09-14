"""
Tests for ChatService orchestration and intent detection.
"""

import uuid
from unittest.mock import AsyncMock, patch

import pytest

from app.persistence.models import SessionModel
from app.services.chat_service import ChatService


def test_detect_intent():
    service = ChatService(db=AsyncMock())

    assert service._detect_intent("Write an essay on growth loops") == "essay"
    assert service._detect_intent("Ship 30 style essay about Founder Mode") == "essay"
    assert service._detect_intent("Create a strategy memo for PLG") == "artifact"
    assert service._detect_intent("Generate a launch plan") == "artifact"
    assert service._detect_intent("What is the LNO framework?") == "question"
    assert service._detect_intent("How does Brian Chesky run product reviews?") == "question"


@pytest.mark.asyncio
async def test_process_message_session_not_found():
    db_mock = AsyncMock()
    service = ChatService(db=db_mock)

    with patch.object(service.session_repo, "get_by_id", return_value=None):
        events = []
        async for event in service.process_message(uuid.uuid4(), "Hello"):
            events.append(event)

        assert len(events) == 1
        assert events[0]["event"] == "error"
        assert "Session not found" in events[0]["data"]["message"]
