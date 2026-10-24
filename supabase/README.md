# Chat Edge Function (Supabase)

The portfolio's "Ask my AI agent" chat runs as the Supabase Edge Function `chat`.

```
browser ──POST /functions/v1/chat──▶ Edge Function ──service_role──▶ Postgres (RLS locked)
                                         │  knowledge: chat_faqs, chat_tech, chat_settings
                                         │  history:   chat_conversations, chat_messages
                                         └──▶ free-tier LLM (optional, OpenAI-compatible)
```

**How a message is answered**
1. The question is validated (≤ 500 chars) and rate-limited per visitor (20/min, 300/day) and per conversation.
2. The question and the reply are saved, so the chat survives page reloads (the browser keeps a random
   token; the database stores only its SHA-256 hash, and history is returned only to that token).
3. The knowledge base is always matched first (aliases, Hinglish, typo tolerance, multi-part questions,
   "tell me more" follow-ups).
4. If an LLM is configured and the daily LLM budget isn't used up, the LLM answers using **only** the
   knowledge base as facts, plus the last 10 messages for context.
5. If there's no LLM, it fails, or it's over budget, the knowledge-base answer is used. Unknown questions
   get an honest "I don't have that in my notes" reply and are listed in `chat_unanswered_questions`.

Files: `functions/chat/index.ts` (Deno entry point) · `functions/_shared/chat-core.js` (logic) ·
`functions/_shared/llm.js` (LLM client) · `functions/_shared/matcher.js` (generated copy of
`backend/src/agent/matcher.js` — don't edit it by hand).

## Deploy

### 1. Database
Run `database/setup.sql` in **Supabase → SQL Editor** (see `database/README.md`). It creates the chat
tables and seeds all 40 answerable topics and 51 technology lookups.

### 2. Secrets
**Supabase → Edge Functions → Secrets** (or the CLI commands below):

| Secret | Required | Value |
| --- | --- | --- |
| `ALLOWED_ORIGINS` | yes | Your site URL(s), comma-separated, e.g. `https://rupesh-portfolio.vercel.app` |
| `RATE_LIMIT_SALT` | yes | Any long random string (used to hash visitor IPs) |
| `LLM_BASE_URL` | for LLM mode | OpenAI-compatible base URL (see below) |
| `LLM_API_KEY` | for LLM mode | Your free-tier API key |
| `LLM_MODEL` | for LLM mode | A model available on your free tier |
| `LLM_DAILY_LIMIT` | no | Max LLM calls per day before using the knowledge base (default `1000`) |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided to the function automatically — don't add them.
Leave the three `LLM_*` secrets unset to run in knowledge-base-only mode.

**Free-tier LLM options** (any OpenAI-compatible API works — check the provider's console for the models
currently on its free tier, since names change):

| Provider | `LLM_BASE_URL` | `LLM_MODEL` example |
| --- | --- | --- |
| Groq | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` |
| Google Gemini | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` |
| OpenRouter | `https://openrouter.ai/api/v1` | any model ending in `:free` |

### 3. Deploy the function
From the `Portfolio` folder (needs Node; no global install):

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set ALLOWED_ORIGINS=https://your-site.vercel.app RATE_LIMIT_SALT=change-me-to-a-long-random-string
npx supabase secrets set LLM_BASE_URL=https://api.groq.com/openai/v1 LLM_API_KEY=your-key LLM_MODEL=llama-3.3-70b-versatile
npx supabase functions deploy chat --no-verify-jwt
```

`--no-verify-jwt` lets visitors call it without logging in; the function protects itself with the origin
allow-list, rate limits and per-conversation tokens, and it only ever uses the service_role key server-side.

### 4. Frontend
In the **frontend** Vercel project add:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_REF.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the **anon / publishable** key (never the service_role key) |

Redeploy the frontend. Without these two variables the chat falls back to the Express `/api/chat` endpoint.

## Editing what the agent knows
- **Quick edits:** change `answer`, `phrases`, `keywords` or `suggestions` in **Table Editor → chat_faqs**,
  or add new rows. The function picks up changes within 5 minutes — no redeploy.
- **From code:** edit `backend/src/agent/knowledge.js`, then in `backend/` run `npm run test:agent`,
  `npm run build:supabase` (regenerates the seed and `_shared/matcher.js`) and `npm run test:chat`.
  Re-running `setup.sql` only inserts new topics — it never overwrites rows you edited in the dashboard.
- **Find gaps:** `select * from public.chat_unanswered_questions order by created_at desc;`

## Test locally
```bash
cd backend
npm run test:chat     # Edge Function logic: storage, ownership, LLM + fallback, limits, validation
npm run test:agent    # question matching (106 real questions)
```
