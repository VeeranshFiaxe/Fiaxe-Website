/* The intro's hand-off to the home page, as a jigsaw. Each card from the box
   flips over; its back is one piece of the page's first screen, and the
   pieces fly into place, in reading order, until they form the whole screen.
   The real page is underneath, identical, so removing the pieces afterwards
   is invisible.

   Each piece's back is its region of a picture of the page taken while the
   intro plays (see preparePageImage); if that isn't ready, a live copy of
   what is on screen, offset to show the same region.
   Only transform and opacity animate, so the browser runs it all on the GPU
   without repainting the copies; scrolling just speeds the playback up. */

import type { CardSnapshot } from "./intro-engine";

type Slot = { left: number; top: number; width: number; height: number };

export type Puzzle = {
  /** resolves once every piece is in place */
  finished: Promise<unknown>;
  /** play faster, eased in by the browser (used while scrolling) */
  hurry(): void;
  /** restart the page animations held still while the pieces showed them */
  release(): void;
};

const PIECE = 2000; // one piece, flip to landing, ms
const SETTLE = 900; // the finished board growing to full size, ms

/* The board is the page's first screen, extended down to the end of the
   hero so its row of cards isn't sliced off by the screen edge (capped, so
   a very tall hero doesn't shrink everything). It's built scaled down to
   fit the screen, then grows to full size, which is exactly the live page. */
function boardHeight(vh: number) {
  const hero = pageBlocks()[0];
  const bottom = hero ? hero.getBoundingClientRect().bottom + 32 : vh;
  return Math.round(Math.min(vh * 1.5, Math.max(vh, bottom)));
}
const STAGGER = 110; // between pieces, in reading order

/* Split the viewport into one piece per card: rows of uneven widths and
   heights, so it reads as a puzzle rather than a grid. */
function layout(n: number, vw: number, vh: number): Slot[] {
  const rows = Math.min(n, vw / vh < 0.8 ? 3 : 2);
  const counts = Array.from({ length: rows }, (_, r) => Math.floor(n / rows) + (r >= rows - (n % rows) ? 1 : 0));
  const rowW = counts.map((_, r) => 1 + 0.22 * Math.sin(r * 1.9 + 0.7));
  const rowSum = rowW.reduce((a, b) => a + b, 0);
  const slots: Slot[] = [];
  let y = 0;
  counts.forEach((count, r) => {
    const h = r === rows - 1 ? vh - y : Math.round((rowW[r] / rowSum) * vh);
    const w = Array.from({ length: count }, (_, i) => 1 + 0.38 * Math.sin(i * 2.3 + r * 1.3));
    const sum = w.reduce((a, b) => a + b, 0);
    let x = 0;
    w.forEach((wi, i) => {
      const width = i === count - 1 ? vw - x : Math.round((wi / sum) * vw);
      slots.push({ left: x, top: y, width, height: h });
      x += width;
    });
    y += h;
  });
  return slots;
}

type OrbTimes = [Animation, number][];

/* The page's top-level blocks, minus the intro. A wrapper marked
   data-page-wrap (the flying F's, see FTrail) is opened up into its children,
   and its canvas left out: the copy shows each slot's flat F instead. */
function pageBlocks() {
  const out: HTMLElement[] = [];
  const walk = (els: Iterable<Element>) => {
    for (const el of els) {
      if (!(el instanceof HTMLElement) || el.id === "fx-intro" || el instanceof HTMLCanvasElement) continue;
      if (el.hasAttribute("data-page-wrap")) walk(el.children);
      else out.push(el);
    }
  };
  walk(document.querySelector("main")?.children ?? []);
  return out;
}

/* A copy of what the page shows right now, sized to the viewport. The copy's
   orbs are frozen at the angle the page's orbs are at, recorded in `orbs`. */
function copyPage(vw: number, vh: number) {
  const orbs: OrbTimes = [];
  const page = document.createElement("div");
  page.className = "intro-clone";
  Object.assign(page.style, { position: "absolute", left: "0", top: "0", width: `${vw}px`, height: `${vh}px`, overflow: "hidden" });
  page.style.background = "var(--canvas)";
  // the fixed header is copied as a plain positioned block too: inside a
  // transformed piece, "fixed" would pin it to the piece instead
  const header = document.querySelector<HTMLElement>("body > header");
  const els = [...(header ? [header] : []), ...pageBlocks()];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.top >= vh) continue;
    const copy = el.cloneNode(true) as HTMLElement;
    // the 3D F isn't in the copy, so show the flat one it hides
    copy.querySelectorAll<SVGElement>(".f-ghost").forEach((g) => (g.style.opacity = ""));
    const copies = copy.querySelectorAll<HTMLElement>(".orb");
    el.querySelectorAll<HTMLElement>(".orb").forEach((orb, i) => {
      const anims = orb.getAnimations();
      if (!anims.length) return;
      const times = anims.map((a) => Number(a.currentTime ?? 0));
      anims.forEach((a, j) => orbs.push([a, times[j]]));
      copies[i].style.animationDelay = times.map((t) => `${-t}ms`).join(", ");
      copies[i].style.animationPlayState = "paused";
    });
    Object.assign(copy.style, {
      position: "absolute",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      margin: "0",
    });
    page.appendChild(copy);
  }
  return { page, orbs };
}

/* ── the page as one picture ──
   Rendering the copy once into a bitmap means each flying piece is a small
   image, not a live copy of the page: far cheaper for the browser to move
   around, which is what keeps it smooth on modest machines. The copy is
   drawn through an SVG <foreignObject>, with the page's CSS, fonts and
   images inlined so the picture needs nothing from outside. */

export type PageImage = { bitmap: HTMLCanvasElement; vw: number; vh: number; scale: number; orbs: OrbTimes };

const toDataUrl = (url: string) =>
  fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = reject;
          fr.readAsDataURL(blob);
        }),
    );

async function pageCss() {
  const parts = await Promise.all(
    Array.from(document.styleSheets).map(async (sheet) => {
      let text = "";
      try {
        text = Array.from(sheet.cssRules, (r) => r.cssText).join("\n");
      } catch {
        return ""; // a stylesheet from another origin; nothing of ours
      }
      const base = sheet.href ?? location.href;
      const urls = new Set<string>();
      for (const m of text.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) if (!m[2].startsWith("data:")) urls.add(m[2]);
      const found = await Promise.all(
        [...urls].slice(0, 40).map((u) => toDataUrl(new URL(u, base).href).then((d) => [u, d] as const, () => null)),
      );
      for (const f of found) if (f) text = text.split(f[0]).join(f[1]);
      return text;
    }),
  );
  return parts.join("\n");
}

export async function preparePageImage(): Promise<PageImage | null> {
  try {
    const vw = document.documentElement.clientWidth;
    const vh = boardHeight(window.innerHeight);
    const { page, orbs } = copyPage(vw, vh);
    const root = document.documentElement;
    const body = getComputedStyle(document.body);
    const wrap = document.createElement("div");
    wrap.className = root.className;
    const theme = root.getAttribute("data-theme");
    if (theme) wrap.setAttribute("data-theme", theme);
    Object.assign(wrap.style, {
      position: "relative",
      width: `${vw}px`,
      height: `${vh}px`,
      overflow: "hidden",
      background: "var(--canvas)",
      color: body.color,
      fontFamily: body.fontFamily,
      lineHeight: body.lineHeight,
    });
    wrap.appendChild(page);
    await Promise.all(
      Array.from(wrap.querySelectorAll("img"), (img) => {
        img.removeAttribute("srcset");
        img.removeAttribute("loading");
        return img.src ? toDataUrl(img.src).then((d) => void (img.src = d), () => {}) : null;
      }),
    );
    const css = (await pageCss()).replaceAll("]]>", "");
    const html = new XMLSerializer().serializeToString(wrap);
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}">` +
      `<foreignObject x="0" y="0" width="100%" height="100%">` +
      `<div xmlns="http://www.w3.org/1999/xhtml"><style><![CDATA[${css}]]></style>${html}</div>` +
      `</foreignObject></svg>`;
    const img = new Image();
    img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      await img.decode();
    } finally {
      URL.revokeObjectURL(img.src);
    }
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    const bitmap = document.createElement("canvas");
    bitmap.width = Math.round(vw * scale);
    bitmap.height = Math.round(vh * scale);
    bitmap.getContext("2d")!.drawImage(img, 0, 0, bitmap.width, bitmap.height);
    return { bitmap, vw, vh, scale, orbs };
  } catch {
    return null; // the pieces fall back to live copies
  }
}

/* A damped spring as a CSS linear() easing: lands with a small overshoot. */
function springEasing() {
  const fallback = "cubic-bezier(0.2, 0.9, 0.25, 1.08)";
  if (typeof CSS === "undefined" || !CSS.supports("animation-timing-function", "linear(0, 1)")) return fallback;
  const pts: string[] = [];
  const w = 9; // rad/s over the unit timeline
  const z = 0.72; // damping ratio: one soft overshoot, no wobble
  const wd = w * Math.sqrt(1 - z * z);
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const v = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + ((z * w) / wd) * Math.sin(wd * t));
    pts.push(v.toFixed(4));
  }
  pts[pts.length - 1] = "1";
  return `linear(${pts.join(", ")})`;
}

export function buildPuzzle(layer: HTMLElement, cards: CardSnapshot[], image: PageImage | null): Puzzle {
  const vw = document.documentElement.clientWidth;
  const vh = boardHeight(window.innerHeight);
  const slots = layout(cards.length, vw, vh);

  // the board, scaled to fit the screen and centred; pieces live inside it
  const fit = window.innerHeight / vh;
  const offX = (vw - vw * fit) / 2;
  const fitted = `translate(${offX}px, 0px) scale(${fit})`;
  const board = document.createElement("div");
  Object.assign(board.style, {
    position: "absolute",
    left: "0",
    top: "0",
    width: `${vw}px`,
    height: `${vh}px`,
    transformOrigin: "0 0",
    transform: fitted,
  });
  layer.appendChild(board);
  // the cards' on-screen boxes, in board coordinates
  const toBoard = (c: CardSnapshot) => ({
    ...c,
    left: (c.left - offX) / fit,
    top: c.top / fit,
    width: c.width / fit,
    height: c.height / fit,
  });
  // the picture only fits if the window hasn't changed since it was taken
  const picture = image && image.vw === vw && image.vh === vh ? image : null;
  const live = picture ? null : copyPage(vw, vh);
  // hold the page's orbs at the angle the pieces show, so the swap is exact
  const held: Animation[] = [];
  for (const [a, t] of picture ? picture.orbs : live!.orbs) {
    a.pause();
    a.currentTime = t;
    held.push(a);
  }
  const spring = springEasing();
  const anims: Animation[] = [];
  const opts = (delay: number): KeyframeAnimationOptions => ({ duration: PIECE, delay, fill: "both" });

  // faint outlines of the empty board, so it's clear pieces are filling it
  for (const s of slots) {
    const ghost = document.createElement("div");
    Object.assign(ghost.style, {
      position: "absolute",
      left: `${s.left + 6}px`,
      top: `${s.top + 6}px`,
      width: `${s.width - 12}px`,
      height: `${s.height - 12}px`,
      border: "1px dashed var(--line-bright)",
      borderRadius: "14px",
    });
    board.appendChild(ghost);
    anims.push(ghost.animate([{ opacity: 0 }, { opacity: 0.9, offset: 0.25 }, { opacity: 0.9, offset: 0.75 }, { opacity: 0 }], opts(0)));
  }

  // pair left-most card with left-most piece, so flight paths rarely cross
  const cx = (r: Slot) => r.left + r.width / 2;
  const byX = cards.map(toBoard).sort((a, b) => cx(a) - cx(b));
  const slotByX = slots.map((_, i) => i).sort((a, b) => cx(slots[a]) - cx(slots[b]));

  byX.forEach((card, i) => {
    const slotIndex = slotByX[i]; // slots are in reading order, so this is the landing order
    const s = slots[slotIndex];
    const tile = document.createElement("div");
    Object.assign(tile.style, {
      position: "absolute",
      left: `${s.left}px`,
      top: `${s.top}px`,
      // a little overlap hides seams between pieces while the board is scaled
      width: `${s.width + 2}px`,
      height: `${s.height + 2}px`,
      transformStyle: "preserve-3d",
      willChange: "transform",
      contain: "layout style",
      zIndex: String(100 - slotIndex),
    });

    const front = card.face;
    Object.assign(front.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      backfaceVisibility: "hidden",
      borderRadius: "10px",
    });

    const back = document.createElement("div");
    Object.assign(back.style, {
      position: "absolute",
      inset: "0",
      overflow: "hidden",
      backfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      contain: "strict",
      background: "var(--canvas)",
    });
    // soft lifted shadow while in flight; only its opacity animates
    const shadow = document.createElement("div");
    Object.assign(shadow.style, {
      position: "absolute",
      inset: "0",
      borderRadius: "12px",
      boxShadow: "0 30px 70px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.12)",
      opacity: "0",
    });
    if (picture) {
      // just this piece's region of the picture
      const k = picture.scale;
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round((s.width + 2) * k));
      c.height = Math.max(1, Math.round((s.height + 2) * k));
      c.getContext("2d")!.drawImage(picture.bitmap, s.left * k, s.top * k, c.width, c.height, 0, 0, c.width, c.height);
      Object.assign(c.style, { display: "block", width: "100%", height: "100%" });
      back.appendChild(c);
    } else {
      const view = live!.page.cloneNode(true) as HTMLElement;
      view.style.left = `${-s.left}px`;
      view.style.top = `${-s.top}px`;
      back.appendChild(view);
    }
    tile.append(shadow, front, back);
    board.appendChild(tile);

    // start exactly over the card; lift a little towards the viewer while
    // flipping and growing towards the piece's shape, then glide into place
    const dx = cx(card) - cx(s);
    const dy = card.top + card.height / 2 - (s.top + s.height / 2);
    const sx = card.width / s.width;
    const sy = card.height / s.height;
    const tilt = (slotIndex % 2 ? 1 : -1) * (2 + (slotIndex % 3));
    const mix = (a: number, b: number, k: number) => a + (b - a) * k;
    const p = "perspective(1600px)";
    const delay = slotIndex * STAGGER;
    anims.push(
      tile.animate(
        [
          {
            transform: `${p} translate3d(${dx}px, ${dy}px, 0px) scale(${sx}, ${sy}) rotateY(0deg) rotateZ(0deg)`,
            easing: "cubic-bezier(0.45, 0.05, 0.3, 1)",
          },
          {
            offset: 0.42,
            transform: `${p} translate3d(${dx * 0.55}px, ${dy * 0.55 - 24}px, 70px) scale(${mix(sx, 1, 0.4)}, ${mix(sy, 1, 0.4)}) rotateY(180deg) rotateZ(${tilt}deg)`,
            easing: spring,
          },
          { transform: `${p} translate3d(0px, 0px, 0px) scale(1, 1) rotateY(180deg) rotateZ(0deg)` },
        ],
        opts(delay),
      ),
      shadow.animate(
        [{ opacity: 0.4 }, { opacity: 1, offset: 0.42 }, { opacity: 0.5, offset: 0.8 }, { opacity: 0 }],
        { ...opts(delay), easing: "ease-in-out" },
      ),
    );
  });

  // once every piece is down, swap them for the whole picture in one piece
  // (no hairline seams between pieces), then grow the board into the page
  let rate = 1;
  const finished = Promise.all(anims.map((a) => a.finished)).then(() => {
    const whole = picture ? picture.bitmap : (live!.page.cloneNode(true) as HTMLElement);
    Object.assign(whole.style, { position: "absolute", left: "0", top: "0", width: `${vw}px`, height: `${vh}px` });
    board.replaceChildren(whole);
    if (fit === 1) return;
    const grow = board.animate([{ transform: fitted }, { transform: "translate(0px, 0px) scale(1)" }], {
      duration: SETTLE,
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
      fill: "both",
    });
    grow.updatePlaybackRate(rate);
    anims.push(grow);
    return grow.finished;
  });

  return {
    finished,
    hurry() {
      rate = 1.8;
      for (const a of anims) if (a.playbackRate < rate) a.updatePlaybackRate(rate);
    },
    release() {
      for (const a of held) a.play();
    },
  };
}
