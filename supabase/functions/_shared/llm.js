// Minimal client for any OpenAI-compatible /chat/completions API, so a free tier can be plugged in
// with three secrets: LLM_BASE_URL, LLM_API_KEY, LLM_MODEL (e.g. Groq, Google Gemini, OpenRouter).
// Plain fetch keeps it dependency-free and identical in Deno (Edge Function) and Node (tests).

const THINK_BLOCK = /<think>[\s\S]*?<\/think>/gi; // some reasoning models prefix their answer with this

export function createLlm({ apiKey, baseUrl, model, timeoutMs = 15000, maxTokens = 500, fetchImpl = globalThis.fetch }) {
  const enabled = Boolean(apiKey && baseUrl && model);

  /** messages: [{ role: 'user' | 'assistant', content }]. Returns { text, model }; throws on any failure. */
  async function complete({ system, messages }) {
    if (!enabled) throw new Error('LLM is not configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, ...messages],
          temperature: 0.2,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`LLM request failed with HTTP ${res.status}`);
      const data = await res.json();
      const text = String(data?.choices?.[0]?.message?.content ?? '')
        .replace(THINK_BLOCK, '')
        .trim();
      if (!text) throw new Error('LLM returned an empty answer');
      return { text: text.slice(0, 4000), model: String(data?.model || model) };
    } finally {
      clearTimeout(timer);
    }
  }

  return { enabled, model, complete };
}
