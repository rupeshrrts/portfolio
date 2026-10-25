'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import { profile } from '@/data/profile';
import { api } from '@/lib/api';

function Counter({ value, decimals = 0, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    let raf;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      setN(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function About() {
  const [views, setViews] = useState(null);

  useEffect(() => {
    // Count each browser session once.
    const key = 'rk-viewed';
    const already = sessionStorage.getItem(key);
    api('/api/stats/views', { method: already ? 'GET' : 'POST' })
      .then((d) => {
        setViews(d.views);
        sessionStorage.setItem(key, '1');
      })
      .catch(() => {});
  }, []);

  return (
    <section id="about" className="section">
      <div className="container">
        <SectionTitle index="01" kicker="about me" title="Engineer by craft," accent="AI builder by obsession." />

        <div className="bento">
          <Reveal className="card bento-main spotlight">
            <p className="about-lead">{profile.summary}</p>
            <div className="about-meta">
              <span>📍 {profile.location}</span>
              <span>🤖 AI Enthusiast</span>
              <span>🎓 GATE CSIT 2025 & 2026</span>
              <span>💻 150+ DSA problems · LeetCode & GFG</span>
              {views !== null && <span>👀 {views.toLocaleString()} portfolio {views === 1 ? 'visit' : 'visits'}</span>}
            </div>
          </Reveal>

          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={0.08 * i} className="card stat-card spotlight">
              <div className="stat-value gradient-text">
                <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
              </div>
              <div className="stat-label">{s.label}</div>
            </Reveal>
          ))}

          <Reveal delay={0.2} className="card bento-focus spotlight">
            <h3>What I focus on</h3>
            <ul className="focus-list">
              <li><b>Agents that act</b> — LLMs that call tools, raise tickets and fetch data securely.</li>
              <li><b>Grounded answers</b> — RAG + prompt engineering for reliable enterprise responses.</li>
              <li><b>Production backbone</b> — Java, Spring Boot, React, Next.js, Angular & SQL Server.</li>
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
