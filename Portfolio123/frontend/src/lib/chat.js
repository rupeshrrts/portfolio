// Chat client. In production it calls the Supabase `chat` Edge Function, which stores the conversation
// so it survives page reloads. Without Supabase settings it falls back to the Express API (local dev).
import { api } from './api';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const FUNCTION_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/chat` : null;
const STORAGE_KEY = 'rk-chat-session';

export const persistentChat = Boolean(FUNCTION_URL);

function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

// The token proves ownership of the conversation; only its hash is stored server-side.
function readSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved?.clientToken) return saved;
  } catch {}
  return { clientToken: newToken(), conversationId: null };
}

function saveSession(session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

async function callFunction(body, timeout = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(SUPABASE_KEY ? { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const error = new Error(data.error || 'Request failed');
      error.status = res.status;
      throw error;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError' || err instanceof TypeError) throw new Error('Failed to fetch');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/** Sends a question; returns { reply, suggestions, topic? }. */
export async function sendChatMessage(message, { lastTopic } = {}) {
  if (!FUNCTION_URL) {
    return api('/api/chat', { method: 'POST', body: JSON.stringify({ message, context: { lastTopic } }), timeout: 20000 });
  }
  const session = readSession();
  try {
    const data = await callFunction({ action: 'send', message, clientToken: session.clientToken, conversationId: session.conversationId });
    saveSession({ ...session, conversationId: data.conversationId });
    return data;
  } catch (err) {
    // The stored conversation was deleted or belongs to another token: start fresh and retry once.
    if (err.status === 403 && session.conversationId) {
      const fresh = { clientToken: newToken(), conversationId: null };
      const data = await callFunction({ action: 'send', message, clientToken: fresh.clientToken });
      saveSession({ ...fresh, conversationId: data.conversationId });
      return data;
    }
    throw err;
  }
}

/** Previous messages of the saved conversation, oldest first ([] when there is none). */
export async function loadChatHistory() {
  if (!FUNCTION_URL) return [];
  const session = readSession();
  if (!session.conversationId) return [];
  try {
    const data = await callFunction({ action: 'history', clientToken: session.clientToken, conversationId: session.conversationId }, 12000);
    return data.messages || [];
  } catch (err) {
    if (err.status === 403 || err.status === 404) saveSession({ clientToken: newToken(), conversationId: null });
    return [];
  }
}

/** Forgets the saved conversation so the next message starts a new one. */
export function startNewChat() {
  saveSession({ clientToken: newToken(), conversationId: null });
}
