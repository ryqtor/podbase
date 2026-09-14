"""
SQLAlchemy ORM models — the persistence layer's data representation.

Design decision: Using SQLAlchemy 2.0 declarative base with mapped_column
for type-safe column definitions. pgvector's Vector type is used for
embedding storage. All models use UUID primary keys for distributed-
friendly ID generation.

Tables:
- sessions: Chat sessions with model config
- messages: Chat messages with source citations
- transcripts: Ingested podcast transcripts
- chunks: Chunked transcript segments with embeddings
- artifacts: Generated markdown/HTML artifacts
"""

from __future__ import annotations

import uuid
from datetime import date, datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


class Session(Base):
    """A chat session containing messages and linked artifacts."""

    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    title: Mapped[str] = mapped_column(String(255), default="New Chat")
    model_provider: Mapped[str] = mapped_column(String(50), default="openai")
    model_name: Mapped[str] = mapped_column(String(100), default="gpt-4o-mini")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)

    # Relationships
    messages: Mapped[list[Message]] = relationship(
        back_populates="session", cascade="all, delete-orphan", order_by="Message.created_at"
    )
    artifacts: Mapped[list[Artifact]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class Message(Base):
    """A single message within a chat session."""

    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20),
        CheckConstraint("role IN ('user', 'assistant', 'system')"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sources: Mapped[dict] = mapped_column(JSONB, default=list)
    artifact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("artifacts.id", ondelete="SET NULL"), nullable=True
    )
    model_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    model_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    retrieval_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    generation_latency_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    session: Mapped[Session] = relationship(back_populates="messages")

    __table_args__ = (
        Index("idx_messages_session", "session_id", "created_at"),
    )


class Transcript(Base):
    """A source podcast transcript."""

    __tablename__ = "transcripts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    episode_title: Mapped[str] = mapped_column(String(500), nullable=False)
    episode_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    guest_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    publish_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    ingested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    chunks: Mapped[list[Chunk]] = relationship(
        back_populates="transcript", cascade="all, delete-orphan"
    )


class Chunk(Base):
    """
    A chunk of transcript text with its embedding vector.

    Design decision: 1536-dimensional vectors for OpenAI text-embedding-3-small.
    HNSW index with cosine distance for fast approximate nearest-neighbor search.
    """

    __tablename__ = "chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    transcript_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    token_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    embedding = mapped_column(Vector(1536), nullable=True)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    transcript: Mapped[Transcript] = relationship(back_populates="chunks")

    __table_args__ = (
        Index(
            "idx_chunks_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        Index("idx_chunks_transcript", "transcript_id"),
    )


class Artifact(Base):
    """A generated artifact (markdown or HTML content)."""

    __tablename__ = "artifacts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id", ondelete="SET NULL"), nullable=True
    )
    message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), nullable=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    artifact_type: Mapped[str] = mapped_column(
        String(20),
        CheckConstraint("artifact_type IN ('markdown', 'html')"),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_: Mapped[dict] = mapped_column("metadata", JSONB, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    session: Mapped[Session | None] = relationship(back_populates="artifacts")


# Aliases for compatibility
SessionModel = Session
MessageModel = Message
TranscriptModel = Transcript
ChunkModel = Chunk
ArtifactModel = Artifact
