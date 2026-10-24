import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import { education, achievements } from '@/data/profile';

export default function Education() {
  return (
    <section id="education" className="section">
      <div className="container">
        <SectionTitle index="05" kicker="education & wins" title="Foundations &" accent="milestones." />

        <div className="edu-grid">
          <div className="edu-col">
            {education.map((e, i) => (
              <Reveal key={e.school} delay={i * 0.1} className="card edu-card spotlight">
                <div className="edu-period mono">{e.period}</div>
                <h3>{e.degree}</h3>
                <p className="muted">
                  {e.school} · {e.place}
                </p>
                <span className="edu-score">{e.score}</span>
              </Reveal>
            ))}
          </div>

          <div className="edu-col">
            {achievements.map((a, i) => (
              <Reveal key={a.title} delay={0.1 + i * 0.1} className="card achieve-card spotlight">
                <span className="achieve-icon">{a.icon}</span>
                <div>
                  <h3>{a.title}</h3>
                  <p className="muted">{a.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
