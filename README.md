# Rupesh Kumar — Portfolio

**Live site:** https://rupesh-kumar-portfolio.vercel.app · **API:** https://rupesh-portfolio-api.vercel.app

```
Portfolio/
├── frontend/    Next.js 15 + React 19 + Framer Motion — the website           → Vercel project "portfolio"
├── backend/     Node.js + Express API — contact form, visit counter, chat,
│                email alerts. Runs as a Vercel serverless function            → Vercel project "rupesh-portfolio-api"
├── database/    setup.sql — the complete Supabase schema + chat knowledge     → Supabase SQL Editor
└── supabase/    `chat` Edge Function — saved chat history + optional free LLM → Supabase (optional)
```

```
Visitor ──▶ frontend (Vercel) ──▶ backend /api/* (Vercel) ──▶ Supabase Postgres
                                         └──▶ Resend ──▶ email alert to your Gmail
          (optional) frontend ──▶ Supabase Edge Function `chat` ──▶ Supabase + free LLM
```

**Contents:** [Run locally](#run-locally) · [Deploy from scratch](#deploy-from-scratch-step-by-step) ·
[Update the live site](#updating-the-live-site-later) · [Environment variables](#environment-variables-reference) ·
[Troubleshooting](#troubleshooting) · [Editing content](#editing-content)

---

## Run locally

Needs [Node.js](https://nodejs.org) 18 or newer.

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

Tests (no install needed): in `backend/` run `npm run test:agent`, `npm run test:chat`, `npm run test:notify`.

---

## Deploy from scratch (step by step)

Do the steps **in this order**. Total time ≈ 30–45 minutes. Everything used here is free.

| # | What | Where | Result |
|---|---|---|---|
| 1 | Database | Supabase | tables + keys |
| 2 | Code on GitHub | GitHub | a repo Vercel can import |
| 3 | Backend | Vercel | `https://<name>-api.vercel.app` |
| 4 | Frontend | Vercel | `https://<name>.vercel.app` |
| 5 | Nice website address | Vercel → Domains | `https://rupesh-kumar-portfolio.vercel.app` |
| 6 | Connect frontend ↔ backend | Vercel → backend env vars | contact form works |
| 7 | Email alerts | Resend + Vercel | every message lands in your Gmail |
| 8 | (optional) Saved chat + LLM | Supabase Edge Function | chat remembers, answers anything |

### Step 1 — Supabase (database)

1. Go to [supabase.com](https://supabase.com) → **Sign in** → **New project**.
   - Name: `Portfolio` · choose a strong database password (save it) · Region: closest to you · **Create**.
2. Wait ~2 minutes until the project is ready.
3. Left sidebar → **SQL Editor** → **New query** → open `database/setup.sql` from this repo, copy **all** of it,
   paste → **Run**.
   - Expected result: **`Success. No rows returned`** — this is correct (a setup script returns no rows).
4. Check it worked — run this in a new query:
   ```sql
   select (select count(*) from public.chat_faqs) as faqs,
          (select count(*) from public.chat_tech) as tech,
          (select views from public.site_stats) as views;
   ```
   Expected: `faqs = 39`, `tech = 51`, `views = 0`.
5. Copy your keys (keep them in Notepad for the next steps — **never commit or share the secret one**):

   | Value | Where to find it | Used by |
   |---|---|---|
   | **Project URL** `https://<project-ref>.supabase.co` | green **Connect** button → **Framework** → Next.js → `.env.local` tab, **or** Project Settings → General → Project ID (URL = `https://<Project ID>.supabase.co`) | backend + frontend |
   | **service_role** key (`eyJ...`) — **secret** | Project Settings → **API Keys** → tab **"Legacy anon, service_role API keys"** → `service_role` → **Reveal** → Copy. (Direct link: `https://supabase.com/dashboard/project/<project-ref>/settings/api-keys`) | backend only |
   | **anon** key (`eyJ...`) or **publishable** key (`sb_publishable_...`) — public | same page (`anon`), or the **Connect** popup (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) | frontend only (step 8) |

   - If there's no Legacy tab, use the **Secret keys** → `sb_secret_...` key instead of service_role.
   - Do **not** click "Disable JWT-based API keys".
   - Ignore the "Direct connection string" tab in the Connect popup — that's a database password URL, not needed.

### Step 2 — Put the code on GitHub

**A. Make a clean copy of the project** (important if the folder is in OneDrive or you're moving laptops):
1. Delete these folders if they exist — they are regenerated automatically and break zipping/pushing:
   `frontend/node_modules`, `backend/node_modules`, `frontend/.next`, `backend/data`.
   (OneDrive turns files inside `node_modules` into "online-only" placeholders, and Windows zip fails on them.)
2. Right-click the `Portfolio` folder → **Send to → Compressed (zipped) folder** (≈ 0.5 MB).
3. Move the zip to the laptop that has Git, and unzip it.

**B. First push:**
1. Install [Git](https://git-scm.com) and sign in to [github.com](https://github.com).
2. GitHub → **New repository** → name `portfolio` → **Private** or Public → **leave it empty** (no README,
   no .gitignore) → **Create repository**.
3. Open a terminal **inside** the unzipped folder (the one that directly contains `backend`, `frontend`, …):
   ```bash
   git init
   git add .
   git status
   ```
   Check `git status` does **not** list `.env` or `.env.local` (the `.gitignore` excludes them). Then:
   ```bash
   git commit -m "Portfolio: Next.js frontend, Express backend, Supabase"
   git branch -M main
   git remote add origin https://github.com/<your-username>/portfolio.git
   git push -u origin main
   ```

### Step 3 — Backend on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in **with GitHub** → **Add New → Project**.
2. **If `portfolio` isn't in the "Import Git Repository" list:** click **Adjust GitHub App Permissions** →
   **Repository access** → keep **Only select repositories** and add `portfolio` (keep any repos already selected,
   e.g. `AgentShieldAI`) → **Save** → back in Vercel, refresh. Never touch the GitHub "Danger zone".
3. Click **Import** next to **`portfolio`** (not another repo).
4. Vercel detects two apps. Click **"Import single project →" next to `backend`**.
   Do **not** use "Import multi-service project" / "Copy prompt".
5. Fill in:
   - **Project Name:** `rupesh-portfolio-api`
   - **Root Directory:** `backend`
   - **Application Preset:** type `Other` in the box and choose **Other**. A yellow *"Possible configuration
     mismatch"* warning appears — **ignore it**; the backend is a Vercel function via `backend/api/index.js` +
     `backend/vercel.json`.
   - **Build and Output Settings:** leave every toggle **off**.
6. **Environment Variables** → add each with **+ Add More** (names must match **exactly**):

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | the service_role key (keep the 🔒 lock on) |
   | `CORS_ORIGIN` | `http://localhost:3000` for now — replaced in step 6 |

7. **Create Project** / **Deploy**. On the next screen **skip "Optional Integrations → Supabase → Add"** (it can
   create a second database or overwrite your keys) → **Deploy**.
8. When you see **Congratulations**, open `https://<backend-domain>/api/health`:
   - ✅ `{"ok":true,"store":"supabase"}` → done.
   - ❌ `"store":"temporary…"` → `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong (see Troubleshooting).
9. Note the backend domain shown under **Domains** (e.g. `rupesh-portfolio-api.vercel.app`).

### Step 4 — Frontend on Vercel

1. **Add New → Project** → **Import** `portfolio` again → **"Import single project →" next to `frontend`**.
2. **Project Name:** e.g. `portfolio` · **Preset:** **Next.js** (auto) · **Root Directory:** `frontend`.
3. **Environment Variables** — only this one for now:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://rupesh-portfolio-api.vercel.app` (your backend domain, **no `/` at the end**) |

   Don't add `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` yet — only after step 8 (otherwise the
   chat tries to use an Edge Function that doesn't exist and shows an error).
4. **Deploy**, skip integrations. Status **Ready** = the site is live.

### Step 5 — Give the website a nice address (free)

1. Frontend project → left sidebar **Domains** → **Edit** next to the random `xxx-yyy.vercel.app` domain
   (or **Add Existing**) → type e.g. `rupesh-kumar-portfolio.vercel.app` → **Save**.
2. The old random address now redirects (307) to the new one. Use the new address everywhere from now on.

### Step 6 — Allow the website to call the backend (CORS)

The backend only accepts requests from the websites listed in `CORS_ORIGIN`.

1. Top-left project switcher (**`portfolio ⇕`**) → choose the **backend** project `rupesh-portfolio-api`.
   (Check the name at the top — the frontend project has no `CORS_ORIGIN`.)
2. **Environment Variables** → `CORS_ORIGIN`:
   - Vercel **can't rename** a variable. If the name is wrong (e.g. `CORS_ORIGNS`, `CORS_ORIGINS`), click
     **⋯ → Remove** and **Add Environment Variable** again. The name must be exactly **`CORS_ORIGIN`**.
   - **Value** (comma-separated, no spaces, no trailing `/`):
     ```
     https://rupesh-kumar-portfolio.vercel.app,http://localhost:3000
     ```
   - Type: **Config** is fine (it's not a secret). Environment: **Production** (or Production and Preview).
3. **Save** → **Deployments** → top deployment → **⋯ → Redeploy** → **Redeploy**.
   Environment-variable changes only apply after a redeploy.
4. Test the live site: the visit counter shows in **About**, the chat answers, **Download résumé** works, and the
   contact form says *"Thanks! Your message has been received."* (row appears in Supabase → Table Editor →
   `contact_messages`).

### Step 7 — Get every contact-form message by email (Resend)

1. Sign up at [resend.com](https://resend.com). **The free sender can only deliver to the email address you sign
   up with**, so sign up with the inbox that should receive the messages.
2. Onboarding page → **Add API Key** (name `portfolio`, permission **Sending access**) → copy the `re_...` key
   (shown once). Ignore the "Send an email" code sample — it's already built in.
3. Backend project (`rupesh-portfolio-api`) → **Environment Variables** → add:

   | Key | Value |
   |---|---|
   | `RESEND_API_KEY` | the `re_...` key (type **Secret**) |
   | `CONTACT_NOTIFY_EMAIL` | the email you signed up to Resend with, e.g. `rupeshsinghsuntech@gmail.com` (default if unset: `rkrrts@gmail.com`) |

4. **Redeploy** the backend (or just `git push` new code — that deploys with the new variables).
5. Send a test message from the live site → check the inbox (first time: check **Spam** → mark **Not spam**).
   The email contains name, email, subject, time and the full message; **Reply** answers the visitor directly.
   Each visitor can send max 5 messages/hour. Messages are always saved in Supabase too.
6. Want them in a second Gmail too? In the receiving Gmail → Settings → **Forwarding** → add the other address.

### Step 8 (optional) — Saved chat history + free LLM (Supabase Edge Function)

Without this, the chat answers from the backend's built-in knowledge (works fine). With it, conversations are
saved in Supabase and survive reloads, unanswered questions are tracked, and an optional free LLM writes answers.

1. Get a free LLM key (optional): [Groq](https://console.groq.com/keys) (`LLM_BASE_URL=https://api.groq.com/openai/v1`,
   `LLM_MODEL=llama-3.3-70b-versatile`) or [Google AI Studio](https://aistudio.google.com/app/apikey)
   (`LLM_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai`, `LLM_MODEL=gemini-2.0-flash`).
   Check the provider's console for current free model names.
2. From the project folder on the laptop with Node:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase secrets set ALLOWED_ORIGINS=https://rupesh-kumar-portfolio.vercel.app RATE_LIMIT_SALT=<any-long-random-text>
   npx supabase secrets set LLM_BASE_URL=<url> LLM_API_KEY=<key> LLM_MODEL=<model>
   npx supabase functions deploy chat --no-verify-jwt
   ```
   (Skip the `LLM_*` line for knowledge-base-only mode.)
3. Frontend project → **Environment Variables** → add (exact names):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the `anon` key or the `sb_publishable_...` key (Supabase calls it `..._PUBLISHABLE_KEY`, but this project reads **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**) |

4. **Redeploy** the frontend → chat → reload the page → the conversation is still there, and rows appear in
   Supabase → `chat_messages`. Details: [`supabase/README.md`](supabase/README.md).

### Final checklist
- [ ] `https://<backend>/api/health` → `{"ok":true,"store":"supabase"}`
- [ ] Website loads, **Download résumé** works, visit counter shows in About
- [ ] Chat answers (e.g. "exp", "What are his skills?")
- [ ] Contact form → *"Thanks! Your message has been received."* → row in `contact_messages` → email in your inbox
- [ ] (step 8) chat history survives a reload; rows appear in `chat_messages`

---

## Updating the live site later

Every `git push` to `main` redeploys **both** Vercel projects automatically (~2 minutes).

**If Git is on this laptop:**
```bash
git add .
git commit -m "Describe the change"
git push
```

**If you edit on a laptop without Git (OneDrive folder):**
1. Delete `frontend/node_modules`, `backend/node_modules`, `frontend/.next`, `backend/data` (see step 2A), then zip.
2. On the Git laptop: unzip → open the unzipped `Portfolio` folder → select **everything inside** (Ctrl+A) → copy →
   paste into your existing repo folder (the one with the hidden `.git` folder) → **Replace the files**.
   Don't paste the folder itself (you'd get `portfolio/Portfolio/...`) and don't delete the repo folder.
3. `git status` (should list your changed files) → `git add .` → `git commit -m "..."` → `git push`.

**Changed environment variables?** They apply only after **Deployments → ⋯ → Redeploy** (or the next push).

**Changed the chat knowledge (`backend/src/agent/knowledge.js`)?** In `backend/` run these one by one:
```bash
npm run test:agent
npm run build:supabase
npm run test:chat
```
Push, then refresh Supabase in the SQL Editor:
```sql
delete from public.chat_faqs;
delete from public.chat_tech;
delete from public.chat_settings;
```
…and run the updated `database/setup.sql` again. (Contact messages, visits and chat history are not touched.)
Small text edits can also be made directly in Supabase → Table Editor → `chat_faqs`.

**Replace the résumé:** put the new PDF in `frontend/public/`, set `resume:` in `frontend/src/data/profile.js` to
`/<file-name>.pdf`, push.

---

## Environment variables reference

**Backend (Vercel project `rupesh-portfolio-api`)**

| Name | Required | Example / notes |
|---|---|---|
| `SUPABASE_URL` | yes | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | service_role `eyJ...` or `sb_secret_...` — **secret, backend only** |
| `CORS_ORIGIN` | yes | `https://rupesh-kumar-portfolio.vercel.app,http://localhost:3000` |
| `RESEND_API_KEY` | for email alerts | `re_...` |
| `CONTACT_NOTIFY_EMAIL` | for email alerts | your Resend sign-up email; comma-separate for several (needs a verified domain in Resend) |
| `RATE_LIMIT_SALT` | no | any long random text (hashes visitor IPs for the contact limit) |

**Frontend (Vercel project `portfolio`)**

| Name | Required | Example / notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | yes | `https://rupesh-portfolio-api.vercel.app` (no trailing `/`) |
| `NEXT_PUBLIC_SUPABASE_URL` | step 8 only | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | step 8 only | `anon` key or `sb_publishable_...` — public, never the service_role key |

**Supabase Edge Function secrets (step 8)** — `ALLOWED_ORIGINS`, `RATE_LIMIT_SALT`, optional `LLM_BASE_URL`,
`LLM_API_KEY`, `LLM_MODEL`, `LLM_DAILY_LIMIT`. `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are provided automatically.

---

## Troubleshooting

| Problem | Cause → fix |
|---|---|
| Windows zip fails with errors | OneDrive "online-only" files in `node_modules` → delete `node_modules`, `.next`, `backend/data`, then zip |
| Vercel import list doesn't show `portfolio` | Repo not pushed yet, or Vercel's GitHub App lacks access → **Adjust GitHub App Permissions** → add the repo → Save |
| Vercel asks "multi-service project" | Use **Import single project** for `backend` and later for `frontend` |
| "Possible configuration mismatch" on preset **Other** | Expected for the backend — ignore |
| `/api/health` shows `"store":"temporary…"` | Supabase variables missing/wrong on the backend → fix → Redeploy |
| Site says *"Couldn't reach the server"* / contact form fails | `CORS_ORIGIN` name misspelled or value isn't the exact site URL (`https://`, no trailing `/`) → fix → **Redeploy backend**; or `NEXT_PUBLIC_API_URL` wrong on the frontend → fix → redeploy frontend |
| Can't rename an environment variable | Vercel doesn't allow it → Remove it and add it again with the correct name |
| Changed a variable but nothing changed | Variables apply only after **Redeploy** |
| Chat shows an error after adding `NEXT_PUBLIC_SUPABASE_*` | The Edge Function isn't deployed → deploy it (step 8) or remove those two variables and redeploy |
| No email arrives | Check Spam; `RESEND_API_KEY` set on the **backend**; `CONTACT_NOTIFY_EMAIL` = your Resend sign-up email; code pushed after adding the email feature; see backend **Logs** for `[contact] email notification failed` |
| Next.js dev server crashes with `EINVAL readlink … .next` | OneDrive placeholders in `frontend/.next` → delete the `.next` folder and start again |
| SQL Editor says "Success. No rows returned" | That's success — run the check query in step 1.4 |

---

## Editing content
- Website text (roles, summary, skills, experience, projects, education): `frontend/src/data/profile.js`.
- Résumé PDF: `frontend/public/` (see "Replace the résumé" above).
- Chat-agent knowledge: `backend/src/agent/knowledge.js` (then see "Changed the chat knowledge" above), or edit
  rows in Supabase → Table Editor → `chat_faqs`.
- Database schema: `database/setup.sql` — safe to re-run any time ([`database/README.md`](database/README.md)).
