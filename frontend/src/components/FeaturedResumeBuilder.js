'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import Reveal from './Reveal';
import { FeaturedCopy } from './FeaturedProject';
import { resumeBuilderProject as p } from '@/data/profile';

// Looping demo of the product: a weak bullet is flagged, AI rewrites it without adding facts,
// job keywords light up, and the PDF downloads exactly as previewed — the score climbs along the way.
const SCENES = [
  {
    step: 'Experience',
    score: 62,
    bullet: 'Made dashboards for 500+ vehicles',
    mark: 'weak',
    status: { tone: 'warn', text: '! Weak bullet — no action or result' },
  },
  {
    step: 'Experience',
    score: 81,
    bullet: 'Built React dashboards tracking 500+ vehicles in real time',
    mark: 'ai',
    status: { tone: 'ai', text: '✦ AI rewrote the bullet — facts unchanged' },
  },
  {
    step: 'Skills',
    score: 94,
    bullet: 'Built React dashboards tracking 500+ vehicles in real time',
    keywords: true,
    status: { tone: 'ok', text: '✓ Job match 92% · keywords found' },
  },
  {
    step: 'Design',
    score: 94,
    bullet: 'Built React dashboards tracking 500+ vehicles in real time',
    keywords: true,
    status: { tone: 'ok', text: '⤓ PDF downloaded — exactly the preview' },
  },
];

const STEPS = ['Contact', 'Experience', 'Skills', 'Design'];
const SKILLS = ['Java', 'Spring Boot', 'React', 'SQL', 'Docker'];

// Each check passes once the score reaches its threshold.
const CHECKS = [
  ['Contact & headings', 0],
  ['Results in bullets', 81],
  ['Keywords from job', 94],
];

const R = 40;
const C = 2 * Math.PI * R;

function ScoreRing({ score }) {
  const value = useMotionValue(score);
  const shown = useTransform(value, (v) => Math.round(v));

  useEffect(() => {
    const controls = animate(value, score, { duration: 0.9, ease: 'easeOut' });
    return controls.stop;
  }, [score, value]);

  return (
    <div className="rb-ring">
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx="52"
          cy="52"
          r={R}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={false}
          animate={{ strokeDashoffset: C * (1 - score / 100), stroke: score >= 80 ? '#34d399' : '#fbbf24' }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <div className="rb-ring-num">
        <div>
          <motion.span>{shown}</motion.span>
          <small className="mono">ATS SCORE</small>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedResumeBuilder() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % SCENES.length), 3000);
    return () => clearInterval(t);
  }, []);

  const scene = SCENES[i];
  const stepIndex = STEPS.indexOf(scene.step);

  return (
    <Reveal className="featured featured--amber">
      <div className="featured-glow" aria-hidden />
      <FeaturedCopy
        p={p}
        icon={<img className="featured-logo" src={p.logo} alt="" />}
        liveBadge="Live at reesume.in"
        ctaLabel="Visit live website"
      />

      <div className="featured-visual" aria-hidden>
        <div className="shield-window rb-window">
          <div className="terminal-bar">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
            <span className="terminal-title mono rb-url">
              <img src={p.logo} alt="" />
              reesume.in/builder
            </span>
            <span className="rb-ats mono">● ATS-safe</span>
          </div>

          <div className="rb-steps mono">
            {STEPS.map((s, n) => (
              <span key={s} className={n === stepIndex ? 'is-active' : n < stepIndex ? 'is-done' : ''}>
                {n < stepIndex && <b>✓ </b>}
                {s}
              </span>
            ))}
          </div>

          <div className="rb-body">
            <div className="rb-paper">
              <span className="rb-name">Rupesh Kumar</span>
              <span className="rb-role">Full Stack Developer · Siwan, Bihar</span>
              <span className="rb-h">EXPERIENCE</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={scene.bullet}
                  className={`rb-bullet${scene.mark ? ` is-${scene.mark}` : ''}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  • {scene.bullet}
                </motion.span>
              </AnimatePresence>
              <span className="rb-line" />
              <span className="rb-line" style={{ width: '72%' }} />
              <span className="rb-h">SKILLS</span>
              <div className="rb-skills">
                {SKILLS.map((s) => (
                  <i key={s} className={scene.keywords ? 'is-hit' : ''}>
                    {s}
                  </i>
                ))}
              </div>
            </div>

            <div className="rb-side">
              <ScoreRing score={scene.score} />
              <ul className="rb-checks">
                {CHECKS.map(([label, min]) => {
                  const ok = scene.score >= min;
                  return (
                    <li key={label} className={ok ? 'is-ok' : ''}>
                      <b>{ok ? '✓' : '!'}</b> {label}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className={`rb-status rb-status--${scene.status.tone}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              {scene.status.text}
            </motion.div>
          </AnimatePresence>

          <div className="shield-platforms">
            {p.formats.map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
