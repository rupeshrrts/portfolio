// Run with: npm run test:agent — checks the portfolio agent picks the right topic for real questions.
import { answer } from '../src/agent/engine.js';
import { TOPICS } from '../src/agent/knowledge.js';

// Opening text of each topic's answer — used to detect combined (multi-part) answers.
const TOPIC_TEXT = Object.fromEntries(TOPICS.map((t) => [t.id, t.answer.slice(0, 40)]));

// [question, expected topic(s) — first topic of reply, or array when several answers are combined]
const CASES = [
  ['hi', 'greeting'],
  ['Hello there!', 'greeting'],
  ['thanks a lot', 'thanks'],
  ['bye', 'bye'],
  ['who are you?', 'bot'],
  ['Are you a bot?', 'bot'],
  ['Who is Rupesh?', 'about'],
  ['Tell me about him', 'about'],
  ['Give me a summary of his profile', 'about'],
  ['What does he do now?', 'dic'],
  ['What is his current role?', 'dic'],
  ['where is he working currently', 'dic'],
  ['Digital India Corporation?', 'dic'],
  ['does he work for the government', 'dic'],
  ['MeitY role?', 'dic'],
  ['what was his previous company', 'godrej'],
  ['Does he know Spring Boot?', 'skills'],
  ['What does he do at Godrej Koerber?', 'godrej'],
  ['tell me about godrej', 'godrej'],
  ['what supply chain work has he done', 'godrej'],
  ['WMS experience?', 'godrej'],
  ['What did he build at Everonic?', 'everonic'],
  ['vehicle tracking system?', 'everonic'],
  ['What did he do before this?', 'everonic'],
  ['Does he know Node.js?', 'skills'],
  ['experience with next.js', 'skills'],
  ['What did he do at IIT Jammu?', 'iit'],
  ['tell me about his internship', 'iit'],
  ['cloud security intern', 'iit'],
  ['What is Anveshanam?', 'iit'],
  ['How many years of experience does he have?', 'experience'],
  ['work experience', 'experience'],
  ['Which companies has he worked for?', 'experience'],
  ['experiance', 'experience'],
  ['What are his skills?', 'skills'],
  ['tech stack', 'skills'],
  ['skils', 'skills'],
  ['Tell me about his AI work', 'ai'],
  ['Does he know generative AI?', 'ai'],
  ['What is his experience with LLMs and agents?', 'ai'],
  ['What MCP work has he done?', 'mcp'],
  ['Does he know React?', 'skills'],
  ['Does he know Angular?', 'skills'],
  ['experience with C#?', 'skills'],
  ['Does he know .NET?', 'skills'],
  ['can he work with AWS and Docker', 'skills'],
  ['Does he know Java?', 'skills'],
  ['does he know kotlin', 'skills'],
  ['Is he familiar with Kubernetes?', 'skills'],
  ['cloud skills', 'cloud'],
  ['Top projects?', 'projects'],
  ['What projects has he built?', 'projects'],
  ['projets', 'projects'],
  ['What is AgentShieldAI?', 'agentshield'],
  ['agent shield kya hai', 'agentshield'],
  ['tell me about his live product', 'agentshield'],
  ['how does agentshield stop secrets leaking', 'agentshield'],
  ['Tell me about GitHubOps AI', 'githubops'],
  ['What did he build with LangGraph?', 'githubops'],
  ['RAG-based GenAI application?', 'ragproject'],
  ['tell me about his rag project', 'ragproject'],
  ['What is CloudLens?', 'cloudlens'],
  ['What is PopMyFlix?', 'popmyflix'],
  ['Where did he study?', 'education'],
  ['education', 'education'],
  ['What is his qualification?', 'education'],
  ['btech cgpa?', 'btech'],
  ['What was his CGPA?', 'btech'],
  ['10th marks', 'class10'],
  ['class 10 percentage', 'class10'],
  ['12th result', 'class12'],
  ['GATE score?', 'gate'],
  ['Has he qualified GATE?', 'gate'],
  ['What are his achievements?', 'achievements'],
  ['How can I contact him?', 'contact'],
  ['email id?', 'contact'],
  ['phone number', 'contact'],
  ['unka number kya hai', 'contact'],
  ['Where is he based?', 'location'],
  ['where does he live', 'location'],
  ['kaha se hai', 'location'],
  ['Is he open to opportunities?', 'available'],
  ['is he open to relocation', 'available'],
  ['Why should we hire him?', 'hire'],
  ['what are his strengths', 'hire'],
  ['github profile', 'links'],
  ['download resume', 'resume'],
  ['What is his salary?', 'personal'],
  ['how old is he', 'personal'],
  ['What are his skills and projects?', ['skills', 'projects']],
  ['Where is he based and how can I contact him?', ['location', 'contact']],
  ['hi, what does he do now?', 'dic'],
  ['which databases does he know', 'databases'],
  ['what programming languages does he code in', 'languages'],
  ['which frameworks', 'frameworks'],
  ['what is his full name', 'name'],
  ['tell me something interesting', 'funfact'],
  ['is he good at python', 'skills'],
  ['what kind of roles is he looking for', 'available'],
  ['How many LeetCode problems has he solved?', 'dsa'],
  ['does he do DSA?', 'dsa'],
  ['gfg profile', 'dsa'],
  ['is he good at problem solving', 'dsa'],
  ['data structures and algorithms', 'dsa'],
  ['what is the weather today', null],
  ['who won the cricket match', null],
  // short forms people type into a chat box
  ['exp', 'experience'],
  ['his exp?', 'experience'],
  ['yoe', 'experience'],
  ['job', 'experience'],
  ['edu', 'education'],
  ['proj', 'projects'],
  ['skill', 'skills'],
  ['contact no', 'contact'],
  ['ph no', 'contact'],
  ['achiev', 'achievements'],
  ['intro', 'about'],
  ['cgpa', 'btech'],
  ['current', 'dic'],
];

// Vague questions get "did you mean" suggestions; off-topic ones get the honest fallback.
const vague = answer('work');
const offTopic = answer('who won the cricket match');
const extraChecks = [
  ['"work" offers did-you-mean suggestions', vague.matched === false && /did you want/.test(vague.reply) && vague.suggestions.includes('What is his work experience?')],
  ['off-topic questions get the honest fallback', offTopic.matched === false && /don't have that in my notes/.test(offTopic.reply)],
];

let pass = 0;
const failures = [];
for (const [q, expected] of CASES) {
  const res = answer(q);
  const exp = Array.isArray(expected) ? expected : [expected];
  // For combined answers we check every expected topic's text is present.
  let ok;
  if (exp[0] === null) ok = res.topic === null;
  else if (exp.length > 1) ok = exp.every((id) => res.reply.includes(TOPIC_TEXT[id]));
  else ok = res.topic === exp[0];
  if (ok) pass++;
  else failures.push(`✗ "${q}" → got ${res.topic}, expected ${exp.join(' + ')}\n    ${res.reply.slice(0, 110).replace(/\n/g, ' ')}`);
}

for (const [name, ok] of extraChecks) {
  if (ok) pass++;
  else failures.push(`✗ ${name}`);
}

console.log(failures.join('\n'));
console.log(`\n${pass}/${CASES.length + extraChecks.length} passed`);
process.exit(failures.length ? 1 : 0);
