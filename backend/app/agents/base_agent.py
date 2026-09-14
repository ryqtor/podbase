"""
Base agent interface.

Design decision: Agents encapsulate prompt engineering and LLM interaction
patterns. Each agent type (QA, Essay, Artifact) has a different prompt
strategy and output format, but they all share the same interface.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import AsyncIterator

from app.infrastructure.llm.base_provider import BaseLLMProvider


class BaseAgent(ABC):
    """Base interface for all agents."""

    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider

    @abstractmethod
    async def run(self, **kwargs) -> str:
        """Execute the agent and return the result."""
        ...

    @abstractmethod
    async def run_stream(self, **kwargs) -> AsyncIterator[str]:
        """Execute the agent with streaming output."""
        ...
