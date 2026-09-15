# Agent Transcripts & Execution Logs

This directory contains the operational execution logs and development transcripts of the AI coding agents used during the construction of **The Lenny Growth Assistant**.

---

## Overview of Development Trajectories

During the forward deployment lifecycle, AI coding agents (Antigravity & Claude 3.5 Sonnet) assisted in architecting, implementing, debugging, and testing the system. Below is a record of key execution phases, including edge cases, failed attempts, root-cause analyses, and resolutions.

---

## Log Directory Structure

| Log File | Description | Key Focus Area |
|---|---|---|
| `01_rag_and_pgvector_setup.log` | Database schema initialization and pgvector HNSW index configuration. | Vector embeddings, HNSW index construction, transaction management. |
| `02_clerk_and_dep_resolution.log` | Package dependency conflict resolution during Vercel deployment. | npm peer dependency resolution (`@clerk/nextjs` vs `next` versioning). |
| `03_gitignore_lib_unignore.log` | Webpack build module resolution failure diagnosis. | Root `.gitignore` exclusion matching `frontend/src/lib/`. |
| `04_artifact_sanitization_qa.log` | DOMPurify and iframe sandboxing security verification. | XSS prevention, HTML/CSS rendering safety, split-screen UI. |

---

## Detailed Case Studies of Failed Attempts & Resolutions

### 1. Issue: npm `ERESOLVE` Peer Dependency Conflict on Deployment
- **Symptom**: Vercel build failed during `npm install` with error `ERESOLVE could not resolve peer dependency next@"^15.2.8" from @clerk/nextjs@7.9.2`.
- **Root Cause**: `@clerk/nextjs` semver wildcard permitted resolving to major version 7, which requires Next.js 15+, while the root project was pinned to Next.js `14.2.10`.
- **Resolution**:
  1. Configured `--legacy-peer-deps` in `.npmrc` to override strict peer dependency checking during deployment.
  2. Maintained `@clerk/nextjs` version compatibility (`^6.12.0`) in `package.json` for Next.js 14 stability.

---

### 2. Issue: Webpack `Module Not Found: Can't resolve '@/lib/...'`
- **Symptom**: `next build` failed with module resolution errors for `@/lib/api-client`, `@/lib/auth-api-client`, and `@/lib/sanitizer`.
- **Root Cause**: The root `.gitignore` file contained a generic `lib/` line intended for Python virtual environments. This line inadvertently ignored `frontend/src/lib/`, preventing core utility modules from being tracked or pushed to Git.
- **Resolution**:
  1. Removed generic `lib/` from `.gitignore`.
  2. Executed `git add frontend/src/lib/` to track and commit essential frontend utilities.
  3. Verified local compilation with `npm run build`, achieving `✓ Compiled successfully`.

---

### 3. Issue: Ollama Streaming Timeout & Local Fallback Handling
- **Symptom**: Local LLM calls via Ollama timed out on initial model cold-starts during local evaluation.
- **Root Cause**: Ollama model weight loading required >15 seconds on initial execution without warm-up HTTP pinging.
- **Resolution**:
  1. Added explicit HTTP health checks and connection pooling in `OllamaProvider`.
  2. Implemented graceful fallback mechanism returning a structured 503 status code with diagnostic remediation instructions when Ollama daemon is unreachable.

---

## Audit & Privacy Compliance
All committed transcripts and logs have been sanitized to remove private API keys, environment credentials, and internal host details.
