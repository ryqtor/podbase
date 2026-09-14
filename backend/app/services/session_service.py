"""
Session service — business logic for session management.
"""

from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.repositories.message_repo import MessageRepository
from app.persistence.repositories.session_repo import SessionRepository
from app.schemas.session import (
    MessageResponse,
    SessionCreate,
    SessionDetailResponse,
    SessionResponse,
    SessionUpdate,
)


class SessionService:
    """Business logic for session management."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.message_repo = MessageRepository(db)

    async def create_session(self, data: SessionCreate) -> SessionResponse:
        """Create a new chat session."""
        session = await self.session_repo.create(
            title=data.title,
            model_provider=data.model_provider,
            model_name=data.model_name,
        )
        return SessionResponse(
            id=session.id,
            title=session.title,
            model_provider=session.model_provider,
            model_name=session.model_name,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=0,
        )

    async def list_sessions(self) -> list[SessionResponse]:
        """List all sessions."""
        sessions = await self.session_repo.list_all()
        result = []
        for s in sessions:
            count = await self.session_repo.get_message_count(s.id)
            result.append(
                SessionResponse(
                    id=s.id,
                    title=s.title,
                    model_provider=s.model_provider,
                    model_name=s.model_name,
                    created_at=s.created_at,
                    updated_at=s.updated_at,
                    message_count=count,
                )
            )
        return result

    async def get_session(self, session_id: uuid.UUID) -> SessionDetailResponse | None:
        """Get session with full message history."""
        session = await self.session_repo.get_by_id(session_id)
        if not session:
            return None

        messages = [
            MessageResponse(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                sources=m.sources if isinstance(m.sources, list) else [],
                artifact_id=m.artifact_id,
                model_provider=m.model_provider,
                model_name=m.model_name,
                retrieval_latency_ms=m.retrieval_latency_ms,
                generation_latency_ms=m.generation_latency_ms,
                created_at=m.created_at,
            )
            for m in session.messages
        ]

        return SessionDetailResponse(
            id=session.id,
            title=session.title,
            model_provider=session.model_provider,
            model_name=session.model_name,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=len(messages),
            messages=messages,
        )

    async def update_session(
        self, session_id: uuid.UUID, data: SessionUpdate
    ) -> SessionResponse | None:
        """Update session properties."""
        session = await self.session_repo.update(
            session_id,
            title=data.title,
            model_provider=data.model_provider,
            model_name=data.model_name,
        )
        if not session:
            return None

        count = await self.session_repo.get_message_count(session_id)
        return SessionResponse(
            id=session.id,
            title=session.title,
            model_provider=session.model_provider,
            model_name=session.model_name,
            created_at=session.created_at,
            updated_at=session.updated_at,
            message_count=count,
        )

    async def delete_session(self, session_id: uuid.UUID) -> bool:
        """Delete a session."""
        return await self.session_repo.delete(session_id)
