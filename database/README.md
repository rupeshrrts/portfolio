# Database (Supabase)

Everything the portfolio stores lives in **one file: [`setup.sql`](setup.sql)**.

| Table / function | Purpose |
| --- | --- |
| `contact_messages` | Messages from the website contact form (`is_read` lets you mark replies) |
| `site_stats`, `increment_page_views()` | Single-row visit counter |
| `chat_faqs` | The chat agent's knowledge base — predefined questions, matching phrases/keywords, answers, follow-up suggestions |
| `chat_tech` | "Does he know X?" technology lookups (`used_in` = NULL means not on his stack) |
| `chat_settings` | Small settings for the chat function (contact email, assistant name, strengths) |
| `chat_conversations`, `chat_messages` | Persistent chat history (question, reply, how it was answered) |
| `chat_unanswered_questions` (view) | Questions the knowledge base couldn't answer — add FAQs for these |
| `rate_limits`, `hit_rate_limit()` | Request limits shared across serverless instances |
| `purge_old_chat_data(days)` | Deletes idle chats and expired rate-limit rows |

## Set up (one time)
1. Create a project at [supabase.com](https://supabase.com). Choose the region closest to you (e.g. Mumbai).
2. **SQL Editor → New query** → paste all of `setup.sql` → **Run**. It's safe to run again later — it never
   deletes data or overwrites FAQ answers you've edited.
3. **Project Settings → API** → copy:
   - **Project URL** → `SUPABASE_URL` (backend) and `NEXT_PUBLIC_SUPABASE_URL` (frontend)
   - **service_role** secret key → `SUPABASE_SERVICE_ROLE_KEY` (backend only)
   - **anon / publishable** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend)
4. Deploy the chat Edge Function — see [`../supabase/README.md`](../supabase/README.md).
5. Open `<backend-url>/api/health` — it should show `"store": "supabase"`.

## Reading data
Supabase → **Table Editor**, or the ready-made queries at the bottom of `setup.sql` (latest messages,
unanswered chat questions, chat activity, adding an FAQ).

## Security
Row Level Security is on for every table with no public policies, and all default grants to `anon` /
`authenticated` are revoked — the public key can't read or write anything. Only the backend and the chat
Edge Function, using the service_role key on the server, can access the data. Never put the service_role key
in the frontend or commit it to Git. Chat history is stored without IP addresses; visitor IPs are only used,
salted and hashed, as rate-limit keys.
