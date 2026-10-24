// Supabase Edge Function: POST /functions/v1/chat
//   { action: "send",    conversationId?, clientToken, message } → { conversationId, reply, suggestions, source }
//   { action: "history", conversationId,  clientToken }          → { conversationId, messages }
//
// Secrets (Dashboard → Edge Functions → Secrets, or `supabase secrets set`):
//   ALLOWED_ORIGINS   comma-separated site URLs allowed to call this function (required in production)
//   RATE_LIMIT_SALT   any long random string, used to hash visitor IPs
//   LLM_BASE_URL, LLM_API_KEY, LLM_MODEL   optional free-tier OpenAI-compatible LLM; without them the
//                                          function answers from the chat_faqs knowledge base only
//   LLM_DAILY_LIMIT   optional cap on LLM calls per day (default 1000), after which it uses the knowledge base
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically by Supabase.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createLlm } from '../_shared/llm.js';
import { handleHistory, handleSend } from '../_shared/chat-core.js';

const env = (name: string) => Deno.env.get(name) ?? '';

const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { persistSession: false },
});

const llm = createLlm({
  apiKey: env('LLM_API_KEY'),
  baseUrl: env('LLM_BASE_URL'),
  model: env('LLM_MODEL'),
});

const config = {
  salt: env('RATE_LIMIT_SALT'),
  llmDailyLimit: Number(env('LLM_DAILY_LIMIT')) || 1000,
};

const allowedOrigins = env('ALLOWED_ORIGINS')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Database access for chat-core.js. Every call uses the service_role key (RLS blocks the public key).
const store = {
  async loadKnowledge() {
    const [faqs, tech, settings] = await Promise.all([
      supabase.from('chat_faqs').select('slug, question, phrases, keywords, answer, suggestions, small_talk')
        .eq('is_active', true).order('sort_order'),
      supabase.from('chat_tech').select('key, display_name, used_in').eq('is_active', true),
      supabase.from('chat_settings').select('key, value'),
    ]);
    for (const r of [faqs, tech, settings]) if (r.error) throw r.error;
    return { faqs: faqs.data, tech: tech.data, settings: settings.data };
  },
  async getConversation(id: string) {
    const { data, error } = await supabase.from('chat_conversations').select('id, client_token_hash').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },
  async createConversation(clientTokenHash: string) {
    const { data, error } = await supabase.from('chat_conversations')
      .insert({ client_token_hash: clientTokenHash }).select('id, client_token_hash').single();
    if (error) throw error;
    return data;
  },
  async recentMessages(conversationId: string, limit: number) {
    const { data, error } = await supabase.from('chat_messages')
      .select('role, content, faq_slug, created_at')
      .eq('conversation_id', conversationId)
      .order('id', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).reverse();
  },
  async insertMessage(row: Record<string, unknown>) {
    const { error } = await supabase.from('chat_messages').insert(row);
    if (error) throw error;
  },
  async hitRateLimit(key: string, limit: number, windowSeconds: number) {
    const { data, error } = await supabase.rpc('hit_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) throw error;
    return data === true;
  },
};

function corsHeaders(origin: string) {
  const allowOrigin = allowedOrigins.length === 0 ? '*' : allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const origin = (req.headers.get('origin') ?? '').replace(/\/$/, '');
  const cors = corsHeaders(origin);

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors);
  if (allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return json({ error: 'Origin not allowed' }, 403, cors);
  }

  let input: Record<string, unknown>;
  try {
    input = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400, cors);
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';

  try {
    const result = input?.action === 'history'
      ? await handleHistory({ store, input })
      : await handleSend({ store, llm, input, ip, config });
    return json(result.body, result.status, cors);
  } catch (err) {
    console.error('[chat] request failed:', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500, cors);
  }
});
