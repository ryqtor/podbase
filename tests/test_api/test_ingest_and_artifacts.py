"""
Tests for transcript ingestion and artifact endpoints.
"""

import io
import uuid
from datetime import date, datetime, timezone
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.persistence.models import ArtifactModel, TranscriptModel


@pytest.mark.asyncio
async def test_ingest_transcript_file(client: AsyncClient, mock_db_session):
    """Test uploading a transcript file for ingestion."""
    transcript_id = uuid.uuid4()
    fake_transcript = TranscriptModel(
        id=transcript_id,
        episode_title="Brian Chesky Interview",
        episode_number=142,
        guest_name="Brian Chesky",
        publish_date=date(2024, 9, 8),
        raw_text="Sample transcript text...",
        metadata_={},
        ingested_at=datetime.now(timezone.utc),
    )

    with patch("app.api.routes.ingest.IngestService") as mock_ingest_cls:
        service_instance = AsyncMock()
        service_instance.ingest_transcript.return_value = {
            "transcript_id": str(transcript_id),
            "episode_title": "Brian Chesky Interview",
            "chunks_created": 4,
            "embeddings_created": 0,
            "status": "partial_no_embeddings",
        }
        mock_ingest_cls.return_value = service_instance

        file_content = b"Episode: Brian Chesky Interview\nLenny: Hello Brian\nBrian: Hello Lenny, this is a sample transcript content that is long enough to pass the 100 character minimum validation check for ingestion."
        response = await client.post(
            "/api/ingest",
            data={
                "episode_title": "Brian Chesky Interview",
                "episode_number": "142",
                "guest_name": "Brian Chesky",
            },
            files={"file": ("transcript.txt", io.BytesIO(file_content), "text/plain")},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["transcript_id"] == str(transcript_id)
        assert data["chunks_created"] == 4


@pytest.mark.asyncio
async def test_get_artifact(client: AsyncClient, mock_db_session):
    """Test retrieving an artifact by ID."""
    artifact_id = uuid.uuid4()
    session_id = uuid.uuid4()
    fake_artifact = ArtifactModel(
        id=artifact_id,
        session_id=session_id,
        message_id=None,
        title="B2B Growth Engine Strategy Memo",
        artifact_type="markdown",
        content="# Strategy Memo\nKey growth loops...",
        metadata_={"agent": "artifact_agent"},
        created_at=datetime.now(timezone.utc),
    )

    with patch("app.api.routes.artifacts.ArtifactRepository") as mock_repo_cls:
        repo_instance = AsyncMock()
        repo_instance.get_by_id.return_value = fake_artifact
        mock_repo_cls.return_value = repo_instance

        response = await client.get(f"/api/artifacts/{artifact_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(artifact_id)
        assert data["title"] == "B2B Growth Engine Strategy Memo"
        assert data["artifact_type"] == "markdown"
