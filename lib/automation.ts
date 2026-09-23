/* Content for the Automation service page (components/site/pages/Automation.tsx).
   Workflows are drawn on a 1000 x 460 canvas; x/y are node centres. */

export type WfIcon =
  | "bolt"
  | "mail"
  | "ai"
  | "db"
  | "chat"
  | "sheet"
  | "branch"
  | "calendar"
  | "doc"
  | "bell"
  | "phone"
  | "model"
  | "memory"
  | "tool";

/* 24x24 line icons (stroke only) for workflow nodes */
export const WF_ICONS: Record<WfIcon, string> = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  ai: "M11 3l1.9 5.1L18 10l-5.1 1.9L11 17l-1.9-5.1L4 10l5.1-1.9ZM19 3v4M21 5h-4M19 16v4M21 18h-4",
  db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  chat: "M4 5h16v11H9l-5 4V5Z",
  sheet: "M4 3h16v18H4zM4 9h16M4 15h16M10 3v18",
  branch: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 9a9 9 0 0 1-9 9",
  calendar: "M4 5h16v16H4zM4 10h16M8 3v4M16 3v4",
  doc: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h6",
  bell: "M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2ZM10 21h4",
  phone: "M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z",
  model: "M12 2 3 7v10l9 5 9-5V7l-9-5ZM3 7l9 5 9-5M12 12v10",
  memory: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Zm0 0v6c0 1.7 3.6 3 8 3M20 6v4M16 15l2 2 4-4M4 12v6c0 1.7 3.6 3 8 3",
  tool: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8Z",
};

export type WfNode = {
  id: string;
  label: string;
  sub: string;
  icon: WfIcon;
  /* icon tint, like an app's brand colour */
  color: string;
  x: number;
  y: number;
  /* tile width in canvas units (default 64); the AI agent is wider */
  w?: number;
  /* tool nodes hang under the agent and do not run in sequence */
  tool?: boolean;
  /* line written to the run log when this node finishes */
  log?: string;
};

export type Workflow = {
  name: string;
  trigger: string;
  nodes: WfNode[];
  edges: [string, string, string?][];
};

export const WORKFLOWS: Workflow[] = [
  {
    name: "Lead to CRM",
    trigger: "On form submission",
    nodes: [
      { id: "form", label: "New lead", sub: "Website form", icon: "bolt", color: "#ff8a3d", x: 80, y: 190, log: "Lead received · Priya S." },
      { id: "agent", label: "AI Agent", sub: "Qualify & enrich", icon: "ai", color: "#a878ff", x: 300, y: 190, w: 150, log: "Scored 86 / 100 · budget confirmed" },
      { id: "model", label: "Model", sub: "LLM", icon: "model", color: "#a878ff", x: 250, y: 360, tool: true },
      { id: "memory", label: "Memory", sub: "Past chats", icon: "memory", color: "#a878ff", x: 350, y: 360, tool: true },
      { id: "if", label: "Hot lead?", sub: "If score > 70", icon: "branch", color: "#5b8cff", x: 520, y: 190, log: "Branch → true" },
      { id: "crm", label: "Create deal", sub: "CRM", icon: "db", color: "#18e299", x: 700, y: 110, log: "Deal created in pipeline" },
      { id: "nurture", label: "Nurture email", sub: "Gmail", icon: "mail", color: "#ff5d5d", x: 700, y: 290, log: "Skipped" },
      { id: "slack", label: "Alert sales", sub: "Slack", icon: "chat", color: "#ffc53d", x: 900, y: 110, log: "Posted to #sales" },
    ],
    edges: [
      ["form", "agent"],
      ["agent", "if"],
      ["if", "crm", "true"],
      ["if", "nurture", "false"],
      ["crm", "slack"],
    ],
  },
  {
    name: "Invoice processing",
    trigger: "On new email",
    nodes: [
      { id: "mail", label: "Invoice email", sub: "Gmail trigger", icon: "mail", color: "#ff5d5d", x: 80, y: 200, log: "Email from vendor · 1 PDF" },
      { id: "extract", label: "Read invoice", sub: "Extract fields", icon: "doc", color: "#5b8cff", x: 260, y: 200, log: "Amount ₹48,200 · due 30 Sep" },
      { id: "agent", label: "AI Agent", sub: "Match to PO", icon: "ai", color: "#a878ff", x: 470, y: 200, w: 150, log: "Matched PO-2291 · 100%" },
      { id: "model", label: "Model", sub: "LLM", icon: "model", color: "#a878ff", x: 420, y: 370, tool: true },
      { id: "erp", label: "ERP lookup", sub: "Tool", icon: "tool", color: "#a878ff", x: 520, y: 370, tool: true },
      { id: "sheet", label: "Log payment", sub: "Accounts sheet", icon: "sheet", color: "#18e299", x: 690, y: 200, log: "Row added · pending approval" },
      { id: "approve", label: "Ask approval", sub: "Finance lead", icon: "bell", color: "#ffc53d", x: 900, y: 200, log: "Approved by Rahul · 2m" },
    ],
    edges: [
      ["mail", "extract"],
      ["extract", "agent"],
      ["agent", "sheet"],
      ["sheet", "approve"],
    ],
  },
  {
    name: "Missed-call follow-up",
    trigger: "On missed call",
    nodes: [
      { id: "call", label: "Missed call", sub: "Phone system", icon: "phone", color: "#18e299", x: 80, y: 220, log: "Missed call · +91 98••• 21" },
      { id: "db", label: "Find customer", sub: "CRM", icon: "db", color: "#5b8cff", x: 260, y: 220, log: "Existing customer · 3 orders" },
      { id: "agent", label: "AI Agent", sub: "Write reply", icon: "ai", color: "#a878ff", x: 470, y: 220, w: 150, log: "WhatsApp reply drafted" },
      { id: "model", label: "Model", sub: "LLM", icon: "model", color: "#a878ff", x: 470, y: 370, tool: true },
      { id: "chat", label: "Send message", sub: "WhatsApp", icon: "chat", color: "#18e299", x: 690, y: 130, log: "Delivered · read in 40s" },
      { id: "cal", label: "Book callback", sub: "Calendar", icon: "calendar", color: "#ff8a3d", x: 690, y: 310, log: "Callback set · 4:30 pm" },
      { id: "bell", label: "Notify owner", sub: "Email", icon: "bell", color: "#ffc53d", x: 900, y: 220, log: "Summary sent" },
    ],
    edges: [
      ["call", "db"],
      ["db", "agent"],
      ["agent", "chat"],
      ["agent", "cal"],
      ["chat", "bell"],
      ["cal", "bell"],
    ],
  },
];

/* Apps we connect (Zapier-style wall). Monogram tiles, so no logo files. */
export const APPS: { name: string; color: string }[] = [
  { name: "Gmail", color: "#ea4335" },
  { name: "Slack", color: "#611f69" },
  { name: "WhatsApp", color: "#25d366" },
  { name: "HubSpot", color: "#ff7a59" },
  { name: "Salesforce", color: "#00a1e0" },
  { name: "Zoho", color: "#e42527" },
  { name: "Sheets", color: "#0f9d58" },
  { name: "Notion", color: "#111111" },
  { name: "Shopify", color: "#5e8e3e" },
  { name: "Razorpay", color: "#0c2451" },
  { name: "Tally", color: "#1f5aa6" },
  { name: "Calendly", color: "#006bff" },
  { name: "Airtable", color: "#fcb400" },
  { name: "OpenAI", color: "#10a37f" },
  { name: "Claude", color: "#d97757" },
  { name: "Stripe", color: "#635bff" },
  { name: "Outlook", color: "#0078d4" },
  { name: "Trello", color: "#0079bf" },
];

/* "Trigger → action" recipes by team (Zapier-style use cases). */
export const RECIPES: { team: string; items: { when: string; then: string; saves: string }[] }[] = [
  {
    team: "Sales",
    items: [
      { when: "A lead fills your website form", then: "AI scores it, adds it to the CRM and pings the right rep", saves: "6 hrs / week" },
      { when: "A deal moves to 'Won'", then: "Invoice, welcome email and onboarding tasks go out", saves: "3 hrs / week" },
      { when: "A lead goes quiet for 5 days", then: "A personal follow-up is drafted for approval", saves: "4 hrs / week" },
    ],
  },
  {
    team: "Operations",
    items: [
      { when: "A new order comes in", then: "Stock is checked, the warehouse is told and the customer gets tracking", saves: "10 hrs / week" },
      { when: "A vendor sends an invoice", then: "Fields are read, matched to the PO and logged for approval", saves: "8 hrs / week" },
      { when: "It's Monday 9 am", then: "Last week's numbers land in your inbox as one clean report", saves: "2 hrs / week" },
    ],
  },
  {
    team: "Support",
    items: [
      { when: "A ticket arrives", then: "AI tags it, drafts a reply and routes urgent ones to a human", saves: "12 hrs / week" },
      { when: "A call is missed", then: "The caller gets a WhatsApp reply and a callback slot", saves: "5 hrs / week" },
      { when: "A customer leaves a bad review", then: "The team is alerted with order history attached", saves: "2 hrs / week" },
    ],
  },
  {
    team: "HR & Finance",
    items: [
      { when: "A candidate applies", then: "The CV is screened and an interview is booked", saves: "7 hrs / week" },
      { when: "An expense is submitted", then: "Receipts are checked against policy and filed", saves: "4 hrs / week" },
      { when: "A new hire's start date is set", then: "Accounts, laptop request and welcome pack are handled", saves: "3 hrs / week" },
    ],
  },
];

export const AUTOMATION_FAQ = [
  { q: "Placeholder: which tools do you use to build automations?", a: "Placeholder answer: n8n, Make, Zapier or custom code, picked for your stack, volume and budget." },
  { q: "Placeholder: who owns the workflows once they are built?", a: "Placeholder answer: you do. We hand over access, documentation and a walkthrough." },
  { q: "Placeholder: can automations use AI safely?", a: "Placeholder answer: covers human approval steps, logging and data handling." },
  { q: "Placeholder: what happens when something breaks?", a: "Placeholder answer: monitoring, alerts and support plans." },
];
