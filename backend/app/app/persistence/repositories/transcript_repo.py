"""
Transcript repository — data access for podcast transcripts and chunks.
"""

from __future__ import annotations

import uuid
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.models import Chunk, Transcript


class TranscriptRepository:
    """CRUD operations for transcripts and their chunks."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_transcript(
        self,
        episode_title: str,
        raw_text: str,
        episode_number: int | None = None,
        guest_name: str | None = None,
        publish_date: date | None = None,
        metadata: dict | None = None,
    ) -> Transcript:
        """Create a new transcript record."""
        transcript = Transcript(
            episode_title=episode_title,
            episode_number=episode_number,
            guest_name=guest_name,
            publish_date=publish_date,
            raw_text=raw_text,
            metadata_=metadata or {},
        )
        self.db.add(transcript)
        await self.db.flush()
        return transcript

    async def create_chunks(self, chunks: list[Chunk]) -> list[Chunk]:
        """Bulk insert chunks."""
        self.db.add_all(chunks)
        await self.db.flush()
        return chunks

    async def get_transcript_by_id(self, transcript_id: uuid.UUID) -> Transcript | None:
        """Get a transcript by ID."""
        result = await self.db.execute(
            select(Transcript).where(Transcript.id == transcript_id)
        )
        return result.scalar_one_or_none()

    async def list_transcripts(self) -> list[Transcript]:
        """List all transcripts."""
        result = await self.db.execute(
            select(Transcript).order_by(Transcript.ingested_at.desc())
        )
        return list(result.scalars().all())

    async def get_chunk_count(self, transcript_id: uuid.UUID | None = None) -> int:
        """Get count of chunks, optionally filtered by transcript."""
        query = select(func.count(Chunk.id))
        if transcript_id:
            query = query.where(Chunk.transcript_id == transcript_id)
        result = await self.db.execute(query)
        return result.scalar() or 0

    async def get_embedding_count(self) -> int:
        """Count chunks that have embeddings."""
        result = await self.db.execute(
            select(func.count(Chunk.id)).where(Chunk.embedding.isnot(None))
        )
        return result.scalar() or 0

    async def get_total_transcript_count(self) -> int:
        """Count total transcripts."""
        result = await self.db.execute(select(func.count(Transcript.id)))
        return result.scalar() or 0

    async def similarity_search(
        self, query_embedding: list[float], top_k: int = 20
    ) -> list[dict]:
        """
        Perform cosine similarity search against chunk embeddings.

        Returns chunks ordered by similarity (highest first), with
        transcript metadata joined for citation support.
        """
        # Use pgvector's cosine distance operator
        result = await self.db.execute(
            select(
                Chunk,
                Transcript.episode_title,
                Transcript.episode_number,
                Transcript.guest_name,
                Chunk.embedding.cosine_distance(query_embedding).label("distance"),
            )
            .join(Transcript, Chunk.transcript_id == Transcript.id)
            .where(Chunk.embedding.isnot(None))
            .order_by("distance")
            .limit(top_k)
        )

        rows = result.all()
        return [
            {
                "chunk": row.Chunk,
                "episode_title": row.episode_title,
                "episode_number": row.episode_number,
                "guest_name": row.guest_name,
                "similarity_score": 1 - row.distance,  # Convert distance to similarity
            }
            for row in rows
        ]

    async def text_search(self, query: str, top_k: int = 5) -> list[dict]:
        """
        Keyword-based text search over chunks and transcripts.
        Used as a fallback when embeddings are not available or as part of hybrid search.
        """
        keywords = [w.strip().lower() for w in query.split() if len(w.strip()) > 2]
        
        # Build query for Chunk + Transcript
        stmt = (
            select(
                Chunk,
                Transcript.episode_title,
                Transcript.episode_number,
                Transcript.guest_name,
            )
            .join(Transcript, Chunk.transcript_id == Transcript.id)
        )

        if keywords:
            from sqlalchemy import or_
            filters = []
            for kw in keywords[:5]:
                filters.append(Chunk.content.ilike(f"%{kw}%"))
                filters.append(Transcript.episode_title.ilike(f"%{kw}%"))
                filters.append(Transcript.guest_name.ilike(f"%{kw}%"))
            stmt = stmt.where(or_(*filters))

        stmt = stmt.limit(top_k)
        result = await self.db.execute(stmt)
        rows = result.all()

        return [
            {
                "chunk": row.Chunk,
                "episode_title": row.episode_title,
                "episode_number": row.episode_number,
                "guest_name": row.guest_name,
                "similarity_score": 0.85,
            }
            for row in rows
        ]

