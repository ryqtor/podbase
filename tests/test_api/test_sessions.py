"""
Tests for session API endpoints.
"""

import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.persistence.models import SessionModel


@pytest.mark.asyncio
async def test_create_session(client: AsyncClient, mock_db_session):
    """Test creating a new session."""
    session_id = uuid.uuid4()
    fake_session = SessionModel(
        id=session_id,
        title="Growth Strategy Chat",
        model_provider="openai",
        model_name="gpt-4o-mini",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        metadata_={},
    )

    with patch("app.api.routes.sessions.SessionService") as mock_service_cls:
        service_instance = AsyncMock()
        service_instance.create_session.return_value = fake_session
        mock_service_cls.return_value = service_instance

        response = await client.post(
            "/api/sessions",
            json={
                "title": "Growth Strategy Chat",
                "model_provider": "openai",
                "model_name": "gpt-4o-mini",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["id"] == str(session_id)
        assert data["title"] == "Growth Strategy Chat"


@pytest.mark.asyncio
async def test_list_sessions(client: AsyncClient, mock_db_session):
    """Test listing all chat sessions."""
    session_id = uuid.uuid4()
    fake_session = SessionModel(
        id=session_id,
        title="Session 1",
        model_provider="openai",
        model_name="gpt-4o-mini",
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        metadata_={},
    )

    with patch("app.api.routes.sessions.SessionService") as mock_service_cls:
        service_instance = AsyncMock()
        service_instance.list_sessions.return_value = [fake_session]
        mock_service_cls.return_value = service_instance

        response = await client.get("/api/sessions")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == str(session_id)
