"""
Chat service — orchestrates the RAG pipeline, agent routing, and response generation.

Design decision: The chat service is the primary orchestrator. It:
1. Detects user intent (question, essay, artifact)
2. Retrieves relevant context via the retriever
3. Routes to the appropriate agent
4. Streams the response
5. Persists messages with sources and timing metadata

This is the "brain" of the backend — it coordinates across all layers
without containing business logic from any specific layer.
"""

from __future__ import annotations

import time
import uuid
from typing import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession

from app.agents.artifact_agent import ArtifactAgent
from app.agents.essay_agent import Ship30EssayGenerator
from app.agents.qa_agent import QAAgent
from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.embeddings import OpenAIEmbedder
from app.infrastructure.llm import LLMMessage, NoProviderAvailableError, ProviderFactory
from app.persistence.repositories.artifact_repo import ArtifactRepository
from app.persistence.repositories.message_repo import MessageRepository
from app.persistence.repositories.session_repo import SessionRepository
from app.persistence.repositories.transcript_repo import TranscriptRepository
from app.retrieval.retriever import Retriever
from app.schemas.chat import ChatSourceReference

logger = get_logger(__name__)


class ChatService:
    """Orchestrates chat interactions across all layers."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.session_repo = SessionRepository(db)
        self.message_repo = MessageRepository(db)
        self.transcript_repo = TranscriptRepository(db)
        self.artifact_repo = ArtifactRepository(db)

    def _detect_intent(self, message: str) -> str:
        """
        Detect user intent from the message.

        Returns: "question", "essay", or "artifact"
        """
        msg_lower = message.lower()

        # Essay intent
        if any(kw in msg_lower for kw in [
            "write an essay", "ship 30", "essay about", "write about",
            "long-form", "article about",
        ]):
            return "essay"

        # Artifact intent
        if any(kw in msg_lower for kw in [
            "create a", "generate a", "build a", "make a",
            "strategy memo", "growth plan", "launch plan",
            "teardown", "experiment framework", "competitive analysis",
            "metrics dashboard",
        ]):
            return "artifact"

        # Default: question
        return "question"

    async def process_message(
        self,
        session_id: uuid.UUID,
        message: str,
        model_provider: str | None = None,
        model_name: str | None = None,
    ) -> AsyncIterator[dict]:
        """
        Process a chat message and yield SSE events.

        Yields dicts with "event" and "data" keys:
        - token: streaming text content
        - sources: citation references
        - artifact: generated artifact metadata
        - metadata: timing and model info
        - done: completion signal
        - error: error information
        """
        gen_start = time.perf_counter()

        try:
            # Validate session exists
            session = await self.session_repo.get_by_id(session_id)
            if not session:
                yield {"event": "error", "data": {"message": "Session not found"}}
                return

            # Resolve provider
            provider_name = model_provider or session.model_provider
            model = model_name or session.model_name

            try:
                llm_provider = await ProviderFactory.get_provider(provider_name, model)
            except NoProviderAvailableError as e:
                yield {"event": "error", "data": {"message": str(e)}}
                return

            # Save user message
            await self.message_repo.create(
                session_id=session_id,
                role="user",
                content=message,
            )

            # Detect intent
            intent = self._detect_intent(message)
            logger.info(
                "chat_intent_detected",
                intent=intent,
                session_id=str(session_id),
            )

            # Retrieve context
            settings = get_settings()
            embedder = OpenAIEmbedder()
            retriever = Retriever(self.transcript_repo, embedder)

            sources, context_chunks, retrieval_ms = await retriever.retrieve(
                query=message,
                llm_provider=llm_provider if settings.is_openai_configured else None,
            )

            # Emit sources
            if sources:
                yield {
                    "event": "sources",
                    "data": {
                        "sources": [s.model_dump() for s in sources],
                    },
                }

            # Route to appropriate agent
            full_response = ""

            if intent == "essay":
                agent = Ship30EssayGenerator(llm_provider)
                async for token in agent.run_stream(
                    topic=message, context_chunks=context_chunks
                ):
                    full_response += token
                    yield {"event": "token", "data": {"content": token}}

                # Save essay as artifact
                artifact = await self.artifact_repo.create(
                    title=f"Essay: {message[:100]}",
                    artifact_type="markdown",
                    content=full_response,
                    session_id=session_id,
                )
                yield {
                    "event": "artifact",
                    "data": {
                        "id": str(artifact.id),
                        "type": "markdown",
                        "title": artifact.title,
                    },
                }

            elif intent == "artifact":
                agent = ArtifactAgent(llm_provider)
                # Run non-streaming for artifact to get metadata
                result = await agent.run(
                    query=message, context_chunks=context_chunks
                )

                full_response = f"I've generated a **{result['title']}** for you. You can view it in the artifact panel."

                # Save artifact
                artifact = await self.artifact_repo.create(
                    title=result["title"],
                    artifact_type=result["artifact_type"],
                    content=result["content"],
                    session_id=session_id,
                )

                # Stream the summary message
                for token in full_response:
                    yield {"event": "token", "data": {"content": token}}

                yield {
                    "event": "artifact",
                    "data": {
                        "id": str(artifact.id),
                        "type": result["artifact_type"],
                        "title": result["title"],
                    },
                }

            else:  # question
                # Get chat history
                history_messages = await self.message_repo.get_session_messages(
                    session_id, limit=20
                )
                chat_history = [
                    {"role": m.role, "content": m.content}
                    for m in history_messages[:-1]  # Exclude the message we just saved
                ]

                agent = QAAgent(llm_provider)
                async for token in agent.run_stream(
                    query=message,
                    context_chunks=context_chunks,
                    chat_history=chat_history,
                ):
                    full_response += token
                    yield {"event": "token", "data": {"content": token}}

            # Calculate generation time
            generation_ms = int((time.perf_counter() - gen_start) * 1000)

            # Save assistant message
            artifact_id = None
            if intent in ("essay", "artifact"):
                artifact_id = artifact.id

            await self.message_repo.create(
                session_id=session_id,
                role="assistant",
                content=full_response,
                sources=[s.model_dump() for s in sources] if sources else [],
                artifact_id=artifact_id,
                model_provider=llm_provider.provider_name,
                model_name=llm_provider.model_name,
                retrieval_latency_ms=retrieval_ms,
                generation_latency_ms=generation_ms,
            )

            # Update session title if it's the first message
            if session.title == "New Chat" and message:
                title = message[:80] + ("..." if len(message) > 80 else "")
                await self.session_repo.update(session_id, title=title)

            # Emit metadata
            yield {
                "event": "metadata",
                "data": {
                    "retrieval_ms": retrieval_ms,
                    "generation_ms": generation_ms,
                    "model_provider": llm_provider.provider_name,
                    "model_name": llm_provider.model_name,
                    "sources_count": len(sources),
                    "intent": intent,
                },
            }

            yield {"event": "done", "data": {}}

        except Exception as e:
            logger.error(
                "chat_service_error",
                error=str(e),
                session_id=str(session_id),
            )
            yield {
                "event": "error",
                "data": {"message": "An error occurred processing your message. Please try again."},
            }
