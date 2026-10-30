// Single source of truth for everything shown on the site. Edit here to update content.
export const profile = {
  name: 'Rupesh Kumar',
  firstName: 'Rupesh',
  roles: ['Full Stack Developer', 'Java Spring Boot Developer', 'React & Next.js Developer', 'Generative AI Engineer', 'Agentic AI Engineer'],
  location: 'Siwan, Bihar, India',
  email: 'rupeshsinghsuntech@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rupesh-kumar-508b1820a/',
  github: 'https://github.com/rupeshrrts',
  resume: '/RupeshKr.pdf',
  summary:
    'Full Stack Developer with 2+ years of experience building enterprise web applications with REST APIs, Node.js, Angular, React, Next.js and SQL, and shipping Generative & Agentic AI features — tool-calling agents, RAG and MCP tools that connect LLMs to enterprise data. I build Java / Spring Boot backends with Spring Security (JWT), Spring Data JPA, PostgreSQL and Docker, and I\'m strong in API testing, debugging and production support.',
  stats: [
    { value: 2, suffix: '+', label: 'Years experience' },
    { value: 3, suffix: '', label: 'Companies & labs' },
    { value: 2, suffix: 'x', label: 'GATE CSIT qualified' },
    { value: 8.15, suffix: '', label: 'B.Tech CGPA', decimals: 2 },
  ],
};

export const skills = [
  {
    id: 'ai',
    title: 'Generative & Agentic AI',
    icon: '◈',
    color: '#a78bfa',
    items: [
      'Model Context Protocol (MCP)',
      'AI Agent Development',
      'OpenAI API',
      'Anthropic Claude',
      'Prompt Engineering',
      'Function / Tool Calling',
      'RAG',
      'Natural-Language-to-SQL',
      'LangChain',
      'LangGraph',
      'Human-in-the-Loop Agents',
      'FAISS Vector DB',
      'NVIDIA NIM',
    ],
  },
  {
    id: 'lang',
    title: 'Languages',
    icon: '{ }',
    color: '#22d3ee',
    items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'SQL', 'C / C++', 'HTML5', 'CSS3'],
  },
  {
    id: 'fw',
    title: 'Frameworks',
    icon: '▲',
    color: '#f472b6',
    items: [
      'Spring Boot',
      'Spring Security',
      'JPA / Hibernate',
      'Node.js',
      'Express.js',
      'FastAPI',
      'React.js',
      'Next.js',
      'Angular',
      'Tailwind CSS',
      'Streamlit',
    ],
  },
  {
    id: 'db',
    title: 'Databases',
    icon: '⛁',
    color: '#34d399',
    items: ['PostgreSQL', 'SQL Server', 'Oracle Database', 'PL/SQL'],
  },
  {
    id: 'tools',
    title: 'Tools & Cloud',
    icon: '⚙',
    color: '#fbbf24',
    items: ['AWS', 'GCP', 'OpenStack', 'Docker', 'Terraform', 'Ansible', 'Git & GitHub', 'SAP Integration', 'Postman', 'Swagger', 'Linux'],
  },
  {
    id: 'core',
    title: 'Core Concepts',
    icon: '◎',
    color: '#60a5fa',
    items: ['Data Structures & Algorithms', 'OOP', 'Dependency Injection', 'Design Patterns', 'RESTful APIs', 'AuthN & AuthZ', 'Agile'],
  },
];

export const experience = [
  {
    role: 'Software Developer · Full Stack',
    company: 'Digital India Corporation',
    location: 'MeitY, Govt. of India · New Delhi',
    period: 'From 20 Nov 2026',
    tag: 'GovTech · Full Stack · AI',
    tech: ['Java / Spring Boot', 'React.js', 'Node.js', 'PostgreSQL', 'REST APIs', 'LLMs · RAG'],
    points: [
      'Full-stack development of secure, scalable web applications and REST APIs for Government of India digital initiatives under the Digital India programme.',
      'Integration of AI-enabled features — LLMs, Generative AI APIs and RAG — using AI-assisted development tools for faster, well-validated delivery.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Godrej Koerber',
    location: 'Navi Mumbai, Maharashtra',
    period: '19 Dec 2025 — 18 Sep 2026',
    tag: 'Java · WMS · Generative AI',
    summary:
      'Worked on a Warehouse Management System (WMS) web application for supply-chain and logistics clients — Java / Spring Boot backend services, a customer-service ticketing platform, SAP integrations and Generative AI tooling for the support team.',
    tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'Angular', 'Next.js', 'SQL Server', 'RAG', 'MCP', 'SAP Integration'],
    points: [
      'Developed Warehouse Management System (WMS) modules for inventory, stock movement, receiving, picking, packing and dispatch, building Java / Spring Boot REST APIs with Spring Data JPA on SQL Server and an Angular / TypeScript front end.',
      'Built a centralized, role-based Ticketing Management System (Next.js, Spring Boot REST APIs) that replaced email and Excel tracking for customer service issues, with ticket creation, assignment by priority, status tracking (open → in progress → resolved) and SLA-based escalation, helping the support team resolve customer issues faster and with full visibility.',
      'Implemented a RAG pipeline for log analysis that retrieves relevant application and system logs for a client-reported error and passes them to an LLM as context, helping the team find the cause, troubleshoot problems and resolve operational issues faster.',
      'Built a custom MCP server that exposes SQL Server data as structured tools for an AI agent, enabling natural-language database querying to investigate and resolve database issues, plus automated ad-hoc reporting.',
      'Developed and maintained SAP ↔ WMS integration interfaces that sync warehouse master data, stock movements and order transactions with SAP ERP, with end-to-end testing, troubleshooting and data validation to improve integration reliability.',
    ],
  },
  {
    role: 'Associate Software Engineer',
    company: 'Everonic Solutions',
    location: 'Lucknow, Uttar Pradesh',
    period: '5 Aug 2024 — 29 Nov 2025',
    tag: 'Real-time · Telematics',
    tech: ['Java', 'Spring Boot', 'Spring Data JPA', 'React', 'Next.js', 'TypeScript', 'SQL Server', 'Oracle'],
    points: [
      'Built a full-stack, real-time Vehicle Tracking System (React, Next.js, TypeScript, REST APIs, SQL Server) that processes GPS and telemetry data for live fleet monitoring and operational analytics.',
      'Designed Java / Spring Boot REST APIs and data-processing services with Spring Data JPA, a layered architecture and dependency injection to handle high-volume location and telemetry data.',
      'Built interactive React / Next.js dashboards for live tracking, route analysis, trip history and operational metrics, turning raw vehicle data into actionable insights.',
      'Managed relational data in SQL Server and Oracle (PL/SQL) and served it through REST APIs for live dashboards and trip history; used Git for version control in an Agile team.',
    ],
  },
  {
    role: 'Cloud Engineer Intern',
    company: 'IIT Jammu',
    location: 'Jagti, Jammu',
    period: 'Jan 2024 — Jul 2024',
    tag: 'Cloud · Security',
    tech: ['AWS EC2', 'S3', 'VPC', 'Route 53', 'IAM', 'Terraform', 'Ansible'],
    points: [
      'Designed and deployed scalable AWS infrastructure (EC2, S3, VPC, Route 53, IAM) for secure, highly available enterprise and AI-enabled workloads.',
      'Automated infrastructure and environment setup with Terraform (IaC) and Ansible, giving repeatable, consistent deployments and less manual effort.',
      'Built AWS-based cloud security challenges for national-level CTF competitions, including attack-and-defense scenarios.',
      "Contributed to Anveshanam'2, a three-day CTF organized by IIT Jammu and DRDO, creating challenges in cloud security, steganography and memory analysis.",
    ],
  },
];

// Shown as the large hero card at the top of the Projects section.
export const featuredProject = {
  title: 'AgentShieldAI',
  subtitle: 'AI browser security · Live SaaS product',
  tagline: 'Use AI tools freely. Never leak a secret.',
  description:
    'A browser extension + SaaS dashboard that checks every prompt sent to ChatGPT, Claude, Gemini, Copilot and Perplexity — stopping API keys, passwords, tokens and personal data before they ever leave the screen.',
  highlights: [
    'Blocks secrets & keys before they reach any LLM',
    'Warns on or auto-redacts emails, phones, card & ID numbers',
    'Per-rule control: block, warn or redact',
    'Checks run locally in the browser — secrets masked before storage',
    'Per-browser verification, server-side access on every request',
    'Security-alerts dashboard, plans, trials & credit billing',
  ],
  platforms: ['ChatGPT', 'Claude', 'Gemini', 'Copilot', 'Perplexity'],
  tech: ['Browser Extension', 'Chrome · Edge · Brave', 'SaaS Dashboard', 'Auth & Billing', 'Vercel'],
  live: 'https://rupesh-agentshield-site.vercel.app',
};

// Second large card, shown right below AgentShieldAI.
export const githubOpsProject = {
  title: 'GitHubOps AI',
  subtitle: 'LangGraph agent · Human-in-the-loop · Live demo',
  tagline: 'Run GitHub by chat. Approve every change.',
  description:
    'A team portal where an AI agent operates your repositories, issues, pull requests and Actions — with roles, admin reviews for risky actions, and an audit log of everything.',
  highlights: [
    'Natural-language control of repos, issues, PRs & Actions',
    'Every write or delete waits for human approval',
    'Risky actions routed to an admin for review',
    'Full audit log of every agent action',
    'Roles & team access, sign in with GitHub',
    'GitHub token stays in your browser, never in the DB',
  ],
  tech: ['Python', 'LangGraph', 'LangChain', 'GitHub API', 'NVIDIA AI', 'Vercel'],
  live: 'https://githubops-ai.vercel.app/',
  repo: 'https://github.com/rupeshrrts/githubops-ai',
};

// Third large card, shown right below GitHubOps AI.
export const resumeBuilderProject = {
  title: 'Resume Builder',
  logo: '/resume-builder-logo.svg',
  subtitle: 'ATS resume builder · Live at reesume.in',
  tagline: 'Build an ATS-ready resume. Download exactly what you see.',
  description:
    'A step-by-step resume builder with ATS-friendly templates, scores that explain themselves, and an AI that only rewrites what you already wrote — self-hosted on Azure with auto-deploy on every push.',
  highlights: [
    '9 single-column, ATS-readable templates',
    'The preview is the real PDF — no surprises',
    'ATS, resume & job-match scores, each explained',
    'AI rewrites weak bullets, never invents facts',
    'Export to PDF, Word, TXT, Markdown & JSON',
    'Job tracker, cover letters & interview prep',
  ],
  formats: ['PDF', 'Word', 'TXT', 'Markdown', 'JSON'],
  tech: ['Next.js', 'TypeScript', 'Express', 'PostgreSQL', 'Docker', 'Azure', 'GitHub Actions'],
  live: 'https://reesume.in',
};

// Fourth large card, shown right below Resume Builder.
export const popMyFlixProject = {
  title: 'PopMyFlix',
  subtitle: 'Marketing SaaS platform · Jun 2024',
  tagline: 'Launch ads everywhere. Watch them perform live.',
  description:
    'An end-to-end marketing SaaS platform with multi-channel ad automation, live payment integration and real-time campaign analytics — serving 1,000+ daily requests.',
  highlights: [
    'Multi-channel ad automation from one dashboard',
    'Live payment integration',
    'Real-time campaign analytics',
    'Serving 1,000+ daily requests',
    'Smooth, animated UI with GSAP & Framer Motion',
    'FastAPI back end with Firebase cloud',
  ],
  tech: ['Next.js', 'TypeScript', 'GSAP', 'Framer Motion', 'FastAPI', 'Firebase'],
  // TODO: replace with the exact PopMyFlix repository URL.
  repo: 'https://github.com/rupeshrrts',
};

// Smaller tilt cards shown below the featured ones. Add a project here to bring the grid back.
export const projects = [];

export const education = [
  {
    school: 'Shaheed Bhagat Singh State Technical Campus',
    place: 'Ferozepur, Punjab',
    degree: 'B.Tech — Computer Science & Engineering',
    period: '2020 — 2024',
    score: 'CGPA 8.15 / 10',
  },
  {
    school: 'Shaheed Bhagat Singh Inter College',
    place: 'Sani-Basantpur, Siwan',
    degree: 'Class XII — BSEB, Patna',
    period: '2018 — 2019',
    score: '76% · 1st Division',
  },
  {
    school: 'Gandak High School',
    place: 'Tarwara, Siwan',
    degree: 'Class X — BSEB, Patna',
    period: '2016',
    score: '73.6% · 1st Division',
  },
];

export const achievements = [
  { title: 'GATE 2026', detail: 'Qualified — Computer Science & Information Technology', icon: '🏆' },
  { title: 'GATE 2025', detail: 'Qualified — Computer Science & Information Technology', icon: '🏆' },
  { title: '150+ DSA Problems', detail: 'Data structures & algorithms solved on LeetCode and GeeksforGeeks', icon: '💻' },
  { title: "Anveshanam'2 CTF", detail: 'Challenge author for national CTF by IIT Jammu & DRDO', icon: '🛡️' },
];
