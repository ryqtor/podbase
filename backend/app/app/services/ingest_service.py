"""
Ingestion service — handles transcript upload, chunking, and embedding.
"""

from __future__ import annotations

from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.embeddings import OpenAIEmbedder
from app.persistence.models import Chunk
from app.persistence.repositories.transcript_repo import TranscriptRepository
from app.retrieval.chunker import RecursiveChunker

logger = get_logger(__name__)


class IngestService:
    """Handles transcript ingestion: parse → chunk → embed → store."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.transcript_repo = TranscriptRepository(db)
        self.chunker = RecursiveChunker()

    async def ingest_transcript(
        self,
        raw_text: str,
        episode_title: str,
        episode_number: int | None = None,
        guest_name: str | None = None,
        publish_date: date | None = None,
    ) -> dict:
        """
        Ingest a transcript: store → chunk → embed.

        Returns summary of ingestion results.
        """
        settings = get_settings()

        logger.info(
            "ingestion_start",
            episode_title=episode_title,
            text_length=len(raw_text),
        )

        # Step 1: Store the raw transcript
        transcript = await self.transcript_repo.create_transcript(
            episode_title=episode_title,
            raw_text=raw_text,
            episode_number=episode_number,
            guest_name=guest_name,
            publish_date=publish_date,
            metadata={"source": "upload"},
        )

        # Step 2: Chunk the text
        text_chunks = self.chunker.chunk_text(
            raw_text,
            metadata={
                "episode_title": episode_title,
                "episode_number": episode_number,
                "guest_name": guest_name,
            },
        )

        # Step 3: Generate embeddings
        embedder = OpenAIEmbedder()
        chunk_texts = [c.content for c in text_chunks]

        embeddings = []
        if settings.is_openai_configured:
            try:
                embeddings = await embedder.embed_batch(chunk_texts)
            except Exception as e:
                logger.error("embedding_failed", error=str(e))
                # Continue without embeddings — they can be generated later
        else:
            logger.warning("embeddings_skipped", reason="openai_not_configured")

        # Step 4: Store chunks with embeddings
        db_chunks = []
        for i, text_chunk in enumerate(text_chunks):
            embedding = embeddings[i] if i < len(embeddings) else None
            db_chunk = Chunk(
                transcript_id=transcript.id,
                chunk_index=text_chunk.chunk_index,
                content=text_chunk.content,
                token_count=text_chunk.token_count,
                embedding=embedding,
                metadata_=text_chunk.metadata,
            )
            db_chunks.append(db_chunk)

        await self.transcript_repo.create_chunks(db_chunks)

        result = {
            "transcript_id": str(transcript.id),
            "episode_title": episode_title,
            "chunks_created": len(db_chunks),
            "embeddings_created": len(embeddings),
            "status": "complete" if embeddings else "partial_no_embeddings",
        }

        logger.info("ingestion_complete", **result)
        return result

    async def get_status(self) -> dict:
        """Get overall ingestion status."""
        total_transcripts = await self.transcript_repo.get_total_transcript_count()
        total_chunks = await self.transcript_repo.get_chunk_count()
        total_embeddings = await self.transcript_repo.get_embedding_count()

        return {
            "total_transcripts": total_transcripts,
            "total_chunks": total_chunks,
            "total_embeddings": total_embeddings,
        }


# Alias for compatibility
IngestionService = IngestService
