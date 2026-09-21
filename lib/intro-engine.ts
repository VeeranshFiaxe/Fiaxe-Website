/* The home page intro: a 3D Fiaxe box floats in, its logo lights up, it
   drops and bounces, shakes, bursts open and throws every offering out as a
   card. The cards then orbit the box; hover stops the orbit, click opens that
   offering. Loaded on demand by components/site/IntroBox.tsx.

   All physics is hand-rolled (gravity, bounces, springs); nothing here needs
   a physics library. */

import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  DynamicDrawUsage,
  Euler,
  Fog,
  Group,
  HemisphereLight,
  InstancedMesh,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Quaternion,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type IntroItem = { name: string; tagline: string; kind: string; accent: string; href: string };

export type IntroEngine = {
  destroy(): void;
};

type Opts = {
  canvas: HTMLCanvasElement;
  items: IntroItem[];
  bg: string;
  accent: string;
  font: string;
  onOpened(): void;
  onPick(href: string): void;
  onHover(href: string | null): void;
};

/* The FIAXE "F" mark, same paths as components/Logo.tsx (1024 × 1024) */
const F_PATHS = [
  "M158 565 L27 357 L203 120 L995 130 L884 334 L347 341 L180 569 Z",
  "M160 775 L388 449 L813 452 L700 660 L508 674 L314 977 L266 947 Z",
];

// box size, world units
const W = 2.2;
const H = 1.45;
const D = 2.2;
const T = 0.09;
const REST_YAW = -0.5;
const G = 24;

const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

function logoTexture(glow: boolean) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const pad = glow ? 110 : 40;
  const s = (512 - pad * 2) / 1024;
  ctx.translate(pad, pad);
  ctx.scale(s, s);
  if (glow) ctx.filter = "blur(26px)";
  ctx.fillStyle = "#ffffff";
  for (const d of F_PATHS) ctx.fill(new Path2D(d));
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function cardTexture(it: IntroItem, font: string) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const ctx = c.getContext("2d")!;
  // body
  const g = ctx.createLinearGradient(0, 0, 1024, 640);
  g.addColorStop(0, "#1d1c21");
  g.addColorStop(1, "#111013");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 640);
  // accent bloom in the corner
  const r = ctx.createRadialGradient(120, 90, 0, 120, 90, 520);
  r.addColorStop(0, it.accent + "55");
  r.addColorStop(1, it.accent + "00");
  ctx.fillStyle = r;
  ctx.fillRect(0, 0, 1024, 640);
  // border
  roundRect(ctx, 10, 10, 1004, 620, 40);
  ctx.lineWidth = 4;
  ctx.strokeStyle = it.accent + "aa";
  ctx.stroke();
  // kind
  ctx.fillStyle = it.accent;
  ctx.beginPath();
  ctx.arc(86, 96, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `600 34px ${font}`;
  ctx.fillText(it.kind.toUpperCase(), 118, 108);
  // name, wrapped to two lines
  ctx.fillStyle = "#f4f1ec";
  ctx.font = `600 84px ${font}`;
  const words = it.name.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > 860 && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  lines.push(line);
  lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 70, 290 + i * 96));
  // tagline
  ctx.fillStyle = "#a39d96";
  ctx.font = `400 38px ${font}`;
  ctx.fillText(it.tagline.length > 44 ? it.tagline.slice(0, 43) + "…" : it.tagline, 70, 540);
  ctx.fillStyle = it.accent;
  ctx.font = `600 52px ${font}`;
  ctx.fillText("→", 920, 545);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function cardBackTexture(accent: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#141316";
  ctx.fillRect(0, 0, 512, 320);
  roundRect(ctx, 5, 5, 502, 310, 20);
  ctx.lineWidth = 2;
  ctx.strokeStyle = accent + "88";
  ctx.stroke();
  ctx.translate(206, 110);
  ctx.scale(100 / 1024, 100 / 1024);
  ctx.fillStyle = "#f4f1ec";
  for (const d of F_PATHS) ctx.fill(new Path2D(d));
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(c);
}

function beamTexture() {
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0.9)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return new CanvasTexture(c);
}

export function createIntro(o: Opts): IntroEngine {
  const { canvas, items } = o;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap; // PCFSoft is deprecated and falls back to this anyway

  const bg = new Color(o.bg);
  const accent = new Color(o.accent);
  const scene = new Scene();
  scene.background = bg;
  const fog = new Fog(bg, 9, 21);
  scene.fog = fog;
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;

  const camera = new PerspectiveCamera(34, 1, 0.1, 60);
  const lookAt = new Vector3(0, 1.5, 0);

  // ── lights ──
  scene.add(new HemisphereLight(0xffffff, 0x222026, 0.35));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -7;
  key.shadow.camera.right = key.shadow.camera.top = 7;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new DirectionalLight(0x9fb8ff, 1.1);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  // ── floor ──
  const floorMat = new MeshStandardMaterial({ color: bg.clone().multiplyScalar(0.8), roughness: 1, metalness: 0 });
  const floor = new Mesh(new CircleGeometry(40, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── the box ──
  const shell = new MeshPhysicalMaterial({
    color: 0x1b1a1f,
    metalness: 0.35,
    roughness: 0.32,
    clearcoat: 1,
    clearcoatRoughness: 0.18,
  });
  const inner = new MeshStandardMaterial({ color: 0x0e0d10, roughness: 0.6, metalness: 0.2 });
  const boxRoot = new Group(); // origin at the bottom centre, so squash and tilt pivot on the floor
  const box = new Group();
  boxRoot.add(box);
  scene.add(boxRoot);
  const panel = (w: number, h: number, d: number, x: number, y: number, z: number, m: Material = shell) => {
    const mesh = new Mesh(new RoundedBoxGeometry(w, h, d, 3, 0.035), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    box.add(mesh);
    return mesh;
  };
  panel(W, T, D, 0, T / 2, 0);
  panel(W, H, T, 0, H / 2, D / 2 - T / 2);
  panel(W, H, T, 0, H / 2, -D / 2 + T / 2);
  panel(T, H, D - 2 * T, W / 2 - T / 2, H / 2, 0);
  panel(T, H, D - 2 * T, -W / 2 + T / 2, H / 2, 0);
  panel(W - 2 * T - 0.01, 0.02, D - 2 * T - 0.01, 0, T + 0.01, 0, inner);

  // lid hinges on the back top edge
  const hinge = new Group();
  hinge.position.set(0, H, -D / 2);
  box.add(hinge);
  const lid = new Mesh(new RoundedBoxGeometry(W + 0.06, T * 1.3, D + 0.06, 3, 0.05), shell);
  lid.position.set(0, (T * 1.3) / 2, D / 2);
  lid.castShadow = true;
  hinge.add(lid);

  // glowing seam just under the lid, brightens while the box shakes
  const seamMat = new MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, toneMapped: false });
  for (const [w, d, x, z] of [
    [W - 0.02, 0.02, 0, D / 2 - 0.01],
    [W - 0.02, 0.02, 0, -D / 2 + 0.01],
    [0.02, D - 0.02, W / 2 - 0.01, 0],
    [0.02, D - 0.02, -W / 2 + 0.01, 0],
  ]) {
    const seam = new Mesh(new BoxGeometry(w, 0.03, d), seamMat);
    seam.position.set(x, H + 0.005, z);
    box.add(seam);
  }

  // the F on the front face, plus a soft glow behind it
  const logoTex = logoTexture(false);
  const glowTex = logoTexture(true);
  const logoMat = new MeshBasicMaterial({ map: logoTex, transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const glowMat = new MeshBasicMaterial({
    map: glowTex,
    color: new Color(0xffffff).lerp(accent, 0.25),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    toneMapped: false,
    depthWrite: false,
  });
  const logo = new Mesh(new PlaneGeometry(0.95, 0.95), logoMat);
  logo.position.set(0, H * 0.5, D / 2 + 0.004);
  const glow = new Mesh(new PlaneGeometry(1.4, 1.4), glowMat);
  glow.position.set(0, H * 0.5, D / 2 + 0.006);
  box.add(logo, glow);

  const core = new PointLight(new Color(0xffffff).lerp(accent, 0.6), 0, 9, 1.6);
  core.position.set(0, H * 0.7, 0);
  box.add(core);

  // light beam out of the open box
  const beamMat = new MeshBasicMaterial({
    map: beamTexture(),
    color: new Color(0xffffff).lerp(accent, 0.5),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    side: DoubleSide,
    depthWrite: false,
    toneMapped: false,
  });
  const beam = new Mesh(new CylinderGeometry(2.1, W * 0.42, 6, 48, 1, true), beamMat);
  beam.position.y = H + 3;
  box.add(beam);

  // ── dust puff on impact ──
  const DUST = 90;
  const dustPos = new Float32Array(DUST * 3);
  const dustVel = new Float32Array(DUST * 3);
  const dustGeo = new BufferGeometry();
  dustGeo.setAttribute("position", new BufferAttribute(dustPos, 3).setUsage(DynamicDrawUsage));
  const dot = dotTexture();
  const dustMat = new PointsMaterial({ size: 0.16, map: dot, transparent: true, opacity: 0, depthWrite: false, color: 0xbab3aa });
  const dust = new Points(dustGeo, dustMat);
  dust.frustumCulled = false;
  scene.add(dust);
  let dustLife = 0;
  const puff = (strength: number) => {
    for (let i = 0; i < DUST; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = W * 0.62;
      dustPos.set([Math.cos(a) * r, 0.05, Math.sin(a) * r], i * 3);
      const s = rand(1, 3.2) * strength;
      dustVel.set([Math.cos(a) * s, rand(0.2, 1.1) * strength, Math.sin(a) * s], i * 3);
    }
    dustLife = 1;
  };

  // ── rising motes after the box opens ──
  const MOTES = 140;
  const motePos = new Float32Array(MOTES * 3);
  const moteSpeed = new Float32Array(MOTES);
  const moteGeo = new BufferGeometry();
  moteGeo.setAttribute("position", new BufferAttribute(motePos, 3).setUsage(DynamicDrawUsage));
  const moteMat = new PointsMaterial({
    size: 0.09,
    map: dot,
    color: new Color(0xffffff).lerp(accent, 0.5),
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const motes = new Points(moteGeo, moteMat);
  motes.frustumCulled = false;
  scene.add(motes);
  const resetMote = (i: number, y = rand(0, 5)) => {
    motePos.set([rand(-0.8, 0.8), H + y, rand(-0.8, 0.8)], i * 3);
    moteSpeed[i] = rand(0.3, 1.1);
  };
  for (let i = 0; i < MOTES; i++) resetMote(i);

  // ── confetti: small blocks in every offering's colour ──
  const CONF = 110;
  const confGeo = new RoundedBoxGeometry(0.14, 0.14, 0.14, 2, 0.03);
  const confMat = new MeshStandardMaterial({ roughness: 0.3, metalness: 0.05, envMapIntensity: 0.4 });
  const conf = new InstancedMesh(confGeo, confMat, CONF);
  conf.castShadow = true;
  conf.visible = false;
  scene.add(conf);
  const palette = [...items.map((i) => i.accent), "#f4f1ec", o.accent];
  const cP = new Float32Array(CONF * 3);
  const cV = new Float32Array(CONF * 3);
  const cR = new Float32Array(CONF * 3);
  const cW = new Float32Array(CONF * 3);
  const cS = new Float32Array(CONF);
  const tmpC = new Color();
  for (let i = 0; i < CONF; i++) {
    conf.setColorAt(i, tmpC.set(palette[i % palette.length]));
    cS[i] = rand(0.55, 1.35);
  }

  // ── offering cards ──
  const CW = 1.75;
  const CH = CW * 0.625;
  const cardGeo = new BoxGeometry(CW, CH, 0.035);
  type Card = {
    mesh: Mesh;
    href: string;
    vel: Vector3;
    spin: Vector3;
    flyFor: number;
    hover: number;
  };
  const cards: Card[] = items.map((it, i) => {
    const edge = new MeshStandardMaterial({ color: it.accent, emissive: it.accent, emissiveIntensity: 0.4 });
    const front = new MeshBasicMaterial({ map: cardTexture(it, o.font), toneMapped: false });
    const back = new MeshBasicMaterial({ map: cardBackTexture(it.accent), toneMapped: false });
    const mesh = new Mesh(cardGeo, [edge, edge, edge, edge, front, back]);
    mesh.castShadow = true;
    mesh.visible = false;
    mesh.userData.i = i;
    scene.add(mesh);
    return { mesh, href: it.href, vel: new Vector3(), spin: new Vector3(), flyFor: 0, hover: 0 };
  });

  // ── state ──
  type Phase = "float" | "fall" | "rest" | "shake" | "open";
  let phase: Phase = "float";
  let pt = 0; // time in phase
  let total = 0;
  let y = 2.7;
  let vy = 0;
  let bounces = 0;
  let squash = 0;
  let squashV = 0;
  let tiltX = 0.1;
  let tiltZ = -0.14;
  let tiltXV = 0;
  let tiltZV = 0;
  let lidA = 0;
  let lidV = 0;
  let camShake = 0;
  let lookY = 3.4;
  let camPull = 0; // 0 = close intro framing, 1 = wide framing for the orbit
  let ring = 0;
  let ringSpeed = 0.2;
  let opened = false;
  let hovered: Card | null = null;
  let boxHover = false;

  const pointer = new Vector2(9, 9);
  const pointerSmooth = new Vector2();
  const floorHit = new Vector3();
  const lastFloorHit = new Vector3();
  let pointerMoved = false;
  const raycaster = new Raycaster();
  const floorPlane = new Plane(new Vector3(0, 1, 0), 0);

  let ringR = 3.4;
  let dist = 10;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const tall = camera.aspect < 0.8;
    ringR = tall ? 2.2 : 3.4;
    camera.fov = tall ? 50 : 34;
    // far enough that the ring (plus a card) fits the width
    const half = Math.tan((camera.fov * Math.PI) / 360);
    dist = Math.max(10.5, (ringR + CW * 0.7) / (half * camera.aspect) + ringR * 0.6);
    fog.near = dist * 0.85;
    fog.far = dist * 2.1;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const burst = () => {
    opened = true;
    conf.visible = true;
    for (let i = 0; i < CONF; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = rand(1.2, 4.2);
      cP.set([rand(-0.5, 0.5), H * 0.8, rand(-0.5, 0.5)], i * 3);
      cV.set([Math.cos(a) * s, rand(6, 12), Math.sin(a) * s], i * 3);
      cR.set([rand(0, 6), rand(0, 6), rand(0, 6)], i * 3);
      cW.set([rand(-12, 12), rand(-12, 12), rand(-12, 12)], i * 3);
    }
    cards.forEach((c, i) => {
      const a = ring + (i / cards.length) * Math.PI * 2 + Math.PI / 2;
      c.mesh.visible = true;
      c.mesh.position.set(rand(-0.3, 0.3), H * 0.7, rand(-0.3, 0.3));
      c.mesh.rotation.set(rand(0, 6), rand(0, 6), rand(0, 6));
      c.mesh.scale.setScalar(0.3);
      c.vel.set(Math.cos(a) * rand(2, 3.4), rand(8.5, 11), Math.sin(a) * rand(2, 3.4));
      c.spin.set(rand(-9, 9), rand(-9, 9), rand(-9, 9));
      c.flyFor = 0.75 + i * 0.07;
    });
    lidV = -16;
    camShake = 0.18;
    window.setTimeout(o.onOpened, 1500);
  };

  const skipAhead = () => {
    if (phase === "float") {
      phase = "fall";
      pt = 0;
    } else if (phase === "rest" || phase === "shake") {
      phase = "open";
      pt = 0;
      burst();
    }
  };

  // ── input ──
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    pointerMoved = true;
  };
  const onLeave = () => {
    pointer.set(9, 9);
  };
  const onClick = () => {
    if (hovered) o.onPick(hovered.href);
    else if (boxHover) skipAhead();
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerdown", onMove);
  canvas.addEventListener("pointerleave", onLeave);
  canvas.addEventListener("click", onClick);

  const m4 = new Matrix4();
  const q = new Quaternion();
  const e3 = new Euler();
  const v3 = new Vector3();
  const p2 = new Vector2();
  const target = new Vector3();
  const faceQ = new Quaternion();
  const dummy = new Object3D();
  const yawCos = Math.cos(REST_YAW);
  const yawSin = Math.sin(REST_YAW);

  let raf = 0;
  let last = performance.now();
  let visible = true;
  const onVis = () => {
    visible = !document.hidden;
    last = performance.now();
    if (visible) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", onVis);

  function frame(now: number) {
    if (!visible) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(1 / 30, (now - last) / 1000);
    last = now;
    total += dt;
    pt += dt;

    // ── box choreography ──
    let yaw = REST_YAW;
    let jitterX = 0;
    let shakeZ = 0;
    if (phase === "float") {
      const k = ease(pt / 2.1);
      y = 2.7 + Math.sin(total * 2.2) * 0.07;
      yaw = -1.9 + (REST_YAW + 1.9) * k;
      tiltX = 0.1 * (1 - k) + Math.sin(total * 1.7) * 0.03;
      tiltZ = -0.14 * (1 - k) + Math.cos(total * 1.3) * 0.03;
      // logo flickers on, then holds
      const lt = pt - 0.55;
      const flick = lt < 0 ? 0 : lt < 0.9 ? [0, 0.9, 0.15, 1, 0.35, 0.8, 0.5, 1][Math.floor(lt * 9)] ?? 1 : 1;
      logoMat.opacity = flick;
      glowMat.opacity = flick * 0.55;
      box.scale.setScalar(0.85 + 0.15 * ease(pt / 0.8));
      if (pt > 2.4) {
        phase = "fall";
        pt = 0;
        tiltX = 0.12;
        tiltZ = -0.18;
      }
    } else if (phase === "fall") {
      vy -= G * dt;
      y += vy * dt;
      if (y <= 0) {
        y = 0;
        const hit = -vy;
        if (hit > 1.4) {
          squashV += Math.min(hit * 0.28, 3.4);
          tiltZV += (bounces % 2 ? 1 : -1) * hit * 0.12;
          tiltXV += hit * 0.06;
          camShake = Math.max(camShake, Math.min(0.22, hit * 0.018));
          if (bounces === 0) puff(1);
          vy = hit * 0.36;
          bounces++;
        } else {
          vy = 0;
          phase = "rest";
          pt = 0;
        }
      }
    } else if (phase === "rest") {
      if (pt > 0.55) {
        phase = "shake";
        pt = 0;
      }
    } else if (phase === "shake") {
      // two rattles, the second harder, then it blows
      const amp = pt < 0.5 ? 0.035 * Math.sin((pt / 0.5) * Math.PI) : pt < 0.78 ? 0 : 0.075 * Math.min(1, (pt - 0.78) / 0.35);
      shakeZ = Math.sin(pt * 62) * amp;
      jitterX = Math.sin(pt * 47) * amp * 0.6;
      y = Math.abs(Math.sin(pt * 31)) * amp * 0.9;
      lidA = -Math.abs(Math.sin(pt * 38)) * amp * 1.6;
      const glowUp = Math.min(1, pt / 1.4);
      core.intensity = glowUp * 6;
      seamMat.opacity = glowUp * (0.6 + Math.random() * 0.4);
      if (pt > 1.45) {
        phase = "open";
        pt = 0;
        burst();
      }
    } else {
      y = 0;
      // lid: underdamped spring to ~115° open
      const goal = -2.0;
      lidV += (-(lidA - goal) * 90 - lidV * 7) * dt;
      lidA += lidV * dt;
      if (lidA < -2.35) {
        lidA = -2.35;
        lidV *= -0.3;
      }
      const flash = Math.exp(-pt * 3);
      core.intensity = 10 + flash * 60;
      seamMat.opacity = Math.max(0, seamMat.opacity - dt * 3);
      beamMat.opacity = Math.min(0.42, pt * 1.2) * (0.85 + Math.sin(total * 3) * 0.15) + flash * 0.4;
      moteMat.opacity = Math.min(0.9, pt * 0.8);
      camPull = Math.min(1, camPull + dt * 0.7);
    }

    // squash and tilt springs
    squashV += (-squash * 320 - squashV * 16) * dt;
    squash += squashV * dt;
    const sq = Math.max(-0.12, Math.min(0.24, squash));
    if (phase !== "float") {
      tiltZV += (-tiltZ * 80 - tiltZV * 7) * dt;
      tiltXV += (-tiltX * 80 - tiltXV * 7) * dt;
      tiltZ += tiltZV * dt;
      tiltX += tiltXV * dt;
    }
    boxRoot.position.set(jitterX, y, 0);
    boxRoot.rotation.set(tiltX, yaw, tiltZ + shakeZ, "YXZ");
    boxRoot.scale.set(1 + sq * 0.55, 1 - sq, 1 + sq * 0.55);
    hinge.rotation.x = lidA;

    // ── dust ──
    if (dustLife > 0) {
      dustLife = Math.max(0, dustLife - dt * 1.1);
      for (let i = 0; i < DUST; i++) {
        const j = i * 3;
        dustVel[j] *= 1 - dt * 2.2;
        dustVel[j + 2] *= 1 - dt * 2.2;
        dustVel[j + 1] -= dt * 1.2;
        dustPos[j] += dustVel[j] * dt;
        dustPos[j + 1] = Math.max(0.02, dustPos[j + 1] + dustVel[j + 1] * dt);
        dustPos[j + 2] += dustVel[j + 2] * dt;
      }
      dustGeo.attributes.position.needsUpdate = true;
      dustMat.opacity = dustLife * 0.5;
    }

    // ── motes ──
    if (opened) {
      for (let i = 0; i < MOTES; i++) {
        const j = i * 3;
        motePos[j + 1] += moteSpeed[i] * dt;
        motePos[j] += Math.sin(total * 0.8 + i) * dt * 0.25;
        if (motePos[j + 1] > H + 6) resetMote(i, 0);
      }
      moteGeo.attributes.position.needsUpdate = true;
    }

    // ── pointer ──
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(
      cards.filter((c) => c.mesh.visible).map((c) => c.mesh),
      false,
    );
    const nextHover = hits.length ? cards[hits[0].object.userData.i as number] : null;
    if (nextHover !== hovered) {
      hovered = nextHover;
      o.onHover(hovered ? hovered.href : null);
    }
    boxHover = !hovered && !opened && raycaster.intersectObject(box, true).length > 0;
    canvas.style.cursor = hovered || boxHover ? "pointer" : "default";
    const onFloor = raycaster.ray.intersectPlane(floorPlane, floorHit) !== null;

    // ── confetti ──
    if (conf.visible) {
      const kick = onFloor && pointerMoved ? floorHit.distanceTo(lastFloorHit) / Math.max(dt, 1e-3) : 0;
      for (let i = 0; i < CONF; i++) {
        const j = i * 3;
        const s = 0.07 * cS[i];
        cV[j + 1] -= G * 0.6 * dt;
        cP[j] += cV[j] * dt;
        cP[j + 1] += cV[j + 1] * dt;
        cP[j + 2] += cV[j + 2] * dt;
        // the box walls: work in box space (it sits at the origin, yawed)
        const lx = cP[j] * yawCos - cP[j + 2] * yawSin;
        const lz = cP[j] * yawSin + cP[j + 2] * yawCos;
        if (cP[j + 1] < H + s && Math.abs(lx) < W / 2 + s && Math.abs(lz) < D / 2 + s && cV[j + 1] < 0) {
          const inside = Math.abs(lx) < W / 2 - T && Math.abs(lz) < D / 2 - T;
          if (!inside || cP[j + 1] < T + s) {
            if (inside) {
              cP[j + 1] = T + s;
            } else if (cP[j + 1] > H - 0.15) {
              cP[j + 1] = H + s; // landed on the rim
            } else {
              // pushed out through the nearest wall
              const ox = W / 2 + s - Math.abs(lx);
              const oz = D / 2 + s - Math.abs(lz);
              let nx = lx;
              let nz = lz;
              if (ox < oz) nx = Math.sign(lx) * (W / 2 + s);
              else nz = Math.sign(lz) * (D / 2 + s);
              cP[j] = nx * yawCos + nz * yawSin;
              cP[j + 2] = -nx * yawSin + nz * yawCos;
            }
            cV[j + 1] = Math.abs(cV[j + 1]) > 1.5 ? -cV[j + 1] * 0.35 : 0;
            cV[j] *= 0.8;
            cV[j + 2] *= 0.8;
          }
        }
        if (cP[j + 1] < s) {
          cP[j + 1] = s;
          if (cV[j + 1] < -1.2) {
            cV[j + 1] *= -0.42;
            cW[j] *= 0.6;
            cW[j + 1] *= 0.6;
            cW[j + 2] *= 0.6;
          } else cV[j + 1] = 0;
          cV[j] *= 1 - dt * 5;
          cV[j + 2] *= 1 - dt * 5;
          // settle flat
          for (let a = 0; a < 3; a++) {
            const snap = Math.round(cR[j + a] / (Math.PI / 2)) * (Math.PI / 2);
            cR[j + a] += (snap - cR[j + a]) * Math.min(1, dt * 8);
            cW[j + a] *= 1 - dt * 6;
          }
        }
        // swipe the cursor through them to kick them around
        if (kick > 0.5) {
          const dx = cP[j] - floorHit.x;
          const dz = cP[j + 2] - floorHit.z;
          const d2 = dx * dx + dz * dz;
          if (d2 < 0.5 && cP[j + 1] < 0.6) {
            const d = Math.sqrt(d2) + 0.05;
            const f = Math.min(9, kick * 0.35);
            cV[j] += (dx / d) * f;
            cV[j + 2] += (dz / d) * f;
            cV[j + 1] += f * rand(0.5, 1);
            cW[j] += rand(-10, 10);
            cW[j + 2] += rand(-10, 10);
          }
        }
        cR[j] += cW[j] * dt;
        cR[j + 1] += cW[j + 1] * dt;
        cR[j + 2] += cW[j + 2] * dt;
        dummy.position.set(cP[j], cP[j + 1], cP[j + 2]);
        dummy.rotation.set(cR[j], cR[j + 1], cR[j + 2]);
        dummy.scale.setScalar(cS[i]);
        dummy.updateMatrix();
        conf.setMatrixAt(i, dummy.matrix);
      }
      conf.instanceMatrix.needsUpdate = true;
    }
    if (onFloor) lastFloorHit.copy(floorHit);
    pointerMoved = false;

    // ── cards: thrown out, then pulled into an orbit ──
    ringSpeed += ((hovered ? 0 : 0.2) - ringSpeed) * Math.min(1, dt * 4);
    ring += ringSpeed * dt;
    const n = cards.length;
    cards.forEach((c, i) => {
      if (!c.mesh.visible) return;
      const m = c.mesh;
      const grow = m.scale.x + (1 + c.hover * 0.12 - m.scale.x) * Math.min(1, dt * 6);
      m.scale.setScalar(grow);
      if (c.flyFor > 0) {
        c.flyFor -= dt;
        c.vel.y -= G * 0.5 * dt;
        m.position.addScaledVector(c.vel, dt);
        e3.set(c.spin.x * dt, c.spin.y * dt, c.spin.z * dt);
        m.quaternion.multiply(q.setFromEuler(e3));
        return;
      }
      const a = ring + (i / n) * Math.PI * 2 + Math.PI / 2;
      target.set(Math.cos(a) * ringR, 2.55 + Math.sin(total * 1.2 + i * 1.7) * 0.14 + c.hover * 0.15, Math.sin(a) * ringR);
      // underdamped spring, so they arrive with a bit of swing
      v3.subVectors(target, m.position).multiplyScalar(22);
      c.vel.addScaledVector(v3, dt).multiplyScalar(1 - Math.min(1, dt * 4.2));
      m.position.addScaledVector(c.vel, dt);
      c.hover += ((hovered === c ? 1 : 0) - c.hover) * Math.min(1, dt * 8);
      // face the camera, leaning into the motion
      m4.lookAt(camera.position, m.position, camera.up);
      faceQ.setFromRotationMatrix(m4);
      e3.set(-c.vel.y * 0.04, 0, -c.vel.x * 0.05);
      faceQ.multiply(q.setFromEuler(e3));
      m.quaternion.slerp(faceQ, Math.min(1, dt * 5));
    });

    // ── camera ──
    const off = pointer.x > 5;
    pointerSmooth.lerp(p2.set(off ? 0 : pointer.x, off ? 0 : pointer.y), Math.min(1, dt * 2));
    camShake *= Math.exp(-dt * 7);
    const k = ease(camPull);
    const d = dist * (0.72 + 0.28 * k);
    camera.position.set(
      pointerSmooth.x * 0.6 + (Math.random() - 0.5) * camShake,
      lookY + 1.35 + 0.65 * k + pointerSmooth.y * 0.3 + (Math.random() - 0.5) * camShake,
      d,
    );
    // follow the box down with a little lag, so the drop feels heavy
    lookY += (y * 0.85 + 1.25 + 0.55 * k - lookY) * Math.min(1, dt * 5);
    lookAt.set(0, lookY, 0);
    camera.lookAt(lookAt);

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("click", onClick);
      scene.traverse((obj) => {
        const mesh = obj as Mesh;
        mesh.geometry?.dispose();
        const mats = mesh.material ? (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) : [];
        for (const mat of mats) {
          for (const v of Object.values(mat)) if (v instanceof Texture) v.dispose();
          mat.dispose();
        }
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss(); // free the WebGL context now, not at GC; browsers cap them
    },
  };
}
