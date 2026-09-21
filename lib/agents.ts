// Agent catalogue shared by the home strip and /agents, plus the timing helpers
// that sync each transcript to its sample recording (public/recordings).

// A single spoken phrase in the recording's own language. `t` is when that
// phrase begins (seconds into the clip). Add a `t` to every cue you have a
// timestamp for; cues without one are spaced out automatically.
export type Cue = { t?: number; text: string; speaker?: "agent" | "user" };

export type AgentTemplate = {
  name: string;
  languages: string;
  desc: string;
  industries: string[];
  sample: string;
  transcript: Cue[];
};

export type TimedWord = { text: string; start: number; end: number; cueIndex: number };

// Turn a recording's timed cues into per-word timings so the on-screen script
// can highlight the exact word being spoken. A cue's `t` is when that phrase
// starts; its words are spread across the gap to the next cue (or the clip's
// end). Cues without a `t` are distributed across the clip by word count, so an
// untimed transcript still tracks playback, but less precisely than one with
// timestamps.
export function timedWords(cues: Cue[], duration: number): TimedWord[] {
  const dur = duration > 0 ? duration : 0;
  const counts = cues.map((c) => c.text.trim().split(/\s+/).filter(Boolean).length);
  const total = counts.reduce((a, b) => a + b, 0) || 1;

  // Resolve a start time for every cue: an explicit `t` wins, otherwise place
  // the cue proportionally to how many words come before it.
  let seen = 0;
  const starts = cues.map((c, i) => {
    const fallback = dur * (seen / total);
    seen += counts[i];
    return typeof c.t === "number" ? c.t : fallback;
  });
  // Keep starts non-decreasing so a stray timestamp can't rewind the highlight.
  for (let i = 1; i < starts.length; i++) {
    if (starts[i] < starts[i - 1]) starts[i] = starts[i - 1];
  }

  const words: TimedWord[] = [];
  cues.forEach((c, ci) => {
    const parts = c.text.trim().split(/\s+/).filter(Boolean);
    const segStart = starts[ci];
    const segEnd =
      ci + 1 < cues.length ? starts[ci + 1] : dur || segStart + parts.length * 0.4;
    const span = Math.max(0, segEnd - segStart);
    const n = parts.length;
    parts.forEach((w, wi) => {
      words.push({
        text: w,
        start: segStart + (n ? (span * wi) / n : 0),
        end: segStart + (n ? (span * (wi + 1)) / n : span),
        cueIndex: ci,
      });
    });
  });
  return words;
}

// Index of the word being spoken at `time` (−1 before the first word starts).
export function activeWordIndex(words: TimedWord[], time: number): number {
  let idx = -1;
  for (let i = 0; i < words.length; i++) {
    if (words[i].start <= time) idx = i;
    else break;
  }
  return idx;
}

export const INDUSTRIES = ["All", "Ecommerce", "EdTech", "HealthTech", "BFSI", "Hospitality", "Recruitment"];

export const AGENTS: AgentTemplate[] = [
  {
    name: "Customer Support Agent",
    languages: "en · hi",
    desc: "Answers every inbound call 24/7, FAQs, order status, triage and escalation, without hold music.",
    industries: ["Ecommerce", "BFSI", "Hospitality", "EdTech"],
    sample: "/recordings/customer-support.mp3",
    transcript: [
      { speaker: "agent", text: "Hello क्या मैं श्रुति जी से बात कर रही हूं?" },
      { speaker: "user", text: "जी बोलिए." },
      { speaker: "agent", text: "नमस्कार श्रुति जी. मैं से नेहा बोल रही हूं. यह call आपके order number के बारे में है. क्या आपसे दो minute बात हो सकती है?" },
      { speaker: "user", text: "जी बोलिए." },
      { speaker: "agent", text: "हमारे records में इस order की delivery fail दिख रही है. क्या delivery boy आपके address पर आया था?" },
      { speaker: "user", text: "हां वह आया था पर उस समय मैं घर पर नहीं थी." },
      { speaker: "agent", text: "Ok. आपको delivery किस date पर चाहिए?" },
      { speaker: "user", text: "परसों हो सकती है." },
      { speaker: "agent", text: "आपकी delivery परसों को कर दी जाएगी. क्या कुछ और मदद चाहिए?" },
      { speaker: "user", text: "नहीं, thank you." },
      { speaker: "agent", text: "Fiat से shopping करने के लिए शुक्रिया. आपका दिन शुभ हो." }
    ],
  },
  {
    name: "Cart Abandonment Agent",
    languages: "en · hi",
    desc: "Calls shoppers minutes after they abandon a cart, answers objections, applies coupons, and recovers the sale.",
    industries: ["Ecommerce"],
    sample: "/recordings/cart-recovery.mp3",
    transcript: [
      { speaker: "agent", text: "Hello, this is प्रिया calling from. Am I speaking with अनुराग?" },
      { speaker: "user", text: "Yes." },
      { speaker: "agent", text: "Great, thank you. Are you comfortable speaking in हिंदी or english?" },
      { speaker: "user", text: "हिंदी में बात" },
      { speaker: "agent", text: "करना, नमस्कार." },
      { speaker: "user", text: "ठीक है, हम हिंदी में बात करेंगे. मैंने देखा कि आपने smart wave light strip को website पर देखा था. क्या मैं आपको दो minute देने के लिए एक special offer बता सकती हूं?" },
      { speaker: "agent", text: "जी जी बताइए ना." },
      { speaker: "user", text: "Smart wave light strip पर दस percent off चल रहा है अभी. सिर्फ़ आज तक valid है. क्या आप interested हैं?" },
      { speaker: "agent", text: "हां ठीक है चलेगा." },
      { speaker: "user", text: "क्या आप अभी ख़रीदना चाहेंगे?" },
      { speaker: "agent", text: "अभी तो नहीं, मैं बाद में आपको बताता हूं." },
      { speaker: "user", text: "ठीक है, कोई बात नहीं. Same coupon base को portable fan या aquasense smart bottle पर भी लग सकता है. अगर आपको कभी ज़रूरत हो तो. क्या मैं आपको WhatsApp पर link भेज सकती हूं? जी जी भेज दीजिए." },
      { speaker: "agent", text: "बढ़िया. मैंने आपके लिए WhatsApp पर link भेजने का arrangement कर दिया है. बस कुछ ही minutes में मिल जाएगा. कुछ और मदद चाहिए? नहीं नहीं, thank you." },
      { speaker: "user", text: "धन्यवाद. आपका दिन शुभ हो." }
    ],
  },
  {
    name: "COD Confirmation Agent",
    languages: "en · hi",
    desc: "Confirms cash-on-delivery orders and handles last-mile logistics tasks, cutting RTO losses at scale.",
    industries: ["Ecommerce"],
    sample: "/recordings/cod.mp3",
    transcript: [
      { speaker: "agent", text: "Hello भव्या. My name is प्रिया and I am calling from." },
      { speaker: "user", text: "Can I have 2 minutes of your time?" },
      { speaker: "agent", text: "Yes." },
      { speaker: "user", text: "Before we begin would you like to continue this conversation in हिंदी or english?" },
      { speaker: "agent", text: "हिंदी." },
      { speaker: "user", text: "जी. Call आपके cash on delivery order को confirm करने के लिए है. जो आपने हाल ही में place थी. इसमें एक winter cap है और आपको delivery के time 05:50 rupees का payment करना होगा. Just to check, क्या आप यह delivery confirm करना चाहते हैं?" },
      { speaker: "agent", text: "हां." },
      { speaker: "user", text: "Alright, मैंने आपका order confirm कर दिया है जो कि दस दिनों में deliver हो जाएगी. Fiax के customer बनने के लिए thanks. अगर कोई और help चाहिए तो please contact ज़रूर करें. आपका दिन शुभ हो." }
    ],
  },
  {
    name: "Recruitment Agent",
    languages: "en · hi",
    desc: "Screens, interviews and shortlists candidates at scale, structured insights from every conversation.",
    industries: ["Recruitment", "EdTech"],
    sample: "/recordings/recruitment.mp3",
    transcript: [
      { speaker: "agent", text: "Hello अनुराग, hope you are doing great. Before continuing, are you comfortable continuing in हिंदी or english?" },
      { speaker: "user", text: "हिंदी में बात करना है मुझको." },
      { speaker: "agent", text: "React native developer role के लिए apply करने के लिए धन्यवाद." },
      { speaker: "user", text: "मैं आपके experience को बेहतर तरीके से समझने के लिए आपसे बात करना चाहती हूं. क्या अभी बात करने का सही समय है?" },
      { speaker: "agent", text: "जी जी बताइए ना." },
      { speaker: "user", text: "बढ़िया, चलिए शुरू करते हैं." },
      { speaker: "agent", text: "जी?" },
      { speaker: "user", text: "यह एक remote full time opportunity है. क्या यह आपके लिए ठीक रहेगा? हां हां बिल्कुल सही रहेगा." },
      { speaker: "agent", text: "समझ गई. आपका notice period कितना है?" },
      { speaker: "user", text: "Notice period मेरा पंद्रह दिन का है." },
      { speaker: "agent", text: "धन्यवाद. आपका current CTC क्या है और आपकी expected CTC कितनी है?" },
      { speaker: "user", text: "Current मेरा अभी सात लाख है और expect करूंगा मैं आठ लाख का." },
      { speaker: "agent", text: "बढ़िया, समझ गई. क्या आप किसी ऐसे project के बारे में बता सकते हैं जिसमें आपने React native का इस्तेमाल किया हो? उसमें आपकी key contributions" },
      { speaker: "user", text: "क्या थी और किन challenges का सामना करना पड़ा?" },
      { speaker: "agent", text: "Basically मैंने एक hospital management app बनाया था जिसमें मैंने" },
      { speaker: "user", text: "उसमें live updates रखे गए of beds और basically मुझे problems सबसे ज़्यादा live updates में ही हुई थी." },
      { speaker: "agent", text: "समझ गई. तो आपने hospital management app में live updates को implement करने में कुछ challenges का सामना किया, लेकिन आपने उसे कैसे resolve किया?" },
      { speaker: "user", text: "Basically मैंने React का use किया और काफ़ी सारे tools का use किया जिससे वह ठीक हुआ." },
      { speaker: "agent", text: "बढ़िया." },
      { speaker: "user", text: "अच्छा सुनने में आया कि आपने अपनी समस्या का समाधान निकाल लिया. अच्छा JavaScript ES 6 और types script के beach मुख्य अंतर क्या हैं?" },
      { speaker: "agent", text: "मुझे ज़्यादा तो नहीं पता पर इतना पता है कि types basically variables का type check करता है और JavaScript वह नहीं करता." },
      { speaker: "user", text: "ठीक है. आपको कुछ idea है कि types script में type checking का क्या महत्व है? एक और बात यह है कि types script में आप अपने code में type annotation जोड़ सकते हैं. जो कि आपके code को अधिक सुरक्षित और maintainable बनता है. बढ़िया. बातचीत ख़त्म करने से पहले क्या मैं जान सकती हूं कि आप इस समय किस company में हैं?" },
      { speaker: "agent", text: "CX में." },
      { speaker: "user", text: "सभी सवालों के जवाब देने के लिए धन्यवाद. हम आपके जवाब review करेंगे और अगर आप shortlist होते हैं तो हम जल्द ही आपसे संपर्क करेंगे." },
      { speaker: "agent", text: "ठीक है, thank you." },
      { speaker: "user", text: "धन्यवाद, आपका दिन शुभ हो." }
    ],
  },
  {
    name: "Collections Agent",
    languages: "en · hi",
    desc: "Runs polite, compliant payment reminder campaigns with promise-to-pay capture synced to your CRM.",
    industries: ["BFSI", "Ecommerce"],
    sample: "/recordings/collections.mp3",
    transcript: [
      { speaker: "agent", text: "Hello. Am I speaking with अनुराग?" },
      { speaker: "user", text: "Yes." },
      { speaker: "agent", text: "Hello अनुराग. This is मोनिका from Fiax credit card services. Do you have a minute to talk?" },
      { speaker: "user", text: "Yes." },
      { speaker: "agent", text: "So there's about 30000 rupees pending on your Phiaks card due in the next 2 days." },
      { speaker: "user", text: "Missing that means a late fee of around 750" },
      { speaker: "agent", text: "rupees plus interest. ऐसे or you looking to pay now or before the due date?" },
      { speaker: "user", text: "I will pay before the due date." },
      { speaker: "agent", text: "That's great to hear अनुराग. Want me to walk you through the repayment process now or are you comfortable doing it yourself before the due date?" },
      { speaker: "user", text: "No, I will complete it before the due date by myself only." },
      { speaker: "agent", text: "Sounds good अनुराग. 1 more thing. We've also got easy EMI options if that's ever useful. Interested? No no no no." },
      { speaker: "user", text: "Perfect. Thanks" },
      { speaker: "agent", text: "for your time. Remember," },
      { speaker: "user", text: "due date is in the next 2 days. Have a good 1." },
      { speaker: "agent", text: "That's it from my side. Thank you, and have a nice day." }
    ],
  },
  {
    name: "Appointment Agent",
    languages: "en · hi",
    desc: "Books, confirms and reschedules appointments, reduces no-shows for clinics, salons and campuses.",
    industries: ["HealthTech", "Hospitality", "EdTech"],
    sample: "/recordings/wedding.mp3",
    transcript: [
      { speaker: "agent", text: "Hi. This is माया from Feiax wedding venue services. Before we proceed, would you like to continue the conversation in English or हिंदी?" },
      { speaker: "user", text: "English." },
      { speaker: "agent", text: "Great. So how can I help you today in new booking, checking on an existing 1 or want to hear about our services?" },
      { speaker: "user", text: "I want to make a new booking." },
      { speaker: "agent", text: "What date or rough timing are you thinking of for the wedding?" },
      { speaker: "user", text: "So I am thinking the 7th of July around 7PM." },
      { speaker: "agent", text: "Got it. So July 7th around 7PM" },
      { speaker: "user", text: "and roughly how many guests are you expecting?" },
      { speaker: "agent", text: "707" },
      { speaker: "user", text: "hundred guests. Is this just a wedding day or are there other functions too, like महिंदी or संगीत?" },
      { speaker: "agent", text: "There'll be multiple functions held on the same day." },
      { speaker: "user", text: "So multiple functions all on July 7th. Any particular theme, decor style, or entertainment you have in mind?" },
      { speaker: "agent", text: "Yeah. It'll be a masculine team." },
      { speaker: "user", text: "So grand celebration with a large team involved. I'd love you to come see the venue in person. We're open 9 to 5 any day works." },
      { speaker: "agent", text: "Anything else I can help with?" },
      { speaker: "user", text: "Ok, can I come down next Thursday?" },
      { speaker: "agent", text: "Next Thursday works perfectly. Shall we say around 2PM? I'll make sure to have everything ready for you. Anything else I can help with?" },
      { speaker: "user", text: "That's it from my side. Thank you. Have a lovely day." }
    ],
  },
  {
    name: "Lead Qualification Agent",
    languages: "en · hi",
    desc: "Calls new leads instantly, scores intent, captures budget and timeline, and routes hot prospects to your team.",
    industries: ["BFSI", "EdTech", "Ecommerce"],
    sample: "/recordings/lead-qualification.mp3",
    transcript: [
      { speaker: "agent", text: "Hello. Am I speaking with भव्या?" },
      { speaker: "user", text: "Yes." },
      { speaker: "agent", text: "Certainly भव्या. I would just like to note down a couple of quick details. May I ask, have you completed your graduation?" },
      { speaker: "user", text: "Yeah, I have completed my graduation last year." },
      { speaker: "agent", text: "Noted. Thank you. And which stream of course have you graduated in?" },
      { speaker: "user", text: "Computer science." },
      { speaker: "agent", text: "Noted and 1 last thing, should you join CX business school, would you be requiring the hostel facility?" },
      { speaker: "user", text: "No." },
      { speaker: "agent", text: "Noted. Thank you for your time today. Our senior counselor will reach out to you regarding more information. Have a nice day ahead." }
    ],
  },
  {
    name: "Outbound Sales Agent",
    languages: "en · hi",
    desc: "Runs full outbound campaigns, pitches offers, handles objections and books demos straight into your calendar.",
    industries: ["Ecommerce", "BFSI", "EdTech"],
    sample: "/recordings/weirdo.mp3",
    transcript: [
      { speaker: "agent", text: "Hello." },
      { speaker: "user", text: "नमस्ते." },
      { speaker: "agent", text: "मैं नेहा से" },
      { speaker: "user", text: "आपकी किस तरह मदद कर सकती हूं?" },
      { speaker: "agent", text: "मुझे अपना order reschedule करवाना है." },
      { speaker: "user", text: "समझ गई जी. क्या मैं आपका order number जान सकती हूं?" },
      { speaker: "agent", text: "एक" },
      { speaker: "user", text: "minute." },
      { speaker: "agent", text: "ठीक है." },
      { speaker: "user", text: "आपका order number क्या है?" },
      { speaker: "agent", text: "A1234." },
      { speaker: "user", text: "ठीक है. आपका order number 1234" },
      { speaker: "agent", text: "है. क्या आपको पता है कि आपका order कितने दिन पहले deliver होने वाला था?" },
      { speaker: "user", text: "मुझे याद नहीं है." },
      { speaker: "agent", text: "समझ गई. क्या आपको कोई delivery attempt या notification मिली थी?" },
      { speaker: "user", text: "नहीं." },
      { speaker: "agent", text: "ठीक है. तो शायद आपका order गलत तरीके से mark हो गया है. क्या आप अपना order reschedule करना चाहते हैं या cancel करना चाहते हैं? मुझे reschedule करना है." },
      { speaker: "user", text: "जी बिल्कुल. आप order reschedule कर सकते हैं. आप किस दिन reschedule करना चाहते हैं?" },
      { speaker: "agent", text: "कल हो सकता है." },
      { speaker: "user", text: "ठीक है. आपका order कल के लिए reschedule कर दिया गया है." },
      { speaker: "agent", text: "Thank you." },
      { speaker: "user", text: "Viedo से shopping करने के लिए धन्यवाद. आपका दिन शुभ हो." }
    ],
  },
  {
    name: "Feedback & Survey Agent",
    languages: "en · hi",
    desc: "Collects post-purchase feedback and CSAT surveys at scale, tagging sentiment and flagging detractors in real time.",
    industries: ["Ecommerce", "Hospitality", "HealthTech"],
    sample: "/recordings/poker.mp3",
    transcript: [
      { speaker: "agent", text: "Hello. Am I speaking with प्रशांत?" },
      { speaker: "user", text: "Yes." },
      { speaker: "agent", text: "Hello प्रशांत. This is अंजलि from Feiax Spoker. Is now a good time to talk?" },
      { speaker: "user", text: "Yeah. Go ahead." },
      { speaker: "agent", text: "Thank you. You've been a regular player with us, and I have a quick survey that will take only 2 to 3 minutes." },
      { speaker: "user", text: "So," },
      { speaker: "agent", text: "is that ok?" },
      { speaker: "user", text: "Yeah, sure." },
      { speaker: "agent", text: "Is सियाक's poker app stop real money games and you could only play free games with friends or on leader boards, would you still use the app?" },
      { speaker: "user", text: "Yeah, most probably." },
      { speaker: "agent", text: "Got it. Moving on to the next question. Would you be interested in offline poker tournaments held in your city or area?" },
      { speaker: "user", text: "Yeah, maybe." },
      { speaker: "agent", text: "Ok and moving on to the next question. May I please know your city or area to help us plan these events better?" },
      { speaker: "user", text: "So, I'm based in Mumbai." },
      { speaker: "agent", text: "That's it from my side. Thank you and have a nice day." }
    ],
  },
];
