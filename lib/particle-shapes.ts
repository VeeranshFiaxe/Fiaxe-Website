/* Point clouds for the particle model, one per ShapeKey in lib/catalog.ts.

   Every generator fills the same-length Float32Array (x, y, z per grain) in
   roughly the same box, about ±1.3 world units, so the engine can morph any
   shape into any other just by swapping the target array. Pure maths, no
   Three.js, so it costs nothing until the model actually loads. */

import type { ShapeKey } from "./catalog";

type Rand = () => number;

/* Seeded so a shape is the same on every visit and every server/client */
function rng(seed: number): Rand {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const jitter = (r: Rand, a: number) => (r() - 0.5) * 2 * a;

function globe(out: Float32Array, n: number, r: Rand) {
  const shell = Math.floor(n * 0.78);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    let x, y, z;
    if (i < shell) {
      // fibonacci sphere, a hair of thickness so it reads as matter
      const t = i / shell;
      y = 1 - 2 * t;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      const k = 1 + jitter(r, 0.025);
      x = Math.cos(th) * rad * k;
      z = Math.sin(th) * rad * k;
      y *= k;
    } else {
      // tilted orbit ring
      const a = r() * Math.PI * 2;
      const rr = 1.45 + jitter(r, 0.04);
      const cx = Math.cos(a) * rr;
      const cz = Math.sin(a) * rr;
      x = cx;
      y = cz * 0.32 + jitter(r, 0.02);
      z = cz * 0.95;
    }
    out.set([x, y, z], i * 3);
  }
}

/* A browser window: frame, title bar with three dots, and a page inside */
function browser(out: Float32Array, n: number, r: Rand) {
  const W = 1.35, H = 0.95;
  const parts: [number, (i: number) => [number, number]][] = [
    // outline
    [0.26, () => {
      const p = r() * 2 * (W + H) * 2;
      const e = 0.012;
      if (p < 2 * W) return [-W + p, H + jitter(r, e)];
      if (p < 4 * W) return [-W + (p - 2 * W), -H + jitter(r, e)];
      if (p < 4 * W + 2 * H) return [-W + jitter(r, e), -H + (p - 4 * W)];
      return [W + jitter(r, e), -H + (p - 4 * W - 2 * H)];
    }],
    // title bar divider
    [0.07, () => [-W + r() * 2 * W, H - 0.22 + jitter(r, 0.01)]],
    // traffic-light dots
    [0.05, () => {
      const d = Math.floor(r() * 3);
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.045;
      return [-W + 0.14 + d * 0.13 + Math.cos(a) * rr, H - 0.11 + Math.sin(a) * rr];
    }],
    // hero block
    [0.2, () => [-W + 0.14 + r() * 1.5, 0.12 + r() * 0.44]],
    // three cards
    [0.3, () => {
      const c = Math.floor(r() * 3);
      const cw = (2 * W - 0.28 - 0.2) / 3;
      return [-W + 0.14 + c * (cw + 0.1) + r() * cw, -H + 0.14 + r() * 0.72];
    }],
    // hero image on the right
    [0.12, () => {
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.28;
      return [0.85 + Math.cos(a) * rr, 0.34 + Math.sin(a) * rr];
    }],
  ];
  let i = 0;
  for (const [share, gen] of parts) {
    const m = Math.round(n * share);
    for (let k = 0; k < m && i < n; k++, i++) {
      const [x, y] = gen(k);
      out.set([x, y, jitter(r, 0.05)], i * 3);
    }
  }
  for (; i < n; i++) out.set([jitter(r, W), jitter(r, H), jitter(r, 0.05)], i * 3);
}

/* Torus knot: one continuous loop, the shape of a workflow that runs itself */
function flow(out: Float32Array, n: number, r: Rand) {
  const p = 2, q = 3;
  for (let i = 0; i < n; i++) {
    const t = r() * Math.PI * 2;
    const rad = 0.72 + 0.32 * Math.cos(q * t);
    const cx = rad * Math.cos(p * t);
    const cy = rad * Math.sin(p * t);
    const cz = 0.32 * Math.sin(q * t);
    // tube around the curve
    const a = r() * Math.PI * 2, tr = 0.11 * Math.sqrt(r());
    out.set([cx + Math.cos(a) * tr, cy + Math.sin(a) * tr, cz + jitter(r, tr)], i * 3);
  }
}

/* Stacked modules: a 3x3x3 lattice with a few pieces pulled out */
function blocks(out: Float32Array, n: number, r: Rand) {
  const cells: [number, number, number][] = [];
  const pick = rng(7);
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) if (pick() > 0.22 || (x === 0 && y === 0)) cells.push([x, y, z]);
  const s = 0.62, h = 0.24;
  for (let i = 0; i < n; i++) {
    const [cx, cy, cz] = cells[Math.floor(r() * cells.length)];
    // a point on the surface of this small cube
    const face = Math.floor(r() * 6);
    const u = jitter(r, h), v = jitter(r, h);
    let x = 0, y = 0, z = 0;
    if (face < 2) { x = face ? h : -h; y = u; z = v; }
    else if (face < 4) { y = face === 3 ? h : -h; x = u; z = v; }
    else { z = face === 5 ? h : -h; x = u; y = v; }
    out.set([cx * s + x, cy * s + y, cz * s + z], i * 3);
  }
}

/* A small neural network: layers of nodes joined by edges */
function brain(out: Float32Array, n: number, r: Rand) {
  const layout = [3, 5, 5, 3];
  const nodes: [number, number, number][][] = layout.map((count, li) => {
    const x = -1.2 + (li * 2.4) / (layout.length - 1);
    return Array.from({ length: count }, (_, k) => {
      const y = (k - (count - 1) / 2) * 0.46;
      return [x, y, Math.sin(k * 1.7 + li) * 0.25] as [number, number, number];
    });
  });
  const edges: [[number, number, number], [number, number, number]][] = [];
  for (let l = 0; l < nodes.length - 1; l++)
    for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
  const all = nodes.flat();
  const nodeShare = Math.floor(n * 0.45);
  for (let i = 0; i < n; i++) {
    if (i < nodeShare) {
      const [x, y, z] = all[i % all.length];
      // ball around each node
      const u = r() * 2 - 1, a = r() * Math.PI * 2, rr = 0.09 * Math.cbrt(r());
      const s = Math.sqrt(1 - u * u);
      out.set([x + s * Math.cos(a) * rr, y + s * Math.sin(a) * rr, z + u * rr], i * 3);
    } else {
      const [a, b] = edges[Math.floor(r() * edges.length)];
      const t = r();
      out.set(
        [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + jitter(r, 0.006), a[2] + (b[2] - a[2]) * t],
        i * 3,
      );
    }
  }
}

/* A sound wave turned into a solid: rings whose radius follows the voice */
function wave(out: Float32Array, n: number, r: Rand) {
  for (let i = 0; i < n; i++) {
    const x = jitter(r, 1.45);
    const env = Math.cos((x / 1.45) * (Math.PI / 2)) ** 1.5;
    const amp = 0.08 + env * (0.35 + 0.35 * Math.abs(Math.sin(x * 5.2)) * Math.abs(Math.cos(x * 2.1)));
    const a = r() * Math.PI * 2;
    const rr = amp * (0.94 + jitter(r, 0.06));
    out.set([x, Math.cos(a) * rr, Math.sin(a) * rr], i * 3);
  }
}

const GENERATORS: Record<ShapeKey, (out: Float32Array, n: number, r: Rand) => void> = {
  globe,
  browser,
  flow,
  blocks,
  brain,
  wave,
};

const cache = new Map<string, Float32Array>();

export function buildShape(shape: ShapeKey, n: number): Float32Array {
  const key = `${shape}:${n}`;
  let arr = cache.get(key);
  if (!arr) {
    arr = new Float32Array(n * 3);
    GENERATORS[shape](arr, n, rng(shape.length * 9973 + 17));
    // shuffle grain order so a morph scatters and re-forms instead of
    // sweeping across in the order each generator happened to fill
    const r = rng(n + shape.charCodeAt(0));
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      for (let k = 0; k < 3; k++) {
        const t = arr[i * 3 + k];
        arr[i * 3 + k] = arr[j * 3 + k];
        arr[j * 3 + k] = t;
      }
    }
    cache.set(key, arr);
  }
  return arr;
}
