import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Marquee from '@/components/Marquee';
import About from '@/components/About';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Projects from '@/components/Projects';
import Education from '@/components/Education';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import AgentChat from '@/components/AgentChat';
import CommandPalette from '@/components/CommandPalette';
import CursorGlow from '@/components/CursorGlow';
import ScrollProgress from '@/components/ScrollProgress';

export default function Home() {
  return (
    <>
      <div className="bg-aurora" aria-hidden />
      <div className="bg-grid" aria-hidden />
      <div className="bg-noise" aria-hidden />
      <CursorGlow />
      <ScrollProgress />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Education />
        <Contact />
      </main>
      <Footer />
      <AgentChat />
      <CommandPalette />
    </>
  );
}
