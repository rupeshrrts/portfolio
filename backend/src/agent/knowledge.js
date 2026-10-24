// Everything the portfolio agent knows. Keep answers factual — they come straight from the résumé,
// GitHub profile and live projects. `keys` are matched after normalisation (see engine.js):
// weight 5 = unique names, 3 = strong topic words, 1–2 = supporting words.

export const CONTACT = {
  email: 'rupeshsinghsuntech@gmail.com',
  github: 'github.com/rupeshrrts',
  linkedin: 'linkedin.com/in/rupesh-kumar-508b1820a',
  site: 'rupesh-agentshield-site.vercel.app',
};

export const TOPICS = [
  // ---------- small talk ----------
  {
    id: 'greeting',
    keys: { hi: 3, hello: 3, hey: 3, hii: 3, namaste: 3, hola: 3, morning: 2, evening: 2, afternoon: 2, sup: 2 },
    smallTalk: true,
    answer:
      "Hey there! 👋 I'm Rupesh's portfolio agent. I can tell you about his Java and AI work at Godrej Koerber, his Agentic AI projects like AgentShieldAI, his skills, education or how to reach him. What would you like to know?",
    suggest: ['Who is Rupesh?', 'What is AgentShieldAI?', 'What are his skills?'],
  },
  {
    id: 'thanks',
    keys: { thank: 3, thanks: 3, thx: 3, ty: 2, great: 1, awesome: 1, cool: 1, nice: 1, helpful: 2, dhanyavad: 3, shukriya: 3 },
    smallTalk: true,
    answer: "You're welcome! 😊 Anything else you'd like to know about Rupesh?",
    suggest: ['How can I contact him?', 'Top projects?'],
  },
  {
    id: 'bye',
    keys: { bye: 3, goodbye: 3, later: 1, cya: 3, tata: 3 },
    smallTalk: true,
    answer: `Thanks for stopping by! If you'd like to talk to Rupesh directly, email ${CONTACT.email}. Have a great day! 👋`,
  },
  {
    id: 'bot',
    phrases: ['who are you', 'what are you', 'are you a bot', 'are you ai', 'are you real', 'are you human', 'your name'],
    keys: { bot: 3, chatbot: 3, yourself: 2 },
    answer:
      "I'm Rupesh's portfolio assistant — a small agent that answers questions using his résumé, GitHub and project data. For anything I can't answer, the contact form at the bottom reaches him directly.",
    suggest: ['Who is Rupesh?', 'What does he do now?'],
  },

  // ---------- profile ----------
  {
    id: 'about',
    phrases: ['who is rupesh', 'about rupesh', 'about him', 'tell me about him', 'tell me about rupesh', 'introduce', 'summary', 'overview', 'background', 'his profile'],
    keys: { rupesh: 1, about: 2, who: 1, summary: 3, introduce: 3, introduction: 3, background: 3, profile: 2, overview: 2 },
    answer:
      'Rupesh Kumar is a Full Stack Developer (Java Spring Boot, React & Next.js) and Generative AI Engineer with 2+ years of experience building enterprise web applications with Java / Spring Boot, React, Next.js, Angular and SQL, plus Generative & Agentic AI features (RAG, MCP, tool calling). From 20 Nov 2026 he is a Software Developer (Full Stack Developer role) at Digital India Corporation, MeitY, Government of India, in New Delhi.\n\nMost recently he was a Software Engineer at Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026), working on a Warehouse Management System. He also built and launched AgentShieldAI, a live AI-security SaaS, and has qualified GATE CSIT in both 2025 and 2026.',
    suggest: ['What does he do now?', 'What is AgentShieldAI?', 'What are his skills?'],
  },
  {
    id: 'hire',
    phrases: ['why should i hire', 'why hire', 'why should we hire', 'what makes him', 'strength', 'unique', 'stand out', 'good fit'],
    keys: { hire: 3, hiring: 3, recruit: 3, strength: 3, strengths: 3, fit: 2, unique: 2, why: 1, best: 1, valuable: 2 },
    answer:
      'A few reasons Rupesh stands out:\n• Full-stack Java delivery — Spring Boot REST APIs, a role-based ticketing system and SAP integrations for a Warehouse Management System at Godrej Koerber.\n• He ships AI in production — a RAG pipeline for log analysis and a custom MCP server for natural-language database queries.\n• He builds products end to end — AgentShieldAI is live with an extension, dashboard, auth and billing.\n• Solid engineering base — 2+ years across Java / Spring Boot, React / Next.js, Angular, SQL Server & Oracle.\n• Cloud & security depth — AWS, Terraform, Ansible and CTF challenge design at IIT Jammu.\n• Strong CS fundamentals — GATE CSIT qualified in 2025 and 2026, plus 150+ DSA problems solved on LeetCode & GFG.',
    suggest: ['How can I contact him?', 'Is he open to opportunities?'],
  },
  {
    id: 'available',
    phrases: ['open to', 'looking for', 'available for', 'job change', 'notice period', 'relocate', 'relocation', 'freelance', 'open for'],
    keys: { available: 3, availability: 3, opportunity: 3, opportunities: 3, notice: 3, relocate: 3, relocation: 3, freelance: 3, remote: 2, open: 1, joining: 2 },
    answer: `Rupesh is open to exciting opportunities in Generative AI, Agentic AI and full-stack engineering (Java / Spring Boot, React, Next.js, Node.js). For specifics like notice period, location preferences or freelance work, it's best to reach him directly at ${CONTACT.email}.`,
    suggest: ['How can I contact him?', 'Why should we hire him?'],
  },
  {
    id: 'personal',
    phrases: ['date of birth', 'how old'],
    keys: { age: 3, dob: 3, birthday: 3, born: 2, married: 3, salary: 3, ctc: 3, package: 2, religion: 3, caste: 3, father: 3, mother: 3, family: 2, address: 2 },
    answer: `I keep personal details like that private. For compensation or anything else personal, please reach out to Rupesh directly at ${CONTACT.email}.`,
    suggest: ['How can I contact him?'],
  },
  {
    id: 'contact',
    phrases: ['get in touch', 'reach him', 'reach out', 'contact him', 'talk to him', 'phone number', 'email id', 'mail id'],
    keys: { contact: 4, email: 4, mail: 3, gmail: 3, phone: 4, mobile: 3, call: 2, number: 2, whatsapp: 3, reach: 3, touch: 2, connect: 2 },
    answer: `You can reach Rupesh at:\n• Email: ${CONTACT.email}\n• LinkedIn: ${CONTACT.linkedin}\n• GitHub: ${CONTACT.github}\n\nOr use the contact form on this page — your message goes straight to him.`,
    suggest: ['Is he open to opportunities?', 'Where is he based?'],
  },
  {
    id: 'location',
    phrases: ['where is he', 'where does he', 'based in', 'where he lives', 'which city', 'home town', 'hometown'],
    keys: { where: 2, location: 4, located: 4, city: 3, live: 2, lives: 2, based: 3, hometown: 4, from: 1, bihar: 3, siwan: 3, mumbai: 2 },
    answer: 'Rupesh is from Siwan, Bihar, and most recently worked in Navi Mumbai, Maharashtra.',
    suggest: ['Is he open to relocation?', 'What does he do now?'],
  },
  {
    id: 'resume',
    phrases: ['download resume', 'download cv'],
    keys: { resume: 4, cv: 4, pdf: 2, download: 2 },
    answer: 'You can download his résumé with the "Download résumé" button at the top of this page, or press Ctrl + K and choose "Download résumé".',
  },
  {
    id: 'links',
    phrases: ['github profile', 'linkedin profile', 'social media'],
    keys: { github: 4, linkedin: 4, social: 2, portfolio: 1, link: 1, links: 1, repo: 2, repos: 2, repositories: 2 },
    answer: `His LinkedIn is ${CONTACT.linkedin}. His GitHub is ${CONTACT.github} — it has GitHubOps AI and more. His live product AgentShieldAI is at ${CONTACT.site}.`,
    suggest: ['Top projects?', 'How can I contact him?'],
  },

  // ---------- experience ----------
  {
    id: 'experience',
    phrases: ['work experience', 'how many years', 'years of experience', 'where has he worked', 'previous companies', 'career', 'work history'],
    keys: { experience: 4, experienced: 3, career: 3, worked: 2, work: 1, companies: 3, company: 2, years: 2, year: 1, employer: 3, history: 1, job: 2 },
    answer:
      'Rupesh has 2+ years of professional experience:\n• Software Developer (Full Stack) — Digital India Corporation, MeitY, Govt. of India, New Delhi (from 20 Nov 2026)\n• Software Engineer — Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026): Java / Spring Boot WMS, ticketing system, RAG & MCP\n• Associate Software Engineer — Everonic Solutions, Lucknow (5 Aug 2024 – 29 Nov 2025): real-time Vehicle Tracking System (Spring Boot, React, Next.js)\n• Cloud Engineer Intern — IIT Jammu (Jan 2024 – Jul 2024)',
    suggest: ['What does he do now?', 'What did he do at Godrej Koerber?', 'What did he build at Everonic?'],
  },
  {
    id: 'dic',
    phrases: ['digital india', 'government job', 'govt job', 'new job', 'next job', 'next role', 'new role', 'upcoming role'],
    keys: { dic: 5, meity: 5, digital: 4, government: 4, govt: 4, gov: 4, ministry: 4, delhi: 3 },
    answer:
      'From 20 Nov 2026, Rupesh is a Software Developer — in a Full Stack Developer role — at Digital India Corporation (DIC), New Delhi, the not-for-profit company under the Ministry of Electronics & Information Technology (MeitY), Government of India. The role covers:\n• Full-stack development of secure, scalable web applications and REST APIs for Government of India digital initiatives under the Digital India programme.\n• Integration of AI-enabled features — LLMs, Generative AI APIs and RAG — using AI-assisted development tools.',
    suggest: ['What did he do at Godrej Koerber?', 'Tell me about his AI work', 'What are his skills?'],
  },
  {
    id: 'godrej',
    phrases: ['current job', 'current role', 'current company', 'right now', 'currently doing', 'what does he do', 'present company', 'working now', 'working currently', 'where is he working', 'where does he work', 'which company', 'previous job', 'previous company', 'last company', 'last job'],
    keys: { godrej: 5, koerber: 5, current: 3, currently: 3, now: 2, working: 2, present: 2, previous: 2, wms: 5, ticket: 3, ticketing: 3, warehouse: 5, sap: 3, supply: 3, chain: 2, logistics: 3, inventory: 3 },
    answer:
      'Most recently, Rupesh was a Software Engineer at Godrej Koerber, Navi Mumbai (19 Dec 2025 – 18 Sep 2026), working on a Warehouse Management System (WMS) web application for supply-chain and logistics clients. There he:\n• Developed WMS modules for inventory, stock movement, receiving, picking, packing and dispatch — Java / Spring Boot REST APIs with Spring Data JPA on SQL Server and an Angular / TypeScript front end.\n• Built a centralized, role-based Ticketing Management System (Next.js, Spring Boot) that replaced email and Excel tracking, with priority-based assignment, status tracking and SLA-based escalation for customer issues.\n• Implemented a RAG pipeline for log analysis that feeds the relevant application and system logs to an LLM, helping the team find root causes faster.\n• Built a custom MCP server exposing SQL Server data as structured tools for an AI agent — natural-language database queries and ad-hoc reporting.\n• Developed and maintained SAP ↔ WMS integration interfaces syncing master data, stock movements and orders with SAP ERP.',
    suggest: ['What is MCP work he has done?', 'What did he do before this?'],
  },
  {
    id: 'everonic',
    phrases: ['vehicle tracking', 'before godrej', 'before this', 'first job'],
    keys: { everonic: 5, lucknow: 4, vehicle: 4, tracking: 3, gps: 4, telemetry: 4, fleet: 3, before: 1, associate: 2 },
    answer:
      'At Everonic Solutions, Lucknow (5 Aug 2024 – 29 Nov 2025) Rupesh was an Associate Software Engineer. He:\n• Built a full-stack, real-time Vehicle Tracking System (React, Next.js, TypeScript, REST APIs, SQL Server) processing GPS and telemetry data for live fleet monitoring.\n• Designed Java / Spring Boot REST APIs and data-processing services with Spring Data JPA, a layered architecture and dependency injection for high-volume location data.\n• Built interactive React / Next.js dashboards for live tracking, route analysis, trip history and operational metrics.\n• Managed SQL Server and Oracle (PL/SQL) data served through REST APIs, using Git in an Agile team.',
    suggest: ['What does he do at Godrej Koerber?', 'What did he do at IIT Jammu?'],
  },
  {
    id: 'iit',
    phrases: ['iit jammu', 'internship', 'cloud intern', 'cloud engineer intern', 'cloud security intern', 'security intern'],
    keys: { iit: 5, jammu: 5, intern: 4, internship: 4, terraform: 3, ansible: 3, drdo: 4, anveshanam: 5, ctf: 4 },
    answer:
      'As a Cloud Engineer Intern at IIT Jammu (Jan – Jul 2024), Rupesh:\n• Designed and deployed scalable AWS infrastructure (EC2, S3, VPC, Route 53, IAM) for secure, highly available workloads.\n• Automated infrastructure and environment setup with Terraform (IaC) and Ansible.\n• Built AWS-based cloud security challenges for national-level CTF competitions.\n• Contributed to Anveshanam\'2, a 3-day CTF by IIT Jammu & DRDO, building cloud-security, steganography and memory-analysis challenges.',
    suggest: ['What cloud skills does he have?', 'What are his achievements?'],
  },

  // ---------- skills ----------
  {
    id: 'skills',
    phrases: ['tech stack', 'what technologies', 'what can he do', 'skill set', 'what does he know', 'technical skills'],
    keys: { skill: 4, skills: 4, stack: 3, technology: 3, technologies: 3, tech: 2, tools: 2, expertise: 3, proficient: 2, know: 1, languages: 2 },
    answer:
      'Rupesh\'s toolkit:\n• AI: MCP, AI agents, LLM integration (OpenAI, Claude, NVIDIA NIM), tool calling, RAG, prompt engineering, NL-to-SQL, LangChain, LangGraph, FAISS\n• Languages: Java, Python, JavaScript, TypeScript, SQL, C/C++\n• Backend: Spring Boot, Spring Security, JPA / Hibernate, Node.js, Express.js, REST APIs\n• Frontend: React.js, Next.js, Angular, HTML5, CSS3, Tailwind CSS\n• Databases: PostgreSQL, SQL Server, Oracle, PL/SQL\n• DevOps & tools: AWS, GCP, OpenStack, Docker, Ansible, Terraform, Git, GitHub, Linux, Postman, Swagger, SAP integration',
    suggest: ['Tell me about his AI work', 'Does he know Angular?'],
  },
  {
    id: 'languages',
    phrases: ['programming languages', 'which languages', 'coding languages', 'code in'],
    keys: { language: 4, languages: 4, programming: 2, coding: 2 },
    answer: 'Programming languages: Java, Python, JavaScript, TypeScript, SQL and C/C++ (plus HTML5 & CSS3). Java powers his Spring Boot backends, TypeScript his React / Next.js front ends, and Python his AI projects.',
    suggest: ['Which frameworks does he use?', 'Which databases does he know?'],
  },
  {
    id: 'frameworks',
    phrases: ['which frameworks', 'what frameworks'],
    keys: { framework: 5, frameworks: 5, library: 3, libraries: 3, frontend: 3, backend: 3 },
    answer: 'Frameworks: Spring Boot, Spring Security, JPA / Hibernate, Node.js, Express.js and FastAPI on the backend; React, Next.js, Angular and Tailwind CSS on the frontend; LangChain and LangGraph for AI agents.',
    suggest: ['Which databases does he know?', 'Tell me about his AI work'],
  },
  {
    id: 'databases',
    phrases: ['which databases', 'what databases'],
    keys: { database: 5, databases: 5, db: 4, rdbms: 4, sqlserver: 3, plsql: 3 },
    answer: 'Databases: PostgreSQL, SQL Server, Oracle Database and PL/SQL — SQL Server and Oracle across Godrej Koerber and Everonic, PostgreSQL with Spring Boot backends. He has also used FAISS as a vector store for RAG, SQLite for agent checkpointing and Firebase for SaaS projects.',
    suggest: ['What are his skills?', 'Top projects?'],
  },
  {
    id: 'name',
    phrases: ['full name', 'his name', 'what is he called'],
    keys: { name: 2, fullname: 4 },
    answer: 'His name is Rupesh Kumar — a Full Stack Developer (Java Spring Boot, React & Next.js) and Generative AI Engineer.',
    suggest: ['Who is Rupesh?'],
  },
  {
    id: 'funfact',
    phrases: ['something interesting', 'fun fact', 'surprise me', 'something cool', 'impress me'],
    keys: { interesting: 4, fun: 3, fact: 3, cool: 1, impress: 3 },
    answer:
      'Here\'s a fun one: this chat assistant you\'re talking to runs on a knowledge base Rupesh built for his portfolio — and his own product, AgentShieldAI, protects people from leaking secrets into chatbots just like this one. He has also written CTF hacking challenges for a national event by IIT Jammu & DRDO, and cleared GATE two years in a row. 🛡️',
    suggest: ['What is AgentShieldAI?', 'What did he do at IIT Jammu?'],
  },
  {
    id: 'ai',
    phrases: ['ai work', 'ai experience', 'generative ai', 'agentic ai', 'ai skills', 'machine learning', 'model context protocol'],
    keys: { ai: 3, genai: 4, generative: 4, agentic: 4, agent: 3, agents: 3, llm: 4, llms: 4, mcp: 4, rag: 4, prompt: 3, openai: 3, claude: 3, gpt: 3, langchain: 3, langgraph: 3, ml: 2, artificial: 2, intelligence: 1 },
    answer:
      'Generative & Agentic AI is Rupesh\'s focus:\n• At Godrej Koerber — a RAG pipeline for log analysis and a custom MCP server that lets an AI agent query SQL Server data in natural language.\n• AgentShieldAI — his live product that protects prompts sent to ChatGPT, Claude, Gemini and Copilot.\n• Projects — GitHubOps AI (LangGraph agent with human-in-the-loop) and a RAG-based GenAI application (FastAPI + React).\nStack: LLM APIs, AI agents, tool calling, RAG, MCP, LangChain, LangGraph, prompt engineering.',
    suggest: ['What is AgentShieldAI?', 'Tell me about GitHubOps AI', 'RAG-based GenAI application?'],
  },
  {
    id: 'mcp',
    phrases: ['what is mcp', 'explain mcp', 'what is model context protocol', 'mcp work', 'mcp tools', 'mcp server', 'mcp experience'],
    keys: { mcp: 5, protocol: 3 },
    answer:
      'MCP (Model Context Protocol) is an open standard that lets AI assistants like Claude or ChatGPT call external tools and data sources in a controlled way — think of it as a "USB port" for AI.\n\nHow Rupesh uses it:\n• At Godrej Koerber — a custom MCP server that exposes SQL Server data as structured tools for an AI agent, enabling natural-language database queries and ad-hoc reporting.',
    suggest: ['Tell me about his AI work', 'What did he do at Godrej Koerber?'],
  },
  {
    id: 'cloud',
    phrases: ['cloud skills', 'devops skills', 'cloud experience', 'aws experience', 'devops experience', 'cloud security', 'worked on cloud', 'worked on aws'],
    keys: { cloud: 4, aws: 4, devops: 4, docker: 3, terraform: 3, ansible: 3, ec2: 3, s3: 3, vpc: 3, iam: 3, cicd: 3, infrastructure: 3, azure: 2, gcp: 2 },
    answer:
      'Cloud & DevOps: AWS (EC2, S3, VPC, Route 53, IAM), Terraform, Ansible, Docker, CI/CD and Linux. He built and automated AWS environments at IIT Jammu and designed AWS security challenges for national CTFs. CloudLens, one of his projects, analysed spend across AWS, Azure and GCP.',
    suggest: ['What did he do at IIT Jammu?', 'What is CloudLens?'],
  },

  // ---------- projects ----------
  {
    id: 'projects',
    phrases: ['what has he built', 'side projects', 'personal projects', 'best project', 'top projects', 'his projects'],
    keys: { project: 4, projects: 4, built: 3, build: 2, portfolio: 1, work: 1, made: 2, created: 2, developed: 2, apps: 2, products: 2 },
    answer:
      'His key projects:\n• AgentShieldAI ⭐ — live AI-security SaaS that stops secrets leaking into ChatGPT, Claude, Gemini & Copilot.\n• GitHubOps AI — LangGraph GitHub automation assistant with human-in-the-loop approval.\n• RAG-Based GenAI Application — FastAPI + React chat app that answers from retrieved context.\n• PopMyFlix — marketing SaaS serving 1,000+ daily requests.\n• CloudLens — multi-cloud (AWS, Azure, GCP) cost intelligence platform.',
    suggest: ['What is AgentShieldAI?', 'Tell me about GitHubOps AI'],
  },
  {
    id: 'agentshield',
    phrases: ['agent shield', 'live project', 'live product', 'flagship', 'his product', 'saas product'],
    keys: { agentshieldai: 6, agentshield: 6, shield: 4, leak: 3, leaking: 3, secrets: 3, extension: 3, redact: 3, live: 1, product: 2 },
    answer: `AgentShieldAI is Rupesh's live product (${CONTACT.site}). It's a browser extension + SaaS dashboard that checks every prompt sent to ChatGPT, Claude, Gemini, Copilot and Perplexity, and:\n• Blocks API keys, passwords, tokens and private keys before they're sent\n• Warns on or auto-redacts emails, phone, card and ID numbers\n• Lets users choose block / warn / redact per rule\n• Runs checks locally in the browser and masks secrets before storage\n• Verifies each browser and checks access server-side on every request\nIt includes a security-alerts dashboard, a 30-day free trial and flexible plans.`,
    suggest: ['What other projects has he built?', 'Tell me about his AI work'],
  },
  {
    id: 'githubops',
    phrases: ['github ops', 'githubops ai', 'github agent', 'github assistant'],
    keys: { githubops: 6, langgraph: 4, hitl: 4, approval: 3, streamlit: 2, sqlite: 3, checkpoint: 3, checkpointing: 3 },
    answer:
      'GitHubOps AI (Aug 2026) is a natural-language GitHub automation assistant built with LangGraph workflows and GitHub API tools. Write and delete operations run only after human confirmation (human-in-the-loop), with SQLite checkpointing to save workflow state.\nTech: Python, LangGraph, LangChain, Streamlit, NVIDIA AI.\nCode: github.com/rupeshrrts/githubops-ai',
    suggest: ['RAG-based GenAI application?', 'What is AgentShieldAI?'],
  },
  {
    id: 'ragproject',
    phrases: ['rag project', 'rag application', 'rag app', 'rag based', 'genai application', 'genai app'],
    keys: { fastapi: 2, application: 3, app: 2, project: 1, rag: 1, retrieval: 3 },
    answer:
      'His RAG-Based GenAI Application (Jul 2026) has a FastAPI backend and a React chat interface that retrieves relevant context to generate LLM answers for real-world enterprise use cases, using custom AI workflow design.\nTech: Python, FastAPI, React, LLM APIs, RAG.',
    suggest: ['Tell me about GitHubOps AI', 'Tell me about his AI work'],
  },
  {
    id: 'cloudlens',
    keys: { cloudlens: 6, cost: 3, spend: 3, billing: 2, finops: 4 },
    answer:
      'CloudLens (Feb 2023) is a SaaS platform integrating AWS, Azure and GCP to visualise real-time cloud spend and recommend ways to reduce idle resource waste. Built with HTML, CSS, JavaScript, Bootstrap and Firebase.',
    suggest: ['What is PopMyFlix?', 'Top projects?'],
  },
  {
    id: 'popmyflix',
    keys: { popmyflix: 6, marketing: 4, ad: 2, ads: 3, campaign: 3, gsap: 3, framer: 3 },
    answer:
      'PopMyFlix is an end-to-end animated marketing SaaS with multi-channel ad automation, live payment integration and real-time campaign analytics, serving 1,000+ daily requests. Built with Next.js, TypeScript, GSAP, Framer Motion, FastAPI and Firebase.',
    suggest: ['What is CloudLens?', 'Top projects?'],
  },

  // ---------- education ----------
  {
    id: 'education',
    phrases: ['where did he study', 'educational background', 'qualification', 'qualifications'],
    keys: { education: 4, educational: 4, study: 3, studied: 3, college: 3, university: 3, degree: 3, qualification: 4, graduate: 3, graduation: 3, academic: 3, padhai: 4 },
    answer:
      'Education:\n• B.Tech, Computer Science & Engineering — Shaheed Bhagat Singh State Technical Campus, Ferozepur (2020–2024), CGPA 8.15/10\n• Class XII — Shaheed Bhagat Singh Inter College, Siwan (BSEB, 2019), 76%, 1st Division\n• Class X — Gandak High School, Tarwara, Siwan (BSEB, 2016), 73.6%, 1st Division\nHe has also qualified GATE CSIT in 2025 and 2026.',
    suggest: ['What are his achievements?', 'What are his skills?'],
  },
  {
    id: 'btech',
    phrases: ['b tech', 'bachelor'],
    keys: { btech: 5, cgpa: 5, engineering: 2, ferozepur: 5, sbsstc: 5, bachelor: 4 },
    answer: 'Rupesh completed his B.Tech in Computer Science & Engineering at Shaheed Bhagat Singh State Technical Campus, Ferozepur, Punjab (2020–2024) with a CGPA of 8.15/10.',
    suggest: ['What are his achievements?'],
  },
  {
    id: 'class12',
    phrases: ['class 12', 'class xii', '12th class', 'intermediate', 'higher secondary', 'plus two'],
    keys: { '12th': 5, xii: 5, twelfth: 5, inter: 3, intermediate: 4 },
    answer: 'Class XII: Shaheed Bhagat Singh Inter College, Sani-Basantpur, Siwan — BSEB Patna (2018–2019), 76%, 1st Division.',
  },
  {
    id: 'class10',
    phrases: ['class 10', 'class x ', '10th class', 'matric', 'secondary school'],
    keys: { '10th': 5, tenth: 5, matric: 5, matriculation: 5, ssc: 4, secondary: 2, gandak: 5 },
    answer: 'Class X: Gandak High School, Tarwara, Siwan — BSEB Patna (2016), scored 368/500 (73.6%), 1st Division.',
  },
  {
    id: 'score',
    phrases: ['how much marks', 'what marks', 'percentage in'],
    keys: { marks: 3, percentage: 3, score: 3, scored: 3, grades: 3, result: 2, results: 2 },
    answer: 'His academic scores:\n• B.Tech CSE — CGPA 8.15/10\n• Class XII (BSEB) — 76%, 1st Division\n• Class X (BSEB) — 73.6%, 1st Division\n• GATE CSIT — qualified in 2025 and 2026',
  },
  {
    id: 'gate',
    phrases: ['gate exam', 'gate score', 'gate qualified'],
    keys: { gate: 6 },
    answer: 'Rupesh qualified GATE in Computer Science & Information Technology (CSIT) twice — in 2025 and again in 2026.',
    suggest: ['What are his achievements?', 'Education?'],
  },
  {
    id: 'dsa',
    phrases: ['data structures', 'problem solving', 'competitive programming', 'coding problems', 'coding practice', 'geeks for geeks'],
    keys: { dsa: 6, leetcode: 6, gfg: 6, geeksforgeeks: 6, algorithm: 4, algorithms: 4, problems: 2, competitive: 3, coding: 1, cp: 3 },
    answer:
      'Rupesh has solved 150+ Data Structures & Algorithms problems on LeetCode and GeeksforGeeks. Combined with qualifying GATE CSIT in 2025 and 2026, it reflects strong CS fundamentals — he also keeps a C++ coding-problems repo on GitHub (github.com/rupeshrrts).',
    suggest: ['What are his achievements?', 'What are his skills?'],
  },
  {
    id: 'achievements',
    phrases: ['proud of', 'awards'],
    keys: { achievement: 5, achievements: 5, award: 4, awards: 4, accomplishment: 4, accomplishments: 4, certification: 3, certifications: 3, milestone: 3 },
    answer:
      'Achievements:\n• Qualified GATE CSIT in 2025 and 2026\n• Solved 150+ DSA problems on LeetCode and GeeksforGeeks\n• Challenge author for Anveshanam\'2, a national CTF by IIT Jammu & DRDO\n• Built and launched AgentShieldAI, a live AI-security SaaS\n• B.Tech CSE with CGPA 8.15/10',
    suggest: ['What is AgentShieldAI?', 'Education?'],
  },
];

// The canonical question for each topic — offered as "did you mean" suggestions, shown in the
// Supabase admin view and given to the LLM as context.
export const QUESTIONS = {
  greeting: 'Hi there!',
  thanks: 'Thank you!',
  bye: 'Bye!',
  bot: 'Who are you?',
  about: 'Who is Rupesh?',
  hire: 'Why should we hire him?',
  available: 'Is he open to opportunities?',
  personal: 'What is his age or salary?',
  contact: 'How can I contact him?',
  location: 'Where is he based?',
  resume: 'Where can I download his résumé?',
  links: 'What are his GitHub and LinkedIn profiles?',
  experience: 'What is his work experience?',
  dic: 'What is his role at Digital India Corporation?',
  godrej: 'What did he do at Godrej Koerber?',
  everonic: 'What did he build at Everonic?',
  iit: 'What did he do at IIT Jammu?',
  skills: 'What are his skills?',
  languages: 'Which programming languages does he know?',
  frameworks: 'Which frameworks does he use?',
  databases: 'Which databases does he know?',
  name: 'What is his full name?',
  funfact: 'Tell me something interesting about him',
  ai: 'Tell me about his AI work',
  mcp: 'What MCP work has he done?',
  cloud: 'What cloud skills does he have?',
  projects: 'What projects has he built?',
  agentshield: 'What is AgentShieldAI?',
  githubops: 'Tell me about GitHubOps AI',
  ragproject: 'What is his RAG-based GenAI application?',
  cloudlens: 'What is CloudLens?',
  popmyflix: 'What is PopMyFlix?',
  education: 'Where did he study?',
  btech: 'What was his B.Tech CGPA?',
  class12: 'What were his Class 12 marks?',
  class10: 'What were his Class 10 marks?',
  score: 'What are his academic scores?',
  gate: 'Has he qualified GATE?',
  dsa: 'How many DSA problems has he solved?',
  achievements: 'What are his achievements?',
};

// Technology lookup for "does he know X?" style questions.
// key = normalised token, value = [display name, where it's used]
export const TECH = {
  csharp: ['C#', 'his earlier .NET development work'],
  dotnet: ['.NET / ASP.NET Core', 'ASP.NET Core 8, Web API, MVC and EF Core across his professional work'],
  aspnet: ['ASP.NET Core', 'his earlier .NET development work'],
  efcore: ['Entity Framework Core', 'data access in his ASP.NET Core APIs'],
  entity: ['Entity Framework Core', 'data access in his ASP.NET Core APIs'],
  python: ['Python', 'GitHubOps AI and his RAG-based GenAI application'],
  typescript: ['TypeScript', 'React/Next.js apps at Everonic, Angular at Godrej Koerber, and PopMyFlix'],
  javascript: ['JavaScript', 'frontend work and CloudLens'],
  cpp: ['C/C++', 'problem solving and DSA — 150+ problems on LeetCode & GFG, plus a C++ coding-problems repo'],
  java: ['Java', 'Spring Boot REST APIs at Godrej Koerber and Everonic'],
  springboot: ['Spring Boot', 'WMS and ticketing APIs at Godrej Koerber and vehicle-tracking APIs at Everonic'],
  sql: ['SQL', 'SQL Server and Oracle work throughout his career'],
  angular: ['Angular', 'the WMS web application at Godrej Koerber'],
  react: ['React', 'the real-time Vehicle Tracking System at Everonic and other full-stack apps'],
  nextjs: ['Next.js', 'the ticketing system at Godrej Koerber, the Vehicle Tracking System at Everonic and PopMyFlix'],
  nodejs: ['Node.js', 'full-stack projects such as this portfolio\'s backend'],
  express: ['Express.js', 'REST APIs in full-stack projects such as this portfolio\'s backend'],
  fastapi: ['FastAPI', 'PopMyFlix and his RAG-based GenAI application'],
  streamlit: ['Streamlit', 'GitHubOps AI'],
  tailwind: ['Tailwind CSS', 'frontend styling'],
  bootstrap: ['Bootstrap', 'CloudLens and other frontends'],
  sqlserver: ['SQL Server', 'Godrej Koerber and Everonic'],
  oracle: ['Oracle Database & PL/SQL', 'the Vehicle Tracking System at Everonic'],
  plsql: ['PL/SQL', 'Oracle database work'],
  mongodb: null,
  postgresql: ['PostgreSQL', 'Spring Boot backends'],
  mysql: null,
  aws: ['AWS', 'IIT Jammu (EC2, S3, VPC, Route 53, IAM)'],
  azure: ['Azure', 'CloudLens cost analysis (alongside AWS and GCP)'],
  gcp: ['GCP', 'cloud work and CloudLens cost analysis (alongside AWS and Azure)'],
  openstack: ['OpenStack', 'cloud infrastructure work'],
  docker: ['Docker', 'containerising apps'],
  kubernetes: null,
  terraform: ['Terraform', 'AWS infrastructure-as-code at IIT Jammu'],
  ansible: ['Ansible', 'configuration automation at IIT Jammu'],
  git: ['Git & GitHub', 'all of his projects'],
  linux: ['Linux', 'servers and cloud work'],
  firebase: ['Firebase', 'CloudLens and PopMyFlix'],
  mcp: ['Model Context Protocol (MCP)', 'a custom MCP server at Godrej Koerber'],
  rag: ['RAG', 'log analysis at Godrej Koerber and his RAG-based GenAI application'],
  langchain: ['LangChain', 'GitHubOps AI'],
  langgraph: ['LangGraph', 'GitHubOps AI (human-in-the-loop agent)'],
  openai: ['OpenAI API', 'LLM integrations in enterprise apps'],
  claude: ['Anthropic Claude', 'LLM integrations in enterprise apps'],
  faiss: ['FAISS', 'vector search for RAG'],
  sap: ['SAP integration', 'SAP ↔ WMS data flows at Godrej Koerber'],
  swagger: ['Swagger', 'API documentation and testing'],
  postman: ['Postman', 'API testing'],
  iis: ['IIS', 'deploying .NET applications'],
  pytorch: null,
  tensorflow: null,
};
