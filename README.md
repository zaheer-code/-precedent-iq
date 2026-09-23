# PrecedentIQ — Legal Briefing & Cross-Case Intelligence Engine

PrecedentIQ is an enterprise-grade, full-stack AI platform designed for litigation teams, corporate legal departments, and law firms. It delivers zero-hallucination Retrieval-Augmented Generation (RAG) over complex case files, opposing argument vulnerability detection, dynamic clause comparison matrices, structured trial brief generation, and page-level source citation inspection.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |         PrecedentIQ React Web App      |
                                  |   (Vite, React 18, Tailwind, Lucide)  |
                                  +-------------------+-------------------+
                                                      |
                                             REST API / JWT Auth
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |       Express.js REST Engine          |
                                  |  (Zod, Helmet, Rate Limit, Multer)    |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +-----------------------+
                     |                                                                  |
                     v                                                                  v
+--------------------+---------------------+                  +-------------------------+---------------------+
|        PostgreSQL + pgvector             |                  |            Google GenAI SDK                 |
|  - Users, Matters, Documents             |                  |  - Gemini 2.5 Flash (Analysis / Synthesis)   |
|  - Document Pages & Text Chunks          |                  |  - text-embedding-004 (768-dim Embeddings)  |
|  - 768-dim Vector Cosine Similarity Search|                  |  - Strict JSON Schema Output Enforcement    |
|  - Multi-Tenant Ownership Scoping        |                  +-----------------------------------------------+
+------------------------------------------+
```

---

## 2. Core Capabilities

1. **Matter & Case Workspace Management:**
   - Isolated case workspaces with matter metadata (docket number, jurisdiction, practice area, status).
2. **Multi-Format Document Ingestion Pipeline:**
   - Supports PDF (with page-level extraction), DOCX, and TXT files.
   - Computes SHA-256 document hashes.
   - Sentence and paragraph-aware chunker preserving page boundaries.
   - Generates 768-dimensional embeddings server-side via Google's `text-embedding-004`.
   - Automatic document type categorization heuristics (Case Law, Contract, Deposition, Motion, Brief, etc.).
3. **Zero-Hallucination Semantic RAG Research:**
   - Natural language queries embedded and queried against pgvector using cosine distance (`dc.embedding <=> $queryEmbedding`).
   - Strict multi-tenant SQL filtering: `WHERE m.user_id = $userId AND m.id = $matterId`.
   - Response validation via Zod schemas and citation cross-verification against actual retrieved chunk IDs.
   - Grounding fallback: Returns *"The provided documents do not establish this."* if evidence is missing.
4. **Opposing Argument Vulnerability Detector:**
   - Systematically scans opposing counsel arguments against matter records to uncover factual contradictions, weak precedent applications, and contractual breaches.
   - Classifies flaws by severity (`HIGH`, `MEDIUM`, `LOW`) and attaches supporting citation proof.
5. **Dynamic Clause Comparison Matrix:**
   - Side-by-side comparative table of contractual terms (indemnity, warranties, termination, notice).
   - Flags direct conflicts, obligation shifts, ambiguities, and missing counterpart terms.
6. **Interactive Trial Brief Builder:**
   - Synthesizes structured legal brief outlines (Questions Presented, Statement of Facts with citations, Applicable Rules, IRAC Analysis with anticipated counterarguments and rebuttals, Evidence Gaps, Conclusion).
   - In-place editing, Markdown export, and court print previews.
7. **Evidence & Citation Inspector:**
   - Global interactive drawer to inspect any citation's exact extracted source text, page number, relevance score, and document metadata.
8. **Security & Immutable Audit Logging:**
   - Records all sensitive actions (Logins, Matter creation, Ingestion, AI Queries, Brief generations) with sanitized metadata.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, Axios, React Router v7.
- **Backend:** Node.js, Express.js, `@google/genai` (Google Gen AI SDK), `pg` (PostgreSQL client), `pgvector`, `zod`, `bcryptjs`, `jsonwebtoken`, `multer`, `pdf-parse`, `mammoth`, `helmet`, `cors`, `morgan`, `express-rate-limit`.
- **Database:** PostgreSQL 14+ with `pgcrypto` and `vector` (pgvector) extensions.
- **AI Models:** `gemini-2.5-flash` for high-speed grounded legal reasoning, `text-embedding-004` for 768-dim embeddings.

---

## 4. Setup & Installation

### Prerequisites
- Node.js v18+ (tested on Node v24)
- PostgreSQL 14+ with `pgvector` extension installed
- Google Gemini API Key

### 1. Clone & Install Dependencies
```bash
# Install root, backend, and frontend packages
npm run install:all
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Configure your credentials:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/precedentiq
JWT_SECRET=precedentiq_super_secure_jwt_enterprise_secret_key_2026
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:5173
```

### 3. Initialize Database Schema & Vector Indexes
Run the automated migration runner:
```bash
npm run db:migrate
```
*This executes `database/schema.sql` (enabling `pgcrypto` & `vector`) and `database/indexes.sql` (creating HNSW vector index and relational indexes).*

---

## 5. Running the Application

### Option A: Run Full-Stack Concurrently (Recommended)
```bash
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

### Option B: Run Services Individually
```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

---

## 6. Running the Automated Test Suite

PrecedentIQ includes a comprehensive test suite covering Authentication, Multi-Tenant Data Isolation, Document Chunking, Citation Verification, and Zod AI Schemas:

```bash
npm test
```

Test Results:
- `auth.test.js`: Bcrypt password hashing, JWT token lifecycle, schema validation.
- `isolation.test.js`: Multi-tenant user and matter SQL scoping.
- `chunker.test.js`: Page-aware text segmentation, token counts, paragraph splitting.
- `citationValidator.test.js`: Zero-hallucination citation verification and rejection of fabricated chunk IDs.
- `schemas.test.js`: Zod schema enforcement for Research, Vulnerabilities, Clauses, and Trial Briefs.

---

## 7. Security Guarantees & Multi-Tenancy

- **Row-Level SQL Scoping:** All database queries require verified JWT `userId` predicates.
- **pgvector Isolation:** Semantic searches are constrained by `m.user_id = $1 AND m.id = $2`. Embeddings are never retrieved cross-tenant.
- **Prompt Injection Guard:** All document chunks are wrapped in untrusted data boundaries:
  `=== RETRIEVED EVIDENCE (UNTRUSTED DATA) ===`
  Any instructions inside documents (e.g. *"Ignore previous instructions"*) are ignored by the AI model.
- **Zero-Hallucination Anti-Hallucination Engine:** Citations returned by Gemini are validated server-side against actual retrieved chunk IDs. Citations lacking evidentiary backing are discarded.
- **Zero Credential Logging:** Audit logger automatically sanitizes passwords, hashes, JWTs, and API keys.

---

## 8. License
PrecedentIQ Proprietary Enterprise License. All rights reserved.
