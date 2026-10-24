// Persistence layer: uses Supabase when credentials are set, otherwise a local JSON file.
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

// Serverless hosts (Vercel) only allow writes to /tmp, which is wiped between cold starts —
// fine for a demo, but use Supabase in production so messages are never lost.
const SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

export const storeMode = supabase ? 'supabase' : SERVERLESS ? 'temporary (/tmp) — configure Supabase!' : 'local-json';

const DB_FILE = SERVERLESS
  ? '/tmp/portfolio-db.json'
  : path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/local-db.json');

if (SERVERLESS && !supabase) {
  console.warn('[store] Supabase is not configured — contact messages will NOT persist on this host.');
}

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
  } catch {
    return { messages: [], views: 0 };
  }
}

async function writeLocal(db) {
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2));
}

export async function saveMessage({ name, email, subject, message }) {
  if (supabase) {
    const { error } = await supabase.from('contact_messages').insert({ name, email, subject, message });
    if (error) throw error;
    return;
  }
  const db = await readLocal();
  db.messages.push({ id: Date.now(), name, email, subject, message, created_at: new Date().toISOString() });
  await writeLocal(db);
}

export async function incrementViews() {
  if (supabase) {
    const { data, error } = await supabase.rpc('increment_page_views');
    if (error) throw error;
    return data;
  }
  const db = await readLocal();
  db.views = (db.views || 0) + 1;
  await writeLocal(db);
  return db.views;
}

export async function getViews() {
  if (supabase) {
    const { data, error } = await supabase.from('site_stats').select('views').eq('id', 1).single();
    if (error) throw error;
    return data.views;
  }
  return (await readLocal()).views || 0;
}
