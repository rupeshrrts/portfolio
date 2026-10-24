import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700'] });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });

export const metadata = {
  title: 'Rupesh Kumar — Generative & Agentic AI Engineer',
  description:
    'Portfolio of Rupesh Kumar: Generative AI and Agentic AI engineer building MCP tools, RAG systems and AI agents on top of a solid full-stack foundation (Java, Spring Boot, React, Next.js).',
  keywords: ['Rupesh Kumar', 'Java', 'Spring Boot', 'Full Stack', 'React', 'Next.js', 'Agentic AI', 'Generative AI', 'MCP', 'RAG', 'Portfolio'],
  openGraph: {
    title: 'Rupesh Kumar — Generative & Agentic AI Engineer',
    description: 'AI agents, MCP tools and RAG systems for the enterprise.',
    type: 'website',
  },
};

export const viewport = { themeColor: '#07070d' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
