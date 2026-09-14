# Lenny Growth Assistant — QA & Evaluation Checklist

This checklist provides a structured verification procedure for evaluators and engineers testing the Lenny Growth Assistant.

---

## 1. Quickstart & Deployment Verification

- [ ] **Zero-Dependency Startup**: Run `docker compose up -d` from a clean environment. All containers (`db`, `backend`, `frontend`) start up healthy.
- [ ] **Health Check Diagnostic**: Navigate to `http://localhost:8000/health`. Verify `{"status": "healthy", "components": {"database": "connected", ...}}`.
- [ ] **Seeding Pipeline**: Run `make seed` or `docker compose exec backend python scripts/seed_transcripts.py`. Verify all sample transcripts (Brian Chesky, Elena Verna, Shreyas Doshi) are ingested, chunked, and embedded.

---

## 2. RAG Grounding & Conversational Q&A

- [ ] **Grounded Query Test**:
  - *Query*: `"What is Founder Mode according to Brian Chesky?"`
  - *Expected*: Detailed response explaining the 2-Year Roadmap, removing PM ticket coordinators, review cycles, with source cards referencing Episode #142.
- [ ] **Framework Extraction Test**:
  - *Query*: `"Explain the LNO Framework by Shreyas Doshi."`
  - *Expected*: Accurate breakdown of Leverage (10x), Neutral (1x), and Overhead (<0.2x) tasks with citation to Episode #95.
- [ ] **Out-of-Domain Guardrail Test**:
  - *Query*: `"What is the best recipe for baking sourdough bread?"`
  - *Expected*: Clear disclaimer stating that the question is outside the scope of Lenny's Podcast transcripts.

---

## 3. Ship 30 for 30 Essay Generation

- [ ] **Atomic Essay Generation**:
  - *Query*: `"Write a Ship 30 for 30 style essay about why growth loops beat traditional marketing funnels."`
  - *Expected*: Structured atomic essay with Headline/Hook, The Mistake, The 3 B2B Loops (Elena Verna), and Takeaway. Automatic artifact creation notification.

---

## 4. Artifact System & Split-Screen Workspace

- [ ] **Strategy Memo Artifact**:
  - *Query*: `"Generate a strategic growth plan for transitioning a sales-led product to product-led growth."`
  - *Expected*: Split-screen workspace opens on the right displaying the interactive document with copy and download buttons.
- [ ] **Preview vs Source Toggle**:
  - *Expected*: Switching between "Preview" and "Source" accurately renders formatted markdown vs raw text.
- [ ] **Sanitization Security**:
  - *Expected*: HTML artifacts render safely without script execution or style leakage into the main UI.

---

## 5. Dual LLM Provider Switching & Fallback

- [ ] **Model Switcher Dropdown**:
  - Switch model in the input selector between OpenAI and Ollama.
  - Verify message bubble model badge accurately reflects the chosen provider and latency.
- [ ] **Fallback Test**:
  - Remove OpenAI key from `.env` and restart backend. Verify graceful fallback to Ollama or informative diagnostic message.

---

## 6. Transcript Ingestion Interface

- [ ] **Frontend Ingestion Modal**:
  - Click "Ingest Transcript" in the sidebar.
  - Upload a `.txt` file with episode title and guest name.
  - Verify successful chunking count and immediate availability in vector search.
