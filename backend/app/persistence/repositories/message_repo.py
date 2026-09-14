"""
Message repository — data access for chat messages.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.models import Message


class MessageRepository:
    """CRUD operations for chat messages."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        session_id: uuid.UUID,
        role: str,
        content: str,
        sources: list[dict] | None = None,
        artifact_id: uuid.UUID | None = None,
        model_provider: str | None = None,
        model_name: str | None = None,
        retrieval_latency_ms: int | None = None,
        generation_latency_ms: int | None = None,
    ) -> Message:
        """Create a new message."""
        message = Message(
            session_id=session_id,
            role=role,
            content=content,
            sources=sources or [],
            artifact_id=artifact_id,
            model_provider=model_provider,
            model_name=model_name,
            retrieval_latency_ms=retrieval_latency_ms,
            generation_latency_ms=generation_latency_ms,
        )
        self.db.add(message)
        await self.db.flush()
        return message

    async def get_session_messages(
        self, session_id: uuid.UUID, limit: int = 100
    ) -> list[Message]:
        """Get messages for a session, ordered by creation time."""
        result = await self.db.execute(
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
            .limit(limit)
        )
        return list(result.scalars().all())

    async def get_by_id(self, message_id: uuid.UUID) -> Message | None:
        """Get a message by ID."""
        result = await self.db.execute(
            select(Message).where(Message.id == message_id)
        )
        return result.scalar_one_or_none()
