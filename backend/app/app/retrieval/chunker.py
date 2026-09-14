"""
Text chunking for RAG pipeline.

Design decision: Recursive character splitting with semantic awareness.

- Chunk size: 800 tokens — large enough to preserve conversational context
  from podcast transcripts, small enough for precise retrieval.
- Overlap: 100 tokens — prevents information loss at chunk boundaries.
- Split hierarchy: paragraph → sentence → word.

Why not semantic chunking? Semantic chunking (e.g., topic detection via
embeddings) produces better chunks but adds significant complexity and
latency during ingestion. For a podcast transcript corpus (hundreds of
episodes, not millions of documents), recursive splitting is sufficient
and reliable. Documented as a future improvement.
"""

from __future__ import annotations

from dataclasses import dataclass

import tiktoken

from app.config import get_settings
from app.infrastructure import get_logger

logger = get_logger(__name__)


@dataclass
class TextChunk:
    """A chunk of text with metadata."""

    content: str
    chunk_index: int
    token_count: int
    metadata: dict


class RecursiveChunker:
    """
    Recursive character text splitter with token-based sizing.

    Splits text by trying separators in order of preference:
    1. Double newline (paragraph break)
    2. Single newline (line break)
    3. Period + space (sentence break)
    4. Space (word break)
    """

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ):
        settings = get_settings()
        self.chunk_size = chunk_size or settings.chunk_size
        self.chunk_overlap = chunk_overlap or settings.chunk_overlap
        self._tokenizer = tiktoken.get_encoding("cl100k_base")
        self._separators = ["\n\n", "\n", ". ", " "]

    def _token_count(self, text: str) -> int:
        """Count tokens in a text string."""
        return len(self._tokenizer.encode(text))

    def _split_text(self, text: str, separators: list[str]) -> list[str]:
        """Recursively split text by trying separators in order."""
        final_chunks: list[str] = []

        # Find the appropriate separator
        separator = separators[-1]
        for sep in separators:
            if sep in text:
                separator = sep
                break

        splits = text.split(separator)
        current_chunk: list[str] = []
        current_tokens = 0

        for split in splits:
            split_tokens = self._token_count(split)

            if current_tokens + split_tokens > self.chunk_size and current_chunk:
                # Save current chunk
                chunk_text = separator.join(current_chunk)
                final_chunks.append(chunk_text)

                # Keep overlap — take trailing elements from current chunk
                overlap_chunks: list[str] = []
                overlap_tokens = 0
                for item in reversed(current_chunk):
                    item_tokens = self._token_count(item)
                    if overlap_tokens + item_tokens > self.chunk_overlap:
                        break
                    overlap_chunks.insert(0, item)
                    overlap_tokens += item_tokens

                current_chunk = overlap_chunks
                current_tokens = overlap_tokens

            current_chunk.append(split)
            current_tokens += split_tokens

        # Don't forget the last chunk
        if current_chunk:
            final_chunks.append(separator.join(current_chunk))

        return final_chunks

    def chunk_text(self, text: str, metadata: dict | None = None) -> list[TextChunk]:
        """
        Split text into overlapping chunks with metadata.

        Args:
            text: The full text to chunk.
            metadata: Metadata to attach to each chunk (e.g., episode info).

        Returns:
            List of TextChunk objects with content, index, and token count.
        """
        if not text or not text.strip():
            return []

        raw_chunks = self._split_text(text.strip(), self._separators)

        chunks = []
        for i, chunk_text in enumerate(raw_chunks):
            chunk_text = chunk_text.strip()
            if not chunk_text:
                continue

            chunks.append(
                TextChunk(
                    content=chunk_text,
                    chunk_index=i,
                    token_count=self._token_count(chunk_text),
                    metadata=metadata or {},
                )
            )

        logger.info(
            "chunking_complete",
            total_chunks=len(chunks),
            avg_tokens=sum(c.token_count for c in chunks) // max(len(chunks), 1),
        )

        return chunks

    split_text = chunk_text


# Alias for compatibility
RecursiveCharacterChunker = RecursiveChunker
