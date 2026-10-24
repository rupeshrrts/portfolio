// Run with: npm run test:chat — tests the Supabase chat Edge Function logic (chat-core.js + llm.js)
// against an in-memory store seeded with the same rows database/setup.sql inserts.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { faqRows, techRows, settingsRows } from './knowledge-rows.js';
import { handleSend, handleHistory, resetKnowledgeCache, LIMITS, FALLBACK_REPLY } from '../../supabase/functions/_shared/chat-core.js';
import { createLlm } from '../../supabase/functions/_shared/llm.js';

function memoryStore() {
  const conversations = new Map();
  const messages = [];
  const counters = new Map();
  let id = 0;
  return {
    conversations,
    messages,
    counters,
    async loadKnowledge() {
      return { faqs: faqRows(), tech: techRows(), settings: settingsRows() };
    },
    async getConversation(cid) {
      return conversations.get(cid) || null;
    },
    async createConversation(client_token_hash) {
      const conv = { id: randomUUID(), client_token_hash };
      conversations.set(conv.id, conv);
      return conv;
    },
    async recentMessages(cid, limit) {
      return messages.filter((m) => m.conversation_id === cid).slice(-limit);
    },
    async insertMessage(row) {
      messages.push({ id: ++id, created_at: new Date().toISOString(), ...row });
    },
    async hitRateLimit(key, limit) {
      const hits = (counters.get(key) || 0) + 1;
      counters.set(key, hits);
      return hits <= limit;
    },
  };
}

const token = () => (randomUUID() + randomUUID()).replace(/-/g, '');
const fakeLlm = (impl) => ({ enabled: true, model: 'fake-model', complete: impl });

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

test('knowledge-base mode answers from the FAQ table and stores both messages', async () => {
  const store = memoryStore();
  const clientToken = token();
  const res = await handleSend({ store, llm: null, input: { clientToken, message: 'What is AgentShieldAI?' } });
  assert.equal(res.status, 200);
  assert.equal(res.body.source, 'faq');
  assert.match(res.body.reply, /AgentShieldAI is Rupesh's live product/);
  assert.ok(res.body.suggestions.length > 0);
  assert.equal(store.messages.length, 2);
  assert.deepEqual(store.messages.map((m) => m.role), ['user', 'assistant']);
  assert.equal(store.messages[1].faq_slug, 'agentshield');
  assert.equal(store.messages[1].matched, true);
});

test('unknown questions are flagged and never invented', async () => {
  const store = memoryStore();
  const res = await handleSend({ store, llm: null, input: { clientToken: token(), message: 'who won the cricket match' } });
  assert.equal(res.body.source, 'fallback');
  assert.equal(res.body.reply, FALLBACK_REPLY);
  assert.equal(store.messages[1].matched, false);
});

test('follow-ups use the stored conversation context', async () => {
  const store = memoryStore();
  const clientToken = token();
  const first = await handleSend({ store, llm: null, input: { clientToken, message: 'What did he do at Godrej Koerber?' } });
  const second = await handleSend({ store, llm: null, input: { clientToken, conversationId: first.body.conversationId, message: 'tell me more' } });
  assert.equal(second.body.conversationId, first.body.conversationId);
  assert.match(second.body.reply, /dig into next/);
  assert.equal(store.conversations.size, 1);
});

test('history is returned only to the token that owns the conversation', async () => {
  const store = memoryStore();
  const clientToken = token();
  const sent = await handleSend({ store, llm: null, input: { clientToken, message: 'hi' } });
  const mine = await handleHistory({ store, input: { clientToken, conversationId: sent.body.conversationId } });
  assert.equal(mine.status, 200);
  assert.equal(mine.body.messages.length, 2);
  assert.equal(mine.body.messages[0].content, 'hi');
  const theirs = await handleHistory({ store, input: { clientToken: token(), conversationId: sent.body.conversationId } });
  assert.equal(theirs.status, 403);
  const hijack = await handleSend({ store, llm: null, input: { clientToken: token(), conversationId: sent.body.conversationId, message: 'hi' } });
  assert.equal(hijack.status, 403);
});

test('LLM mode sends the knowledge base and prior turns, and stores the LLM reply', async () => {
  const store = memoryStore();
  const clientToken = token();
  const calls = [];
  const llm = fakeLlm(async (req) => {
    calls.push(req);
    return { text: 'He is a full stack developer.', model: 'fake-model' };
  });
  const first = await handleSend({ store, llm, input: { clientToken, message: 'Who is Rupesh?' } });
  await handleSend({ store, llm, input: { clientToken, conversationId: first.body.conversationId, message: 'and his skills?' } });
  assert.equal(first.body.source, 'llm');
  assert.equal(first.body.reply, 'He is a full stack developer.');
  assert.match(calls[0].system, /KNOWLEDGE/);
  assert.match(calls[0].system, /Godrej Koerber/);
  assert.match(calls[0].system, /Never guess or invent/);
  assert.deepEqual(calls[1].messages.map((m) => m.role), ['user', 'assistant', 'user']);
  assert.equal(store.messages[1].model, 'fake-model');
});

test('LLM failure falls back to the knowledge base', async () => {
  const store = memoryStore();
  const llm = fakeLlm(async () => {
    throw new Error('provider down');
  });
  const errors = console.error;
  console.error = () => {};
  const res = await handleSend({ store, llm, input: { clientToken: token(), message: 'What are his skills?' } });
  console.error = errors;
  assert.equal(res.body.source, 'faq');
  assert.match(res.body.reply, /toolkit/);
});

test('daily LLM budget switches to the knowledge base when used up', async () => {
  const store = memoryStore();
  store.counters.set('llm:global', 5);
  let called = false;
  const llm = fakeLlm(async () => {
    called = true;
    return { text: 'x', model: 'm' };
  });
  const res = await handleSend({ store, llm, input: { clientToken: token(), message: 'education' }, config: { llmDailyLimit: 5 } });
  assert.equal(called, false);
  assert.equal(res.body.source, 'faq');
});

test('per-IP rate limit returns 429', async () => {
  const store = memoryStore();
  const clientToken = token();
  let last;
  for (let i = 0; i <= LIMITS.perIpPerMinute; i++) {
    last = await handleSend({ store, llm: null, input: { clientToken, message: 'hi' }, ip: '1.2.3.4' });
  }
  assert.equal(last.status, 429);
});

test('input validation', async () => {
  const store = memoryStore();
  assert.equal((await handleSend({ store, llm: null, input: { clientToken: 'short', message: 'hi' } })).status, 400);
  assert.equal((await handleSend({ store, llm: null, input: { clientToken: token(), message: '   ' } })).status, 400);
  assert.equal((await handleSend({ store, llm: null, input: { clientToken: token(), message: 'x'.repeat(501) } })).status, 400);
  assert.equal((await handleSend({ store, llm: null, input: { clientToken: token(), conversationId: 'not-a-uuid', message: 'hi' } })).status, 400);
  assert.equal(store.messages.length, 0);
});

test('llm.js calls an OpenAI-compatible API and strips <think> blocks', async () => {
  let request;
  const llm = createLlm({
    apiKey: 'k',
    baseUrl: 'https://example.test/v1/',
    model: 'free-model',
    fetchImpl: async (url, init) => {
      request = { url, init };
      return { ok: true, json: async () => ({ model: 'free-model', choices: [{ message: { content: '<think>hmm</think> Hello!' } }] }) };
    },
  });
  const out = await llm.complete({ system: 'sys', messages: [{ role: 'user', content: 'hi' }] });
  assert.equal(out.text, 'Hello!');
  assert.equal(request.url, 'https://example.test/v1/chat/completions');
  assert.equal(request.init.headers.Authorization, 'Bearer k');
  const body = JSON.parse(request.init.body);
  assert.equal(body.messages[0].role, 'system');
  assert.equal(body.model, 'free-model');

  const failing = createLlm({ apiKey: 'k', baseUrl: 'https://x', model: 'm', fetchImpl: async () => ({ ok: false, status: 429 }) });
  await assert.rejects(failing.complete({ system: 's', messages: [] }), /HTTP 429/);
  assert.equal(createLlm({ apiKey: '', baseUrl: 'https://x', model: 'm' }).enabled, false);
});

let passed = 0;
for (const { name, fn } of tests) {
  resetKnowledgeCache();
  try {
    await fn();
    passed++;
    console.log(`✓ ${name}`);
  } catch (err) {
    console.log(`✗ ${name}\n    ${err.message}`);
  }
}
console.log(`\n${passed}/${tests.length} passed`);
process.exit(passed === tests.length ? 0 : 1);
