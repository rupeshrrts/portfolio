'use client';
import { useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import { experience } from '@/data/profile';

export default function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  const [open, setOpen] = useState(0);

  return (
    <section id="experience" className="section">
      <div className="container">
        <SectionTitle index="03" kicker="experience" title="Where I've" accent="shipped." />

        <div className="timeline" ref={ref}>
          <div className="timeline-rail">
            <motion.div className="timeline-fill" style={{ scaleY }} />
          </div>

          {experience.map((job, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={job.company} delay={0.05} className="timeline-item">
                <span className={`timeline-node ${job.current ? 'is-current' : ''}`} />
                <div className={`card job-card spotlight ${isOpen ? 'is-open' : ''}`}>
                  <button className="job-head" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen}>
                    <div>
                      <div className="job-period mono">
                        {job.period}
                        {job.current && <span className="badge-live">● now</span>}
                      </div>
                      <h3 className="job-role">{job.role}</h3>
                      <div className="job-company">
                        <span className="gradient-text">{job.company}</span>
                        <span className="muted"> · {job.location}</span>
                      </div>
                    </div>
                    <div className="job-side">
                      <span className="job-tag">{job.tag}</span>
                      <motion.span className="job-toggle" animate={{ rotate: isOpen ? 45 : 0 }}>
                        +
                      </motion.span>
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        className="job-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {job.summary && <p className="job-summary">{job.summary}</p>}
                        {job.points.length > 0 && (
                          <ul className="job-points">
                            {job.points.map((p, pi) => (
                              <motion.li
                                key={pi}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + pi * 0.06 }}
                              >
                                {p}
                              </motion.li>
                            ))}
                          </ul>
                        )}
                        <div className="chip-row">
                          {job.tech.map((t) => (
                            <span key={t} className="chip">
                              {t}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
