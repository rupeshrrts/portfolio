'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import { skills } from '@/data/profile';

export default function Skills() {
  const [activeId, setActiveId] = useState(skills[0].id);
  const active = skills.find((s) => s.id === activeId);
  const total = skills.reduce((n, s) => n + s.items.length, 0);

  return (
    <section id="skills" className="section">
      <div className="container">
        <SectionTitle index="02" kicker="toolkit" title="The stack behind" accent="the agents." />

        <div className="skills-layout">
          <Reveal className="skills-tabs" as="div">
            {skills.map((s) => (
              <button
                key={s.id}
                className={`skill-tab ${s.id === activeId ? 'is-active' : ''}`}
                onClick={() => setActiveId(s.id)}
                onMouseEnter={() => setActiveId(s.id)}
                style={{ '--c': s.color }}
              >
                {s.id === activeId && <motion.span layoutId="skill-tab-bg" className="skill-tab-bg" />}
                <span className="skill-tab-icon">{s.icon}</span>
                <span className="skill-tab-title">{s.title}</span>
                <span className="skill-tab-count mono">{String(s.items.length).padStart(2, '0')}</span>
              </button>
            ))}
            <div className="skills-total mono">{total} technologies · hover to explore</div>
          </Reveal>

          <Reveal delay={0.1} className="card skills-panel" as="div">
            <div className="skills-panel-glow" style={{ '--c': active.color }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
              >
                <div className="skills-panel-head">
                  <span className="skills-panel-icon" style={{ color: active.color }}>
                    {active.icon}
                  </span>
                  <h3>{active.title}</h3>
                </div>
                <div className="chip-cloud">
                  {active.items.map((item, i) => (
                    <motion.span
                      key={item}
                      className="chip chip-lg"
                      style={{ '--c': active.color }}
                      initial={{ opacity: 0, scale: 0.6, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 18 }}
                      whileHover={{ y: -4, scale: 1.06 }}
                    >
                      {item}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
