# 🎙️ The Lenny Growth Assistant

> An AI-powered conversational web application that transforms **Lenny's Podcast transcripts** into a reliable, grounded product and growth intelligence system.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/pgvector-pg16-336791.svg?logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg?logo=docker&logoColor=white)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🌟 Overview & Capabilities

The **Lenny Growth Assistant** is engineered for Product Managers, Growth Leaders, and Founders who want instant, evidence-backed answers and structured strategic deliverables from the world's top product minds.

### Key Capabilities:
1. **Grounded Conversational Q&A**: Every answer is grounded in vector-embedded transcript chunks with speaker attribution, episode citations, and similarity metrics.
2. **Ship 30 for 30 Essay Generator**: A dedicated agent applying the atomic essay framework (Hook → Pain Point → Core Mental Model → Actionable Steps → One-Line Takeaway).
3. **Interactive Growth Artifacts**: Emits Markdown strategy memos, growth loop teardowns, and sandboxed HTML/CSS calculators in a split-screen workspace.
4. **Dual LLM Provider Support**: Seamless runtime switching between **OpenAI** (`gpt-4o-mini`, `gpt-4o`) and local **Ollama** (`llama3.1:8b`) with automatic fallback.
5. **Transcript Ingestion Pipeline**: Ingest and chunk custom podcast transcripts on-the-fly via the UI modal or REST API.

---

## 📐 System Architecture

```mermaid
graph TB
    subgraph "Frontend — Next.js 15 (:3000)"
        UI[Sleek Dark Mode UI]
        Sidebar[Session History & Ingestion Modal]
        ChatUI[SSE Stream & Source Citation Cards]
        Artifacts[Split-Screen Sandboxed Artifact Viewer]
    end

    subgraph "Backend — FastAPI (:8000)"
        API[API Router Layer]
        ChatSvc[Chat Orchestration Service]
        IngestSvc[Transcript Ingestion Pipeline]
        Retriever[pgvector Retriever + LLM Reranker]
        Agents[QA / Essay / Artifact Agents]
    end

    subgraph "Storage — PostgreSQL 16 (:5432)"
        DB[(PostgreSQL + pgvector)]
        SessionsTbl[(Sessions & Messages)]
        VectorTbl[(Chunks — 1536-dim HNSW)]
        ArtifactsTbl[(Artifacts Store)]
    end

    subgraph "LLM Providers"
        OpenAI[OpenAI API (Cloud)]
        Ollama[Ollama (Local / Self-Hosted)]
    end

    UI --> API
    API --> ChatSvc
    API --> IngestSvc
    ChatSvc --> Retriever
    ChatSvc --> Agents
    Agents --> OpenAI
    Agents --> Ollama
    Retriever --> DB
    IngestSvc --> DB
```

---

## 🚀 Quickstart Guide

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) installed.
- (Optional) OpenAI API Key (or use local Ollama).

### 1. Clone & Configure Environment
```bash
git clone <repo-url>
cd lenny-growth-assistant

# Create .env from template
cp .env.example .env

# (Optional) Add your OpenAI API Key
# OPENAI_API_KEY=sk-your-openai-key
```

### 2. Start Services via Docker Compose
```bash
docker compose up -d
```

### 3. Ingest Sample Transcripts
Seed the database with included transcripts (Brian Chesky on Founder Mode, Elena Verna on Growth Loops, Shreyas Doshi on LNO Framework):
```bash
docker compose exec backend python scripts/seed_transcripts.py
```

### 4. Access the Application
- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Diagnostic**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Evaluation & Example Prompts

Here are recommended queries to test system capabilities:

| Intent | Sample Prompt | What to Observe |
|---|---|---|
| **Grounded Q&A** | *"What is Founder Mode according to Brian Chesky and why does he advise against traditional delegating?"* | Speaker attribution, 2-Year Roadmap details, and Source Citation cards from Episode #142. |
| **Framework Synthesis** | *"Explain the LNO Framework by Shreyas Doshi and why the Impact vs Effort matrix fails."* | Leverage/Neutral/Overhead breakdown and strategic conviction rationale citing Episode #95. |
| **Ship 30 for 30 Essay** | *"Write a Ship 30 for 30 style essay about why growth loops beat traditional marketing funnels."* | Structured atomic essay format, short punchy paragraphs, and automatic artifact persistence. |
| **Interactive Artifact** | *"Generate a strategic launch plan and growth loop teardown for a B2B SaaS product."* | Split-screen workspace opens on the right with formatted strategy memo and export options. |
| **Out-of-Domain Guardrail** | *"What is the best way to bake sourdough bread?"* | Clear disclaimer stating query is outside the transcript scope. |

---

## 🛠️ Makefile Commands

| Command | Description |
|---|---|
| `make build` | Build all Docker images |
| `make up` | Start all services in background |
| `make up-ollama` | Start all services including local Ollama GPU container |
| `make seed` | Ingest and embed sample transcripts |
| `make test` | Run backend pytest test suite |
| `make lint` | Run ruff and frontend linting |
| `make down` | Stop all services |
| `make clean` | Stop and wipe database volumes |

---

## 🏛️ Engineering & Architecture Decisions

### 1. Unified Storage with pgvector
- **Decision**: Use `pgvector` inside PostgreSQL rather than a separate vector database (e.g. Chroma/Pinecone).
- **Tradeoff**: Simplifies topology into a single database container supporting relational chat persistence and 1536-dimensional HNSW cosine index lookups with ACID safety.

### 2. Layered Backend Design
- **Decision**: Clear separation across `API → Services → Agents/Retrieval → Persistence → Infrastructure`.
- **Tradeoff**: Strict modularity allows swapping LLM providers, chunking strategies, or embedders without modifying business orchestration layers.

### 3. Sandboxed DOMPurify Split-Screen Viewer
- **Decision**: Dual renderer with DOMPurify sanitization inside `<iframe sandbox="allow-scripts allow-same-origin">`.
- **Tradeoff**: Isolates arbitrary CSS/HTML artifacts from the host application while allowing rich interactive mockups.

---

## 📚 Technical Documentation

Detailed documentation is available in the `docs/` folder:
- 📄 [Product Requirements Document (PRD)](docs/PRD.md)
- 🎨 [UI/UX Design System Specification](docs/design.md)
- 🏗️ [Architecture & Technical Specifications](docs/architecture.md)
- ✅ [QA & Evaluation Checklist](docs/qa-checklist.md)

---

## 📄 License
MIT License. Created for the Lenny Growth Assistant Technical Evaluation.
