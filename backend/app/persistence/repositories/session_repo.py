"""
Session repository — data access for chat sessions.

Design decision: Repository pattern abstracts database operations
behind a clean interface. This allows service layer to remain
database-agnostic and simplifies testing via dependency injection.
"""

from __future__ import annotations

import uuid

from sqlalchemy import func, select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.persistence.models import Message, Session


class SessionRepository:
    """CRUD operations for chat sessions."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        title: str = "New Chat",
        model_provider: str = "openai",
        model_name: str = "gpt-4o-mini",
    ) -> Session:
        """Create a new chat session."""
        session = Session(
            title=title,
            model_provider=model_provider,
            model_name=model_name,
        )
        self.db.add(session)
        await self.db.flush()
        return session

    async def get_by_id(self, session_id: uuid.UUID) -> Session | None:
        """Get a session by ID with messages loaded."""
        result = await self.db.execute(
            select(Session)
            .options(selectinload(Session.messages))
            .where(Session.id == session_id)
        )
        return result.scalar_one_or_none()

    async def list_all(self, limit: int = 50, offset: int = 0) -> list[Session]:
        """List sessions ordered by most recent first."""
        result = await self.db.execute(
            select(Session)
            .order_by(Session.updated_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all())

    async def update(
        self,
        session_id: uuid.UUID,
        title: str | None = None,
        model_provider: str | None = None,
        model_name: str | None = None,
    ) -> Session | None:
        """Update session fields."""
        values = {}
        if title is not None:
            values["title"] = title
        if model_provider is not None:
            values["model_provider"] = model_provider
        if model_name is not None:
            values["model_name"] = model_name

        if values:
            await self.db.execute(
                update(Session).where(Session.id == session_id).values(**values)
            )

        return await self.get_by_id(session_id)

    async def delete(self, session_id: uuid.UUID) -> bool:
        """Delete a session and all associated messages (cascade)."""
        result = await self.db.execute(
            delete(Session).where(Session.id == session_id)
        )
        return result.rowcount > 0

    async def get_message_count(self, session_id: uuid.UUID) -> int:
        """Get the count of messages in a session."""
        result = await self.db.execute(
            select(func.count(Message.id)).where(Message.session_id == session_id)
        )
        return result.scalar() or 0
