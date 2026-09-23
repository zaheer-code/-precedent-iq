# PrecedentIQ — Legal Briefing & Cross-Case Intelligence Engine

PrecedentIQ is an enterprise-grade, full-stack AI platform designed for litigation teams, corporate legal departments, and law firms. It delivers zero-hallucination Retrieval-Augmented Generation (RAG) over complex case files, opposing argument vulnerability detection, dynamic clause comparison matrices, structured trial brief generation, and page-level source citation inspection.

---

## 1. System Architecture

```
                                  +---------------------------------------+
                                  |         PrecedentIQ React Web App      |
                                  |      (Vite 6, React 18, Tailwind)     |
                                  |         [Deployed on Vercel]          |
                                  +-------------------+-------------------+
                                                      |
                                            REST API (HTTPS / JWT)
                                                      |
                                                      v
                                  +-------------------+-------------------+
                                  |       Express.js REST Engine          |
                                  |   (Zod, Helmet, Multer, pg-pool)      |
                                  |   [Deployed on Render/Railway/Node]   |
                                  +---------+-------------------+---------+
                                            |                   |
                     +----------------------+                   +-----------------------+
                     |                                                                  |
                     v                                                                  v
+--------------------+---------------------+                  +-------------------------+---------------------+
|      Supabase PostgreSQL + pgvector      |                  |            Google GenAI SDK                 |
|  - Users, Matters, Documents             |                  |  - Gemini 2.5 Flash (Legal Synthesis)       |
|  - Document Pages & Text Chunks          |                  |  - text-embedding-004 (768-dim Embeddings)  |
|  - 768-dim HNSW Vector Cosine Indexes    |                  |  - Strict Structured JSON Schema Output     |
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

- **Frontend:** React 18, Vite 6, Tailwind CSS, Lucide React, Axios, React Router v7.
- **Backend:** Node.js, Express.js, `@google/genai` (Google Gen AI SDK), `pg` (PostgreSQL client), `pgvector`, `zod`, `bcryptjs`, `jsonwebtoken`, `multer`, `pdf-parse`, `mammoth`, `helmet`, `cors`, `morgan`, `express-rate-limit`.
- **Database:** PostgreSQL 14+ with `pgcrypto` and `vector` (pgvector) extensions (Supabase hosted).
- **AI Models:** `gemini-2.5-flash` for high-speed grounded legal reasoning, `text-embedding-004` for 768-dim embeddings.

---

## 4. Local Development Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- PostgreSQL 14+ with `pgvector` extension (or Supabase project)
- Google Gemini API Key

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

### 3. Initialize Database Schema & Vector Indexes
```bash
npm run db:verify
```
*This verifies database connectivity, enables `pgcrypto` & `vector` extensions, executes `database/schema.sql`, builds HNSW vector indexes via `database/indexes.sql`, and tests a 768-dimension vector similarity query.*

### 4. Run Development Server
```bash
npm run dev
```
- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **Health Check:** `http://localhost:5000/api/health`

### 5. Run Automated Tests
```bash
npm test
```

---

## 5. Production Deployment Guide

PrecedentIQ uses a decoupled deployment architecture:
- **Frontend:** Deployed to **Vercel** as a static Vite Single Page Application (SPA).
- **Backend:** Deployed to a standard Node.js hosting platform (**Render**, **Railway**, **Fly.io**, or **AWS**) as a continuous Express.js service.
- **Database:** Hosted on **Supabase** with the `vector` extension enabled.

---

### A. Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Retrieve your connection string from **Project Settings &rarr; Database &rarr; Connection String &rarr; URI (Transaction Pooler or Direct)**.
3. Verify your connection and apply the schema & indexes:
   ```bash
   npm run db:verify
   ```

---

### B. Backend Deployment (Render / Railway / Node.js Host)

The Express backend requires a persistent Node.js runtime for connection pooling, document parsing, and background embedding generation.

#### Example: Deploying to Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Set the service settings:
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add the following **Backend Environment Variables**:
   | Variable | Description | Example / Value |
   | :--- | :--- | :--- |
   | `NODE_ENV` | Environment mode | `production` |
   | `PORT` | Server listening port | `5000` (or leave default for Render) |
   | `DATABASE_URL` | Supabase connection string | `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres` |
   | `JWT_SECRET` | Secure random string | `min_32_chars_random_secure_key` |
   | `JWT_EXPIRES_IN` | JWT token lifetime | `1d` |
   | `GEMINI_API_KEY` | Google Gemini API key | `AIzaSy...` |
   | `CLIENT_URL` | Allowed frontend domain(s) for CORS | `https://your-precedentiq-client.vercel.app` |
   | `UPLOAD_DIR` | Ingestion temporary storage | `./uploads` |
   | `MAX_FILE_SIZE_MB` | Maximum file upload size | `25` |
4. Deploy the service and copy your backend URL (e.g., `https://precedentiq-api.onrender.com`).

---

### C. Frontend Deployment (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New &rarr; Project**.
2. Import the `zaheer-code/-precedent-iq` GitHub repository.
3. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click Edit and select `client`
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `dist` (auto-detected)
4. Add the **Frontend Environment Variable**:
   | Variable | Description | Example / Value |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | Deployed Backend API Base URL | `https://precedentiq-api.onrender.com` |
5. Click **Deploy**.

> [!NOTE]
> Client-side SPA routing (`/register`, `/login`, `/workspace/...`) is managed by `client/vercel.json`, preventing 404s on browser reloads.

---

### D. Google Gemini API Setup

1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add the key to the backend environment variable `GEMINI_API_KEY`.
3. PrecedentIQ uses `gemini-2.5-flash` for high-speed grounded legal reasoning and `text-embedding-004` for 768-dimensional document chunk vectorization.

---

## 6. Security Guarantees & Multi-Tenancy

- **Row-Level SQL Scoping:** All database queries require verified JWT `userId` predicates.
- **pgvector Isolation:** Semantic searches are constrained by `m.user_id = $1 AND m.id = $2`. Embeddings are never retrieved cross-tenant.
- **Prompt Injection Guard:** All document chunks are wrapped in untrusted data boundaries:
  `=== RETRIEVED EVIDENCE (UNTRUSTED DATA) ===`
  Any instructions inside documents (e.g. *"Ignore previous instructions"*) are safely ignored by the AI model.
- **Zero-Hallucination Anti-Hallucination Engine:** Citations returned by Gemini are validated server-side against actual retrieved chunk IDs. Citations lacking evidentiary backing are discarded.
- **Zero Credential Exposure:** Backend secrets (`DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`) are never exposed in frontend bundles or API responses.

---

## 7. License

PrecedentIQ Proprietary Enterprise License. All rights reserved.
