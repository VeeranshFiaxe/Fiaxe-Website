/* The solutions page's 3D "F": one extruded Fiaxe mark drawn on a transparent
   canvas. It knows nothing about the page; each frame
   components/site/FTrail.tsx tells it where to sit in CSS px, how tall to be
   and how to turn. Loaded on demand. */

import {
  ACESFilmicToneMapping,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Shape,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type FState = {
  /** centre of the glyph, CSS px from the canvas's top left */
  x: number;
  y: number;
  /** glyph height in CSS px */
  size: number;
  yaw: number;
  pitch: number;
  roll: number;
};

export type TrailEngine = {
  render(s: FState): void;
  setTheme(dark: boolean): void;
  destroy(): void;
};

/* The FIAXE "F" mark, same paths as components/Logo.tsx (1024 × 1024).
   Its bounding box is x 27–995, y 120–977. */
const PATHS: [number, number][][] = [
  [[158, 565], [27, 357], [203, 120], [995, 130], [884, 334], [347, 341], [180, 569]],
  [[160, 775], [388, 449], [813, 452], [700, 660], [508, 674], [314, 977], [266, 947]],
];
const CX = 511;
const CY = 548.5;
const GLYPH_H = 857; // bbox height in path units; the glyph is built 1 unit tall
const DEPTH = 0.2;

const FOV = 30;
const DIST = 10;

export function createTrail(canvas: HTMLCanvasElement, dark: boolean): TrailEngine {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.9;

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, DIST);

  scene.add(new HemisphereLight(0xffffff, 0x1a1820, 0.5));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 6, 6);
  scene.add(key);
  const rim = new DirectionalLight(0xbfd8ff, 1.3);
  rim.position.set(-6, 2, -5);
  scene.add(rim);

  // metal that matches the page's text colour in either theme
  const body = new MeshPhysicalMaterial({ metalness: 0.9, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const setTheme = (d: boolean) => {
    body.color = new Color(d ? 0xd8d6d2 : 0x3a3834);
  };
  setTheme(dark);

  const k = 1 / GLYPH_H;
  const bevel = 0.012;
  const geos = PATHS.map((path) => {
    const shape = new Shape();
    path.forEach(([x, y], i) => (i ? shape.lineTo((x - CX) * k, -(y - CY) * k) : shape.moveTo((x - CX) * k, -(y - CY) * k)));
    shape.closePath();
    const g = new ExtrudeGeometry(shape, {
      depth: DEPTH - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelOffset: -bevel,
      bevelSegments: 3,
      curveSegments: 1,
    });
    g.translate(0, 0, -(DEPTH - bevel * 2) / 2);
    return g;
  });

  const glyph = new Group();
  for (const g of geos) glyph.add(new Mesh(g, body));
  scene.add(glyph);

  let w = 1;
  let h = 1;
  let unit = 1; // world units per CSS px on the z = 0 plane
  const resize = () => {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    unit = (2 * DIST * Math.tan((FOV * Math.PI) / 360)) / h;
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    render(s) {
      glyph.position.set((s.x - w / 2) * unit, -(s.y - h / 2) * unit, 0);
      glyph.rotation.set(s.pitch, s.yaw, s.roll);
      glyph.scale.setScalar(Math.max(0.0001, s.size * unit));
      renderer.render(scene, camera);
    },
    setTheme,
    destroy() {
      ro.disconnect();
      for (const g of geos) g.dispose();
      body.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
