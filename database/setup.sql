-- =====================================================================
--  Rupesh Kumar Portfolio — complete database setup (Supabase / PostgreSQL 15+)
-- ---------------------------------------------------------------------
--  HOW TO RUN
--    Supabase Dashboard → SQL Editor → New query → paste this whole file → Run.
--
--  SAFE TO RE-RUN: every statement uses IF NOT EXISTS / OR REPLACE /
--  ON CONFLICT, so running it again never deletes data or overwrites
--  FAQ answers you have edited in the dashboard.
--
--  WHAT IT CREATES
--    1. contact_messages        — messages from the website contact form
--    2. site_stats              — visit counter + increment_page_views()
--    3. rate_limits             — fixed-window limiter + hit_rate_limit()
--    4. chat_faqs / chat_tech / chat_settings
--                               — the chat agent's knowledge base
--    5. chat_conversations / chat_messages
--                               — persistent chat history
--    6. chat_unanswered_questions (view) + purge_old_chat_data()
--    7. Security — RLS on everything, no public access; only the backend
--       and the `chat` Edge Function (service_role key) can read/write
--    8. Seed data — every question the agent can answer today
--
--  USED BY: backend/src/lib/store.js and supabase/functions/chat
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. CONTACT MESSAGES
-- ---------------------------------------------------------------------
create table if not exists public.contact_messages (
  id          bigint generated always as identity primary key,
  name        text        not null,
  email       text        not null,
  subject     text,
  message     text        not null,
  is_read     boolean     not null default false,   -- tick this in Table Editor once you've replied
  created_at  timestamptz not null default now(),

  -- Same limits the backend validates, enforced again at the database level
  constraint contact_name_length    check (char_length(name) between 2 and 100),
  constraint contact_email_length   check (char_length(email) <= 200),
  constraint contact_email_format   check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  constraint contact_subject_length check (subject is null or char_length(subject) <= 200),
  constraint contact_message_length check (char_length(message) between 10 and 3000)
);

comment on table public.contact_messages is 'Messages submitted through the portfolio contact form.';

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_unread_idx on public.contact_messages (is_read) where is_read = false;


-- ---------------------------------------------------------------------
-- 2. SITE STATS (visit counter — always exactly one row with id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_stats (
  id          int         primary key default 1,
  views       bigint      not null default 0,
  updated_at  timestamptz not null default now(),
  constraint site_stats_single_row check (id = 1),
  constraint site_stats_views_positive check (views >= 0)
);

comment on table public.site_stats is 'Portfolio visit counter (single row).';

insert into public.site_stats (id, views) values (1, 0) on conflict (id) do nothing;

-- A single UPDATE is atomic, so simultaneous visitors never lose a count.
create or replace function public.increment_page_views()
returns bigint
language sql
set search_path = public
as $$
  update public.site_stats
     set views = views + 1,
         updated_at = now()
   where id = 1
  returning views;
$$;

comment on function public.increment_page_views() is 'Adds one portfolio visit and returns the new total.';


-- ---------------------------------------------------------------------
-- 3. RATE LIMITS
--    Serverless functions don't share memory, so limits live in the
--    database. hit_rate_limit('chat:ip:<hash>', 20, 60) counts one hit in
--    the current 60-second window and returns false once 20 is exceeded.
-- ---------------------------------------------------------------------
create table if not exists public.rate_limits (
  key           text        not null,
  window_start  timestamptz not null,
  hits          integer     not null default 0,
  primary key (key, window_start),
  constraint rate_limits_key_length check (char_length(key) <= 200)
);

comment on table public.rate_limits is 'Fixed-window request counters used by hit_rate_limit().';

create index if not exists rate_limits_window_idx on public.rate_limits (window_start);

create or replace function public.hit_rate_limit(p_key text, p_limit integer, p_window_seconds integer)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_hits   integer;
begin
  insert into public.rate_limits as r (key, window_start, hits)
  values (p_key, v_window, 1)
  on conflict (key, window_start) do update set hits = r.hits + 1
  returning r.hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

comment on function public.hit_rate_limit(text, integer, integer) is 'Counts a hit for p_key; returns false when p_limit is exceeded in the current window.';


-- ---------------------------------------------------------------------
-- 4. CHAT KNOWLEDGE BASE
--    chat_faqs     — one row per answerable topic. The Edge Function matches
--                    questions against `phrases` (exact phrases) and
--                    `keywords` ({"word": weight}, 5 = unique name,
--                    3 = strong topic word, 1-2 = supporting word).
--    chat_tech     — "does he know X?" lookups. used_in = NULL means the
--                    technology is recognised but NOT on his stack.
--    chat_settings — small key/value settings read by the Edge Function.
--    Edit these in Table Editor; the Edge Function picks changes up within
--    5 minutes — no redeploy needed.
-- ---------------------------------------------------------------------
create table if not exists public.chat_faqs (
  id           bigint      generated always as identity primary key,
  slug         text        not null unique,
  category     text        not null default 'general',
  question     text        not null,
  phrases      text[]      not null default '{}',
  keywords     jsonb       not null default '{}'::jsonb,
  answer       text        not null,
  suggestions  text[]      not null default '{}',
  small_talk   boolean     not null default false,
  sort_order   integer     not null default 0,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint chat_faqs_slug_format      check (slug ~ '^[a-z0-9_-]{2,60}$'),
  constraint chat_faqs_keywords_object  check (jsonb_typeof(keywords) = 'object'),
  constraint chat_faqs_answer_length    check (char_length(answer) between 1 and 4000),
  constraint chat_faqs_question_length  check (char_length(question) between 1 and 300)
);

comment on table public.chat_faqs is 'Chat agent knowledge base: predefined questions and answers.';

create index if not exists chat_faqs_active_idx on public.chat_faqs (is_active, sort_order);

create table if not exists public.chat_tech (
  key           text        primary key,
  display_name  text        not null,
  used_in       text,                                -- NULL = recognised, but not on his stack
  is_active     boolean     not null default true,
  updated_at    timestamptz not null default now(),
  constraint chat_tech_key_format check (key ~ '^[a-z0-9]{1,40}$')
);

comment on table public.chat_tech is 'Technology lookups for "does he know X?" questions.';

create table if not exists public.chat_settings (
  key         text        primary key,
  value       text        not null,
  updated_at  timestamptz not null default now()
);

comment on table public.chat_settings is 'Key/value settings for the chat Edge Function.';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists chat_faqs_touch on public.chat_faqs;
create trigger chat_faqs_touch before update on public.chat_faqs
  for each row execute function public.touch_updated_at();

drop trigger if exists chat_tech_touch on public.chat_tech;
create trigger chat_tech_touch before update on public.chat_tech
  for each row execute function public.touch_updated_at();

drop trigger if exists chat_settings_touch on public.chat_settings;
create trigger chat_settings_touch before update on public.chat_settings
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------
-- 5. CHAT HISTORY
--    A conversation is owned by whoever holds its client token: the browser
--    keeps a random token, the database stores only its SHA-256 hash, and
--    the Edge Function checks it before returning or extending history.
-- ---------------------------------------------------------------------
create table if not exists public.chat_conversations (
  id                 uuid        primary key default gen_random_uuid(),
  client_token_hash  text        not null,
  message_count      integer     not null default 0,
  created_at         timestamptz not null default now(),
  last_message_at    timestamptz not null default now(),
  constraint chat_conversations_token_hash check (client_token_hash ~ '^[0-9a-f]{64}$')
);

comment on table public.chat_conversations is 'One row per visitor chat session.';

create index if not exists chat_conversations_last_message_idx on public.chat_conversations (last_message_at desc);

create table if not exists public.chat_messages (
  id               bigint      generated always as identity primary key,
  conversation_id  uuid        not null references public.chat_conversations (id) on delete cascade,
  role             text        not null,
  content          text        not null,
  source           text,                 -- assistant only: 'llm' | 'faq' | 'fallback'
  faq_slug         text,                 -- assistant only: knowledge-base topic that matched
  matched          boolean,              -- assistant only: false = question not in the knowledge base
  model            text,                 -- assistant only: LLM model that answered
  latency_ms       integer,
  created_at       timestamptz not null default now(),
  constraint chat_messages_role        check (role in ('user', 'assistant')),
  constraint chat_messages_source      check (source is null or source in ('llm', 'faq', 'fallback')),
  constraint chat_messages_length      check (char_length(content) between 1 and 8000),
  constraint chat_messages_user_length check (role <> 'user' or char_length(content) <= 500),
  constraint chat_messages_latency     check (latency_ms is null or latency_ms >= 0)
);

comment on table public.chat_messages is 'Every visitor question and assistant reply.';

create index if not exists chat_messages_conversation_idx on public.chat_messages (conversation_id, id desc);
create index if not exists chat_messages_created_at_idx on public.chat_messages (created_at desc);
create index if not exists chat_messages_unmatched_idx on public.chat_messages (created_at desc)
  where role = 'assistant' and matched = false;

-- Keep conversation counters in step with inserted messages.
create or replace function public.chat_messages_after_insert()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.chat_conversations
     set message_count   = message_count + 1,
         last_message_at = new.created_at
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists chat_messages_count on public.chat_messages;
create trigger chat_messages_count after insert on public.chat_messages
  for each row execute function public.chat_messages_after_insert();


-- ---------------------------------------------------------------------
-- 6. ADMIN HELPERS
-- ---------------------------------------------------------------------
-- Questions the knowledge base couldn't answer — review these and add FAQs.
create or replace view public.chat_unanswered_questions
with (security_invoker = true) as
select a.created_at,
       u.content  as question,
       a.source,
       a.conversation_id
  from public.chat_messages a
  join lateral (
        select m.content
          from public.chat_messages m
         where m.conversation_id = a.conversation_id
           and m.role = 'user'
           and m.id < a.id
         order by m.id desc
         limit 1
       ) u on true
 where a.role = 'assistant'
   and a.matched = false;

comment on view public.chat_unanswered_questions is 'Visitor questions the knowledge base did not cover.';

-- Deletes old chats and expired rate-limit rows. Returns the number of conversations removed.
create or replace function public.purge_old_chat_data(p_days integer default 180)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_deleted integer;
begin
  delete from public.chat_conversations where last_message_at < now() - make_interval(days => p_days);
  get diagnostics v_deleted = row_count;
  delete from public.rate_limits where window_start < now() - interval '2 days';
  return v_deleted;
end;
$$;

comment on function public.purge_old_chat_data(integer) is 'Removes conversations idle for p_days and expired rate-limit windows.';


-- ---------------------------------------------------------------------
-- 7. SECURITY
--    RLS is ON with no policies for anon/authenticated, so the public
--    (anon / publishable) key cannot read or write anything. The backend
--    and the Edge Function use the service_role key, which bypasses RLS.
--    Supabase grants new public tables to anon/authenticated by default,
--    so those grants are revoked explicitly.
-- ---------------------------------------------------------------------
alter table public.contact_messages   enable row level security;
alter table public.site_stats         enable row level security;
alter table public.rate_limits        enable row level security;
alter table public.chat_faqs          enable row level security;
alter table public.chat_tech          enable row level security;
alter table public.chat_settings      enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages      enable row level security;

revoke all on public.contact_messages, public.site_stats, public.rate_limits,
              public.chat_faqs, public.chat_tech, public.chat_settings,
              public.chat_conversations, public.chat_messages,
              public.chat_unanswered_questions
  from anon, authenticated;

grant all on public.contact_messages, public.site_stats, public.rate_limits,
             public.chat_faqs, public.chat_tech, public.chat_settings,
             public.chat_conversations, public.chat_messages,
             public.chat_unanswered_questions
  to service_role;

revoke execute on function public.increment_page_views()                      from public, anon, authenticated;
revoke execute on function public.hit_rate_limit(text, integer, integer)      from public, anon, authenticated;
revoke execute on function public.purge_old_chat_data(integer)                from public, anon, authenticated;
revoke execute on function public.touch_updated_at()                          from public, anon, authenticated;
revoke execute on function public.chat_messages_after_insert()                from public, anon, authenticated;

grant execute on function public.increment_page_views()                 to service_role;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;
grant execute on function public.purge_old_chat_data(integer)           to service_role;


-- ---------------------------------------------------------------------
-- 8. SEED DATA — generated from backend/src/agent/knowledge.js by
--    `npm run build:supabase` (in backend/). ON CONFLICT DO NOTHING keeps
--    any answers you have edited in the dashboard.
-- ---------------------------------------------------------------------
-- BEGIN GENERATED CHAT SEED
insert into public.chat_faqs (slug, category, question, phrases, keywords, answer, suggestions, small_talk, sort_order) values
  ('greeting', 'smalltalk', 'Hi there!', '{}'::text[], '{"hi":3,"hello":3,"hey":3,"hii":3,"namaste":3,"hola":3,"morning":2,"evening":2,"afternoon":2,"sup":2}'::jsonb, 'Hey there! 👋 I''m Rupesh''s portfolio agent. I can tell you about his upcoming role at Digital India Corporation (MeitY), his Java and AI work at Godrej Koerber, his Agentic AI projects like AgentShieldAI, his skills, education or how to reach him. What would you like to know?', array['Who is Rupesh?', 'What is AgentShieldAI?', 'What are his skills?']::text[], true, 10),
  ('thanks', 'smalltalk', 'Thank you!', '{}'::text[], '{"thank":3,"thanks":3,"thx":3,"ty":2,"great":1,"awesome":1,"cool":1,"nice":1,"helpful":2,"dhanyavad":3,"shukriya":3}'::jsonb, 'You''re welcome! 😊 Anything else you''d like to know about Rupesh?', array['How can I contact him?', 'Top projects?']::text[], true, 20),
  ('bye', 'smalltalk', 'Bye!', '{}'::text[], '{"bye":3,"goodbye":3,"later":1,"cya":3,"tata":3}'::jsonb, 'Thanks for stopping by! If you''d like to talk to Rupesh directly, email rupeshsinghsuntech@gmail.com. Have a great day! 👋', '{}'::text[], true, 30),
  ('bot', 'smalltalk', 'Who are you?', array['who are you', 'what are you', 'are you a bot', 'are you ai', 'are you real', 'are you human', 'your name']::text[], '{"bot":3,"chatbot":3,"yourself":2}'::jsonb, 'I''m Rupesh''s portfolio assistant — a small agent that answers questions using his résumé, GitHub and project data. For anything I can''t answer, the contact form at the bottom reaches him directly.', array['Who is Rupesh?', 'What does he do now?']::text[], false, 40),
  ('about', 'profile', 'Who is Rupesh?', array['who is rupesh', 'about rupesh', 'about him', 'tell me about him', 'tell me about rupesh', 'introduce', 'summary', 'overview', 'background', 'his profile']::text[], '{"rupesh":1,"about":2,"who":1,"summary":3,"introduce":3,"introduction":3,"background":3,"profile":2,"overview":2}'::jsonb, 'Rupesh Kumar is a Full Stack Developer (Java Spring Boot, React & Next.js) and Generative AI Engineer with 2+ years of experience building enterprise web applications with Java / Spring Boot, React, Next.js, Angular and SQL, plus Generative & Agentic AI features (RAG, MCP, tool calling). He has been selected as a Software Developer (Full Stack Developer role) at Digital India Corporation, MeitY, Government of India, in New Delhi, and joins on 20 Nov 2026.

Most recently he was a Software Engineer at Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026), working on a Warehouse Management System. He also built and launched AgentShieldAI, a live AI-security SaaS, and has qualified GATE CSIT in both 2025 and 2026.', array['What does he do now?', 'What is AgentShieldAI?', 'What are his skills?']::text[], false, 50),
  ('hire', 'profile', 'Why should we hire him?', array['why should i hire', 'why hire', 'why should we hire', 'what makes him', 'strength', 'unique', 'stand out', 'good fit']::text[], '{"hire":3,"hiring":3,"recruit":3,"strength":3,"strengths":3,"fit":2,"unique":2,"why":1,"best":1,"valuable":2}'::jsonb, 'A few reasons Rupesh stands out:
• Full-stack Java delivery — Spring Boot REST APIs, a role-based ticketing system and SAP integrations for a Warehouse Management System at Godrej Koerber.
• He ships AI in production — a RAG pipeline for log analysis and a custom MCP server for natural-language database queries.
• He builds products end to end — AgentShieldAI is live with an extension, dashboard, auth and billing.
• Solid engineering base — 2+ years across Java / Spring Boot, React / Next.js, Angular, SQL Server & Oracle.
• Cloud & security depth — AWS, Terraform, Ansible and CTF challenge design at IIT Jammu.
• Strong CS fundamentals — GATE CSIT qualified in 2025 and 2026, plus 150+ DSA problems solved on LeetCode & GFG.', array['How can I contact him?', 'Is he open to opportunities?']::text[], false, 60),
  ('available', 'profile', 'Is he open to opportunities?', array['open to', 'looking for', 'available for', 'job change', 'notice period', 'relocate', 'relocation', 'freelance', 'open for']::text[], '{"available":3,"availability":3,"opportunity":3,"opportunities":3,"notice":3,"relocate":3,"relocation":3,"freelance":3,"remote":2,"open":1,"joining":2}'::jsonb, 'Rupesh is open to exciting opportunities in Generative AI, Agentic AI and full-stack engineering (Java / Spring Boot, React, Next.js, Node.js). For specifics like notice period, location preferences or freelance work, it''s best to reach him directly at rupeshsinghsuntech@gmail.com.', array['How can I contact him?', 'Why should we hire him?']::text[], false, 70),
  ('personal', 'profile', 'What is his age or salary?', array['date of birth', 'how old']::text[], '{"age":3,"dob":3,"birthday":3,"born":2,"married":3,"salary":3,"ctc":3,"package":2,"religion":3,"caste":3,"father":3,"mother":3,"family":2,"address":2}'::jsonb, 'I keep personal details like that private. For compensation or anything else personal, please reach out to Rupesh directly at rupeshsinghsuntech@gmail.com.', array['How can I contact him?']::text[], false, 80),
  ('contact', 'profile', 'How can I contact him?', array['get in touch', 'reach him', 'reach out', 'contact him', 'talk to him', 'phone number', 'email id', 'mail id']::text[], '{"contact":4,"email":4,"mail":3,"gmail":3,"phone":4,"mobile":3,"call":2,"number":2,"whatsapp":3,"reach":3,"touch":2,"connect":2}'::jsonb, 'You can reach Rupesh at:
• Email: rupeshsinghsuntech@gmail.com
• LinkedIn: linkedin.com/in/rupesh-kumar-508b1820a
• GitHub: github.com/rupeshrrts

Or use the contact form on this page — your message goes straight to him.', array['Is he open to opportunities?', 'Where is he based?']::text[], false, 90),
  ('location', 'profile', 'Where is he based?', array['where is he', 'where does he', 'based in', 'where he lives', 'which city', 'home town', 'hometown']::text[], '{"where":2,"location":4,"located":4,"city":3,"live":2,"lives":2,"based":3,"hometown":4,"from":1,"bihar":3,"siwan":3,"mumbai":2,"delhi":2}'::jsonb, 'Rupesh is from Siwan, Bihar. He most recently worked in Navi Mumbai and is moving to New Delhi to join Digital India Corporation (MeitY).', array['Is he open to relocation?', 'What does he do now?']::text[], false, 100),
  ('resume', 'profile', 'Where can I download his résumé?', array['download resume', 'download cv']::text[], '{"resume":4,"cv":4,"pdf":2,"download":2}'::jsonb, 'You can download his résumé with the "Download résumé" button at the top of this page, or press Ctrl + K and choose "Download résumé".', '{}'::text[], false, 110),
  ('links', 'profile', 'What are his GitHub and LinkedIn profiles?', array['github profile', 'linkedin profile', 'social media']::text[], '{"github":4,"linkedin":4,"social":2,"portfolio":1,"link":1,"links":1,"repo":2,"repos":2,"repositories":2}'::jsonb, 'His LinkedIn is linkedin.com/in/rupesh-kumar-508b1820a. His GitHub is github.com/rupeshrrts — it has GitHubOps AI and more. His live product AgentShieldAI is at rupesh-agentshield-site.vercel.app.', array['Top projects?', 'How can I contact him?']::text[], false, 120),
  ('experience', 'experience', 'What is his work experience?', array['work experience', 'how many years', 'years of experience', 'where has he worked', 'previous companies', 'career', 'work history']::text[], '{"experience":4,"experienced":3,"career":3,"worked":2,"work":1,"companies":3,"company":2,"years":2,"year":1,"employer":3,"history":1,"job":2}'::jsonb, 'Rupesh has 2+ years of professional experience:
• Software Developer (Full Stack) — Digital India Corporation, MeitY, Govt. of India, New Delhi (joining 20 Nov 2026)
• Software Engineer — Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026): Java / Spring Boot WMS, ticketing system, RAG & MCP
• Associate Software Engineer — Everonic Solutions, Lucknow (5 Aug 2024 – 29 Nov 2025): real-time Vehicle Tracking System (Spring Boot, React, Next.js)
• Cloud Engineer Intern — IIT Jammu (Jan 2024 – Jul 2024)', array['What does he do now?', 'What did he do at Godrej Koerber?', 'What did he build at Everonic?']::text[], false, 130),
  ('dic', 'experience', 'What does he do now?', array['current job', 'current role', 'current company', 'right now', 'currently doing', 'what does he do', 'present company', 'working now', 'working currently', 'where is he working', 'where does he work', 'which company', 'digital india', 'government job']::text[], '{"dic":5,"meity":5,"digital":4,"india":2,"government":4,"govt":4,"gov":4,"ministry":4,"delhi":2,"fullstack":3,"current":3,"currently":3,"now":2,"working":2,"present":2}'::jsonb, 'Rupesh has been selected as a Software Developer — in a Full Stack Developer role — at Digital India Corporation (DIC), New Delhi, the not-for-profit company under the Ministry of Electronics & Information Technology (MeitY), Government of India, and joins on 20 Nov 2026. There he will:
• Build secure, scalable web applications and REST APIs for Government of India digital initiatives under the Digital India programme.
• Integrate AI-enabled features (LLMs, Generative AI APIs, RAG) using AI-assisted development tools.

Most recently he was a Software Engineer at Godrej Koerber (19 Dec 2025 – 18 Sep 2026), building Java / Spring Boot services and Generative AI tooling for a warehouse management product.', array['What did he do at Godrej Koerber?', 'Tell me about his AI work', 'What are his skills?']::text[], false, 140),
  ('godrej', 'experience', 'What did he do at Godrej Koerber?', array['previous job', 'previous company', 'last company', 'last job']::text[], '{"godrej":5,"koerber":5,"previous":2,"wms":5,"ticket":3,"ticketing":3,"warehouse":5,"sap":3,"supply":3,"chain":2,"logistics":3,"inventory":3}'::jsonb, 'Most recently, Rupesh was a Software Engineer at Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026), working on a Warehouse Management System (WMS) web application for supply-chain and logistics clients. There he:
• Developed WMS modules for inventory, stock movement, receiving, picking, packing and dispatch — Java / Spring Boot REST APIs with Spring Data JPA on SQL Server and an Angular / TypeScript front end.
• Built a centralized, role-based Ticketing Management System (Next.js, Spring Boot) that replaced email and Excel tracking, with priority-based assignment, status tracking and SLA-based escalation for customer issues.
• Implemented a RAG pipeline for log analysis that feeds the relevant application and system logs to an LLM, helping the team find root causes faster.
• Built a custom MCP server exposing SQL Server data as structured tools for an AI agent — natural-language database queries and ad-hoc reporting.
• Developed and maintained SAP ↔ WMS integration interfaces syncing master data, stock movements and orders with SAP ERP.', array['What is MCP work he has done?', 'What did he do before this?']::text[], false, 150),
  ('everonic', 'experience', 'What did he build at Everonic?', array['vehicle tracking', 'before godrej', 'before this', 'first job']::text[], '{"everonic":5,"lucknow":4,"vehicle":4,"tracking":3,"gps":4,"telemetry":4,"fleet":3,"before":1,"associate":2}'::jsonb, 'At Everonic Solutions, Lucknow (5 Aug 2024 – 29 Nov 2025) Rupesh was an Associate Software Engineer. He:
• Built a full-stack, real-time Vehicle Tracking System (React, Next.js, TypeScript, REST APIs, SQL Server) processing GPS and telemetry data for live fleet monitoring.
• Designed Java / Spring Boot REST APIs and data-processing services with Spring Data JPA, a layered architecture and dependency injection for high-volume location data.
• Built interactive React / Next.js dashboards for live tracking, route analysis, trip history and operational metrics.
• Managed SQL Server and Oracle (PL/SQL) data served through REST APIs, using Git in an Agile team.', array['What does he do at Godrej Koerber?', 'What did he do at IIT Jammu?']::text[], false, 160),
  ('iit', 'experience', 'What did he do at IIT Jammu?', array['iit jammu', 'internship', 'cloud intern', 'cloud engineer intern', 'cloud security intern', 'security intern']::text[], '{"iit":5,"jammu":5,"intern":4,"internship":4,"terraform":3,"ansible":3,"drdo":4,"anveshanam":5,"ctf":4}'::jsonb, 'As a Cloud Engineer Intern at IIT Jammu (Jan – Jul 2024), Rupesh:
• Designed and deployed scalable AWS infrastructure (EC2, S3, VPC, Route 53, IAM) for secure, highly available workloads.
• Automated infrastructure and environment setup with Terraform (IaC) and Ansible.
• Built AWS-based cloud security challenges for national-level CTF competitions.
• Contributed to Anveshanam''2, a 3-day CTF by IIT Jammu & DRDO, building cloud-security, steganography and memory-analysis challenges.', array['What cloud skills does he have?', 'What are his achievements?']::text[], false, 170),
  ('skills', 'skills', 'What are his skills?', array['tech stack', 'what technologies', 'what can he do', 'skill set', 'what does he know', 'technical skills']::text[], '{"skill":4,"skills":4,"stack":3,"technology":3,"technologies":3,"tech":2,"tools":2,"expertise":3,"proficient":2,"know":1,"languages":2}'::jsonb, 'Rupesh''s toolkit:
• AI: MCP, AI agents, LLM integration (OpenAI, Claude, NVIDIA NIM), tool calling, RAG, prompt engineering, NL-to-SQL, LangChain, LangGraph, FAISS
• Languages: Java, Python, JavaScript, TypeScript, SQL, C/C++
• Backend: Spring Boot, Spring Security, JPA / Hibernate, Node.js, Express.js, REST APIs
• Frontend: React.js, Next.js, Angular, HTML5, CSS3, Tailwind CSS
• Databases: PostgreSQL, SQL Server, Oracle, PL/SQL
• DevOps & tools: AWS, GCP, OpenStack, Docker, Ansible, Terraform, Git, GitHub, Linux, Postman, Swagger, SAP integration', array['Tell me about his AI work', 'Does he know Angular?']::text[], false, 180),
  ('languages', 'skills', 'Which programming languages does he know?', array['programming languages', 'which languages', 'coding languages', 'code in']::text[], '{"language":4,"languages":4,"programming":2,"coding":2}'::jsonb, 'Programming languages: Java, Python, JavaScript, TypeScript, SQL and C/C++ (plus HTML5 & CSS3). Java powers his Spring Boot backends, TypeScript his React / Next.js front ends, and Python his AI projects.', array['Which frameworks does he use?', 'Which databases does he know?']::text[], false, 190),
  ('frameworks', 'skills', 'Which frameworks does he use?', array['which frameworks', 'what frameworks']::text[], '{"framework":5,"frameworks":5,"library":3,"libraries":3,"frontend":3,"backend":3}'::jsonb, 'Frameworks: Spring Boot, Spring Security, JPA / Hibernate, Node.js, Express.js and FastAPI on the backend; React, Next.js, Angular and Tailwind CSS on the frontend; LangChain and LangGraph for AI agents.', array['Which databases does he know?', 'Tell me about his AI work']::text[], false, 200),
  ('databases', 'skills', 'Which databases does he know?', array['which databases', 'what databases']::text[], '{"database":5,"databases":5,"db":4,"rdbms":4,"sqlserver":3,"plsql":3}'::jsonb, 'Databases: PostgreSQL, SQL Server, Oracle Database and PL/SQL — SQL Server and Oracle across Godrej Koerber and Everonic, PostgreSQL with Spring Boot backends. He has also used FAISS as a vector store for RAG, SQLite for agent checkpointing and Firebase for SaaS projects.', array['What are his skills?', 'Top projects?']::text[], false, 210),
  ('name', 'profile', 'What is his full name?', array['full name', 'his name', 'what is he called']::text[], '{"name":2,"fullname":4}'::jsonb, 'His name is Rupesh Kumar — a Full Stack Developer (Java Spring Boot, React & Next.js) and Generative AI Engineer.', array['Who is Rupesh?']::text[], false, 220),
  ('funfact', 'profile', 'Tell me something interesting about him', array['something interesting', 'fun fact', 'surprise me', 'something cool', 'impress me']::text[], '{"interesting":4,"fun":3,"fact":3,"cool":1,"impress":3}'::jsonb, 'Here''s a fun one: this chat assistant you''re talking to runs on a knowledge base Rupesh built for his portfolio — and his own product, AgentShieldAI, protects people from leaking secrets into chatbots just like this one. He has also written CTF hacking challenges for a national event by IIT Jammu & DRDO, and cleared GATE two years in a row. 🛡️', array['What is AgentShieldAI?', 'What did he do at IIT Jammu?']::text[], false, 230),
  ('ai', 'skills', 'Tell me about his AI work', array['ai work', 'ai experience', 'generative ai', 'agentic ai', 'ai skills', 'machine learning', 'model context protocol']::text[], '{"ai":3,"genai":4,"generative":4,"agentic":4,"agent":3,"agents":3,"llm":4,"llms":4,"mcp":4,"rag":4,"prompt":3,"openai":3,"claude":3,"gpt":3,"langchain":3,"langgraph":3,"ml":2,"artificial":2,"intelligence":1}'::jsonb, 'Generative & Agentic AI is Rupesh''s focus:
• At Godrej Koerber — a RAG pipeline for log analysis and a custom MCP server that lets an AI agent query SQL Server data in natural language.
• AgentShieldAI — his live product that protects prompts sent to ChatGPT, Claude, Gemini and Copilot.
• Projects — GitHubOps AI (LangGraph agent with human-in-the-loop) and a RAG-based GenAI application (FastAPI + React).
Stack: LLM APIs, AI agents, tool calling, RAG, MCP, LangChain, LangGraph, prompt engineering.', array['What is AgentShieldAI?', 'Tell me about GitHubOps AI', 'RAG-based GenAI application?']::text[], false, 240),
  ('mcp', 'skills', 'What MCP work has he done?', array['what is mcp', 'explain mcp', 'what is model context protocol', 'mcp work', 'mcp tools', 'mcp server', 'mcp experience']::text[], '{"mcp":5,"protocol":3}'::jsonb, 'MCP (Model Context Protocol) is an open standard that lets AI assistants like Claude or ChatGPT call external tools and data sources in a controlled way — think of it as a "USB port" for AI.

How Rupesh uses it:
• At Godrej Koerber — a custom MCP server that exposes SQL Server data as structured tools for an AI agent, enabling natural-language database queries and ad-hoc reporting.', array['Tell me about his AI work', 'What did he do at Godrej Koerber?']::text[], false, 250),
  ('cloud', 'skills', 'What cloud skills does he have?', array['cloud skills', 'devops skills', 'cloud experience', 'aws experience', 'devops experience', 'cloud security', 'worked on cloud', 'worked on aws']::text[], '{"cloud":4,"aws":4,"devops":4,"docker":3,"terraform":3,"ansible":3,"ec2":3,"s3":3,"vpc":3,"iam":3,"cicd":3,"infrastructure":3,"azure":2,"gcp":2}'::jsonb, 'Cloud & DevOps: AWS (EC2, S3, VPC, Route 53, IAM), Terraform, Ansible, Docker, CI/CD and Linux. He built and automated AWS environments at IIT Jammu and designed AWS security challenges for national CTFs. CloudLens, one of his projects, analysed spend across AWS, Azure and GCP.', array['What did he do at IIT Jammu?', 'What is CloudLens?']::text[], false, 260),
  ('projects', 'projects', 'What projects has he built?', array['what has he built', 'side projects', 'personal projects', 'best project', 'top projects', 'his projects']::text[], '{"project":4,"projects":4,"built":3,"build":2,"portfolio":1,"work":1,"made":2,"created":2,"developed":2,"apps":2,"products":2}'::jsonb, 'His key projects:
• AgentShieldAI ⭐ — live AI-security SaaS that stops secrets leaking into ChatGPT, Claude, Gemini & Copilot.
• GitHubOps AI — LangGraph GitHub automation assistant with human-in-the-loop approval.
• RAG-Based GenAI Application — FastAPI + React chat app that answers from retrieved context.
• PopMyFlix — marketing SaaS serving 1,000+ daily requests.
• CloudLens — multi-cloud (AWS, Azure, GCP) cost intelligence platform.', array['What is AgentShieldAI?', 'Tell me about GitHubOps AI']::text[], false, 270),
  ('agentshield', 'projects', 'What is AgentShieldAI?', array['agent shield', 'live project', 'live product', 'flagship', 'his product', 'saas product']::text[], '{"agentshieldai":6,"agentshield":6,"shield":4,"leak":3,"leaking":3,"secrets":3,"extension":3,"redact":3,"live":1,"product":2}'::jsonb, 'AgentShieldAI is Rupesh''s live product (rupesh-agentshield-site.vercel.app). It''s a browser extension + SaaS dashboard that checks every prompt sent to ChatGPT, Claude, Gemini, Copilot and Perplexity, and:
• Blocks API keys, passwords, tokens and private keys before they''re sent
• Warns on or auto-redacts emails, phone, card and ID numbers
• Lets users choose block / warn / redact per rule
• Runs checks locally in the browser and masks secrets before storage
• Verifies each browser and checks access server-side on every request
It includes a security-alerts dashboard, a 30-day free trial and flexible plans.', array['What other projects has he built?', 'Tell me about his AI work']::text[], false, 280),
  ('githubops', 'projects', 'Tell me about GitHubOps AI', array['github ops', 'githubops ai', 'github agent', 'github assistant']::text[], '{"githubops":6,"langgraph":4,"hitl":4,"approval":3,"streamlit":2,"sqlite":3,"checkpoint":3,"checkpointing":3}'::jsonb, 'GitHubOps AI (Aug 2026) is a natural-language GitHub automation assistant built with LangGraph workflows and GitHub API tools. Write and delete operations run only after human confirmation (human-in-the-loop), with SQLite checkpointing to save workflow state.
Tech: Python, LangGraph, LangChain, Streamlit, NVIDIA AI.
Code: github.com/rupeshrrts/githubops-ai', array['RAG-based GenAI application?', 'What is AgentShieldAI?']::text[], false, 290),
  ('ragproject', 'projects', 'What is his RAG-based GenAI application?', array['rag project', 'rag application', 'rag app', 'rag based', 'genai application', 'genai app']::text[], '{"fastapi":2,"application":3,"app":2,"project":1,"rag":1,"retrieval":3}'::jsonb, 'His RAG-Based GenAI Application (Jul 2026) has a FastAPI backend and a React chat interface that retrieves relevant context to generate LLM answers for real-world enterprise use cases, using custom AI workflow design.
Tech: Python, FastAPI, React, LLM APIs, RAG.', array['Tell me about GitHubOps AI', 'Tell me about his AI work']::text[], false, 300),
  ('cloudlens', 'projects', 'What is CloudLens?', '{}'::text[], '{"cloudlens":6,"cost":3,"spend":3,"billing":2,"finops":4}'::jsonb, 'CloudLens (Feb 2023) is a SaaS platform integrating AWS, Azure and GCP to visualise real-time cloud spend and recommend ways to reduce idle resource waste. Built with HTML, CSS, JavaScript, Bootstrap and Firebase.', array['What is PopMyFlix?', 'Top projects?']::text[], false, 310),
  ('popmyflix', 'projects', 'What is PopMyFlix?', '{}'::text[], '{"popmyflix":6,"marketing":4,"ad":2,"ads":3,"campaign":3,"gsap":3,"framer":3}'::jsonb, 'PopMyFlix is an end-to-end animated marketing SaaS with multi-channel ad automation, live payment integration and real-time campaign analytics, serving 1,000+ daily requests. Built with Next.js, TypeScript, GSAP, Framer Motion, FastAPI and Firebase.', array['What is CloudLens?', 'Top projects?']::text[], false, 320),
  ('education', 'education', 'Where did he study?', array['where did he study', 'educational background', 'qualification', 'qualifications']::text[], '{"education":4,"educational":4,"study":3,"studied":3,"college":3,"university":3,"degree":3,"qualification":4,"graduate":3,"graduation":3,"academic":3,"padhai":4}'::jsonb, 'Education:
• B.Tech, Computer Science & Engineering — Shaheed Bhagat Singh State Technical Campus, Ferozepur (2020–2024), CGPA 8.15/10
• Class XII — Shaheed Bhagat Singh Inter College, Siwan (BSEB, 2019), 76%, 1st Division
• Class X — Gandak High School, Tarwara, Siwan (BSEB, 2016), 73.6%, 1st Division
He has also qualified GATE CSIT in 2025 and 2026.', array['What are his achievements?', 'What are his skills?']::text[], false, 330),
  ('btech', 'education', 'What was his B.Tech CGPA?', array['b tech', 'bachelor']::text[], '{"btech":5,"cgpa":5,"engineering":2,"ferozepur":5,"sbsstc":5,"bachelor":4}'::jsonb, 'Rupesh completed his B.Tech in Computer Science & Engineering at Shaheed Bhagat Singh State Technical Campus, Ferozepur, Punjab (2020–2024) with a CGPA of 8.15/10.', array['What are his achievements?']::text[], false, 340),
  ('class12', 'education', 'What were his Class 12 marks?', array['class 12', 'class xii', '12th class', 'intermediate', 'higher secondary', 'plus two']::text[], '{"12th":5,"xii":5,"twelfth":5,"inter":3,"intermediate":4}'::jsonb, 'Class XII: Shaheed Bhagat Singh Inter College, Sani-Basantpur, Siwan — BSEB Patna (2018–2019), 76%, 1st Division.', '{}'::text[], false, 350),
  ('class10', 'education', 'What were his Class 10 marks?', array['class 10', 'class x ', '10th class', 'matric', 'secondary school']::text[], '{"10th":5,"tenth":5,"matric":5,"matriculation":5,"ssc":4,"secondary":2,"gandak":5}'::jsonb, 'Class X: Gandak High School, Tarwara, Siwan — BSEB Patna (2016), scored 368/500 (73.6%), 1st Division.', '{}'::text[], false, 360),
  ('score', 'education', 'What are his academic scores?', array['how much marks', 'what marks', 'percentage in']::text[], '{"marks":3,"percentage":3,"score":3,"scored":3,"grades":3,"result":2,"results":2}'::jsonb, 'His academic scores:
• B.Tech CSE — CGPA 8.15/10
• Class XII (BSEB) — 76%, 1st Division
• Class X (BSEB) — 73.6%, 1st Division
• GATE CSIT — qualified in 2025 and 2026', '{}'::text[], false, 370),
  ('gate', 'education', 'Has he qualified GATE?', array['gate exam', 'gate score', 'gate qualified']::text[], '{"gate":6}'::jsonb, 'Rupesh qualified GATE in Computer Science & Information Technology (CSIT) twice — in 2025 and again in 2026.', array['What are his achievements?', 'Education?']::text[], false, 380),
  ('dsa', 'education', 'How many DSA problems has he solved?', array['data structures', 'problem solving', 'competitive programming', 'coding problems', 'coding practice', 'geeks for geeks']::text[], '{"dsa":6,"leetcode":6,"gfg":6,"geeksforgeeks":6,"algorithm":4,"algorithms":4,"problems":2,"competitive":3,"coding":1,"cp":3}'::jsonb, 'Rupesh has solved 150+ Data Structures & Algorithms problems on LeetCode and GeeksforGeeks. Combined with qualifying GATE CSIT in 2025 and 2026, it reflects strong CS fundamentals — he also keeps a C++ coding-problems repo on GitHub (github.com/rupeshrrts).', array['What are his achievements?', 'What are his skills?']::text[], false, 390),
  ('achievements', 'education', 'What are his achievements?', array['proud of', 'awards']::text[], '{"achievement":5,"achievements":5,"award":4,"awards":4,"accomplishment":4,"accomplishments":4,"certification":3,"certifications":3,"milestone":3}'::jsonb, 'Achievements:
• Qualified GATE CSIT in 2025 and 2026
• Solved 150+ DSA problems on LeetCode and GeeksforGeeks
• Challenge author for Anveshanam''2, a national CTF by IIT Jammu & DRDO
• Built and launched AgentShieldAI, a live AI-security SaaS
• B.Tech CSE with CGPA 8.15/10', array['What is AgentShieldAI?', 'Education?']::text[], false, 400)
on conflict (slug) do nothing;

insert into public.chat_tech (key, display_name, used_in) values
  ('csharp', 'C#', 'his earlier .NET development work'),
  ('dotnet', '.NET / ASP.NET Core', 'ASP.NET Core 8, Web API, MVC and EF Core across his professional work'),
  ('aspnet', 'ASP.NET Core', 'his earlier .NET development work'),
  ('efcore', 'Entity Framework Core', 'data access in his ASP.NET Core APIs'),
  ('entity', 'Entity Framework Core', 'data access in his ASP.NET Core APIs'),
  ('python', 'Python', 'GitHubOps AI and his RAG-based GenAI application'),
  ('typescript', 'TypeScript', 'React/Next.js apps at Everonic, Angular at Godrej Koerber, and PopMyFlix'),
  ('javascript', 'JavaScript', 'frontend work and CloudLens'),
  ('cpp', 'C/C++', 'problem solving and DSA — 150+ problems on LeetCode & GFG, plus a C++ coding-problems repo'),
  ('java', 'Java', 'Spring Boot REST APIs at Godrej Koerber and Everonic'),
  ('springboot', 'Spring Boot', 'WMS and ticketing APIs at Godrej Koerber and vehicle-tracking APIs at Everonic'),
  ('sql', 'SQL', 'SQL Server and Oracle work throughout his career'),
  ('angular', 'Angular', 'the WMS web application at Godrej Koerber'),
  ('react', 'React', 'the real-time Vehicle Tracking System at Everonic and other full-stack apps'),
  ('nextjs', 'Next.js', 'the ticketing system at Godrej Koerber, the Vehicle Tracking System at Everonic and PopMyFlix'),
  ('nodejs', 'Node.js', 'full-stack projects such as this portfolio''s backend'),
  ('express', 'Express.js', 'REST APIs in full-stack projects such as this portfolio''s backend'),
  ('fastapi', 'FastAPI', 'PopMyFlix and his RAG-based GenAI application'),
  ('streamlit', 'Streamlit', 'GitHubOps AI'),
  ('tailwind', 'Tailwind CSS', 'frontend styling'),
  ('bootstrap', 'Bootstrap', 'CloudLens and other frontends'),
  ('sqlserver', 'SQL Server', 'Godrej Koerber and Everonic'),
  ('oracle', 'Oracle Database & PL/SQL', 'the Vehicle Tracking System at Everonic'),
  ('plsql', 'PL/SQL', 'Oracle database work'),
  ('mongodb', 'Mongodb', null),
  ('postgresql', 'PostgreSQL', 'Spring Boot backends'),
  ('mysql', 'Mysql', null),
  ('aws', 'AWS', 'IIT Jammu (EC2, S3, VPC, Route 53, IAM)'),
  ('azure', 'Azure', 'CloudLens cost analysis (alongside AWS and GCP)'),
  ('gcp', 'GCP', 'cloud work and CloudLens cost analysis (alongside AWS and Azure)'),
  ('openstack', 'OpenStack', 'cloud infrastructure work'),
  ('docker', 'Docker', 'containerising apps'),
  ('kubernetes', 'Kubernetes', null),
  ('terraform', 'Terraform', 'AWS infrastructure-as-code at IIT Jammu'),
  ('ansible', 'Ansible', 'configuration automation at IIT Jammu'),
  ('git', 'Git & GitHub', 'all of his projects'),
  ('linux', 'Linux', 'servers and cloud work'),
  ('firebase', 'Firebase', 'CloudLens and PopMyFlix'),
  ('mcp', 'Model Context Protocol (MCP)', 'a custom MCP server at Godrej Koerber'),
  ('rag', 'RAG', 'log analysis at Godrej Koerber and his RAG-based GenAI application'),
  ('langchain', 'LangChain', 'GitHubOps AI'),
  ('langgraph', 'LangGraph', 'GitHubOps AI (human-in-the-loop agent)'),
  ('openai', 'OpenAI API', 'LLM integrations in enterprise apps'),
  ('claude', 'Anthropic Claude', 'LLM integrations in enterprise apps'),
  ('faiss', 'FAISS', 'vector search for RAG'),
  ('sap', 'SAP integration', 'SAP ↔ WMS data flows at Godrej Koerber'),
  ('swagger', 'Swagger', 'API documentation and testing'),
  ('postman', 'Postman', 'API testing'),
  ('iis', 'IIS', 'deploying .NET applications'),
  ('pytorch', 'Pytorch', null),
  ('tensorflow', 'Tensorflow', null)
on conflict (key) do nothing;

insert into public.chat_settings (key, value) values
  ('contact_email', 'rupeshsinghsuntech@gmail.com'),
  ('assistant_name', 'Rupesh.agent'),
  ('strengths', 'Java / Spring Boot, React / Next.js, Angular, SQL Server / Oracle, Generative & Agentic AI (RAG, MCP, LangChain, LangGraph) and AWS')
on conflict (key) do nothing;
-- END GENERATED CHAT SEED


-- =====================================================================
--  OPTIONAL: handy queries (run separately whenever you need them)
-- =====================================================================
-- Latest contact messages:
--   select created_at, name, email, subject, message from public.contact_messages order by created_at desc limit 20;
--
-- Questions the chat agent couldn't answer (add FAQs for these):
--   select * from public.chat_unanswered_questions order by created_at desc limit 50;
--
-- Recent chat activity:
--   select c.id, c.message_count, c.last_message_at from public.chat_conversations c order by c.last_message_at desc limit 20;
--
-- How answers were produced (llm / faq / fallback) in the last 7 days:
--   select source, count(*) from public.chat_messages
--    where role = 'assistant' and created_at > now() - interval '7 days' group by source;
--
-- Add or edit an FAQ:
--   insert into public.chat_faqs (slug, category, question, phrases, keywords, answer, suggestions)
--   values ('notice', 'profile', 'What is his notice period?', array['notice period'], '{"notice": 4}',
--           'Please email him for his current notice period.', array['How can I contact him?']);
--
-- Delete chats idle for more than 180 days (or schedule it with pg_cron):
--   select public.purge_old_chat_data(180);
--
-- Reset the visit counter:
--   update public.site_stats set views = 0, updated_at = now() where id = 1;
