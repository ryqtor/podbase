"""
Pydantic schemas for session-related API contracts.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class SessionCreate(BaseModel):
    """Request body for creating a new session."""

    title: str = Field(default="New Chat", max_length=255)
    model_provider: str = Field(default="openai")
    model_name: str = Field(default="gpt-4o-mini")


class SessionUpdate(BaseModel):
    """Request body for updating a session."""

    title: str | None = None
    model_provider: str | None = None
    model_name: str | None = None


class SessionResponse(BaseModel):
    """Response body for a session."""

    id: uuid.UUID
    title: str
    model_provider: str
    model_name: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}


class SessionDetailResponse(SessionResponse):
    """Session with full message history."""

    messages: list[MessageResponse] = []


class MessageResponse(BaseModel):
    """Response body for a message."""

    id: uuid.UUID
    session_id: uuid.UUID
    role: str
    content: str
    sources: list[dict] = []
    artifact_id: uuid.UUID | None = None
    model_provider: str | None = None
    model_name: str | None = None
    retrieval_latency_ms: int | None = None
    generation_latency_ms: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
