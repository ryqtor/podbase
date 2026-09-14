"""
Pydantic schemas for chat-related API contracts.
"""

from __future__ import annotations

import uuid

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request body for sending a chat message."""

    session_id: uuid.UUID
    message: str = Field(min_length=1, max_length=10000)
    model_provider: str | None = None  # Override session default
    model_name: str | None = None  # Override session default


class ChatSourceReference(BaseModel):
    """A source citation from the transcript corpus."""

    episode_title: str
    episode_number: int | None = None
    guest_name: str | None = None
    chunk_content: str
    similarity_score: float
    chunk_index: int


class ChatStreamEvent(BaseModel):
    """SSE event data for streaming chat responses."""

    event: str  # token, sources, artifact, metadata, done, error
    data: dict
