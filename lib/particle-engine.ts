/* The particle model's engine. Loaded on demand by
   components/site/ParticleModel.tsx, so Three.js never lands in the initial
   bundle of any page.

   What it does, and what it costs:
     · one Float32Array of positions, simulated on the CPU (springs toward the
       current shape + a push away from the cursor) and uploaded per frame;
     · everything visual (size, depth fade, colour, a gentle float) is in the
       shader, so it costs no uploads;
     · when the grains have settled and the cursor is elsewhere the sim stops
       and only the draw call remains; when the canvas is offscreen or the
       tab is hidden, nothing runs at all. */

import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DynamicDrawUsage,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import type { ShapeKey } from "./catalog";
import { buildShape } from "./particle-shapes";

const TUNE = {
  spring: 16, // 1/s² pull toward home
  damping: 4.6, // 1/s, a touch under critical so shapes settle with a small overshoot
  brush: 0.5, // world units around the cursor that feel it
  push: 26, // strength of the cursor push
  sway: 0.55, // rad the model turns either side while idle
  swaySpeed: 0.32, // rad/s of the sway cycle
  tilt: 0.28, // rad the model leans toward the cursor
  size: 2.4, // px at the camera's resting distance, before DPR
  dprCap: 1.5,
  cameraZ: 5.2,
  sleepBelow: 0.00002, // mean squared speed under which the sim sleeps
};

export type Engine = {
  setShape(shape: ShapeKey, accent: string): void;
  burst(): void;
  setActive(active: boolean): void;
  destroy(): void;
};

const vertex = /* glsl */ `
  attribute float aSeed;
  uniform float uSize;
  uniform float uTime;
  uniform float uCam;
  varying float vDepth;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p += 0.014 * vec3(
      sin(uTime * 0.7 + aSeed * 40.0),
      cos(uTime * 0.6 + aSeed * 31.0),
      sin(uTime * 0.5 + aSeed * 17.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aSeed * 0.9) * (uCam / -mv.z);
    vDepth = clamp((-mv.z - (uCam - 1.4)) / 2.8, 0.0, 1.0);
    vSeed = aSeed;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uBase;
  varying float vDepth;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.12, d);
    // most grains carry the accent; a share carry the page's ink for depth
    vec3 col = mix(uColor, uBase, step(0.74, vSeed) * 0.6);
    col *= mix(1.0, 0.72, vDepth);
    a *= mix(0.95, 0.3, vDepth);
    gl_FragColor = vec4(col, a);
  }
`;

function readInk(): Color {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--cream").trim();
  return new Color(v || "#f4f1ec");
}

export function createEngine(
  canvas: HTMLCanvasElement,
  opts: { shape: ShapeKey; accent: string; count: number; reduced: boolean },
): Engine {
  const { count: n, reduced } = opts;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
  const dpr = Math.min(window.devicePixelRatio || 1, TUNE.dprCap);
  renderer.setPixelRatio(dpr);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 50);
  camera.position.z = TUNE.cameraZ;

  let target = buildShape(opts.shape, n);
  const pos = new Float32Array(target);
  const vel = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  const stiff = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    seed[i] = Math.random();
    stiff[i] = TUNE.spring * (0.55 + Math.random() * 0.9);
  }

  const geo = new BufferGeometry();
  const posAttr = new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("aSeed", new BufferAttribute(seed, 1));

  const color = new Color(opts.accent);
  const colorTarget = new Color(opts.accent);
  const mat = new ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uColor: { value: color },
      uBase: { value: readInk() },
      uSize: { value: TUNE.size * dpr },
      uTime: { value: 0 },
      uCam: { value: TUNE.cameraZ },
    },
  });
  const points = new Points(geo, mat);
  scene.add(points);

  /* ---- pointer, in the model's own coordinates ---- */
  const hover = window.matchMedia("(hover: hover)").matches;
  const ndc = new Vector2();
  const ray = new Raycaster();
  const plane = new Plane(new Vector3(0, 0, 1), 0);
  const hit = new Vector3();
  let pointerAt = -1e9; // last time the pointer moved near the canvas
  let tiltX = 0, tiltY = 0;

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ndc.set(x, y);
    // only count as "engaged" when reasonably close to the model
    if (Math.abs(x) < 1.4 && Math.abs(y) < 1.4) pointerAt = performance.now();
    wake();
  };
  if (hover) window.addEventListener("pointermove", onMove, { passive: true });

  /* ---- theme ---- */
  const themeObs = new MutationObserver(() => {
    mat.uniforms.uBase.value = readInk();
    wake();
  });
  themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---- size ---- */
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the whole shape in frame on tall/narrow boxes
    camera.position.z = TUNE.cameraZ * Math.max(1, 1 / camera.aspect);
    camera.updateProjectionMatrix();
    wake();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  /* ---- loop ---- */
  let raf = 0;
  // runs only while the canvas is on screen AND the tab is visible
  let inView = true;
  let pageVisible = !document.hidden;
  let active = inView && pageVisible;
  let last = performance.now();
  let t = 0;
  let asleep = false;

  function step(dt: number, engaged: boolean) {
    let local: Vector3 | null = null;
    if (engaged) {
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) local = points.worldToLocal(hit.clone());
    }
    const R = TUNE.brush, R2 = R * R;
    const damp = Math.exp(-TUNE.damping * dt);
    let energy = 0;
    for (let i = 0; i < n; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2;
      const k = stiff[i];
      let vx = vel[ix] + (target[ix] - pos[ix]) * k * dt;
      let vy = vel[iy] + (target[iy] - pos[iy]) * k * dt;
      let vz = vel[iz] + (target[iz] - pos[iz]) * k * dt;
      if (local) {
        const dx = pos[ix] - local.x, dy = pos[iy] - local.y, dz = (pos[iz] - local.z) * 0.5;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < R2 && d2 > 1e-6) {
          const d = Math.sqrt(d2);
          const f = (1 - d / R) * TUNE.push * dt;
          vx += (dx / d) * f;
          vy += (dy / d) * f;
          vz += (dz / d) * f;
        }
      }
      vx *= damp; vy *= damp; vz *= damp;
      vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
      pos[ix] += vx * dt; pos[iy] += vy * dt; pos[iz] += vz * dt;
      energy += vx * vx + vy * vy + vz * vz;
    }
    posAttr.needsUpdate = true;
    return energy / n;
  }

  function frame(now: number) {
    raf = 0;
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    t += dt;

    const engaged = hover && now - pointerAt < 1500;
    if (!asleep || engaged) {
      const e = step(dt, engaged);
      asleep = !engaged && e < TUNE.sleepBelow;
    }

    color.lerp(colorTarget, Math.min(1, dt * 4));
    mat.uniforms.uTime.value = t;

    if (!reduced) {
      // sway rather than spin: flat shapes (browser, network) stay readable
      points.rotation.y = Math.sin(t * TUNE.swaySpeed) * TUNE.sway + tiltY;
      const tx = engaged ? -ndc.y * TUNE.tilt : 0;
      const ty = engaged ? ndc.x * TUNE.tilt : 0;
      tiltX += (tx - tiltX) * Math.min(1, dt * 3);
      tiltY += (ty - tiltY) * Math.min(1, dt * 3);
      points.rotation.x = 0.18 + tiltX;
      points.rotation.z = tiltY * 0.15;
    }

    renderer.render(scene, camera);

    // reduced motion: draw until settled, then stop entirely
    const colorDone = Math.abs(color.r - colorTarget.r) + Math.abs(color.g - colorTarget.g) < 0.002;
    if (active && (!reduced || !asleep || !colorDone)) raf = requestAnimationFrame(frame);
  }

  function wake() {
    asleep = false;
    if (active && !raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  const onVis = () => {
    pageVisible = !document.hidden;
    apply();
  };
  function apply() {
    active = inView && pageVisible;
    if (active) wake();
    else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  }
  document.addEventListener("visibilitychange", onVis);

  resize();
  if (reduced) points.rotation.set(0.18, 0.5, 0);
  wake();

  const engine: Engine = {
    setShape(shape, accent) {
      target = buildShape(shape, n);
      colorTarget.set(accent);
      if (reduced) pos.set(target);
      else {
        // a small outward kick so the old shape visibly lets go
        for (let i = 0; i < n * 3; i++) vel[i] += (Math.random() - 0.5) * 1.4;
      }
      posAttr.needsUpdate = true;
      wake();
    },
    burst() {
      if (reduced) return;
      for (let i = 0; i < n; i++) {
        const ix = i * 3;
        const s = 2 + Math.random() * 3;
        vel[ix] += pos[ix] * s;
        vel[ix + 1] += pos[ix + 1] * s;
        vel[ix + 2] += pos[ix + 2] * s;
      }
      wake();
    },
    setActive(on) {
      inView = on;
      apply();
    },
    destroy() {
      engine.setActive(false);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVis);
      themeObs.disconnect();
      ro.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
  return engine;
}
