"""
Chat API route — SSE streaming endpoint.

Design decision: Uses sse-starlette for Server-Sent Events. The chat
endpoint returns an EventSourceResponse that streams token-by-token
output, source citations, artifact metadata, and timing information.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.persistence.database import get_db_session
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Send a message and receive a streamed response via SSE.

    Event types:
    - token: Streaming text content {"content": "..."}
    - sources: Citation references {"sources": [...]}
    - artifact: Generated artifact {"id": "...", "type": "...", "title": "..."}
    - metadata: Timing info {"retrieval_ms": ..., "generation_ms": ...}
    - done: Completion signal {}
    - error: Error info {"message": "..."}
    """

    async def event_generator():
        service = ChatService(db)
        async for event in service.process_message(
            session_id=request.session_id,
            message=request.message,
            model_provider=request.model_provider,
            model_name=request.model_name,
        ):
            yield {
                "event": event["event"],
                "data": json.dumps(event["data"]),
            }

    return EventSourceResponse(event_generator())
