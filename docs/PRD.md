# Lenny Growth Assistant — Product Requirements Document (PRD)

## 1. Executive Summary

**The Lenny Growth Assistant** is an enterprise-grade AI intelligence system engineered to transform hundreds of hours of Lenny's Podcast transcripts into actionable product, growth, and leadership intelligence. 

By combining semantic vector search over dialogue chunks, LLM-based reranking, multi-agent orchestration, and real-time streaming interfaces, the system delivers grounded Q&A, structured "Ship 30 for 30" essays, and interactive strategy artifacts (growth loop models, launch plans, and frameworks).

---

## 1.1 Forward Deployment Discovery Brief

### User and Problem Definition
- **Primary User**: Product Managers, Growth Leaders, and Founders who need proven frameworks and battle-tested advice from leading tech executives interviewed on Lenny's Podcast.
- **Job to Be Done**: Extract grounded insights, draft high-impact essays/memos, and build operational growth artifacts without listening through 200+ hours of audio or manually summarizing raw text.
- **Core Friction Removed**: Eliminates hallucinated LLM advice, saves hours of drafting time, and bridges the gap between raw conversational insights and rendered, actionable deliverables.

### Key Success Metrics
1. **Groundedness Ratio**: >95% of assistant claims cite exact transcript timestamps or episode excerpts.
2. **Hallucination Rate**: <2% on out-of-domain queries (triggering the "insufficient evidence" disclaimer).
3. **Deployment Velocity**: <2 minutes to deploy and run the system via `docker compose up`.
4. **Time-to-Artifact**: Under 5 seconds to generate and render interactive strategy artifacts.

### Key Assumptions
- **Assumed Data Format**: Transcripts are provided as plain text files with consistent speaker labels and episode headers.
- **Assumed Runtime Environment**: Evaluators will run the system either using cloud keys (OpenAI) or locally via Ollama with standard Docker hardware (8GB+ RAM).
- **Assumed Usage Model**: Sessions are scoped to individual product management/growth inquiries with multi-turn follow-ups.

### Scope Choices (Inclusions vs. Exclusions)
- **Included**:
  - Grounded RAG Q&A with episode citation metadata and similarity scores.
  - Dedicated "Ship 30 for 30" atomic essay generation engine (~1,250 words, hook, core framework, 1-2-3 takeaways).
  - Split-screen artifact workspace supporting interactive HTML/CSS and Markdown preview with DOMPurify sanitization.
  - Dual provider support (OpenAI + local Ollama `llama3.1:8b`) with zero-downtime model switching.
  - Full persistence in PostgreSQL + pgvector with session history tracking.
- **Excluded**:
  - Audio transcription pipeline (Whisper STT): Transcripts are ingested directly as raw text.
  - User authentication / multi-tenant RBAC: Designed as an internal team tool for simplified local evaluation.

### Risk Analysis & Mitigations
| Risk | Severity | Mitigation Strategy |
|---|---|---|
| **Hallucination** | High | Strict RAG prompt constraints + confidence threshold disclaimers for out-of-domain prompts. |
| **Unsafe Artifact Rendering** | High | Client-side DOMPurify tag/attribute whitelisting + iframe sandboxing (`allow-scripts allow-same-origin`). |
| **Latency & Cost** | Medium | pgvector HNSW indexing (<5ms search) + hybrid local model (Ollama) option for zero API costs. |
| **Local Model Quality** | Medium | Tailored system prompts for smaller local models (`llama3.1:8b`) to enforce output structure. |
| **Data Leakage** | Low | Local PostgreSQL database instance; zero telemetry or data sharing to third-party services. |

---

## 2. Target Personas & Problem Statements

| Persona | Needs & Goals | Core Friction Addressed |
|---|---|---|
| **Product Managers (PMs)** | Rapidly extract proven frameworks (e.g. LNO, Reverse Trials, Founder Mode) to apply to product roadmaps. | Searching through 200+ hours of unstructured audio/text is prohibitively time-consuming. |
| **Founders & Growth Leads** | Synthesize actionable growth loops, retention engines, and monetization models with explicit citations. | Generic LLM responses hallucinate frameworks and lack real-world practitioner nuances. |
| **Product Leaders & VPs** | Generate executive strategy memos and long-form essays to align organizations around best practices. | Turning raw transcript insights into persuasive, structured written artifacts requires hours of manual drafting. |

---

## 3. Key Value Propositions & Solution Pillars

### 3.1 Grounded RAG with Transparent Citations
- Every claim in conversational Q&A is grounded in indexed transcript chunks.
- Source citation cards display speaker names, episode titles, episode numbers, similarity percentages, and excerpt quotes.
- Fallback disclaimer triggers when similarity falls below empirical confidence thresholds.

### 3.2 Multi-Agent Intent Routing
- **Q&A Agent**: Concise, dialogue-informed responses with exact speaker attribution and cross-episode synthesis.
- **Ship 30 for 30 Essay Generator**: Multi-phase structural generator applying the atomic essay framework (Hook → Problem → Core Framework → Actionable Takeaways).
- **Interactive Artifact Agent**: Emits clean Markdown strategy memos or sandboxed HTML/CSS calculators, dashboards, and visual roadmaps.

### 3.3 Dual-Provider LLM Infrastructure
- Seamless runtime switching between OpenAI (`gpt-4o-mini`, `gpt-4o`) and local Ollama (`llama3.1:8b`).
- Automatic fallback chain with graceful degradation and system diagnostics via `/health`.

---

## 4. Functional Requirements

### 4.1 Ingestion & Knowledge Corpus
- `FR-1.1`: Support ingestion of raw `.txt` transcript files via REST API and frontend modal.
- `FR-1.2`: Automatically extract speaker metadata, episode titles, and episode numbers.
- `FR-1.3`: Chunk text using recursive character splitting (800 tokens, 100 token overlap) with semantic dialogue awareness.
- `FR-1.4`: Compute embeddings (1536-dim vector) and persist with HNSW indexing in PostgreSQL (`pgvector`).

### 4.2 Conversational Q&A & Streaming
- `FR-2.1`: Server-Sent Events (SSE) endpoint (`/api/chat`) streaming tokens with sub-second time-to-first-token.
- `FR-2.2`: Real-time emission of source citation payloads and latency telemetry (`retrieval_ms`, `generation_ms`).
- `FR-2.3`: Multi-turn conversational memory persisted in PostgreSQL with session scoping.

### 4.3 Artifact System & Split-Screen Workspace
- `FR-3.1`: Detect artifact intent and generate structured Markdown or HTML/CSS deliverables.
- `FR-3.2`: Split-screen workspace on the right with instant live preview and raw source code toggles.
- `FR-3.3`: HTML artifacts sanitized via DOMPurify and rendered in `<iframe sandbox="allow-scripts allow-same-origin">`.
- `FR-3.4`: Instant copy-to-clipboard and file download (`.md` / `.html`).

---

## 5. Non-Functional Requirements & SLAs

- **Latency**: Sub-300ms retrieval latency on vector similarity lookups; sub-1s time-to-first-token on streaming responses.
- **Reliability**: 99.9% uptime with automated health checks covering database connectivity and LLM provider availability.
- **Security**: Strict CSP on sandboxed iframe; DOMPurify tag whitelisting blocking `<script>`, `<iframe>`, and form injection.
- **Portability**: Zero external database dependencies — single command startup via `docker compose up`.

---

## 6. Success Metrics & Evaluation Criteria

1. **Groundedness Ratio**: >95% of assistant claims cite exact transcript timestamps or episode excerpts.
2. **Hallucination Rate**: <2% on out-of-domain queries (triggering the "insufficient evidence" disclaimer).
3. **First-Run Time**: <2 minutes to deploy and query the system via `docker compose up`.
