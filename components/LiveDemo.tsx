"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SectionHeading, Reveal } from "./primitives";

const DEFAULT_SAMPLE_SRC = "/sample-call.mp3";

type Line = { who: "agent" | "caller"; text: string };
type Field = { label: string; value: string };
type Stat = { v: string; k: string };

type Call = {
  name: string;
  meta: string;
  src: string;
  bookingTitle: string;
  confirmation: string;
  transcript: Line[];
  booking: Field[];
  summaryStats: Stat[];
  summary: string;
};

const CALLS: Call[] = [
  {
    name: "Real Estate Enquiry",
    meta: "2:34 · Inbound · Lead Qualified",
    src: DEFAULT_SAMPLE_SRC,
    bookingTitle: "Site visit booked",
    confirmation: "✓ Confirmation sent to amit.patel@email.com",
    transcript: [
      { who: "agent", text: "Good afternoon! Thank you for calling Prestige Estates. My name is Maya. How can I assist you today?" },
      { who: "caller", text: "Hi, I saw your ad for the 3BHK in Whitefield. Is it still available?" },
      { who: "agent", text: "Yes, it's available! The 3BHK in our Lakewood project starts at ₹1.2 Cr. Would you like to schedule a site visit?" },
      { who: "caller", text: "Sure, I'm free this Saturday. Afternoon works best." },
      { who: "agent", text: "I've blocked Saturday at 2:00 PM for you. Could I get your name and email to send the confirmation?" },
      { who: "caller", text: "Amit Patel. amit.patel@email.com" },
      { who: "agent", text: "Done, Amit. Your visit is confirmed for Saturday, 2 PM at Lakewood, Whitefield. You'll receive a confirmation shortly. Anything else I can help with?" },
    ],
    booking: [
      { label: "Name", value: "Amit Patel" },
      { label: "Property", value: "3BHK Lakewood" },
      { label: "Date", value: "Saturday, 2:00 PM" },
      { label: "Type", value: "Site Visit" },
    ],
    summaryStats: [
      { v: "2:34", k: "Duration" },
      { v: "92%", k: "Confidence" },
      { v: "High", k: "Intent" },
    ],
    summary:
      "Caller enquired about a 3BHK in Whitefield (Lakewood project, ₹1.2 Cr). Expressed strong interest and booked a site visit for Saturday 2 PM. Contact: Amit Patel, amit.patel@email.com. Recommended priority follow-up with pricing sheet.",
  },
  {
    name: "Clinic Appointment",
    meta: "1:48 · Inbound · Booked",
    src: DEFAULT_SAMPLE_SRC,
    bookingTitle: "Appointment booked",
    confirmation: "✓ Reminder SMS scheduled for Priya Nair",
    transcript: [
      { who: "agent", text: "Good afternoon, thank you for calling SureCare Clinics. This is Anaya. How can I help you today?" },
      { who: "caller", text: "Hi, I'd like to book an appointment with Dr. Mehta for a general check-up." },
      { who: "agent", text: "Of course! Dr. Mehta has openings this Thursday at 11:00 AM or 4:00 PM. Which works better for you?" },
      { who: "caller", text: "Thursday at 11 AM is perfect." },
      { who: "agent", text: "Great. May I have your name and phone number to confirm the booking?" },
      { who: "caller", text: "Priya Nair, 98201 45032." },
      { who: "agent", text: "Thank you, Priya. Your appointment with Dr. Mehta is confirmed for Thursday at 11 AM. You'll get an SMS reminder the day before. Anything else I can help with?" },
    ],
    booking: [
      { label: "Name", value: "Priya Nair" },
      { label: "Doctor", value: "Dr. Mehta" },
      { label: "Date", value: "Thursday, 11:00 AM" },
      { label: "Type", value: "General Check-up" },
    ],
    summaryStats: [
      { v: "1:48", k: "Duration" },
      { v: "95%", k: "Confidence" },
      { v: "High", k: "Intent" },
    ],
    summary:
      "Caller requested a general check-up with Dr. Mehta. Booked the Thursday 11 AM slot. Contact: Priya Nair, 98201 45032. SMS reminder scheduled for the day before. Recommended sending pre-visit instructions.",
  },
];

function RecordingRow({
  name,
  meta,
  src,
  isActive,
  isSelected,
  onActivate,
}: {
  name: string;
  meta: string;
  src: string;
  isActive: boolean;
  isSelected: boolean;
  onActivate: (name: string | null) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Only one recording plays at a time, pause this row when another takes over.
  useEffect(() => {
    const audio = audioRef.current;
    if (audio && !isActive && !audio.paused) audio.pause();
  }, [isActive]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      onActivate(name);
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }

  return (
    <button
      type="button"
      onClick={togglePlay}
      aria-label={playing ? `Pause ${name}` : `Play ${name}`}
      aria-pressed={playing}
      className={`flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors ${
        isSelected
          ? "border-blue/40 bg-blue/5"
          : "border-line bg-surface-2 hover:border-line-bright"
      }`}
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-blue text-white">
        <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
          {playing ? (
            <path d="M3 1.5h3v11H3v-11Zm5 0h3v11H8v-11Z" />
          ) : (
            <path d="M3 1.5v11l9-5.5-9-5.5Z" />
          )}
        </svg>
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium text-cream">{name}</span>
        <span className="block font-mono text-[10px] text-faint">{meta}</span>
      </span>
      <span className="font-mono text-[10px] tracking-[0.12em] text-blue uppercase">
        {playing ? "Playing" : "Listen"} →
      </span>
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          onActivate(null);
        }}
      />
    </button>
  );
}

export function LiveDemo() {
  const [activeName, setActiveName] = useState<string | null>(null);
  // Which call's transcript + outcome the panels show. Switches when a
  // different recording is played.
  const [selected, setSelected] = useState(0);

  function handleActivate(name: string | null) {
    setActiveName(name);
    if (name) {
      const idx = CALLS.findIndex((c) => c.name === name);
      if (idx >= 0) setSelected(idx);
    }
  }

  const call = CALLS[selected];

  return (
    <section id="live-demo" className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <SectionHeading
        index="06"
        label="Live Demo"
        rightMeta="Real script · real outcome"
        title={
          <>
            See a real call. <span className="underline-bar">Start to finish.</span>
          </>
        }
        copy="This is what a Fiaxe agent sounds like on a live call. Play a recording below to switch the transcript and outcome, real script, real scenario, real outcome."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {/* transcript */}
        <Reveal className="rounded-2xl border border-line bg-ink shadow-sm">
          <div className="flex h-full flex-col p-7">
            <div className="mb-5 flex items-center justify-between">
              <p className="mono-label">› Live transcript</p>
              <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
                {call.name}
              </span>
            </div>
            <div key={selected} className="flex flex-col gap-3">
              {call.transcript.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${line.who === "agent" ? "flex-row-reverse text-right" : ""}`}
                >
                  <span
                    className={`mt-1 shrink-0 font-mono text-[9px] tracking-[0.1em] uppercase ${
                      line.who === "agent" ? "text-blue" : "text-faint"
                    }`}
                  >
                    {line.who === "agent" ? "Agent" : "Caller"}
                  </span>
                  <span
                    className={`max-w-[80%] rounded-md border px-3 py-2 text-[13px] leading-snug ${
                      line.who === "agent"
                        ? "border-blue/20 bg-blue/5 text-cream"
                        : "border-line bg-surface-2 text-muted"
                    }`}
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>

            {/* sample recordings, play right here on the page */}
            <p className="mono-label mt-8 mb-3">› Sample recordings</p>
            <div className="space-y-2">
              {CALLS.map((r, i) => (
                <RecordingRow
                  key={r.name}
                  name={r.name}
                  meta={r.meta}
                  src={r.src}
                  isActive={activeName === r.name}
                  isSelected={selected === i}
                  onActivate={handleActivate}
                />
              ))}
            </div>
            <Link
              href="/agents"
              className="mt-3 flex items-center justify-center gap-2 rounded-md border border-line-bright px-3 py-2.5 font-mono text-[11px] font-medium tracking-[0.12em] text-cream uppercase transition-colors hover:border-cream"
            >
              Listen to more
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Reveal>

        {/* booking + summary */}
        <Reveal className="rounded-2xl border border-line bg-ink shadow-sm" delay={0.08}>
          <div key={selected} className="flex h-full flex-col gap-4 p-7">
            {/* booking */}
            <div className="rounded-lg border border-line p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-medium tracking-tight">{call.bookingTitle}</p>
                <span className="font-mono text-[9px] tracking-[0.1em] text-green-600 uppercase">
                  Auto-scheduled
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {call.booking.map((b) => (
                  <div key={b.label} className="rounded-md border border-line bg-surface-2 px-3 py-2">
                    <p className="font-mono text-[9px] tracking-[0.1em] text-faint uppercase">{b.label}</p>
                    <p className="mt-0.5 text-[13px] font-medium text-cream">{b.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-md border border-line bg-surface-2 px-3 py-2 text-center text-[12px] text-muted">
                {call.confirmation}
              </p>
            </div>

            {/* AI summary */}
            <div className="rounded-lg border border-line p-5">
              <div className="flex items-center justify-between">
                <p className="font-display text-base font-medium tracking-tight">AI call summary</p>
                <span className="font-mono text-[9px] tracking-[0.1em] text-blue uppercase">
                  Auto-generated
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {call.summaryStats.map((s) => (
                  <div key={s.k} className="rounded-md border border-line bg-surface-2 px-2 py-3 text-center">
                    <p className="font-display text-lg font-medium tracking-tight text-blue">{s.v}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-faint">{s.k}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 rounded-md border border-line bg-surface-2 px-3 py-3 text-[12.5px] leading-relaxed text-muted">
                {call.summary}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
