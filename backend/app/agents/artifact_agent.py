"""
Artifact Agent — generates structured documents (strategy memos,
growth plans, launch plans, product teardowns, etc.).

Design decision: The artifact agent detects the requested artifact type
from the user's query and generates appropriate content in either
markdown or HTML format. The output is persisted as an artifact and
rendered in the artifact viewer.
"""

from __future__ import annotations

from typing import AsyncIterator

from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage
from app.agents.base_agent import BaseAgent

logger = get_logger(__name__)

ARTIFACT_SYSTEM_PROMPT = """You are a senior product strategist creating professional artifacts based on insights from Lenny's Podcast transcripts.

## ARTIFACT TYPES YOU CAN CREATE

1. **Strategy Memo** — Executive-level summary of a strategic topic
2. **Growth Plan** — Actionable growth strategy with metrics and tactics
3. **Launch Plan** — Step-by-step product launch playbook
4. **Product Teardown** — Analysis of a product's strategy, growth levers, and lessons
5. **Experimentation Framework** — Testing methodology with hypothesis templates
6. **Competitive Analysis** — Market positioning and differentiation analysis
7. **Metrics Dashboard Spec** — Key metrics definitions and tracking plan

## RULES

1. **Ground in evidence**: Reference specific insights from the transcript context
2. **Be actionable**: Include specific steps, timelines, and metrics
3. **Professional formatting**: Use headers, tables, bullet points, and clear structure
4. **Cite sources**: Reference episode titles and guests where applicable
5. **No hallucination**: Only include information supported by the transcript context

## OUTPUT FORMAT

When the user asks for Markdown output: Use clean Markdown with headers, tables, and lists.
When the user asks for HTML output: Generate semantic HTML with inline CSS for professional styling.
Default to Markdown unless HTML is specifically requested."""


class ArtifactAgent(BaseAgent):
    """Generates structured document artifacts from transcript context."""

    def __init__(self, llm_provider: BaseLLMProvider):
        super().__init__(llm_provider)

    def _detect_artifact_type(self, query: str) -> tuple[str, str]:
        """
        Detect the artifact type and output format from the query.

        Returns: (artifact_type_label, output_format)
        """
        query_lower = query.lower()

        # Detect output format
        output_format = "markdown"
        if any(kw in query_lower for kw in ["html", "web page", "webpage", "styled"]):
            output_format = "html"

        # Detect artifact type
        if any(kw in query_lower for kw in ["strategy memo", "strategic memo", "memo"]):
            return "Strategy Memo", output_format
        elif any(kw in query_lower for kw in ["growth plan", "growth strategy"]):
            return "Growth Plan", output_format
        elif any(kw in query_lower for kw in ["launch plan", "launch playbook", "go-to-market"]):
            return "Launch Plan", output_format
        elif any(kw in query_lower for kw in ["teardown", "product teardown", "analysis"]):
            return "Product Teardown", output_format
        elif any(kw in query_lower for kw in ["experiment", "a/b test", "testing framework"]):
            return "Experimentation Framework", output_format
        elif any(kw in query_lower for kw in ["competitive", "competitor", "market analysis"]):
            return "Competitive Analysis", output_format
        elif any(kw in query_lower for kw in ["metrics", "dashboard", "kpi"]):
            return "Metrics Dashboard Spec", output_format
        elif any(kw in query_lower for kw in ["essay", "ship 30", "article"]):
            return "Ship 30 Essay", output_format
        else:
            return "Strategic Document", output_format

    def _build_messages(
        self,
        query: str,
        context_chunks: list[dict],
        artifact_type: str,
        output_format: str,
    ) -> list[LLMMessage]:
        """Build messages for artifact generation."""
        messages = [LLMMessage(role="system", content=ARTIFACT_SYSTEM_PROMPT)]

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

        format_instruction = (
            "Output in clean **HTML** with inline CSS. Use semantic tags, a professional color scheme (dark navy headers, clean typography), and responsive layout."
            if output_format == "html"
            else "Output in clean **Markdown** with headers, tables, and structured lists."
        )

        messages.append(
            LLMMessage(
                role="user",
                content=f"Create a {artifact_type}.\n\n{format_instruction}\n\nRequest: {query}",
            )
        )

        return messages

    async def run(
        self,
        query: str = "",
        context_chunks: list[dict] | None = None,
        **kwargs,
    ) -> dict:
        """
        Generate an artifact.

        Returns dict with: title, artifact_type, content, output_format
        """
        artifact_type, output_format = self._detect_artifact_type(query)

        logger.info(
            "artifact_agent_run",
            query=query[:100],
            artifact_type=artifact_type,
            output_format=output_format,
        )

        messages = self._build_messages(
            query, context_chunks or [], artifact_type, output_format
        )
        response = await self.llm.generate(
            messages=messages, temperature=0.5, max_tokens=4096
        )

        return {
            "title": f"{artifact_type}: {query[:100]}",
            "artifact_type": output_format,
            "content": response.content,
        }

    async def run_stream(
        self,
        query: str = "",
        context_chunks: list[dict] | None = None,
        **kwargs,
    ) -> AsyncIterator[str]:
        """Stream artifact generation."""
        artifact_type, output_format = self._detect_artifact_type(query)

        messages = self._build_messages(
            query, context_chunks or [], artifact_type, output_format
        )

        async for token in self.llm.generate_stream(
            messages=messages, temperature=0.5, max_tokens=4096
        ):
            yield token
