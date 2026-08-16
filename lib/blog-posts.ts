export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string; // ISO
  readTime: string;
  image?: string;
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "missed-calls-are-costing-you-more-than-you-think",
    title: "Missed Calls Are Costing Indian Businesses More Than They Think",
    excerpt:
      "Every unanswered ring is a lead going to a competitor. Here's what the data inside our own customer base says about the true cost of a missed call.",
    category: "Industry",
    date: "2026-06-02",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    content: [
      "Across the businesses we work with, one pattern shows up again and again: the phone rings the most exactly when there's no one free to answer it. Lunch hour, closing time, the ten minutes after a marketing push lands. Those are also, reliably, the moments a lead is most likely to hang up and call the next name on their list.",
      "We looked at call logs across real estate, healthcare, and education customers before they went live with a Fiaxe agent. The pattern was consistent: 20 to 35% of inbound calls went unanswered during business hours, and after-hours volume was almost entirely missed. For a business paying to generate those calls through ads, referrals, or walk-in interest, that's a straight leak in the funnel, not a soft one.",
      "The instinct is to treat this as a staffing problem, hire more front desk, add a shift, rotate lunch breaks. That helps at the margins, but it doesn't fix the structural issue: call volume is spiky and human capacity is flat. You either overstaff for the peak and pay for idle time, or understaff for the average and miss the peak.",
      "A voice agent doesn't have that trade-off. It answers the first call and the fiftieth call in the same minute the same way, at 2pm and at 2am. That's not a replacement for your team, it's the layer that makes sure every caller gets a real conversation before your team ever needs to step in.",
      "The businesses that saw the biggest jump after going live weren't the ones with the flashiest script, they were the ones that simply stopped losing calls at the door. Answering is the first job. Everything else, qualifying, booking, routing, is easier once that's solved.",
    ],
  },
  {
    slug: "inside-a-fiaxe-voice-agent",
    title: "Inside a Fiaxe Voice Agent: How It Actually Holds a Call",
    excerpt:
      "A look at what happens between 'hello' and a booked appointment, and why sounding human is the easy part.",
    category: "Product",
    date: "2026-05-19",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
    content: [
      "People assume the hard part of a voice agent is the voice. Getting speech to sound natural in Hindi, English, and half a dozen regional languages is genuinely hard, but it's also the part that's improved the fastest over the last two years. The part that's still hard, and the part we spend most of our engineering time on, is holding the thread of a real conversation.",
      "A phone call doesn't move in a straight line. Someone calls about a 2BHK, mentions their budget halfway through, changes their mind about the locality, then asks if site visits happen on Sundays. A script-based IVR falls apart the moment a caller says something it didn't anticipate. A Fiaxe agent is built to track intent across the whole call, not just the current turn, so a detail mentioned two minutes ago still matters when it's relevant again.",
      "Every agent we build starts with the same question: what does a good human agent on this specific desk actually do? For a real estate enquiry line, that means qualifying budget and timeline before offering a site visit slot. For a clinic, it means triaging urgency before booking. We encode that judgment into the agent, not a generic script, so it asks the questions your best front-desk person would ask, in the order they'd ask them.",
      "Underneath, every call produces a transcript, a structured summary, and, where it's warranted, a CRM update, a calendar hold, or a handoff to a human. The agent's job isn't to have a nice chat, it's to move the caller one step closer to booked, qualified, or resolved, and to leave a clean record behind so your team never has to ask 'wait, what did they say?'",
      "The best compliment we get from customers isn't 'it sounds real', it's 'my callers didn't realise until the end, and even then they didn't mind'. That's the bar: a conversation good enough that being efficient and being human don't feel like a trade-off.",
    ],
  },
  {
    slug: "multilingual-by-default",
    title: "Multilingual by Default: Building Voice AI for India's Language Reality",
    excerpt:
      "In most markets 'multilingual support' is a nice-to-have. In India, a voice agent that only speaks English isn't a smaller product, it's a different one.",
    category: "Product",
    date: "2026-04-27",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800&q=80",
    content: [
      "A customer once told us, half-joking, that their old IVR was technically bilingual: English, and silence. That's the failure mode we designed against from day one. If an agent can't follow a caller who opens in Hindi, drifts into English for a phone number, and finishes in Hinglish asking 'kal aa sakta hoon kya', it hasn't solved the problem, it's just moved it.",
      "Code-switching mid-sentence is normal, not an edge case, across most of the calls we handle. Our agents are built to track language at the utterance level, not lock into one language for the whole call, so a caller can move fluidly and the agent moves with them without asking them to repeat themselves in 'proper' Hindi or 'proper' English.",
      "This matters most exactly where it's easiest to overlook: a collections call in Tier 2 and Tier 3 cities, a patient booking a follow-up in their home language, a parent asking about school fees in the language they're most comfortable negotiating in. Get the language wrong and you don't just sound foreign, you lose the qualifying details because the caller switches to guarded, minimal answers.",
      "We treat language coverage as a product requirement, not a stretch goal, and we test new agents against real regional call samples before they go live, not just clean, single-language scripts. A voice agent for an Indian business has to meet the caller in whatever language they actually show up in, because that's the only version of 'understanding the customer' that counts on a phone call.",
    ],
  },
  {
    slug: "from-lead-to-booking-real-estate-playbook",
    title: "From Lead to Booking: How Real Estate Teams Qualify Buyers with Voice AI",
    excerpt:
      "A practical look at the qualification flow behind our real estate agents, and why the order of questions matters more than the questions themselves.",
    category: "Playbook",
    date: "2026-04-08",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    content: [
      "Most real estate enquiry lines ask the same handful of questions eventually, budget, locality, timeline, configuration. What separates a call that converts from one that doesn't is usually the order those questions get asked in, and whether the caller feels like they're being qualified or being helped.",
      "Our real estate agents lead with the caller's stated interest, the project or listing they called about, before asking anything that sounds like a filter. Budget comes after locality, not before, because leading with budget reads as a sales gate and cools the conversation down. By the time the agent asks about timeline, the caller has already answered three questions that felt like they were about the property, not about qualification.",
      "The agent is also built to recognise a 'not yet' answer and route accordingly instead of pushing for a booking anyway. A caller six months out from buying gets added to a nurture sequence with a lighter follow-up cadence. A caller who's ready this week gets offered site visit slots in the same call. Treating every lead the same, chasing an immediate booking regardless of intent, is what burns trust with genuinely warm leads.",
      "One customer, a multi-project developer, told us the biggest shift wasn't the volume of site visits booked, it was that their sales team stopped wasting the first five minutes of every callback re-qualifying a lead the agent had already qualified cleanly. The transcript and summary were already in the CRM, timeline, budget band, preferred locality, so the human conversation could start at 'let's find you a slot' instead of 'so tell me what you're looking for'.",
      "The lesson generalises past real estate: a voice agent that qualifies well doesn't just fill a calendar, it hands your team a warmer, better-documented lead than most inbound calls ever produced before.",
    ],
  },
  {
    slug: "collections-calls-that-dont-annoy-customers",
    title: "Collections Calls That Don't Annoy Customers: A Playbook",
    excerpt:
      "Reminder calls have a bad reputation for a reason. Here's how we designed ours to recover more without sounding like a warning shot.",
    category: "Playbook",
    date: "2026-03-22",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800&q=80",
    content: [
      "Nobody enjoys getting a payment reminder call, but there's a wide gap between a reminder that gets a promise-to-pay and one that gets hung up on. Tone and timing do most of the work, more than the script itself.",
      "We start every collections agent with the assumption that the customer usually intends to pay, they've just lost track, or a payment failed silently, or they're waiting on their own incoming payment. The agent opens by stating the fact plainly, amount, due date, without the loaded language that reads as a threat. That framing alone changes how the rest of the call goes.",
      "Language and channel choice matter as much as wording. A soft reminder in the customer's preferred language, at a reasonable hour, with an easy way to commit to a date, converts a promise-to-pay far more often than a stern call in a language the customer is less comfortable negotiating in. Every promise the agent captures is logged and synced back automatically, so a customer who commits to Friday isn't called again on Wednesday by mistake.",
      "We also built in a clear ceiling: the agent recognises hardship signals, a job loss, a medical situation, mentioned mid-call, and routes those calls to a human rather than continuing down a standard script. Recovery rate matters, but so does not running an automated system that can't recognise when a human conversation is the right next step.",
      "Customers running this at scale have told us the biggest surprise wasn't the lift in recovery, it was the drop in complaints. A polite, well-timed, correctly-languaged reminder just doesn't generate the same friction a rushed human call script often does under pressure.",
    ],
  },
  {
    slug: "what-changes-when-voice-ai-is-wired-into-your-crm",
    title: "What Actually Changes When Voice AI Is Wired Into Your CRM",
    excerpt:
      "The call is only half the job. The other half is what happens the second it ends, and that's where most voice AI pilots quietly fail.",
    category: "Product",
    date: "2026-03-02",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
    content: [
      "A voice agent that has a great conversation and then leaves no trace anywhere is, from an operations standpoint, barely better than a great conversation that never happened. The value of the call only compounds if what was said on it becomes usable data the moment the call ends.",
      "Every Fiaxe agent writes back to your CRM automatically: a transcript, a structured summary, and whatever fields your team actually works from, lead status, qualification details, next action, appointment time. No one on your team should have to listen to a recording to find out what happened on a call that already ended an hour ago.",
      "This is also where a lot of voice AI pilots quietly fail. The agent itself works fine on a demo call, but the output lands in a dashboard nobody checks, disconnected from the CRM the sales or support team actually lives in. The integration isn't a nice-to-have bolt-on, it's the difference between a novelty and a system your team relies on daily.",
      "We built Fiaxe CRM-first for that reason: agents plug into the pipelines, statuses, and fields you already use, so a booked call shows up as a booked appointment on the same calendar your team checks anyway, and a qualified lead shows up with the same fields a human rep would have filled in. The agent's output should look like it came from your best rep, not from a separate system your team has to remember to check.",
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
