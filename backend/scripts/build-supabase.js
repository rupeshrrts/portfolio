// Run with: npm run build:supabase
// 1. Writes the chat knowledge seed (from src/agent/knowledge.js) into database/setup.sql.
// 2. Copies src/agent/matcher.js into supabase/functions/_shared/ so the Edge Function uses the same matcher.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { faqRows, techRows, settingsRows } from './knowledge-rows.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const SQL_FILE = path.join(root, 'database/setup.sql');
const BEGIN = '-- BEGIN GENERATED CHAT SEED';
const END = '-- END GENERATED CHAT SEED';

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (list) => (list.length ? `array[${list.map(q).join(', ')}]::text[]` : `'{}'::text[]`);
const json = (obj) => `${q(JSON.stringify(obj))}::jsonb`;

function insert(table, columns, rows, conflict) {
  const values = rows.map((r) => `  (${r.join(', ')})`).join(',\n');
  return `insert into public.${table} (${columns.join(', ')}) values\n${values}\non conflict (${conflict}) do nothing;`;
}

const faqs = faqRows();
const tech = techRows();
const settings = settingsRows();

const seed = [
  insert(
    'chat_faqs',
    ['slug', 'category', 'question', 'phrases', 'keywords', 'answer', 'suggestions', 'small_talk', 'sort_order'],
    faqs.map((f) => [q(f.slug), q(f.category), q(f.question), arr(f.phrases), json(f.keywords), q(f.answer), arr(f.suggestions), String(f.small_talk), String(f.sort_order)]),
    'slug',
  ),
  insert('chat_tech', ['key', 'display_name', 'used_in'], tech.map((t) => [q(t.key), q(t.display_name), q(t.used_in)]), 'key'),
  insert('chat_settings', ['key', 'value'], settings.map((s) => [q(s.key), q(s.value)]), 'key'),
].join('\n\n');

const sql = fs.readFileSync(SQL_FILE, 'utf8');
const start = sql.indexOf(BEGIN);
const end = sql.indexOf(END);
if (start === -1 || end === -1 || end < start) throw new Error(`Seed markers not found in ${SQL_FILE}`);
const updated = `${sql.slice(0, start + BEGIN.length)}\n${seed}\n${sql.slice(end)}`;
fs.writeFileSync(SQL_FILE, updated);
console.log(`Seeded ${faqs.length} FAQs, ${tech.length} technologies and ${settings.length} settings into database/setup.sql`);

const sharedDir = path.join(root, 'supabase/functions/_shared');
fs.mkdirSync(sharedDir, { recursive: true });
fs.copyFileSync(path.join(root, 'backend/src/agent/matcher.js'), path.join(sharedDir, 'matcher.js'));
console.log('Copied matcher.js to supabase/functions/_shared/');
