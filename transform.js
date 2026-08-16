const fs = require('fs');
const parsed = JSON.parse(fs.readFileSync('parsed_transcripts.json', 'utf-8'));
const agentsFile = fs.readFileSync('components/Agents.tsx', 'utf-8');

const mapping = {
  'Customer Support Agent': 'Copy of fiaxe customer support_transcript.txt',
  'Cart Abandonment Agent': 'Copy of cart recovery_transcript.txt',
  'COD Confirmation Agent': 'Copy of cod_transcript.txt',
  'Recruitment Agent': 'Copy of recruitment bot_transcript.txt',
  'Collections Agent': 'Copy of collection bot_transcript.txt',
  'Appointment Agent': 'Copy of wedding_transcript.txt',
  'Lead Qualification Agent': 'Copy of lead qualification_transcript.txt',
  'Outbound Sales Agent': 'Copy of weirdo_transcript.txt',
  'Feedback & Survey Agent': 'Copy of poker_transcript.txt'
};

let updatedAgents = agentsFile;

// Modify Cue type
updatedAgents = updatedAgents.replace(
  'export type Cue = { t?: number; text: string };',
  'export type Cue = { t?: number; text: string; speaker?: "agent" | "user" };'
);

// Modify TimedWord type
updatedAgents = updatedAgents.replace(
  'export type TimedWord = { text: string; start: number; end: number };',
  'export type TimedWord = { text: string; start: number; end: number; cueIndex: number };'
);

// Update timedWords function to include cueIndex
updatedAgents = updatedAgents.replace(
  'end: segStart + (n ? (span * (wi + 1)) / n : span),',
  'end: segStart + (n ? (span * (wi + 1)) / n : span),\n        cueIndex: ci,'
);

// Replace the AGENTS array transcripts
for (const [agentName, filename] of Object.entries(mapping)) {
  const data = parsed[filename];
  if (!data) continue;
  
  const transcriptLines = data.map(d => {
    return `{ speaker: "${d.speaker}", text: ` + JSON.stringify(d.text) + ` }`;
  }).join(',\n      ');

  const regex = new RegExp(`name: "${agentName}"[\\s\\S]*?transcript: \\[\\[\\s\\S\\]*?\\]`, 'g');
  // wait regex above is wrong, let's do it safer:
  const splitAgents = updatedAgents.split(`name: "${agentName}"`);
  if (splitAgents.length > 1) {
    const afterName = splitAgents[1];
    const newAfterName = afterName.replace(/transcript:\s*\[[\s\S]*?\]/, `transcript: [\n      ${transcriptLines}\n    ]`);
    updatedAgents = splitAgents[0] + `name: "${agentName}"` + newAfterName;
  }
}

// Modify the UI for rendering the scrolling transcript
const renderOld = `      <div className="mt-6 border-t border-line pt-4 relative">
        <p className="font-mono text-[11px] leading-relaxed">
          <span className="text-blue">agent &gt;</span>{" "}
          {words.map((word, i) => {
            const state =
              i === activeIndex
                ? "rounded bg-blue/15 text-cream"
                : i < activeIndex
                  ? "text-cream"
                  : "text-muted";
            return (
              <span key={i} className={\`transition-colors duration-200 \${state}\`}>
                {word.text}{" "}
              </span>
            );
          })}
        </p>
      </div>`;

const renderNew = `      <div className="mt-6 border-t border-line pt-4 relative">
        <div 
          className="max-h-[140px] overflow-y-auto space-y-2.5 pr-2 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line"
          ref={(el) => {
            if (el && playing) {
              const activeEl = el.querySelector('[data-active="true"]');
              if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
              }
            }
          }}
        >
          {agent.transcript.map((cue, ci) => {
            const cueWords = words.filter(w => w.cueIndex === ci);
            const isActiveCue = cueWords.some(w => words.indexOf(w) === activeIndex) || (activeIndex === -1 && ci === 0 && !playing);
            
            return (
              <div key={ci} data-active={isActiveCue} className="flex flex-col">
                <span className={cue.speaker === "agent" ? "text-blue mb-0.5" : "text-purple-400 mb-0.5"}>
                  {cue.speaker === "agent" ? "agent >" : "user >"}
                </span>
                <p>
                  {cueWords.map((word, i) => {
                    const globalIdx = words.indexOf(word);
                    const state = globalIdx === activeIndex
                      ? "rounded bg-blue/15 text-cream"
                      : globalIdx < activeIndex
                        ? "text-cream"
                        : "text-muted";
                    return (
                      <span key={i} className={\`transition-colors duration-200 \${state}\`}>
                        {word.text}{" "}
                      </span>
                    );
                  })}
                </p>
              </div>
            );
          })}
        </div>
      </div>`;

updatedAgents = updatedAgents.replace(renderOld, renderNew);

fs.writeFileSync('components/Agents.tsx', updatedAgents);
console.log('Done mapping and updating UI!');
