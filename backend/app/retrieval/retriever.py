"""
Retrieval module — orchestrates vector search and reranking.

Design decision: The Retriever class coordinates between the embedding
provider and the transcript repository's similarity search. It adds
a reranking step using LLM-based relevance scoring to improve precision.

Tradeoff: A dedicated cross-encoder model (e.g., ms-marco-MiniLM) would
be faster and more accurate for reranking, but adds another model
dependency. Using the LLM for reranking keeps the stack simpler.
Documented as a future improvement.
"""

from __future__ import annotations

import time

from app.config import get_settings
from app.infrastructure import get_logger
from app.infrastructure.embeddings.base_embedder import BaseEmbedder
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage
from app.persistence.repositories.transcript_repo import TranscriptRepository
from app.schemas.chat import ChatSourceReference

logger = get_logger(__name__)


class Retriever:
    """
    RAG retrieval pipeline: embed query → vector search → rerank → return sources.
    """

    def __init__(
        self,
        transcript_repo: TranscriptRepository,
        embedder: BaseEmbedder,
    ):
        self.transcript_repo = transcript_repo
        self.embedder = embedder

    async def retrieve(
        self,
        query: str,
        top_k: int | None = None,
        rerank_top_k: int | None = None,
        llm_provider: BaseLLMProvider | None = None,
    ) -> tuple[list[ChatSourceReference], list[dict], int]:
        """
        Retrieve relevant transcript chunks for a query.

        Returns:
            - sources: List of ChatSourceReference for citation
            - context_chunks: List of chunk dicts for prompt construction
            - retrieval_ms: Retrieval latency in milliseconds
        """
        settings = get_settings()
        top_k = top_k or settings.retrieval_top_k
        rerank_top_k = rerank_top_k or settings.rerank_top_k

        start_time = time.perf_counter()

        # Step 1: Embed the query
        query_embedding = await self.embedder.embed_text(query)

        # Step 2: Vector similarity search
        results = await self.transcript_repo.similarity_search(
            query_embedding=query_embedding,
            top_k=top_k,
        )

        if not results:
            retrieval_ms = int((time.perf_counter() - start_time) * 1000)
            logger.info("retrieval_empty", query=query[:100], retrieval_ms=retrieval_ms)
            return [], [], retrieval_ms

        # Step 3: Rerank using LLM (if provider available)
        if llm_provider and len(results) > rerank_top_k:
            results = await self._rerank(query, results, rerank_top_k, llm_provider)
        else:
            results = results[:rerank_top_k]

        # Step 4: Build source references
        sources = []
        context_chunks = []
        for r in results:
            chunk = r["chunk"]
            source = ChatSourceReference(
                episode_title=r["episode_title"],
                episode_number=r.get("episode_number"),
                guest_name=r.get("guest_name"),
                chunk_content=chunk.content[:500],  # Truncate for display
                similarity_score=round(r["similarity_score"], 4),
                chunk_index=chunk.chunk_index,
            )
            sources.append(source)
            context_chunks.append({
                "content": chunk.content,
                "episode_title": r["episode_title"],
                "episode_number": r.get("episode_number"),
                "guest_name": r.get("guest_name"),
            })

        retrieval_ms = int((time.perf_counter() - start_time) * 1000)
        logger.info(
            "retrieval_complete",
            query=query[:100],
            results_count=len(sources),
            top_similarity=sources[0].similarity_score if sources else 0,
            retrieval_ms=retrieval_ms,
        )

        return sources, context_chunks, retrieval_ms

    async def _rerank(
        self,
        query: str,
        results: list[dict],
        top_k: int,
        llm_provider: BaseLLMProvider,
    ) -> list[dict]:
        """
        Rerank results using LLM-based relevance scoring.

        Sends each chunk to the LLM with the query and asks for a
        relevance score (0-10). This is slower than a cross-encoder
        but keeps the stack simpler.
        """
        try:
            # Build a scoring prompt
            chunks_text = ""
            for i, r in enumerate(results[:10]):  # Score top 10 only
                chunks_text += f"\n[{i}] {r['chunk'].content[:300]}\n"

            scoring_prompt = f"""Rate the relevance of each text chunk to the query on a scale of 0-10.
Return ONLY a JSON array of scores, e.g. [8, 3, 7, ...]

Query: {query}

Chunks:
{chunks_text}

Scores (JSON array only):"""

            response = await llm_provider.generate(
                messages=[LLMMessage(role="user", content=scoring_prompt)],
                temperature=0.0,
                max_tokens=200,
            )

            # Parse scores
            import json

            scores_text = response.content.strip()
            # Handle potential markdown code blocks
            if "```" in scores_text:
                scores_text = scores_text.split("```")[1]
                if scores_text.startswith("json"):
                    scores_text = scores_text[4:]
            scores = json.loads(scores_text)

            # Attach scores and sort
            scored_results = []
            for i, r in enumerate(results[:10]):
                score = scores[i] if i < len(scores) else 0
                scored_results.append((score, r))

            scored_results.sort(key=lambda x: x[0], reverse=True)
            return [r for _, r in scored_results[:top_k]]

        except Exception as e:
            logger.warning("reranking_failed", error=str(e))
            # Fallback to original order
            return results[:top_k]
