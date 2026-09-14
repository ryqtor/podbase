"""
Ingestion API routes — upload and manage transcripts.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.database import get_db_session
from app.persistence.repositories.transcript_repo import TranscriptRepository
from app.schemas.ingest import IngestStatusResponse, TranscriptResponse
from app.services.ingest_service import IngestService

router = APIRouter(prefix="/ingest", tags=["ingestion"])


@router.post("")
async def ingest_transcript(
    file: UploadFile = File(...),
    episode_title: str = Form(...),
    episode_number: int | None = Form(None),
    guest_name: str | None = Form(None),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Upload and ingest a transcript file.

    Accepts .txt files. The transcript is chunked, embedded,
    and stored for RAG retrieval.
    """
    if not file.filename or not file.filename.endswith((".txt", ".md")):
        raise HTTPException(
            status_code=400,
            detail="Only .txt and .md files are supported",
        )

    content = await file.read()
    raw_text = content.decode("utf-8")

    if len(raw_text.strip()) < 100:
        raise HTTPException(
            status_code=400,
            detail="Transcript is too short (minimum 100 characters)",
        )

    service = IngestService(db)
    result = await service.ingest_transcript(
        raw_text=raw_text,
        episode_title=episode_title,
        episode_number=episode_number,
        guest_name=guest_name,
    )

    return result


@router.get("/status", response_model=IngestStatusResponse)
async def get_ingest_status(
    db: AsyncSession = Depends(get_db_session),
):
    """Get the current ingestion status (transcript/chunk/embedding counts)."""
    service = IngestService(db)
    return await service.get_status()


@router.get("/transcripts")
async def list_transcripts(
    db: AsyncSession = Depends(get_db_session),
):
    """List all ingested transcripts."""
    repo = TranscriptRepository(db)
    transcripts = await repo.list_transcripts()
    result = []
    for t in transcripts:
        chunk_count = await repo.get_chunk_count(t.id)
        result.append({
            "id": str(t.id),
            "episode_title": t.episode_title,
            "episode_number": t.episode_number,
            "guest_name": t.guest_name,
            "publish_date": str(t.publish_date) if t.publish_date else None,
            "chunk_count": chunk_count,
            "ingested_at": t.ingested_at.isoformat(),
        })
    return result
