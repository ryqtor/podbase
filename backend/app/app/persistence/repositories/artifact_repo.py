"""
Artifact repository — data access for generated artifacts.
"""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.models import Artifact


class ArtifactRepository:
    """CRUD operations for artifacts."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(
        self,
        title: str,
        artifact_type: str,
        content: str,
        session_id: uuid.UUID | None = None,
        message_id: uuid.UUID | None = None,
        metadata: dict | None = None,
    ) -> Artifact:
        """Create a new artifact."""
        artifact = Artifact(
            session_id=session_id,
            message_id=message_id,
            title=title,
            artifact_type=artifact_type,
            content=content,
            metadata_=metadata or {},
        )
        self.db.add(artifact)
        await self.db.flush()
        return artifact

    async def get_by_id(self, artifact_id: uuid.UUID) -> Artifact | None:
        """Get an artifact by ID."""
        result = await self.db.execute(
            select(Artifact).where(Artifact.id == artifact_id)
        )
        return result.scalar_one_or_none()

    async def list_by_session(self, session_id: uuid.UUID) -> list[Artifact]:
        """List artifacts for a session."""
        result = await self.db.execute(
            select(Artifact)
            .where(Artifact.session_id == session_id)
            .order_by(Artifact.created_at.desc())
        )
        return list(result.scalars().all())
