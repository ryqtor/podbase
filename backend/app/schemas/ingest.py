"""
Pydantic schemas for ingestion-related API contracts.
"""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class TranscriptUpload(BaseModel):
    """Metadata for a transcript upload."""

    episode_title: str = Field(min_length=1, max_length=500)
    episode_number: int | None = None
    guest_name: str | None = None
    publish_date: date | None = None


class TranscriptResponse(BaseModel):
    """Response body for an ingested transcript."""

    id: uuid.UUID
    episode_title: str
    episode_number: int | None
    guest_name: str | None
    publish_date: date | None
    chunk_count: int = 0
    ingested_at: datetime

    model_config = {"from_attributes": True}


class IngestStatusResponse(BaseModel):
    """Response body for ingestion status."""

    total_transcripts: int
    total_chunks: int
    total_embeddings: int
