// Fails when a page ships more gzipped JS than its budget, or a public/ file
// grows past the media limit. Run after `next build` (npm run perf).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

const JS_BUDGET_KB = 175; // framework alone is ~150KB; leaves ~25KB per page
const MEDIA_BUDGET_KB = 500;
let failed = false;
const fail = (msg) => ((failed = true), console.error("✗ " + msg));

const pages = readdirSync("out", { recursive: true }).filter((f) => f.endsWith(".html"));
for (const page of pages) {
  const html = readFileSync(join("out", page), "utf8");
  const scripts = new Set(
    [...html.matchAll(/<script src="(\/_next\/[^"]+\.js)"([^>]*)>/g)].filter((m) => !/noModule/i.test(m[2])).map((m) => m[1]),
  );
  const kb = [...scripts].reduce((n, s) => n + gzipSync(readFileSync(join("out", s))).length, 0) / 1024;
  if (kb > JS_BUDGET_KB) fail(`${page}: ${kb.toFixed(1)}KB JS (budget ${JS_BUDGET_KB}KB)`);
  else console.log(`✓ ${page.padEnd(34)} ${kb.toFixed(1)}KB JS`);
}

(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    const { size } = statSync(p);
    if (statSync(p).isDirectory()) walk(p);
    else if (size > MEDIA_BUDGET_KB * 1024) fail(`${p}: ${(size / 1024).toFixed(0)}KB (limit ${MEDIA_BUDGET_KB}KB, compress it)`);
  }
})("public");

process.exit(failed ? 1 : 0);
