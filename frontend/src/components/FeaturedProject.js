'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Reveal from './Reveal';
import Magnetic from './Magnetic';
import { featuredProject as p } from '@/data/profile';

// Looping demo of the product: a risky prompt gets caught, then a clean one goes through.
const DEMOS = [
  { site: 'chat.openai.com', prompt: 'Summarise this config: AWS_SECRET=AKIA••••••••••••', verdict: 'block', note: 'Cloud access key detected — prompt stopped.' },
  { site: 'claude.ai', prompt: 'Email the report to [EMAIL_REDACTED] by Friday', verdict: 'redact', note: 'Email address redacted automatically.' },
  { site: 'gemini.google.com', prompt: 'Explain dependency injection in Spring Boot', verdict: 'safe', note: 'No sensitive data — safe prompt sent.' },
];

const VERDICT = {
  block: { label: 'Blocked', icon: '⛔' },
  redact: { label: 'Redacted', icon: '✎' },
  safe: { label: 'Sent safely', icon: '✓' },
};

// Left-hand copy shared by every large featured card.
export function FeaturedCopy({ p, icon, liveBadge, ctaLabel }) {
  return (
    <div className="featured-copy">
      <div className="featured-badges">
        <span className="featured-badge">★ Featured</span>
        <span className="featured-live">
          <i /> {liveBadge}
        </span>
      </div>
      <h3 className="featured-title">
        <span className="featured-shield">{icon}</span> {p.title}
      </h3>
      <p className="featured-sub">{p.subtitle}</p>
      <p className="featured-tagline gradient-text">{p.tagline}</p>
      <p className="featured-desc">{p.description}</p>

      <ul className="featured-highlights">
        {p.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>

      <div className="chip-row">
        {p.tech.map((t) => (
          <span key={t} className="chip">
            {t}
          </span>
        ))}
      </div>

      <div className="featured-cta">
        <Magnetic>
          <a href={p.live || p.repo} target="_blank" rel="noreferrer" className="btn btn-primary">
            {ctaLabel} <span aria-hidden>↗</span>
          </a>
        </Magnetic>
        {p.live && p.repo && (
          <Magnetic>
            <a href={p.repo} target="_blank" rel="noreferrer" className="btn btn-ghost">
              View on GitHub <span aria-hidden>↗</span>
            </a>
          </Magnetic>
        )}
      </div>
    </div>
  );
}

export default function FeaturedProject() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % DEMOS.length), 3200);
    return () => clearInterval(t);
  }, []);

  const demo = DEMOS[i];

  return (
    <Reveal className="featured">
      <div className="featured-glow" aria-hidden />
      <FeaturedCopy p={p} icon="🛡" liveBadge="Live product" ctaLabel="Visit live site" />

      <div className="featured-visual" aria-hidden>
        <div className="shield-window">
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title mono">{demo.site}</span>
            <span className="shield-on mono">🛡 AgentShield on</span>
          </div>
          <div className="shield-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
              >
                <div className="shield-prompt mono">{demo.prompt}</div>
                <motion.div
                  className={`shield-verdict shield-${demo.verdict}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <b>
                    {VERDICT[demo.verdict].icon} {VERDICT[demo.verdict].label}
                  </b>
                  <span>{demo.note}</span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="shield-platforms">
            {p.platforms.map((pl) => (
              <span key={pl}>{pl}</span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
