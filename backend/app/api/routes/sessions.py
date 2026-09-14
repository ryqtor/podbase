"""
Session API routes.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.database import get_db_session
from app.schemas.session import SessionCreate, SessionResponse, SessionDetailResponse, SessionUpdate
from app.services.session_service import SessionService

router = APIRouter(prefix="/sessions", tags=["sessions"])


def get_session_service(db: AsyncSession = Depends(get_db_session)) -> SessionService:
    return SessionService(db)


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    data: SessionCreate,
    service: SessionService = Depends(get_session_service),
):
    """Create a new chat session."""
    return await service.create_session(data)


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    service: SessionService = Depends(get_session_service),
):
    """List all chat sessions, most recent first."""
    return await service.list_sessions()


@router.get("/{session_id}", response_model=SessionDetailResponse)
async def get_session(
    session_id: uuid.UUID,
    service: SessionService = Depends(get_session_service),
):
    """Get a session with full message history."""
    session = await service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: uuid.UUID,
    data: SessionUpdate,
    service: SessionService = Depends(get_session_service),
):
    """Update session title or model settings."""
    session = await service.update_session(session_id, data)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: uuid.UUID,
    service: SessionService = Depends(get_session_service),
):
    """Delete a session and all its messages."""
    deleted = await service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
