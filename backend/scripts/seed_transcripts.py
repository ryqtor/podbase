"""
Seed script: ingests all transcripts from data/transcripts into the database.

Can be run via:
    python scripts/seed_transcripts.py
Or inside docker container:
    docker compose exec backend python scripts/seed_transcripts.py
"""

from __future__ import annotations

import asyncio
import os
import re
import sys
from datetime import date, datetime
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if not backend_dir.exists():
    backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.config import get_settings
from app.persistence.database import get_session_factory, init_db
from app.services.ingest_service import IngestionService


def parse_transcript_metadata(content: str) -> dict:
    """Extract metadata header fields if present, else default."""
    metadata = {
        "episode_title": "Lenny's Podcast Episode",
        "episode_number": None,
        "guest_name": "Lenny's Guest",
        "publish_date": None,
        "raw_text": content,
    }

    lines = content.splitlines()
    body_start_idx = 0

    for idx, line in enumerate(lines[:15]):
        if line.startswith("Episode:"):
            metadata["episode_title"] = line.replace("Episode:", "").strip()
        elif line.startswith("Episode Number:"):
            try:
                metadata["episode_number"] = int(line.replace("Episode Number:", "").strip())
            except ValueError:
                pass
        elif line.startswith("Guest:"):
            metadata["guest_name"] = line.replace("Guest:", "").strip()
        elif line.startswith("Publish Date:"):
            date_str = line.replace("Publish Date:", "").strip()
            try:
                metadata["publish_date"] = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                metadata["publish_date"] = date.today()
        elif line.strip() == "" and idx > 2:
            body_start_idx = idx + 1
            break

    if body_start_idx > 0:
        metadata["raw_text"] = "\n".join(lines[body_start_idx:]).strip()

    return metadata


async def seed():
    print("🚀 Initializing database connection...")
    await init_db()

    transcripts_dir = backend_dir / "data" / "transcripts"
    if not transcripts_dir.exists():
        print(f"❌ Transcripts directory not found at: {transcripts_dir}")
        return

    transcript_files = list(transcripts_dir.glob("*.txt"))
    if not transcript_files:
        print(f"⚠️ No .txt files found in {transcripts_dir}")
        return

    print(f"📂 Found {len(transcript_files)} transcript files to ingest.")

    factory = get_session_factory()
    async with factory() as session:
        service = IngestionService(session)

        for file_path in transcript_files:
            print(f"\n📄 Processing: {file_path.name}...")
            content = file_path.read_text(encoding="utf-8")
            meta = parse_transcript_metadata(content)

            try:
                result = await service.ingest_transcript(
                    raw_text=meta["raw_text"],
                    episode_title=meta["episode_title"],
                    episode_number=meta["episode_number"],
                    guest_name=meta["guest_name"],
                    publish_date=meta["publish_date"] or date.today(),
                )
                await session.commit()
                print(
                    f"✅ Successfully ingested: '{result['episode_title']}' "
                    f"({result['chunks_created']} chunks created, "
                    f"status: {result['status']})"
                )
            except Exception as e:
                await session.rollback()
                print(f"❌ Failed to ingest {file_path.name}: {e}")

    print("\n🎉 Seeding complete!")


if __name__ == "__main__":
    asyncio.run(seed())
