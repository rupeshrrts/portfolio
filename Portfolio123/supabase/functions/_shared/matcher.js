// Question matcher for the portfolio agent: normalises the question (aliases, Hinglish, typos),
// scores every topic, handles "does he know X?", multi-part questions and follow-ups.
//
// Pure module with no imports so it runs unchanged in Node (Express, tests) and in Deno (the Supabase
// Edge Function, which feeds it rows from the chat_faqs / chat_tech tables). A copy lives at
// supabase/functions/_shared/matcher.js — regenerate it with `npm run build:supabase` in backend/.
//
// topics: [{ id, phrases?: string[], keys?: { word: weight }, answer, suggest?: string[], smallTalk? }]
// tech:   { normalisedKey: [displayName, whereUsed] | null }   (null = known word, not on his stack)

const ALIASES = [
  [/c#/g, ' csharp '],
  [/c\+\+/g, ' cpp '],
  [/asp\.net( core)?/g, ' aspnet dotnet '],
  [/\.net( core)?/g, ' dotnet '],
  [/\bdot ?net\b/g, ' dotnet '],
  [/node\.?js/g, ' nodejs '],
  [/next\.?js/g, ' nextjs '],
  [/react\.?js/g, ' react '],
  [/express\.?js/g, ' express '],
  [/b\.? ?tech/g, ' btech '],
  [/sql server|mssql/g, ' sqlserver '],
  [/entity framework|ef core/g, ' efcore '],
  [/pl\/sql/g, ' plsql '],
  [/ci\/cd/g, ' cicd '],
  [/agent ?shield( ?ai)?/g, ' agentshield '],
  [/github ?ops( ?ai)?/g, ' githubops '],
  [/gen ?ai/g, ' genai '],
  [/postgres(ql)?/g, ' postgresql '],
  [/spring ?boot/g, ' springboot '],
  [/full ?stack/g, ' fullstack '],
  [/mongo ?db/g, ' mongodb '],
  [/\b10 ?th\b/g, ' 10th '],
  [/\b12 ?th\b/g, ' 12th '],
];

// Word-level rewrites: Hinglish plus the abbreviations people type into a chat box.
const WORD_MAP = {
  kya: 'what', kaha: 'where', kahan: 'where', kaun: 'who', kab: 'when', kaise: 'how', kitna: 'how', kitne: 'how',
  unka: 'his', uska: 'his', inka: 'his', iska: 'his', unke: 'his', uske: 'his', naukri: 'job', padhai: 'education',
  batao: 'tell', bataiye: 'tell', bolo: 'tell', ur: 'your', u: 'you', pls: 'please', plz: 'please', abhi: 'now',
  exp: 'experience', xp: 'experience', yoe: 'experience', yrs: 'years', edu: 'education', qual: 'qualification',
  proj: 'projects', projs: 'projects', cert: 'certification', certs: 'certification', achv: 'achievements',
  ph: 'phone', mob: 'mobile', num: 'number', loc: 'location', sal: 'salary', addr: 'address', comp: 'company',
  lang: 'language', langs: 'languages', fw: 'framework', dbs: 'databases', intro: 'introduction', bg: 'background',
  li: 'linkedin', gh: 'github',
};

// Common words that must never be "typo-corrected" into a topic keyword.
const STOP = new Set(
  'a an the is are was were be been am do does did he his him she her they them it its i me my you your we our us what which who whom whose when where why how can could would should will shall may might must to of in on at by for with from about as into than then so and or but if not no yes this that these those there here have has had tell show give please any some all more most much many also just only very really still date time name like want need get got let make made know'.split(
    ' ',
  ),
);

const FOLLOW_UP = new Set(['more', 'elaborate', 'detail', 'details', 'explain', 'continue', 'further', 'expand']);
const TECH_INTENT = /\b(know|knows|knowledge|use|uses|used|using|familiar|experience|experienced|worked|work with|skilled|proficient|expert|good at)\b/;

const DEFAULT_SUGGEST = ['Who is Rupesh?', 'What is AgentShieldAI?', 'What are his skills?', 'How can I contact him?'];
const DEFAULT_STRENGTHS =
  'Java / Spring Boot, React / Next.js, Angular, SQL Server / Oracle, Generative & Agentic AI (RAG, MCP, LangChain, LangGraph) and AWS';

export const FALLBACK_REPLY =
  "Hmm, I don't have that in my notes about Rupesh. I can tell you about his experience, projects (like AgentShieldAI), skills, education, GATE results, or how to contact him. For anything else, use the contact form and he'll reply personally.";

export function normalize(text) {
  let t = ` ${String(text).toLowerCase()} `;
  for (const [re, rep] of ALIASES) t = t.replace(re, rep);
  t = t.replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return t
    .split(' ')
    .map((w) => WORD_MAP[w] || w)
    .join(' ');
}

const stem = (w) => {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
};

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function lev(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

export function createMatcher({ topics, tech = {}, strengths = DEFAULT_STRENGTHS }) {
  // Vocabulary of every keyword the agent understands, used for typo correction.
  const VOCAB = new Set([...topics.flatMap((t) => Object.keys(t.keys || {})), ...Object.keys(tech)].map(stem));
  const PHRASES = new Map(topics.map((t) => [t.id, (t.phrases || []).map((p) => ` ${normalize(p)} `)]));
  // Per topic: stemmed keyword → highest weight (so "skill" and "skills" only count once).
  const TOPIC_KEYS = new Map(
    topics.map((t) => {
      const m = new Map();
      for (const [k, w] of Object.entries(t.keys || {})) m.set(stem(k), Math.max(Number(w), m.get(stem(k)) || 0));
      return [t.id, m];
    }),
  );
  const TECH_BY_STEM = new Map(Object.keys(tech).map((k) => [stem(k), k]));
  // Strongest weight each keyword carries anywhere, used to pick between prefix completions.
  const WEIGHT = new Map();
  for (const keys of TOPIC_KEYS.values()) for (const [k, w] of keys) WEIGHT.set(k, Math.max(w, WEIGHT.get(k) || 0));
  const fallback = { topic: null, matched: false, reply: FALLBACK_REPLY, suggestions: DEFAULT_SUGGEST };

  // "proj" → "project", "achiev" → "achievement": the strongest keyword that starts with the word.
  function complete(s) {
    let best = null;
    for (const v of VOCAB) {
      if (v.length <= s.length || !v.startsWith(s)) continue;
      const better =
        !best || (WEIGHT.get(v) || 0) > (WEIGHT.get(best) || 0) || ((WEIGHT.get(v) || 0) === (WEIGHT.get(best) || 0) && v.length < best.length);
      if (better) best = v;
    }
    return best;
  }

  function correct(word) {
    const s = stem(word);
    if (VOCAB.has(s) || STOP.has(word) || /\d/.test(word)) return s;
    if (word.length >= 3) {
      const completed = complete(s);
      if (completed) return completed;
    }
    if (word.length < 4) return s;
    const maxDist = word.length >= 7 ? 2 : 1;
    let best = s;
    let bestD = maxDist + 1;
    for (const v of VOCAB) {
      if (v[0] !== s[0]) continue;
      const d = lev(s, v);
      if (d < bestD) {
        best = v;
        bestD = d;
      }
    }
    return bestD <= maxDist ? best : s;
  }

  function analyse(text) {
    const norm = normalize(text);
    const tokens = norm.split(' ').filter(Boolean).map(correct);
    return { norm: ` ${norm} `, tokens: new Set(tokens), raw: norm };
  }

  function scoreTopics({ norm, tokens }) {
    return topics
      .map((topic) => {
        let score = 0;
        for (const [key, weight] of TOPIC_KEYS.get(topic.id)) {
          if (tokens.has(key)) score += weight;
        }
        const phraseHits = PHRASES.get(topic.id).filter((p) => norm.includes(p)).length;
        score += Math.min(phraseHits, 2) * 4;
        return { topic, score };
      })
      .sort((a, b) => b.score - a.score);
  }

  function techAnswer(techKeys) {
    const known = [];
    const unknown = [];
    for (const k of techKeys) {
      const entry = tech[k];
      if (entry) known.push(`• ${entry[0]} — yes, used in ${entry[1]}.`);
      else unknown.push(k);
    }
    const parts = [];
    if (known.length) parts.push(`Yes! Here's where Rupesh has used ${known.length > 1 ? 'these' : 'it'}:\n${known.join('\n')}`);
    if (unknown.length) {
      parts.push(
        `${unknown.map(cap).join(', ')} ${unknown.length > 1 ? "aren't" : "isn't"} on his listed stack. His core strengths are ${strengths} — and he picks up new tools quickly.`,
      );
    }
    return parts.join('\n\n');
  }

  function unknownSkillQuestion(raw) {
    // "does he know kotlin" / "experience with flutter" — capture a tech word we have no record of.
    const m = raw.match(/\b(?:know|knows|use|used|familiar with|worked with|work with|experience (?:with|in)|good at|expert in|proficient in)\s+([a-z0-9]+)/);
    if (!m) return null;
    const word = m[1];
    if (STOP.has(word) || VOCAB.has(stem(word)) || word.length < 2) return null;
    return word;
  }

  function answerClause(text) {
    const a = analyse(text);
    const ranked = scoreTopics(a);
    const best = ranked[0] || { topic: { id: null }, score: 0 };
    const techKeys = [...a.tokens].map((t) => TECH_BY_STEM.get(t)).filter(Boolean);
    const asksTech = TECH_INTENT.test(a.norm);

    if (techKeys.length && (asksTech || best.score < 4) && best.topic.id !== 'agentshield') {
      return { topic: 'skills', score: 5, reply: techAnswer(techKeys.slice(0, 4)), suggest: ['What are his skills?', 'Tell me about his AI work'] };
    }
    if (asksTech) {
      const unknown = unknownSkillQuestion(a.raw);
      if (unknown && best.score < 4) {
        return { topic: 'skills', score: 4, reply: techAnswer([unknown]), suggest: ['What are his skills?'] };
      }
    }
    if (best.score < 2) {
      // Too weak to answer, but topics that matched a little make good "did you mean" suggestions.
      // A topic counts only if a meaningful word (not "who", "his"...) matched it.
      const meaningful = (r) => [...TOPIC_KEYS.get(r.topic.id).keys()].some((k) => a.tokens.has(k) && !STOP.has(k));
      const near = ranked.filter((r) => r.score > 0 && !r.topic.smallTalk && meaningful(r)).slice(0, 3).map((r) => r.topic);
      return { score: 0, near, followUp: [...a.tokens].some((t) => FOLLOW_UP.has(t)) };
    }
    return { topic: best.topic.id, score: best.score, reply: best.topic.answer, suggest: best.topic.suggest, smallTalk: best.topic.smallTalk };
  }

  /** Returns { topic, matched, reply, suggestions }. matched=false means "not in the knowledge base". */
  function answer(question, context = {}) {
    const text = String(question || '').slice(0, 500);
    if (!text.trim()) return fallback;

    // Split multi-part questions ("skills and projects?", "where is he based, how to contact?")
    const clauses = text
      .split(/\?|;|,|\band also\b|\balso\b|\band\b|\baur\b/i)
      .map((c) => c.trim())
      .filter((c) => c.length > 1);

    const whole = answerClause(text);
    let results = [whole];

    if (clauses.length > 1) {
      const parts = clauses.map(answerClause).filter((r) => r.score >= 2);
      const distinct = [];
      for (const p of parts) if (!distinct.some((d) => d.topic === p.topic)) distinct.push(p);
      const substantive = distinct.filter((d) => !d.smallTalk);
      const chosen = substantive.length ? substantive : distinct;
      if (chosen.length > 1 || (chosen.length === 1 && whole.score < 2)) results = chosen.slice(0, 3);
    }

    results = results.filter((r) => r.score >= 2);

    if (!results.length) {
      // "tell me more" → point to deeper questions on the last topic
      if (whole.followUp && context.lastTopic) {
        const last = topics.find((t) => t.id === context.lastTopic);
        if (last?.suggest?.length) {
          return {
            topic: last.id,
            matched: true,
            reply: 'Sure! Here are some things you can dig into next — just tap one below.',
            suggestions: last.suggest,
          };
        }
      }
      const options = (whole.near || []).map((t) => t.question || t.suggest?.[0]).filter(Boolean);
      if (options.length) {
        return {
          topic: null,
          matched: false,
          reply: "I'm not completely sure what you mean — did you want one of these? Tap one below, or ask in a full sentence, e.g. \"What is his work experience?\"",
          suggestions: [...new Set(options)].slice(0, 3),
        };
      }
      return fallback;
    }

    const lead = results[results.length - 1];
    return {
      topic: lead.topic,
      matched: true,
      reply: results.map((r) => r.reply).join('\n\n'),
      suggestions: (lead.suggest && lead.suggest.length ? lead.suggest : DEFAULT_SUGGEST).slice(0, 3),
    };
  }

  return { answer };
}
