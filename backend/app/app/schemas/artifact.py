"""
Pydantic schemas for artifact-related API contracts.
"""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ArtifactResponse(BaseModel):
    """Response body for an artifact."""

    id: uuid.UUID
    session_id: uuid.UUID | None
    message_id: uuid.UUID | None
    title: str
    artifact_type: str  # "markdown" or "html"
    content: str
    metadata: dict = {}
    created_at: datetime

    model_config = {"from_attributes": True}


class ArtifactCreate(BaseModel):
    """Internal model for creating an artifact."""

    session_id: uuid.UUID | None = None
    message_id: uuid.UUID | None = None
    title: str = Field(min_length=1, max_length=500)
    artifact_type: str = Field(pattern=r"^(markdown|html)$")
    content: str = Field(min_length=1)
    metadata: dict = {}
