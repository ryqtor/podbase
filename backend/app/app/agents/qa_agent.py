"""
QA Agent — grounded question-answering over transcript corpus.

Design decision: The QA agent enforces strict grounding. Every answer
must cite source episodes and transcript references. If the retrieved
context doesn't support the answer, the agent must say so explicitly.

The system prompt encodes these requirements as behavioral constraints,
not suggestions. This is the primary defense against hallucination.
"""

from __future__ import annotations

from typing import AsyncIterator

from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage
from app.agents.base_agent import BaseAgent

logger = get_logger(__name__)

SYSTEM_PROMPT = """You are the Lenny Growth Assistant — an AI that answers product, growth, and startup questions based exclusively on Lenny Rachitsky's podcast transcripts.

## CORE RULES — NEVER VIOLATE

1. **Ground every claim.** Every substantive claim must be supported by the provided transcript context. If you make a claim, cite the source episode.

2. **Cite sources explicitly.** When referencing information, include:
   - Episode title
   - Guest name (if available)
   - A brief quote or paraphrase from the transcript

3. **Admit uncertainty.** If the provided context does not contain sufficient evidence to answer the question, respond with:
   "I could not find strong support for this in the transcript corpus. Based on the limited context available, [provide what you can with caveats]."

4. **Never hallucinate.** Do not fabricate episode names, guest names, quotes, or frameworks that are not in the provided context. If you're unsure, say so.

5. **Be specific.** Prefer concrete examples, frameworks, and actionable advice over generic platitudes. Lenny's podcast is valued for its specificity.

## RESPONSE FORMAT

- Use clear headers and structure for longer responses
- Bold key frameworks, names, and metrics
- Use bullet points for actionable items
- Keep responses focused and practical
- End with a brief summary or key takeaway when appropriate

## CONTEXT

The following transcript excerpts are provided as your knowledge base. Only use information from these excerpts."""


class QAAgent(BaseAgent):
    """
    Grounded Q&A agent that answers questions using transcript context.
    """

    def __init__(self, llm_provider: BaseLLMProvider):
        super().__init__(llm_provider)

    def _build_messages(
        self,
        query: str,
        context_chunks: list[dict],
        chat_history: list[dict] | None = None,
    ) -> list[LLMMessage]:
        """Build the message list for the LLM."""
        messages = [LLMMessage(role="system", content=SYSTEM_PROMPT)]

        # Add context
        if context_chunks:
            context_text = "\n\n---\n\n".join(
                f"**Episode: {c['episode_title']}**"
                + (f" (Guest: {c['guest_name']})" if c.get("guest_name") else "")
                + f"\n\n{c['content']}"
                for c in context_chunks
            )
            messages.append(
                LLMMessage(
                    role="system",
                    content=f"## TRANSCRIPT CONTEXT\n\n{context_text}",
                )
            )
        else:
            messages.append(
                LLMMessage(
                    role="system",
                    content="## NOTICE\nNo relevant transcript context was found for this query. You must acknowledge this limitation in your response.",
                )
            )

        # Add chat history (last 10 messages for context window management)
        if chat_history:
            for msg in chat_history[-10:]:
                messages.append(LLMMessage(role=msg["role"], content=msg["content"]))

        # Add the current query
        messages.append(LLMMessage(role="user", content=query))

        return messages

    async def run(
        self,
        query: str = "",
        context_chunks: list[dict] | None = None,
        chat_history: list[dict] | None = None,
        **kwargs,
    ) -> str:
        """Generate a grounded answer."""
        messages = self._build_messages(query, context_chunks or [], chat_history)

        logger.info(
            "qa_agent_run",
            query=query[:100],
            context_count=len(context_chunks or []),
            history_count=len(chat_history or []),
        )

        response = await self.llm.generate(messages=messages, temperature=0.3)
        return response.content

    async def run_stream(
        self,
        query: str = "",
        context_chunks: list[dict] | None = None,
        chat_history: list[dict] | None = None,
        **kwargs,
    ) -> AsyncIterator[str]:
        """Stream a grounded answer token by token."""
        messages = self._build_messages(query, context_chunks or [], chat_history)

        logger.info(
            "qa_agent_stream",
            query=query[:100],
            context_count=len(context_chunks or []),
        )

        async for token in self.llm.generate_stream(messages=messages, temperature=0.3):
            yield token
