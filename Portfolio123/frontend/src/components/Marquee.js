const ITEMS = [
  'Model Context Protocol',
  'Agentic AI',
  'RAG',
  'Java',
  'Spring Boot',
  'Python',
  'Claude',
  'OpenAI',
  'LangChain',
  'Node.js',
  'React',
  'Next.js',
  'Tool Calling',
  'FastAPI',
  'AWS',
  'Docker',
  'NL → SQL',
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="marquee-item">
            {t} <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
