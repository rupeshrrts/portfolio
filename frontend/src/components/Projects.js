'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import SectionTitle from './SectionTitle';
import Reveal from './Reveal';
import FeaturedProject from './FeaturedProject';
import FeaturedGitHubOps from './FeaturedGitHubOps';
import FeaturedResumeBuilder from './FeaturedResumeBuilder';
import FeaturedPopMyFlix from './FeaturedPopMyFlix';
import { projects } from '@/data/profile';

function TiltCard({ project, index }) {
  const ref = useRef(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px);
    my.set(py);
    ref.current.style.setProperty('--mx', `${px * 100}%`);
    ref.current.style.setProperty('--my', `${py * 100}%`);
  };
  const onLeave = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <Reveal delay={index * 0.08} className="project-wrap">
      <motion.article
        ref={ref}
        className="project-card"
        style={{ rotateX, rotateY, '--g': project.gradient }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="project-shine" />
        <div className="project-top">
          <span className="project-glyph">{project.glyph}</span>
          <span className="project-year mono">{project.year}</span>
        </div>
        <h3 className="project-title">{project.title}</h3>
        <p className="project-sub">{project.subtitle}</p>
        <p className="project-desc">{project.description}</p>
        <div className="project-metric">
          <span className="project-metric-value">{project.metric.value}</span>
          <span className="project-metric-label">{project.metric.label}</span>
        </div>
        <div className="chip-row">
          {project.tech.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        <div className="project-links">
          {project.live && (
            <a className="project-link" href={project.live} target="_blank" rel="noreferrer">
              Live demo <span aria-hidden>↗</span>
            </a>
          )}
          {project.repo ? (
            <a className="project-link" href={project.repo} target="_blank" rel="noreferrer">
              View on GitHub <span aria-hidden>↗</span>
            </a>
          ) : (
            !project.live && <span className="project-link project-link--muted">Private project</span>
          )}
        </div>
      </motion.article>
    </Reveal>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="section">
      <div className="container">
        <SectionTitle index="04" kicker="selected work" title="Things I've" accent="built." />
        <FeaturedProject />
        <FeaturedGitHubOps />
        <FeaturedResumeBuilder />
        <FeaturedPopMyFlix />
        {projects.length > 0 && (
          <div className="projects-grid">
            {projects.map((p, i) => (
              <TiltCard key={p.title} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
