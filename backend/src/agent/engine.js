// Local answer engine: the shared matcher bound to the knowledge base in knowledge.js.
// In production the Supabase Edge Function runs the same matcher against the chat_faqs / chat_tech tables.
import { TOPICS, TECH, CONTACT, QUESTIONS } from './knowledge.js';
import { createMatcher } from './matcher.js';

const topics = TOPICS.map((t) => ({ ...t, question: QUESTIONS[t.id] }));

export const { answer } = createMatcher({ topics, tech: TECH });

export { CONTACT };
