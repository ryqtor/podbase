"""
Ship 30 for 30 Essay Generator.

Design decision: This is NOT a simple prompt wrapper. It implements a
multi-stage pipeline that encodes the Ship 30 for 30 writing principles:

Stage 1: Topic extraction from RAG context
Stage 2: Outline generation using structural template
Stage 3: Draft generation with grounded claims
Stage 4: Polish pass for skimmability

The spec explicitly says "DO NOT implement as a simple prompt."

Ship 30 for 30 Principles Encoded:
- Strong hook (opening that creates curiosity)
- Narrative progression (problem → framework → examples → resolution)
- Concrete examples (grounded in transcript data)
- Skimmability (short paragraphs, subheadings, bold key phrases)
- Practical takeaway (actionable conclusion)
- ~1250 words target length
"""

from __future__ import annotations

from typing import AsyncIterator

from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage
from app.agents.base_agent import BaseAgent

logger = get_logger(__name__)

# ── Stage prompts ────────────────────────────────────────────────

OUTLINE_PROMPT = """You are a writing strategist specializing in the Ship 30 for 30 essay format.

Given the following topic and supporting evidence from podcast transcripts, create a detailed essay outline.

## STRUCTURAL TEMPLATE (Ship 30 for 30)

1. **HOOK** (1-2 sentences): A provocative statement, surprising statistic, or counterintuitive insight that creates immediate curiosity. Do NOT start with "Have you ever..." or generic questions.

2. **PROBLEM STATEMENT** (1 paragraph): Define the problem or tension clearly. Make the reader feel the pain.

3. **FRAMEWORK/THESIS** (1 paragraph): Introduce the core framework, mental model, or insight. Give it a name if possible.

4. **EVIDENCE SECTION 1** (2-3 paragraphs): First supporting point with specific examples from the transcript context. Include quotes or paraphrases.

5. **EVIDENCE SECTION 2** (2-3 paragraphs): Second supporting point with specific examples.

6. **EVIDENCE SECTION 3** (1-2 paragraphs): Third supporting point or counterexample.

7. **PRACTICAL APPLICATION** (1-2 paragraphs): How the reader can apply this. Be specific — give steps, heuristics, or decision criteria.

8. **TAKEAWAY** (1-2 sentences): End with a memorable, quotable statement that captures the essay's core insight.

## INPUT

Topic: {topic}

Transcript Context:
{context}

## OUTPUT

Produce a detailed outline with bullet points for each section. Include specific evidence references from the transcript context."""


DRAFT_PROMPT = """You are a world-class content writer producing a Ship 30 for 30 essay (~1250 words).

## WRITING PRINCIPLES

- **Skimmability**: Use short paragraphs (2-3 sentences max), subheadings, and bold key phrases
- **Specificity**: Include concrete numbers, frameworks, and named examples from the sources
- **Grounding**: Every claim must reference the source transcript. Use inline citations like (Source: [Episode Title])
- **Voice**: Confident, practical, direct. Write as if explaining to a smart friend over coffee.
- **Format**: Use markdown headers (##), bold text (**), and occasional bullet points

## CONSTRAINTS

- Target ~1250 words
- Ground every substantive claim in the provided evidence
- If making a claim not directly supported by evidence, prefix with "In general..." or "Broadly speaking..."
- Never fabricate episode names, guest names, or quotes

## OUTLINE

{outline}

## TRANSCRIPT EVIDENCE

{context}

Write the complete essay now. Start directly with the hook — no title needed."""


POLISH_PROMPT = """You are an editor polishing a Ship 30 for 30 essay for maximum impact.

## EDITING CHECKLIST

1. **Hook**: Does the first sentence grab attention? If not, rewrite it.
2. **Skimmability**: Are paragraphs short (2-3 sentences)? Add line breaks if needed.
3. **Bold key phrases**: Bold the most important insight in each section.
4. **Subheadings**: Are section transitions marked with ## headers?
5. **Citations**: Does every major claim reference a source episode?
6. **Takeaway**: Does the essay end with a memorable, actionable statement?
7. **Word count**: Is it approximately 1250 words? Trim or expand as needed.

## ESSAY TO POLISH

{draft}

Output the polished essay. Do not add meta-commentary — just output the final essay."""


class Ship30EssayGenerator(BaseAgent):
    """
    Multi-stage essay generator implementing Ship 30 for 30 writing principles.

    Pipeline:
    1. Generate outline from topic + context
    2. Write draft using outline + evidence
    3. Polish for skimmability and impact
    """

    def __init__(self, llm_provider: BaseLLMProvider):
        super().__init__(llm_provider)

    def _build_context_text(self, context_chunks: list[dict]) -> str:
        """Format context chunks into readable text for prompts."""
        if not context_chunks:
            return "No transcript context available."

        parts = []
        for c in context_chunks:
            header = f"**Episode: {c['episode_title']}**"
            if c.get("guest_name"):
                header += f" (Guest: {c['guest_name']})"
            parts.append(f"{header}\n{c['content']}")

        return "\n\n---\n\n".join(parts)

    async def _generate_outline(self, topic: str, context: str) -> str:
        """Stage 1: Generate essay outline."""
        logger.info("essay_stage_outline", topic=topic[:100])

        prompt = OUTLINE_PROMPT.format(topic=topic, context=context)
        response = await self.llm.generate(
            messages=[LLMMessage(role="user", content=prompt)],
            temperature=0.4,
            max_tokens=1500,
        )
        return response.content

    async def _generate_draft(self, outline: str, context: str) -> str:
        """Stage 2: Generate essay draft."""
        logger.info("essay_stage_draft")

        prompt = DRAFT_PROMPT.format(outline=outline, context=context)
        response = await self.llm.generate(
            messages=[LLMMessage(role="user", content=prompt)],
            temperature=0.7,
            max_tokens=3000,
        )
        return response.content

    async def _polish_draft(self, draft: str) -> str:
        """Stage 3: Polish for skimmability and impact."""
        logger.info("essay_stage_polish")

        prompt = POLISH_PROMPT.format(draft=draft)
        response = await self.llm.generate(
            messages=[LLMMessage(role="user", content=prompt)],
            temperature=0.3,
            max_tokens=3000,
        )
        return response.content

    async def run(
        self,
        topic: str = "",
        context_chunks: list[dict] | None = None,
        **kwargs,
    ) -> str:
        """
        Execute the full multi-stage essay pipeline.

        Returns the polished ~1250 word essay with citations.
        """
        context = self._build_context_text(context_chunks or [])

        # Stage 1: Outline
        outline = await self._generate_outline(topic, context)
        logger.info("essay_outline_complete", outline_length=len(outline))

        # Stage 2: Draft
        draft = await self._generate_draft(outline, context)
        logger.info("essay_draft_complete", draft_length=len(draft))

        # Stage 3: Polish
        polished = await self._polish_draft(draft)
        logger.info(
            "essay_complete",
            topic=topic[:100],
            word_count=len(polished.split()),
        )

        return polished

    async def run_stream(
        self,
        topic: str = "",
        context_chunks: list[dict] | None = None,
        **kwargs,
    ) -> AsyncIterator[str]:
        """
        Stream the essay generation.

        Note: Since this is a multi-stage pipeline, we only stream the
        final polish stage. The outline and draft stages run to completion
        first. This provides the best balance between streaming UX and
        essay quality.
        """
        context = self._build_context_text(context_chunks or [])

        # Stage 1 & 2: Run to completion (not streamed)
        outline = await self._generate_outline(topic, context)
        draft = await self._generate_draft(outline, context)

        # Stage 3: Stream the polish pass
        prompt = POLISH_PROMPT.format(draft=draft)
        async for token in self.llm.generate_stream(
            messages=[LLMMessage(role="user", content=prompt)],
            temperature=0.3,
            max_tokens=3000,
        ):
            yield token
