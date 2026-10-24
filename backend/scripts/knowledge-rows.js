// Turns knowledge.js into database rows for the Supabase chat tables (chat_faqs, chat_tech, chat_settings).
// Used by build-supabase.js (to write the SQL seed) and test-chat.js (to test against the same data).
import { TOPICS, TECH, CONTACT, QUESTIONS } from '../src/agent/knowledge.js';

const CATEGORIES = {
  smalltalk: ['greeting', 'thanks', 'bye', 'bot'],
  profile: ['about', 'hire', 'available', 'personal', 'contact', 'location', 'resume', 'links', 'name', 'funfact'],
  experience: ['experience', 'godrej', 'everonic', 'iit'],
  skills: ['skills', 'languages', 'frameworks', 'databases', 'ai', 'mcp', 'cloud'],
  projects: ['projects', 'agentshield', 'githubops', 'ragproject', 'cloudlens', 'popmyflix'],
  education: ['education', 'btech', 'class12', 'class10', 'score', 'gate', 'dsa', 'achievements'],
};
const categoryOf = (id) => Object.keys(CATEGORIES).find((c) => CATEGORIES[c].includes(id)) || 'general';

export function faqRows() {
  return TOPICS.map((t, i) => ({
    slug: t.id,
    category: categoryOf(t.id),
    question: QUESTIONS[t.id] || t.id,
    phrases: t.phrases || [],
    keywords: t.keys || {},
    answer: t.answer,
    suggestions: t.suggest || [],
    small_talk: Boolean(t.smallTalk),
    sort_order: (i + 1) * 10,
  }));
}

export function techRows() {
  return Object.entries(TECH).map(([key, entry]) => ({
    key,
    display_name: entry ? entry[0] : key.charAt(0).toUpperCase() + key.slice(1),
    used_in: entry ? entry[1] : null,
  }));
}

export function settingsRows() {
  return [
    { key: 'contact_email', value: CONTACT.email },
    { key: 'assistant_name', value: 'Rupesh.agent' },
    {
      key: 'strengths',
      value:
        'Java / Spring Boot, React / Next.js, Angular, SQL Server / Oracle, Generative & Agentic AI (RAG, MCP, LangChain, LangGraph) and AWS',
    },
  ];
}
