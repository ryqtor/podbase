# Lenny Growth Assistant — System Architecture & Technical Specification

## 1. System Architecture Overview

The Lenny Growth Assistant is designed as a modular, layered AI system composed of four major tiers:

```
[ Next.js 15 Client (SSR + React 18) ]
                  │
                  ▼  (HTTP REST + SSE Streaming)
[ FastAPI Application Server ]
  ├── Middleware (Error Handling, Request Logging, CORS)
  ├── API Routes (/chat, /sessions, /ingest, /artifacts, /models, /health)
  ├── Services (ChatService, IngestionService, SessionService)
  ├── Agents (QAAgent, Ship30EssayGenerator, ArtifactAgent)
  ├── Retrieval (Recursive Chunker, Embedder, pgvector Retriever, LLM Reranker)
  └── Infrastructure (OpenAI Provider, Ollama Provider, ProviderFactory)
                  │
                  ▼  (SQLAlchemy 2.0 Async + asyncpg)
[ PostgreSQL 16 + pgvector (HNSW Indexing) ]
```

---

## 2. Layered Architecture Principles

The backend strictly adheres to dependency direction from outermost to innermost layers:

1. **API Layer (`app/api/`)**: FastAPI routes and HTTP middleware. Handles schema validation, SSE streaming response lifecycle, and dependency injection via `Depends()`. Contains no domain business logic.
2. **Services Layer (`app/services/`)**: Orchestrates business workflows across multiple repositories and retrieval engines. `ChatService` acts as the master coordinator.
3. **Agents Layer (`app/agents/`)**: Implements specialized prompt engineering pipelines and streaming execution for Q&A, structured essay generation, and artifact production.
4. **Retrieval Layer (`app/retrieval/`)**: Manages document chunking, semantic embedding generation, vector similarity searches, and cross-encoder/LLM reranking passes.
5. **Persistence Layer (`app/persistence/`)**: SQLAlchemy 2.0 declarative models and clean repository abstractions for sessions, messages, transcripts, chunks, and artifacts.
6. **Infrastructure Layer (`app/infrastructure/`)**: External integrations (OpenAI API, Ollama HTTP client) wrapped behind abstract interfaces (`BaseLLMProvider`, `BaseEmbedder`).

---

## 3. Database Schema & Vector Indexing

The storage engine uses PostgreSQL 16 with the `pgvector` extension enabled:

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;

-- Transcripts Table
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    episode_title VARCHAR(500) NOT NULL,
    episode_number INTEGER,
    guest_name VARCHAR(255),
    publish_date DATE,
    raw_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chunks Table (Vector Store)
CREATE TABLE chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    token_count INTEGER,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW Vector Index for High-Throughput Approximate Nearest Neighbor Search
CREATE INDEX idx_chunks_embedding ON chunks
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
```

### Why HNSW over IVFFlat?
- **HNSW (Hierarchical Navigable Small World)** provides superior recall (>98%) and sub-millisecond query latencies without requiring periodic retraining as the dataset grows.

---

## 4. RAG Retrieval & Reranking Mechanics

```mermaid
graph TD
    A[User Query] --> B[Generate Embedding (1536-dim)]
    B --> C[pgvector Cosine Distance Search Top-20]
    C --> D[Lightweight LLM Relevance Scoring Top-5]
    D --> E[Filter by Minimum Similarity Confidence]
    E --> F[Inject into Agent Prompt Template]
```

1. **Chunking**: Transcripts are chunked using `RecursiveCharacterChunker` (800 tokens target, 100 token overlap) with split priority: `\n\n` → `\n` → `. ` → ` `.
2. **Retrieval**: Top-20 candidates are pulled using pgvector cosine distance (`1 - (embedding <=> query_embedding)`).
3. **Reranking**: An LLM-based zero-shot reranker scores candidate chunks from 0-10 based on relevance to the specific nuance of the prompt, returning the top-5 highest-scoring passages.

---

## 5. Agent Architecture

### 5.1 QAAgent
- Grounded Q&A agent instructed to attribute insights to specific podcast guests, summarize key frameworks, and emit honest disclaimer notifications when evidence is insufficient.

### 5.2 Ship30EssayGenerator
- Multi-step structured generator enforcing the Ship 30 for 30 atomic essay format:
  1. Headline & Hook (capturing attention with counter-intuitive insight)
  2. The Common Mistake / Pain Point
  3. The Core Framework / Mental Model (grounded in Lenny's guest dialogue)
  4. Practical 1-2-3 Action Steps
  5. The One-Line Takeaway

### 5.3 ArtifactAgent
- Generates stand-alone interactive deliverables (Growth Strategy Memos, Retention Loop Teardowns, HTML/CSS Launch Checklists) rendered inside the split-screen viewer.

---

## 6. Model Routing & Graceful Fallback

```mermaid
graph TD
    A[Request] --> B{Primary Provider Configured & Online?}
    B -->|Yes| C[Execute with Primary (e.g. OpenAI)]
    B -->|No| D{Fallback Enabled & Alternate Online?}
    D -->|Yes| E[Execute with Alternate (e.g. Ollama)]
    D -->|No| F[Return 503 with Diagnostic Details]
```

- When OpenAI API keys are present, queries use `gpt-4o-mini` or `gpt-4o`.
- If OpenAI key is omitted or quota is exhausted, the system automatically falls back to local `Ollama` (`llama3.1:8b`).
- The active model and latency metrics are streamed in real time to the frontend UI.

---

## 7. Security Architecture

1. **Defense-in-Depth HTML Sanitization**:
   - Client sanitizes all HTML artifacts using `DOMPurify` with an explicit whitelist of structural HTML/CSS tags.
   - Script execution, forms, inputs, external redirects, and iframe-nesting are strictly stripped.
2. **Sandboxed Iframe Isolation**:
   - HTML artifacts are rendered inside `<iframe sandbox="allow-scripts allow-same-origin" srcdoc="...">` to isolate CSS styling and DOM execution from the parent application.
3. **SQL Injection Prevention**:
   - All database queries use SQLAlchemy parameterized async queries and prepared pgvector statements.
