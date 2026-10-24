# Rupesh Kumar — Portfolio

```
Portfolio/
├── frontend/    Next.js 15 + React 19 + Framer Motion      → Vercel project #1
├── backend/     Node.js + Express API (contact, visit counter,
│                local chat fallback) — Vercel function     → Vercel project #2
├── supabase/    `chat` Edge Function — persistent AI chat (free-tier LLM
│                or knowledge-base answers)                 → Supabase
└── database/    setup.sql — the whole Supabase schema + chat knowledge in one file
```

## Run locally

```bash
# terminal 1 — API on http://localhost:5000
cd backend
copy .env.example .env
npm install
npm run dev
```

```bash
# terminal 2 — website on http://localhost:3000
cd frontend
copy .env.local.example .env.local
npm install
npm run dev
```

Without Supabase keys the backend stores data in `backend/data/local-db.json`, which is fine for local work.

## Editing content
- Website text: `frontend/src/data/profile.js`.
- Chat-agent knowledge: edit rows in Supabase **Table Editor → chat_faqs** (live within 5 minutes), or edit
  `backend/src/agent/knowledge.js` and run `npm run test:agent && npm run build:supabase && npm run test:chat`
  in `backend/` — see [`supabase/README.md`](supabase/README.md).

## Deploy (in this order)

### 1. Database — Supabase
Follow [`database/README.md`](database/README.md): run `database/setup.sql` in the SQL Editor and copy the
**Project URL** and **service_role** key.

### 2. Backend — Vercel project
1. Push this repo to GitHub.
2. Vercel → **Add New → Project** → import the repo.
3. **Root Directory: `backend`**, Framework Preset: **Other** (no build command needed).
4. Environment Variables:

   | Name | Value |
   | --- | --- |
   | `SUPABASE_URL` | from Supabase |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Supabase (secret) |
   | `CORS_ORIGIN` | your frontend URL — add after step 3, e.g. `https://rupesh-portfolio.vercel.app` |

5. Deploy → open `https://<backend>.vercel.app/api/health` → expect `"store": "supabase"`.

### 3. Frontend — Vercel project
1. Vercel → **Add New → Project** → same repo.
2. **Root Directory: `frontend`**, Framework Preset: **Next.js**.
3. Environment Variables:

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://<backend>.vercel.app` (no trailing slash) |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase **anon / publishable** key (never service_role) |

4. Deploy.

### 3b. Chat — Supabase Edge Function
Follow [`supabase/README.md`](supabase/README.md): set the secrets (`ALLOWED_ORIGINS` = your frontend URL,
`RATE_LIMIT_SALT`, and optionally a free-tier LLM key) and run
`npx supabase functions deploy chat --no-verify-jwt`.

### 4. Connect them
Set the backend's `CORS_ORIGIN` to the frontend's final URL (several URLs can be comma-separated, e.g. your
custom domain too) and **redeploy the backend**. If you ever change `NEXT_PUBLIC_API_URL`, redeploy the frontend.

### Checklist after deploy
- [ ] `<backend>/api/health` shows `"store": "supabase"`
- [ ] The "Ask my AI agent" chat answers questions, and the conversation is still there after a page reload
- [ ] New rows appear in Supabase **chat_messages** (`source` = `llm` with an LLM key, otherwise `faq`)
- [ ] Contact form shows "Thanks! Your message has been received." and the row appears in Supabase
- [ ] The visit counter appears in the About section
