/* The home page intro: a 3D Fiaxe box settles in, its logo fades up, the lid
   opens and every offering rises out as a card. The cards then orbit the box;
   hover stops the orbit, click opens that offering. Loaded on demand by
   components/site/IntroBox.tsx.

   Cards start inside the open box, where the walls hide what's below the
   rim, and rise straight up until they clear it before moving out.

   Motion is kept deliberately quiet: eased tweens and damped springs, no
   bounces, shakes or particles. */

import {
  ACESFilmicToneMapping,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  Euler,
  Fog,
  Group,
  HemisphereLight,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  ShadowMaterial,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Texture,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type IntroItem = { name: string; tagline: string; kind: string; accent: string; href: string };

/* A card as it sits on screen at hand-off: its face (the card artwork) and
   its bounding box in viewport pixels. */
export type CardSnapshot = { href: string; face: HTMLCanvasElement; left: number; top: number; width: number; height: number };

export type IntroEngine = {
  /* Hide the 3D cards and return where each one was on screen, so the page
     can carry on with them as flat elements; the box then fades away. */
  exit(): CardSnapshot[];
  destroy(): void;
};

type Opts = {
  canvas: HTMLCanvasElement;
  items: IntroItem[];
  bg: string;
  /** card surface, text, secondary text and hairline colours */
  surface: string;
  text: string;
  muted: string;
  line: string;
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

// cards: portrait panels with real rounded corners
const CW = 1.3;
const CH = 1.66;
const CR = 0.07;
const TEX_W = 640;
const TEX_H = Math.round((TEX_W * CH) / CW);
const TEX_R = (CR / CW) * TEX_W;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

function logoTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d")!;
  const pad = 40;
  const s = (512 - pad * 2) / 1024;
  ctx.translate(pad, pad);
  ctx.scale(s, s);
  ctx.fillStyle = "#ffffff";
  for (const d of F_PATHS) ctx.fill(new Path2D(d));
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, maxLines: number) {
  const lines: string[] = [];
  let line = "";
  for (const w of text.split(" ")) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > max && line) {
      lines.push(line);
      line = w;
    } else line = next;
  }
  lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

type Palette = { surface: string; text: string; muted: string; line: string };

function cardSurface(ctx: CanvasRenderingContext2D, p: Palette) {
  ctx.fillStyle = p.surface;
  ctx.fillRect(0, 0, TEX_W, TEX_H);
  // hairline border, inset so it follows the geometry's rounded corners
  ctx.beginPath();
  ctx.roundRect(1.5, 1.5, TEX_W - 3, TEX_H - 3, TEX_R - 1.5);
  ctx.lineWidth = 3;
  ctx.strokeStyle = p.line;
  ctx.stroke();
}

function cardTexture(it: IntroItem, index: number, p: Palette, font: string) {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const ctx = c.getContext("2d")!;
  cardSurface(ctx, p);
  const x = 56;
  const inner = TEX_W - x * 2;

  // top row: small accent dot + kind, index on the right
  ctx.fillStyle = it.accent;
  ctx.beginPath();
  ctx.arc(x + 6, 72, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = p.muted;
  ctx.font = `500 22px ${font}`;
  ctx.letterSpacing = "3px";
  ctx.fillText(it.kind.toUpperCase(), x + 26, 80);
  ctx.textAlign = "right";
  ctx.fillText(String(index + 1).padStart(2, "0"), TEX_W - x, 80);
  ctx.textAlign = "left";
  ctx.letterSpacing = "0px";

  // bottom block, laid out upwards: footer, hairline, tagline, name
  ctx.fillStyle = p.muted;
  ctx.font = `500 24px ${font}`;
  ctx.fillText("Explore", x, TEX_H - 58);
  ctx.textAlign = "right";
  ctx.fillText("→", TEX_W - x, TEX_H - 58);
  ctx.textAlign = "left";
  ctx.fillStyle = p.line;
  ctx.fillRect(x, TEX_H - 110, inner, 2);

  ctx.font = `400 28px ${font}`;
  const tag = wrap(ctx, it.tagline, inner, 2);
  let y = TEX_H - 150 - (tag.length - 1) * 40;
  ctx.fillStyle = p.muted;
  tag.forEach((l, i) => ctx.fillText(l, x, y + i * 40));

  ctx.font = `500 58px ${font}`;
  ctx.letterSpacing = "-1px";
  const name = wrap(ctx, it.name, inner, 3);
  y -= 44 + (name.length - 1) * 64;
  ctx.fillStyle = p.text;
  name.forEach((l, i) => ctx.fillText(l, x, y + i * 64));

  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function cardBackTexture(p: Palette) {
  const c = document.createElement("canvas");
  c.width = TEX_W / 2;
  c.height = TEX_H / 2;
  const ctx = c.getContext("2d")!;
  ctx.scale(0.5, 0.5);
  cardSurface(ctx, p);
  const s = 110;
  ctx.translate((TEX_W - s) / 2, (TEX_H - s) / 2);
  ctx.scale(s / 1024, s / 1024);
  ctx.fillStyle = p.muted;
  for (const d of F_PATHS) ctx.fill(new Path2D(d));
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/* A flat rounded rectangle with UVs spanning 0..1, so the texture maps
   edge to edge and the corners are cut in the geometry itself. */
function cardGeometry() {
  const s = new Shape();
  const x = -CW / 2;
  const y = -CH / 2;
  s.moveTo(x + CR, y);
  s.lineTo(x + CW - CR, y);
  s.quadraticCurveTo(x + CW, y, x + CW, y + CR);
  s.lineTo(x + CW, y + CH - CR);
  s.quadraticCurveTo(x + CW, y + CH, x + CW - CR, y + CH);
  s.lineTo(x + CR, y + CH);
  s.quadraticCurveTo(x, y + CH, x, y + CH - CR);
  s.lineTo(x, y + CR);
  s.quadraticCurveTo(x, y, x + CR, y);
  const g = new ShapeGeometry(s, 10);
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - x) / CW, (pos.getY(i) - y) / CH);
  uv.needsUpdate = true;
  return g;
}

export function createIntro(o: Opts): IntroEngine {
  const { canvas, items } = o;
  const pal: Palette = { surface: o.surface, text: o.text, muted: o.muted, line: o.line };
  // modest machine (.lite: few cores or little memory, set in app/layout.tsx):
  // fewer pixels, smaller shadows
  const low = document.documentElement.classList.contains("lite");
  const renderer = new WebGLRenderer({ canvas, antialias: !low, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1 : 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const bg = new Color(o.bg);
  // light theme: the floor only shows soft shadows, so it melts into the page
  const light = bg.getHSL({ h: 0, s: 0, l: 0 }).l > 0.5;
  const scene = new Scene();
  scene.background = bg;
  const fog = new Fog(bg, 9, 21);
  scene.fog = fog;
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.45;

  const camera = new PerspectiveCamera(34, 1, 0.1, 60);
  const lookAt = new Vector3(0, 1.5, 0);

  // ── lights ──
  scene.add(new HemisphereLight(0xffffff, 0x222026, 0.35));
  const key = new DirectionalLight(0xffffff, 2);
  key.position.set(4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.setScalar(low ? 1024 : 2048);
  key.shadow.camera.left = key.shadow.camera.bottom = -7;
  key.shadow.camera.right = key.shadow.camera.top = 7;
  key.shadow.radius = 6;
  key.shadow.bias = -0.0004;
  scene.add(key);
  const rim = new DirectionalLight(0xffffff, 0.7);
  rim.position.set(-6, 4, -6);
  scene.add(rim);

  // ── floor ──
  const floorMat = light
    ? new ShadowMaterial({ color: 0x1b1714, opacity: 0.14 })
    : new MeshStandardMaterial({ color: bg.clone().multiplyScalar(0.9), roughness: 1, metalness: 0, transparent: true });
  const floorOpacity = floorMat.opacity;
  const floor = new Mesh(new CircleGeometry(40, 64), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // ── the box: matte, dark, soft edges ──
  const shell = new MeshPhysicalMaterial({
    color: 0x1b1a1f,
    metalness: 0.2,
    roughness: 0.5,
    clearcoat: 0.35,
    clearcoatRoughness: 0.4,
  });
  const inner = new MeshStandardMaterial({ color: 0x0e0d10, roughness: 0.8, metalness: 0.1 });
  const boxRoot = new Group();
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

  // the F on the front face
  const logoMat = new MeshBasicMaterial({ map: logoTexture(), transparent: true, opacity: 0, toneMapped: false, depthWrite: false });
  const logo = new Mesh(new PlaneGeometry(0.8, 0.8), logoMat);
  logo.position.set(0, H * 0.5, D / 2 + 0.004);
  box.add(logo);

  // soft warm light from inside once the lid lifts
  const core = new PointLight(0xfff4e6, 0, 7, 1.8);
  core.position.set(0, H * 0.7, 0);
  box.add(core);

  // ── offering cards ──
  const cardMat = (map: Texture) => new MeshBasicMaterial({ map, toneMapped: false });
  const cardGeo = cardGeometry();
  type Card = {
    obj: Group;
    href: string;
    face: HTMLCanvasElement;
    delay: number;
    hover: number;
    // polar position around the box, each on its own damped spring
    ang: number;
    angV: number;
    rad: number;
    radV: number;
    hgt: number;
    hgtV: number;
    prev: Vector3;
  };
  const cards: Card[] = items.map((it, i) => {
    const obj = new Group();
    const faceTex = cardTexture(it, i, pal, o.font);
    const front = new Mesh(cardGeo, cardMat(faceTex));
    const back = new Mesh(cardGeo, cardMat(cardBackTexture(pal)));
    back.rotation.y = Math.PI;
    front.userData.i = back.userData.i = i;
    obj.add(front, back);
    obj.visible = false;
    scene.add(obj);
    return { obj, href: it.href, face: faceTex.image as HTMLCanvasElement, delay: 0, hover: 0, ang: 0, angV: 0, rad: 0, radV: 0, hgt: 0, hgtV: 0, prev: new Vector3() };
  });

  // ── state ──
  type Phase = "enter" | "rest" | "open";
  let phase: Phase = "enter";
  let pt = 0; // time in phase
  let total = 0;
  let y = 1.1;
  let lidA = 0;
  let lookY = 2.2;
  let camPull = 0; // 0 = close intro framing, 1 = wide framing for the orbit
  let ring = 0;
  let ringSpeed = 0.12;
  let opened = false;
  let hovered: Card | null = null;
  let boxHover = false;

  const pointer = new Vector2(9, 9);
  const pointerSmooth = new Vector2();
  const raycaster = new Raycaster();

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
    dist = Math.max(10.5, (ringR + CW * 0.8) / (half * camera.aspect) + ringR * 0.6);
    fog.near = dist * 0.85;
    fog.far = dist * 2.1;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const open = () => {
    phase = "open";
    pt = 0;
    opened = true;
    boxRoot.position.y = 0;
    boxRoot.rotation.set(0, REST_YAW, 0);
    box.scale.setScalar(1);
    // leave towards the camera (away from the lid), fanned out, then slide
    // round the ring to their slots
    const n = cards.length;
    cards.forEach((c, i) => {
      c.ang = Math.PI / 2 + 1.1 * (n > 1 ? i / (n - 1) - 0.5 : 0);
      c.rad = 0.15;
      // sits on the box floor at its starting size (0.6), fully inside
      c.hgt = T + CH * 0.3 + 0.02;
      c.angV = c.radV = 0;
      c.hgtV = 1.5;
      c.obj.position.set(Math.cos(c.ang) * c.rad, c.hgt, Math.sin(c.ang) * c.rad);
      c.prev.copy(c.obj.position);
      c.obj.scale.setScalar(0.6);
      c.delay = 0.45 + i * 0.12;
    });
    window.setTimeout(o.onOpened, 1400);
  };

  // ── input ──
  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  };
  const onLeave = () => pointer.set(9, 9);
  const onClick = () => {
    if (hovered) o.onPick(hovered.href);
    else if (boxHover && !opened) open();
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
  const faceQ = new Quaternion();
  const meshes = cards.flatMap((c) => c.obj.children);

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
    if (exiting) {
      exitFrame(dt);
      renderer.render(scene, camera);
      // once the box has gone there is nothing left to draw
      if (et > FADE_BOX) cancelAnimationFrame(raf);
      return;
    }

    // ── box choreography ──
    let yaw = REST_YAW;
    if (phase === "enter") {
      const k = easeOut(pt / 1.9);
      y = 1.1 * (1 - k);
      yaw = -1.25 + (REST_YAW + 1.25) * k;
      box.scale.setScalar(0.94 + 0.06 * k);
      logoMat.opacity = 0.9 * easeInOut((pt - 0.5) / 1.1);
      if (pt > 1.9) {
        phase = "rest";
        pt = 0;
      }
    } else if (phase === "rest") {
      y = 0;
      box.scale.setScalar(1);
      if (pt > 0.5) open();
    } else {
      y = 0;
      box.scale.setScalar(1);
      logoMat.opacity = 0.9;
      lidA = -1.75 * easeInOut(pt / 1.2);
      core.intensity = 3.5 * easeOut(pt / 1.2);
      // only the box casts shadows, and once the lid is up it holds still:
      // draw its shadow one last time, then stop redrawing it every frame
      if (pt > 1.25 && renderer.shadowMap.autoUpdate) {
        renderer.shadowMap.autoUpdate = false;
        renderer.shadowMap.needsUpdate = true;
      }
      camPull = Math.min(1, camPull + dt * 0.55);
    }
    boxRoot.position.y = y;
    boxRoot.rotation.set(0, yaw, 0);
    hinge.rotation.x = lidA;

    // ── pointer ──
    // (skipped while the pointer is off the canvas: nothing can be hovered)
    const pointerOn = pointer.x < 5;
    if (pointerOn) raycaster.setFromCamera(pointer, camera);
    const hits = pointerOn
      ? raycaster.intersectObjects(
          meshes.filter((m) => m.parent!.visible),
          false,
        )
      : [];
    const nextHover = hits.length ? cards[hits[0].object.userData.i as number] : null;
    if (nextHover !== hovered) {
      hovered = nextHover;
      o.onHover(hovered ? hovered.href : null);
    }
    boxHover = pointerOn && !hovered && !opened && raycaster.intersectObject(box, true).length > 0;
    canvas.style.cursor = hovered || boxHover ? "pointer" : "default";

    // ── cards: rise out of the box, then ease into a slow orbit ──
    ringSpeed += ((hovered ? 0 : 0.12) - ringSpeed) * Math.min(1, dt * 4);
    ring += ringSpeed * dt;
    const n = cards.length;
    cards.forEach((c, i) => {
      if (!opened) return;
      const m = c.obj;
      if (c.delay > 0) {
        c.delay -= dt;
        if (c.delay > 0) return;
        m.visible = true;
      }
      m.scale.setScalar(m.scale.x + (1 + c.hover * 0.06 - m.scale.x) * Math.min(1, dt * 4));
      const slot = ring + (i / n) * Math.PI * 2 + Math.PI / 2;
      let da = (slot - c.ang) % (Math.PI * 2);
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      // rise straight up until the card clears the rim, then move out and
      // round; the angle is slower, so cards are out at full radius before
      // they swing round behind the box
      const clear = c.hgt > H + CH / 2 + 0.08;
      if (clear) c.angV += (da * 4 - c.angV * 4) * dt;
      c.radV += ((clear ? ringR : 0.15) - c.rad) * 9 * dt - c.radV * 6 * dt;
      const h = 2.5 + Math.sin(total * 0.8 + i * 1.7) * 0.06 + c.hover * 0.12;
      c.hgtV += ((h - c.hgt) * 9 - c.hgtV * 6) * dt;
      c.ang += c.angV * dt;
      c.rad += c.radV * dt;
      c.hgt += c.hgtV * dt;
      c.prev.copy(m.position);
      m.position.set(Math.cos(c.ang) * c.rad, c.hgt, Math.sin(c.ang) * c.rad);
      v3.subVectors(m.position, c.prev).divideScalar(Math.max(dt, 1e-3));
      c.hover += ((hovered === c ? 1 : 0) - c.hover) * Math.min(1, dt * 8);
      // face the camera, with a slight lean into the motion
      m4.lookAt(camera.position, m.position, camera.up);
      faceQ.setFromRotationMatrix(m4);
      e3.set(-v3.y * 0.015, 0, -v3.x * 0.02);
      faceQ.multiply(q.setFromEuler(e3));
      m.quaternion.slerp(faceQ, Math.min(1, dt * 6));
    });

    // ── camera ──
    const off = pointer.x > 5;
    pointerSmooth.lerp(p2.set(off ? 0 : pointer.x, off ? 0 : pointer.y), Math.min(1, dt * 1.5));
    const k = easeInOut(camPull);
    const d = dist * (0.72 + 0.28 * k);
    camera.position.set(pointerSmooth.x * 0.4, lookY + 1.35 + 0.65 * k + pointerSmooth.y * 0.2, d);
    // once open, aim lower so the box sits above the headline
    lookY += (y * 0.85 + 1.25 - 0.3 * k - lookY) * Math.min(1, dt * 3);
    lookAt.set(0, lookY, 0);
    camera.lookAt(lookAt);

    renderer.render(scene, camera);
  }
  raf = requestAnimationFrame(frame);

  // ── exit: hand the cards over to the page as flat snapshots ──
  let exiting = false;
  let et = 0;
  const FADE_BOX = 0.5;
  const boxMats = [shell, inner, logoMat];
  const corner = new Vector3();

  const exit: IntroEngine["exit"] = () => {
    if (exiting) return [];
    exiting = true;
    et = 0;
    renderer.shadowMap.autoUpdate = true; // the box sinks away, and its shadow with it
    hovered = null;
    canvas.style.cursor = "default";
    for (const m of boxMats) {
      m.transparent = true;
      m.needsUpdate = true;
    }
    camera.updateMatrixWorld();
    const cr = canvas.getBoundingClientRect();
    const out: CardSnapshot[] = [];
    for (const c of cards) {
      const m = c.obj;
      if (!m.visible) continue;
      m.updateMatrixWorld();
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        corner.set((sx * CW) / 2, (sy * CH) / 2, 0).applyMatrix4(m.matrixWorld).project(camera);
        const px = cr.left + ((corner.x + 1) / 2) * cr.width;
        const py = cr.top + ((1 - corner.y) / 2) * cr.height;
        x0 = Math.min(x0, px);
        x1 = Math.max(x1, px);
        y0 = Math.min(y0, py);
        y1 = Math.max(y1, py);
      }
      out.push({ href: c.href, face: c.face, left: x0, top: y0, width: x1 - x0, height: y1 - y0 });
      m.visible = false;
    }
    return out;
  };

  // the box sinks and fades while the snapshots take over
  function exitFrame(dt: number) {
    et += dt;
    const k = easeInOut(et / FADE_BOX);
    for (const m of boxMats) m.opacity = (m === logoMat ? 0.9 : 1) * (1 - k);
    floorMat.opacity = floorOpacity * (1 - k);
    core.intensity *= 1 - k;
    boxRoot.position.y = -0.6 * k;
    box.scale.setScalar(1 - 0.08 * k);
    if (k >= 1) boxRoot.visible = floor.visible = false;
  }

  return {
    exit,
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
