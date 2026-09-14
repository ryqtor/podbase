"""
Tests for SessionService.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock

import pytest

from app.persistence.models import SessionModel
from app.schemas.session import SessionCreate, SessionUpdate
from app.services.session_service import SessionService


@pytest.mark.asyncio
async def test_create_and_get_session():
    db = AsyncMock()
    service = SessionService(db=db)

    session_id = uuid.uuid4()
    mock_model = SessionModel(
        id=session_id,
        title="Elena Verna Discussion",
        model_provider="openai",
        model_name="gpt-4o-mini",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        metadata_={},
        messages=[],
    )

    service.session_repo.create = AsyncMock(return_value=mock_model)
    created = await service.create_session(
        SessionCreate(title="Elena Verna Discussion", model_provider="openai", model_name="gpt-4o-mini")
    )

    assert created.id == session_id
    assert created.title == "Elena Verna Discussion"
    assert created.message_count == 0


@pytest.mark.asyncio
async def test_delete_session():
    db = AsyncMock()
    service = SessionService(db=db)
    service.session_repo.delete = AsyncMock(return_value=True)

    success = await service.delete_session(uuid.uuid4())
    assert success is True
