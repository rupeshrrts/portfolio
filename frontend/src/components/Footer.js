import { profile } from '@/data/profile';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-big gradient-text">Let&apos;s talk.</div>
        <div className="footer-row">
          <span className="muted">
            © {new Date().getFullYear()} {profile.name} · Built with Next.js, Node.js & a lot of ☕
          </span>
          <div className="footer-links">
            <a href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
            {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
            <a href={`mailto:${profile.email}`}>Email</a>
            <a href="#top">Back to top ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
