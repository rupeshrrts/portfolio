import Reveal from './Reveal';

export default function SectionTitle({ index, kicker, title, accent }) {
  return (
    <Reveal className="section-title">
      <span className="section-kicker">
        <span className="mono">{index}</span> // {kicker}
      </span>
      <h2>
        {title} <span className="gradient-text">{accent}</span>
      </h2>
    </Reveal>
  );
}
