/* Content for the Voice AI product page (app/products/voice-ai). */

export const VOICE_FAQS: { q: string; a: string }[] = [
  {
    q: "Are these custom-built, or just templates?",
    a: "Every Fiaxe agent is built from scratch around your scripts, workflows, and tone of voice. No drag-and-drop builders, no generic bot, it's shaped to how your business actually runs.",
  },
  {
    q: "How long until my agent is live?",
    a: "Most agents go live in around a week, from the first discovery call through workflow mapping, build, testing, and deployment. Timelines flex with complexity, and we tell you upfront.",
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
