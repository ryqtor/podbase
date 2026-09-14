"""
Tests for chunking logic and token splitting.
"""

from app.retrieval.chunker import RecursiveCharacterChunker


def test_chunker_basic_splitting():
    chunker = RecursiveCharacterChunker(chunk_size=100, chunk_overlap=20)
    text = (
        "In product management, the LNO framework provides clarity on where to spend effort. "
        "Leverage tasks give 10x returns. Neutral tasks give 1x returns. Overhead tasks give less than 0.2x return. "
        "High agency leaders challenge constraints and focus ruthlessly on strategic leverage. "
        "When you avoid consensus-seeking bureaucracy, execution speed increases exponentially."
    )
    chunks = chunker.split_text(text, metadata={"episode": "Shreyas Doshi"})

    assert len(chunks) >= 1
    for chunk in chunks:
        assert len(chunk.content) > 0
        assert chunk.metadata["episode"] == "Shreyas Doshi"
        assert chunk.token_count is not None
        assert chunk.token_count > 0


def test_chunker_empty_text():
    chunker = RecursiveCharacterChunker(chunk_size=500, chunk_overlap=50)
    chunks = chunker.split_text("")
    assert chunks == []


def test_chunker_dialogue_preservation():
    chunker = RecursiveCharacterChunker(chunk_size=200, chunk_overlap=20)
    dialogue = (
        "Lenny: Welcome Brian.\n\n"
        "Brian Chesky: Thanks Lenny. Founder mode is all about being in the details.\n\n"
        "Lenny: How do you avoid becoming a bottleneck?"
    )
    chunks = chunker.split_text(dialogue)
    assert len(chunks) >= 1
    assert "Brian Chesky:" in chunks[0].content or "Lenny:" in chunks[0].content
