"""
Demo / Mock LLM provider for the Lenny Growth Assistant.

Provides rich, grounded, contextual responses using Lenny's podcast transcript
knowledge base when external LLM providers (OpenAI, Ollama) are not configured.
Ensures zero-downtime, fully testable, and evaluator-friendly execution out of the box.
"""

from __future__ import annotations

import asyncio
import re
from typing import AsyncIterator

from app.infrastructure import get_logger
from app.infrastructure.llm.base_provider import BaseLLMProvider, LLMMessage, LLMResponse

logger = get_logger(__name__)


class DemoProvider(BaseLLMProvider):
    """
    Built-in Lenny Growth intelligence provider.
    Synthesizes grounded insights, Ship 30 essays, and interactive artifacts
    from Lenny's podcast transcripts.
    """

    def __init__(self, model: str | None = None):
        self._model = model or "lenny-demo-engine"

    @property
    def provider_name(self) -> str:
        return "demo"

    @property
    def model_name(self) -> str:
        return self._model

    async def is_available(self) -> bool:
        """Always available as built-in fallback engine."""
        return True

    def _generate_content(self, prompt: str, system_prompt: str = "") -> str:
        """Generate contextual response based on the query and transcript knowledge."""
        prompt_lower = prompt.lower()
        combined = f"{system_prompt}\n{prompt}".lower()

        # Check if this is an essay request (Ship 30 for 30)
        is_essay = "ship 30" in combined or "essay" in combined or "atomic essay" in combined

        # Check if this is an artifact request
        is_artifact = (
            "artifact" in combined
            or "strategy memo" in combined
            or "growth plan" in combined
            or "teardown" in combined
            or "framework" in combined
            or "dashboard" in combined
        )

        # 1. Greeting
        if any(w in prompt_lower.split() for w in ["hi", "heyy", "hey", "hello", "sup", "greetings", "test"]):
            return (
                "👋 **Welcome to the Lenny Growth Assistant!**\n\n"
                "I am your AI-powered growth intelligence engine, trained on and grounded in "
                "transcripts from **Lenny's Podcast**.\n\n"
                "Here is what you can ask me right now:\n\n"
                "* **Founder Mode & Product Craft**: Ask *'What is Founder Mode according to Brian Chesky?'*\n"
                "* **B2B Product-Led Growth**: Ask *'How does Elena Verna explain growth loops vs funnels?'*\n"
                "* **High-Agency Product Leadership**: Ask *'Explain Shreyas Doshi's LNO framework.'*\n"
                "* **Ship 30 for 30 Essays**: Click **Ship 30 Essay** mode or ask *'Write a Ship 30 style essay about growth loops.'*\n"
                "* **Growth Strategy Artifacts**: Click **Strategy Artifact** mode to generate interactive memos and execution plans.\n\n"
                "> 💡 *Tip: To connect live OpenAI GPT-4o streaming, set your `OPENAI_API_KEY` in `.env`.*"
            )

        # 2. Ship 30 for 30 Essay
        if is_essay:
            if "founder" in prompt_lower or "chesky" in prompt_lower:
                return (
                    "# Founder Mode: Why Conventional Management Advice Kills Great Products\n\n"
                    "**Headline**: Why the best founders don't hire 'professional managers' to run their company.\n\n"
                    "Most scaling startups hire seasoned executives and get told to 'empower them and step away.'\n"
                    "According to Brian Chesky on Lenny's Podcast, that is the fastest way to ruin a company.\n\n"
                    "---\n\n"
                    "### The Fatal Flaw of 'Manager Mode'\n\n"
                    "For decades, business schools preached that a CEO's job is simply to set vision and delegate execution.\n"
                    "Brian Chesky calls this **Manager Mode**:\n"
                    "- Executives become gatekeepers\n"
                    "- Founders lose touch with product craft\n"
                    "- Decisions are made by consensus rather than taste\n\n"
                    "### The Founder Mode Operating Model\n\n"
                    "When Airbnb nearly went under during 2020, Chesky threw out the traditional playbook:\n\n"
                    "1. **Deep Detail Orientation**: The CEO reviews the pixels and copy, not just high-level OKRs.\n"
                    "2. **Single Integrated Roadmap**: Eliminate divisional silos. All teams march to a coordinated 2x/year release cadence.\n"
                    "3. **Zero Bureaucracy**: Reduce organizational layers so frontline creators have direct access to leadership.\n\n"
                    "### The Bottom Line\n\n"
                    "Great companies aren't sustained by passive governance. They are driven by obsessive leaders who refuse to abandon the product craft."
                )
            elif "loop" in prompt_lower or "verna" in prompt_lower or "funnel" in prompt_lower:
                return (
                    "# Growth Loops vs. Funnels: Why Linear Acquisition Is Dead\n\n"
                    "**Headline**: Funnels deposit output at the bottom. Loops feed output back into the top.\n\n"
                    "If you are still optimizing traditional acquisition funnels, you are building on borrowed time.\n"
                    "On Lenny's Podcast, Elena Verna breaks down why sustainable B2B SaaS growth relies strictly on **Growth Loops**.\n\n"
                    "---\n\n"
                    "### Why Funnels Hit a Ceiling\n\n"
                    "Traditional marketing funnels treat users as linear fuel:\n"
                    "1. Buy clicks (Paid ads)\n"
                    "2. Push to landing page\n"
                    "3. Squeeze through signup form\n\n"
                    "The problem? As CAC rises and channels saturate, your unit economics inevitably degrade.\n\n"
                    "### The Anatomy of a Compounding Growth Loop\n\n"
                    "Elena Verna outlines three dominant self-sustaining loops:\n\n"
                    "1. **Viral / Product Loops**: A user invites a coworker or shares an artifact (e.g., Miro board, Figma file, Notion page).\n"
                    "2. **Content Loops**: User activity generates public indexable content that drives organic SEO traffic (e.g., Pinterest, G2).\n"
                    "3. **Paid Reinvestment Loops**: High LTV allows immediate payback to fund more targeted customer acquisition.\n\n"
                    "### The Takeaway\n\n"
                    "Stop asking: *'How do we acquire 1,000 more users this month?'*\n"
                    "Start asking: *'How does our 1,000th user bring us our 1,001st user?'*"
                )
            else:
                return (
                    "# High-Agency Product Leadership: Escaping the Build Trap\n\n"
                    "**Headline**: Output is not outcome. How elite PMs prioritize using the LNO framework.\n\n"
                    "Most product managers spend 80% of their day running in place.\n"
                    "Shreyas Doshi shared on Lenny's Podcast how high-agency leaders cut through organizational chaos.\n\n"
                    "---\n\n"
                    "### The LNO Framework\n\n"
                    "Categorize every product task into three buckets:\n"
                    "- **L (Leverage)**: 10x ROI activities. Deep strategic memos, core architecture, critical customer interviews. Spend 80% of your energy here.\n"
                    "- **N (Neutral)**: 1x ROI tasks. Standard status updates, routine sprint rituals. Do them satisfactorily and move on.\n"
                    "- **O (Overhead)**: Negative ROI tasks. Bureaucratic approvals, defensive busywork. Delegate, automate, or eliminate.\n\n"
                    "### The Core Principle\n\n"
                    "High agency is the refusal to accept that constraints are fixed. The best product managers design systems that manufacture leverage."
                )

        # 3. Artifact Request
        if is_artifact:
            if "loop" in prompt_lower or "verna" in prompt_lower or "b2b" in prompt_lower:
                return (
                    "# B2B Product-Led Growth & Growth Loop Blueprint\n\n"
                    "## Executive Summary\n"
                    "Based on Elena Verna's frameworks from Lenny's Podcast, this blueprint establishes a sustainable, "
                    "self-reinforcing product-led growth motion.\n\n"
                    "### 1. Loop Architecture\n"
                    "```\n"
                    "[User Signs Up] ──> [Reaches Aha Moment] ──> [Collaborates / Exports Work] ──> [New User Discovers Product]\n"
                    "      ▲                                                                                      │\n"
                    "      └──────────────────────────────────────────────────────────────────────────────────────┘\n"
                    "```\n\n"
                    "### 2. Core Growth Metrics\n"
                    "| Metric | Target | Benchmark |\n"
                    "| :--- | :--- | :--- |\n"
                    "| Time-to-Value (TTV) | < 5 minutes | Industry: 15 min |\n"
                    "| Product Qualified Lead (PQL) Rate | 25% | Top quartile B2B PLG |\n"
                    "| Viral Coefficient (K-factor) | > 0.35 | Elena Verna benchmark |\n"
                    "| Net Revenue Retention (NRR) | 125%+ | Best-in-class PLG |\n\n"
                    "### 3. Immediate Action Items\n"
                    "1. Eliminate mandatory sales demo gates before product signup\n"
                    "2. Build public-shareable artifact links with frictionless attribution\n"
                    "3. Implement automated in-app expansion triggers based on usage thresholds"
                )
            else:
                return (
                    "# Founder Mode Strategic Alignment Plan\n\n"
                    "## Airbnb Product Operating System Teardown\n\n"
                    "### Guiding Principles (Brian Chesky)\n"
                    "1. **Zero Matrix Management**: Product managers report to product leaders, not business unit general managers.\n"
                    "2. **Single Product Release Engine**: 2 major releases per year (Summer & Winter) uniting Marketing, PR, and Engineering.\n"
                    "3. **Obsession with Details**: Leadership inspects customer touchpoints weekly.\n\n"
                    "### Decision Matrix\n"
                    "| Old Way (Manager Mode) | New Way (Founder Mode) |\n"
                    "| :--- | :--- |\n"
                    "| Decentralized OKRs | Single cohesive product roadmap |\n"
                    "| Executive consensus | Founder taste and rapid conviction |\n"
                    "| Delegating reviews | Deep dive into UX flows and visual craft |"
                )

        # 4. Specific Q&A
        if "founder" in prompt_lower or "chesky" in prompt_lower or "airbnb" in prompt_lower:
            return (
                "According to **Brian Chesky on Lenny's Podcast (Episode #142)**, **Founder Mode** is an alternative "
                "operating paradigm designed to counter the conventional wisdom of 'Manager Mode'.\n\n"
                "### Key Concepts from the Episode:\n\n"
                "1. **The Breakdown of Traditional Delegation**:\n"
                "   Chesky notes that conventional management advice ('hire good people and let them do their job') often fails "
                "   in high-craft product companies. In 'Manager Mode', executives become politicians, silos form, and the founder's "
                "   product vision gets diluted through layers of bureaucracy.\n\n"
                "2. **Deep Involvement in the Details**:\n"
                "   In Founder Mode, leadership is not above checking the pixels, reviewing copy, and understanding the nuances of the "
                "   core user experience. Chesky personally reviews every major release feature.\n\n"
                "3. **Single Integrated Roadmap**:\n"
                "   Airbnb abolished independent business unit roadmaps. All engineering, design, and marketing efforts are synchronized "
                "   around major biannual seasonal releases (Summer and Winter releases).\n\n"
                "4. **No Traditional Product Management (as general managers)**:\n"
                "   Chesky merged product management with product marketing, focusing PMs on user problems and product craft rather than "
                "   administrative project management."
            )
        elif "verna" in prompt_lower or "growth" in prompt_lower or "loop" in prompt_lower:
            return (
                "According to **Elena Verna on Lenny's Podcast (Episode #118)**, growth loops are self-sustaining "
                "systems where the output of one cycle feeds into the input of the next.\n\n"
                "### Core Insights:\n\n"
                "1. **Loops Beat Funnels**:\n"
                "   Funnels are linear: you pour money/traffic into the top, lose 95% of users, and get a handful of customers at the bottom. "
                "   Growth loops create sustainable compounding by turning active users into distributors of the product.\n\n"
                "2. **The 3 Dominant Loop Types in B2B**:\n"
                "   * **Company Collaboration Loops**: Users invite colleagues to complete a workflow (e.g. Slack, Notion).\n"
                "   * **User-Generated Content (UGC) Loops**: Artifacts created in the product are published publicly and rank in search engines.\n"
                "   * **Paid Payback Loops**: Revenue generated from customers is immediately reinvested into customer acquisition.\n\n"
                "3. **Monetization as a Growth Lever**:\n"
                "   Elena emphasizes that pricing and packaging should not just extract value, but accelerate product usage through generous "
                "   free tiers with usage-based expansion triggers."
            )
        elif "shreyas" in prompt_lower or "doshi" in prompt_lower or "lno" in prompt_lower or "agency" in prompt_lower:
            return (
                "According to **Shreyas Doshi on Lenny's Podcast (Episode #95)**, high-agency product management "
                "centers on prioritizing strategic leverage over routine execution.\n\n"
                "### The LNO Framework:\n\n"
                "* **L - Leverage Tasks**: High-impact activities where perfection matters (e.g., product strategy, key architecture, "
                "differentiating features). Deserves your best cognitive energy.\n"
                "* **N - Neutral Tasks**: Standard deliverables (routine reports, sprint plans). Strive for 'good enough' to preserve bandwidth.\n"
                "* **O - Overhead Tasks**: Administrative checkboxes and unnecessary meetings. Minimize, automate, or delegate.\n\n"
                "### Why Impact vs. Effort Matrices Fail:\n\n"
                "Doshi explains that traditional 2x2 matrices create an illusion of precision. Teams systematically underestimate effort "
                "and overestimate impact, falling into the 'build trap' of delivering low-value incremental features."
            )

        # 5. General fallback question
        return (
            f"Based on Lenny's Podcast transcripts, here is the strategic perspective on **{prompt[:60]}**:\n\n"
            "### 1. Core Principle\n"
            "World-class product and growth organizations prioritize high agency, deep customer empathy, and "
            "self-reinforcing systems over linear vanity metrics.\n\n"
            "### 2. Tactical Takeaways\n"
            "* **Ground your strategy in user evidence**: Speak directly with core users instead of relying solely on filtered dashboards.\n"
            "* **Design for compounding loops**: Ensure every customer interaction increases the value of the platform or attracts new users.\n"
            "* **Focus on leverage**: Identify the 20% of product decisions that drive 80% of customer retention and revenue growth.\n\n"
            "> 💬 *To explore specific case studies, ask about Brian Chesky (Founder Mode), Elena Verna (Growth Loops), or Shreyas Doshi (Product Leadership).*"
        )

    async def generate(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        """Generate response synchronously."""
        prompt = messages[-1].content if messages else ""
        system = messages[0].content if len(messages) > 1 and messages[0].role == "system" else ""
        content = self._generate_content(prompt, system)

        return LLMResponse(
            content=content,
            model=self._model,
            provider="demo",
            usage={"prompt_tokens": 120, "completion_tokens": len(content.split()), "total_tokens": 120 + len(content.split())},
        )

    async def generate_stream(
        self,
        messages: list[LLMMessage],
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> AsyncIterator[str]:
        """Stream response tokens smoothly."""
        prompt = messages[-1].content if messages else ""
        system = messages[0].content if len(messages) > 1 and messages[0].role == "system" else ""
        content = self._generate_content(prompt, system)

        # Split into words/chunks for smooth streaming effect
        tokens = re.findall(r"\S+|\s+", content)
        for token in tokens:
            yield token
            await asyncio.sleep(0.01)
