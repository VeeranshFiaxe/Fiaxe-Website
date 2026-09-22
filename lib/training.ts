/* Content for the AI Training service page (components/site/pages/Training.tsx). */

export type Level = "Beginner" | "Intermediate" | "Advanced";
export type Audience = "Leadership" | "Business teams" | "Technical teams";

export type Course = {
  title: string;
  blurb: string;
  audience: Audience;
  level: Level;
  hours: number;
  format: "Workshop" | "Live cohort" | "Self-paced";
  skills: string[];
  /* cover colours and pattern */
  color: string;
  pattern: "rings" | "grid" | "bars" | "dots";
  badge?: "Most popular" | "New";
};

export const COURSES: Course[] = [
  {
    title: "AI for Leaders",
    blurb: "Placeholder: where AI pays off, what it costs and how to roll it out safely.",
    audience: "Leadership",
    level: "Beginner",
    hours: 4,
    format: "Workshop",
    skills: ["Strategy", "Risk", "ROI"],
    color: "#5b8cff",
    pattern: "rings",
    badge: "Most popular",
  },
  {
    title: "Prompting for Everyday Work",
    blurb: "Placeholder: get reliable, useful answers from ChatGPT, Claude and Gemini.",
    audience: "Business teams",
    level: "Beginner",
    hours: 6,
    format: "Live cohort",
    skills: ["Prompting", "Writing", "Research"],
    color: "#ff8a3d",
    pattern: "dots",
    badge: "Most popular",
  },
  {
    title: "AI for Sales & Marketing",
    blurb: "Placeholder: research accounts, draft outreach and repurpose content in minutes.",
    audience: "Business teams",
    level: "Intermediate",
    hours: 8,
    format: "Live cohort",
    skills: ["Outreach", "Content", "CRM"],
    color: "#ff5d8f",
    pattern: "bars",
  },
  {
    title: "Automating Your Own Work",
    blurb: "Placeholder: build no-code automations that take chores off your plate.",
    audience: "Business teams",
    level: "Intermediate",
    hours: 10,
    format: "Workshop",
    skills: ["n8n", "Zapier", "Agents"],
    color: "#18e299",
    pattern: "grid",
    badge: "New",
  },
  {
    title: "Building with LLM APIs",
    blurb: "Placeholder: ship features on top of Claude and OpenAI, from prompt to production.",
    audience: "Technical teams",
    level: "Intermediate",
    hours: 12,
    format: "Live cohort",
    skills: ["APIs", "Evals", "Tool use"],
    color: "#a878ff",
    pattern: "grid",
  },
  {
    title: "RAG & AI Agents",
    blurb: "Placeholder: connect models to your data and build agents that take actions.",
    audience: "Technical teams",
    level: "Advanced",
    hours: 16,
    format: "Live cohort",
    skills: ["RAG", "Agents", "Vector DBs"],
    color: "#ffc53d",
    pattern: "rings",
    badge: "New",
  },
  {
    title: "AI Governance & Policy",
    blurb: "Placeholder: write the rules your team needs to use AI with confidence.",
    audience: "Leadership",
    level: "Intermediate",
    hours: 3,
    format: "Workshop",
    skills: ["Policy", "Data", "Compliance"],
    color: "#3dc5ff",
    pattern: "bars",
  },
  {
    title: "AI Foundations",
    blurb: "Placeholder: how today's AI works, in plain language, for everyone on the team.",
    audience: "Business teams",
    level: "Beginner",
    hours: 2,
    format: "Self-paced",
    skills: ["Basics", "Safety", "Tools"],
    color: "#8b7cf6",
    pattern: "dots",
  },
];

/* Role-based learning paths (Google Cloud "learning path" pattern). */
export const PATHS: { audience: Audience; title: string; copy: string; modules: { name: string; mins: number }[] }[] = [
  {
    audience: "Leadership",
    title: "Lead the AI shift",
    copy: "Placeholder: for founders and department heads deciding where AI goes first.",
    modules: [
      { name: "What AI can and can't do", mins: 45 },
      { name: "Finding high-value use cases", mins: 60 },
      { name: "Costs, risks and governance", mins: 60 },
      { name: "Your 90-day AI roadmap", mins: 75 },
    ],
  },
  {
    audience: "Business teams",
    title: "Work faster with AI",
    copy: "Placeholder: for sales, ops, HR and finance teams who want hours back every week.",
    modules: [
      { name: "AI foundations", mins: 60 },
      { name: "Prompting that works", mins: 90 },
      { name: "AI in your daily tools", mins: 90 },
      { name: "Automate one real task", mins: 120 },
    ],
  },
  {
    audience: "Technical teams",
    title: "Build AI products",
    copy: "Placeholder: for engineers shipping AI features and internal agents.",
    modules: [
      { name: "LLM APIs and tool use", mins: 120 },
      { name: "Retrieval over your data", mins: 180 },
      { name: "Agents and workflows", mins: 180 },
      { name: "Evals, cost and safety", mins: 120 },
    ],
  },
];

export const FORMATS = [
  { title: "On-site workshop", copy: "Placeholder: a focused half or full day at your office, built on your team's real work.", meta: "10–40 people" },
  { title: "Live virtual cohort", copy: "Placeholder: weekly live sessions over 3–6 weeks with hands-on assignments.", meta: "Up to 60 people" },
  { title: "Custom programme", copy: "Placeholder: a company-wide rollout with paths per role, office hours and reporting.", meta: "Whole company" },
];

export const TRAINING_FAQ = [
  { q: "Placeholder: does my team need a technical background?", a: "Placeholder answer: most tracks assume none; technical tracks list their prerequisites." },
  { q: "Placeholder: can you tailor the content to our industry?", a: "Placeholder answer: every programme uses your team's real tasks and tools." },
  { q: "Placeholder: do participants get a certificate?", a: "Placeholder answer." },
  { q: "Placeholder: which AI tools do you teach?", a: "Placeholder answer: ChatGPT, Claude, Gemini, Copilot and the tools your company already pays for." },
];
