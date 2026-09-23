/* Content for the Voice AI product page (app/products/voice-ai). */

export const VOICE_FAQS: { q: string; a: string }[] = [
  {
    q: "Are these custom-built, or just templates?",
    a: "Every Fiaxe agent is built from scratch around your scripts, workflows, and tone of voice. No drag-and-drop builders, no generic bot, it's shaped to how your business actually runs.",
  },
  {
    q: "How long until my agent is live?",
    a: "Most agents go live in about two weeks, from the first discovery call through workflow mapping, build, testing, and deployment. Timelines flex with complexity, and we tell you upfront.",
  },
  {
    q: "Do you handle the setup, or do I?",
    a: "It's fully done-for-you. We build, integrate, test, and launch the agent, then keep monitoring and improving it as your business evolves. You don't need to learn a platform.",
  },
  {
    q: "Can the agent speak Indian languages?",
    a: "Yes, Hindi, English, and major regional languages, with natural pacing and a warm tone so customers don't feel like they're talking to a robot.",
  },
  {
    q: "What happens when a call needs a human?",
    a: "The agent detects when a human touch is needed and transfers the call seamlessly, with the full context of the conversation passed along to your team.",
  },
  {
    q: "Does it work with my CRM and tools?",
    a: "Fiaxe includes its own purpose-built CRM, and integrates with the tools you already use, Google Calendar, WhatsApp, Salesforce, HubSpot, and more.",
  },
  {
    q: "What do I get from each call?",
    a: "Every call is auto-logged with a recording, transcript, AI summary, intent score, and outcome, flowing straight into your CRM with no manual data entry.",
  },
  {
    q: "How much does it cost?",
    a: "Because every agent is custom-built, pricing depends on your use case and call volume. Book a discovery call and we'll scope a clear, custom quote, no obligation.",
  },
];

export const LANGUAGES = [
  "English (India)", "Hindi", "Hinglish", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi",
  "Gujarati", "Bengali", "Punjabi", "Odia", "Assamese", "Urdu", "English (US)", "English (UK)",
  "Arabic", "Spanish", "French", "German", "Portuguese", "Italian", "Indonesian", "Japanese",
  "Korean", "Mandarin", "Russian", "Turkish",
];

export const USE_CASES = [
  { name: "Inbound reception", does: "Answers every call, handles FAQs and routes the rest", result: "0 missed calls" },
  { name: "Lead qualification", does: "Asks your questions, scores intent, books the hot ones", result: "Only warm leads reach sales" },
  { name: "Appointment booking", does: "Books, confirms and reschedules into your calendar", result: "Fewer no-shows" },
  { name: "Customer support", does: "Order status, returns and common requests, no hold time", result: "Placeholder: 70% resolved on call" },
  { name: "Reminders & collections", does: "Payment, renewal and visit reminders at scale", result: "Placeholder: faster collections" },
  { name: "Outbound campaigns", does: "Re-engagement, surveys and cart recovery calls", result: "Placeholder: 3x reach per rupee" },
];

/* Fiaxe agent vs the usual alternatives. true / false / text */
export const COMPARISON: { row: string; fiaxe: string | boolean; ivr: string | boolean; team: string | boolean }[] = [
  { row: "Answers 24/7", fiaxe: true, ivr: true, team: false },
  { row: "Understands natural speech", fiaxe: true, ivr: false, team: true },
  { row: "Speaks 28+ languages", fiaxe: true, ivr: false, team: "Limited" },
  { row: "Handles 100s of calls at once", fiaxe: true, ivr: true, team: false },
  { row: "Books, updates CRM, sends WhatsApp", fiaxe: true, ivr: false, team: "Manually" },
  { row: "Full transcript + summary per call", fiaxe: true, ivr: false, team: false },
  { row: "Cost per call", fiaxe: "Low", ivr: "Low", team: "High" },
];

export const VOICE_STEPS = [
  { title: "Discovery", meta: "Day 1", copy: "A 30-minute chat about how calls are handled today and where leads slip." },
  { title: "Call mapping", meta: "Day 2–3", copy: "We map every kind of call and decide exactly what should happen on each." },
  { title: "Build", meta: "Day 4–7", copy: "Your agent, trained on your scripts, tone and edge cases. Never a template." },
  { title: "Test together", meta: "Day 8–10", copy: "Real practice calls, tuned until it sounds natural and you're confident." },
  { title: "Go live", meta: "Day 11–14", copy: "Wired to your number, calendar and tools, then switched on. We keep improving it." },
];

/* Hero call console: real recordings, the transcript they caption from
   (lib/agents, by agent name) and the fields the agent fills in as the call
   goes. `at` is how far through the clip (0-1) a field gets captured. */
export type ConsoleCall = {
  label: string;
  agent: string;
  src: string;
  direction: "Inbound" | "Outbound";
  lang: string;
  fields: { k: string; v: string; at: number }[];
  outcome: string;
};

export const CONSOLE_CALLS: ConsoleCall[] = [
  {
    label: "Lead qualification",
    agent: "Lead Qualification Agent",
    src: "/recordings/lead-qualification.mp3",
    direction: "Outbound",
    lang: "English",
    fields: [
      { k: "Lead", v: "Bhavya", at: 0.08 },
      { k: "Graduated", v: "Yes, last year", at: 0.38 },
      { k: "Stream", v: "Computer science", at: 0.55 },
      { k: "Hostel", v: "Not needed", at: 0.78 },
    ],
    outcome: "Qualified · counsellor callback booked",
  },
  {
    label: "Delivery support",
    agent: "Customer Support Agent",
    src: "/recordings/customer-support.mp3",
    direction: "Outbound",
    lang: "Hindi",
    fields: [
      { k: "Customer", v: "Shruti", at: 0.1 },
      { k: "Issue", v: "Failed delivery", at: 0.42 },
      { k: "Reason", v: "Not home at the time", at: 0.58 },
      { k: "New date", v: "Day after tomorrow", at: 0.78 },
    ],
    outcome: "Delivery rescheduled · CRM updated",
  },
  {
    label: "Cart recovery",
    agent: "Cart Abandonment Agent",
    src: "/recordings/cart-recovery.mp3",
    direction: "Outbound",
    lang: "English → Hindi",
    fields: [
      { k: "Shopper", v: "Anurag", at: 0.06 },
      { k: "Language", v: "Switched to Hindi", at: 0.2 },
      { k: "Offer", v: "10% off, today only", at: 0.5 },
      { k: "Follow-up", v: "WhatsApp link", at: 0.82 },
    ],
    outcome: "Link sent on WhatsApp · retry in 24h",
  },
  {
    label: "Collections",
    agent: "Collections Agent",
    src: "/recordings/collections.mp3",
    direction: "Outbound",
    lang: "English + Hindi",
    fields: [
      { k: "Customer", v: "Anurag", at: 0.1 },
      { k: "Amount due", v: "₹30,000 in 2 days", at: 0.32 },
      { k: "Promise to pay", v: "Before due date", at: 0.52 },
      { k: "EMI offer", v: "Declined", at: 0.78 },
    ],
    outcome: "Promise to pay logged · reminder set",
  },
];

/* Use-case switchboard: a short, clean sample exchange for each */
export const SWITCHBOARD = [
  {
    name: "Inbound reception",
    direction: "Inbound",
    does: "Picks up on the first ring, day or night. Answers questions, takes messages and puts the right calls through to your team.",
    lines: [
      { who: "caller", text: "Hi, are you open on Sunday?" },
      { who: "agent", text: "We are, from 10 to 6. Would you like me to book you a slot?" },
      { who: "caller", text: "Yes, around noon." },
    ],
    stat: "0",
    statLabel: "missed calls after go-live",
  },
  {
    name: "Lead qualification",
    direction: "Outbound",
    does: "Calls every new lead within a minute, asks your questions, scores intent and books the hot ones straight into a rep's calendar.",
    lines: [
      { who: "agent", text: "You enquired about the 3BHK in Whitefield. What budget are you working with?" },
      { who: "caller", text: "Around 1.2 crore." },
      { who: "agent", text: "That works. Can I book a site visit for Saturday?" },
    ],
    stat: "<60s",
    statLabel: "from form fill to first call",
  },
  {
    name: "Appointment booking",
    direction: "Inbound + outbound",
    does: "Books, confirms and reschedules into your calendar on the call, then sends reminders so people actually show up.",
    lines: [
      { who: "caller", text: "Can I move my Thursday appointment?" },
      { who: "agent", text: "Of course. Dr. Mehta is free Friday at 11 or 4. Which suits you?" },
      { who: "caller", text: "Friday at 11." },
    ],
    stat: "Fewer",
    statLabel: "no-shows with automatic reminders",
  },
  {
    name: "Customer support",
    direction: "Inbound",
    does: "Order status, returns, refunds and the questions you get every day, handled with no hold music. Hard cases go to a human with full context.",
    lines: [
      { who: "caller", text: "Where is my order? It was due yesterday." },
      { who: "agent", text: "I can see it's out for delivery and should reach you by 6 PM today." },
      { who: "caller", text: "Great, thanks." },
    ],
    stat: "Placeholder: 70%",
    statLabel: "of calls resolved without a human",
  },
  {
    name: "Reminders & collections",
    direction: "Outbound",
    does: "Polite, compliant payment and renewal reminders at scale. Captures promise-to-pay dates and syncs them to your CRM.",
    lines: [
      { who: "agent", text: "Your card payment of ₹30,000 is due in two days. Will you pay before then?" },
      { who: "caller", text: "Yes, I'll pay tomorrow." },
      { who: "agent", text: "Noted. I'll send the payment link on WhatsApp." },
    ],
    stat: "Placeholder: 2x",
    statLabel: "faster collections",
  },
  {
    name: "Outbound campaigns",
    direction: "Outbound",
    does: "Re-engagement, surveys, COD confirmation and cart recovery. Hundreds of calls at once, each one a real conversation.",
    lines: [
      { who: "agent", text: "You left a light strip in your cart. There's 10% off if you order today." },
      { who: "caller", text: "Send me the link, I'll check later." },
      { who: "agent", text: "Done, it's on your WhatsApp now." },
    ],
    stat: "Placeholder: 3x",
    statLabel: "reach per rupee vs a call team",
  },
] as const;

/* "Hello" in the languages the agents speak, for the rotating greeting */
export const GREETINGS = [
  { word: "Namaste", lang: "Hindi" },
  { word: "வணக்கம்", lang: "Tamil" },
  { word: "Hello", lang: "English" },
  { word: "నమస్కారం", lang: "Telugu" },
  { word: "ನಮಸ್ಕಾರ", lang: "Kannada" },
  { word: "नमस्कार", lang: "Marathi" },
  { word: "নমস্কার", lang: "Bengali" },
  { word: "નમસ્તે", lang: "Gujarati" },
  { word: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", lang: "Punjabi" },
  { word: "നമസ്കാരം", lang: "Malayalam" },
  { word: "مرحبا", lang: "Arabic" },
  { word: "Hola", lang: "Spanish" },
];
