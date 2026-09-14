"""
Artifact API routes.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.database import get_db_session
from app.persistence.repositories.artifact_repo import ArtifactRepository

router = APIRouter(prefix="/artifacts", tags=["artifacts"])


@router.get("/{artifact_id}")
async def get_artifact(
    artifact_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session),
):
    """Get an artifact by ID."""
    repo = ArtifactRepository(db)
    artifact = await repo.get_by_id(artifact_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")

    return {
        "id": str(artifact.id),
        "session_id": str(artifact.session_id) if artifact.session_id else None,
        "message_id": str(artifact.message_id) if artifact.message_id else None,
        "title": artifact.title,
        "artifact_type": artifact.artifact_type,
        "content": artifact.content,
        "metadata": artifact.metadata_,
        "created_at": artifact.created_at.isoformat(),
    }


@router.get("")
async def list_artifacts(
    session_id: uuid.UUID | None = None,
    db: AsyncSession = Depends(get_db_session),
):
    """List artifacts, optionally filtered by session."""
    repo = ArtifactRepository(db)
    if session_id:
        artifacts = await repo.list_by_session(session_id)
    else:
        artifacts = []  # Require session_id for listing

    return [
        {
            "id": str(a.id),
            "session_id": str(a.session_id) if a.session_id else None,
            "title": a.title,
            "artifact_type": a.artifact_type,
            "created_at": a.created_at.isoformat(),
        }
        for a in artifacts
    ]
