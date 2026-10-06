import * as THREE from "three";

/*
  Cena fixa atrás do site com duas camadas:
  1. Estrelas — campo de estrelas sutil, com paralaxe no mouse e na rolagem.
  2. Esfera   — milhares de partículas que se reorganizam conforme a rolagem:
                esfera "respirando" (hero) → "</>" (Tecnologias) → "MM" (Contato).

  Posição e tamanho seguem elementos-âncora no HTML (data-shape="sphere" | "code" | "mono").
  `state.intro` (0 → 1) e `state.morph` (0 → 1 → 2) são animados pelo GSAP em ParticleBackground.jsx.
*/

const COLOR = new THREE.Color("#2864ff");
const HIGHLIGHT = new THREE.Color("#b7caff");

// Raio da esfera em unidades locais (a forma tem altura de referência SHAPE_HEIGHT)
const SPHERE_RADIUS = 1.1;
// Inclinação leve da esfera, para ver um pouco do "topo" (radianos)
const SPHERE_TILT = 0.25;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uIntro;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uMouseStrength;

  attribute vec3 aCode;
  attribute vec3 aMono;
  attribute vec3 aScatter;
  attribute float aRand;

  varying float vMix;
  varying float vRand;

  mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    // Esfera girando devagar e "respirando": o tamanho pulsa e cada ponto oscila no seu ritmo
    vec3 sphere = position;
    sphere.xz = rot(uTime * 0.25) * sphere.xz;
    float breath = 1.0 + sin(uTime * 1.2) * 0.035;
    float wobble = 1.0 + sin(uTime * 1.6 + aRand * 6.2831 + position.y * 3.0) * 0.035;
    sphere *= breath * wobble;

    // Cada partícula começa a transição num momento diferente (aRand)
    float m1 = smoothstep(0.0, 1.0, clamp((uMorph - aRand * 0.3) / 0.7, 0.0, 1.0));
    float m2 = smoothstep(0.0, 1.0, clamp((uMorph - 1.0 - aRand * 0.3) / 0.7, 0.0, 1.0));
    vec3 p = mix(mix(sphere, aCode, m1), aMono, m2);

    // "Explosão" no meio de cada transição
    float burst = sin(m1 * 3.14159) + sin(m2 * 3.14159);
    p += aScatter * burst * 0.9;

    // Leve tremulação nas formas de texto
    p.xy += vec2(sin(uTime * 0.8 + aRand * 20.0), cos(uTime * 0.7 + aRand * 15.0)) * 0.012 * m1;

    // Entrada: partículas espalhadas se juntam na esfera
    float it = smoothstep(0.0, 1.0, clamp((uIntro - aRand * 0.4) / 0.6, 0.0, 1.0));
    p = mix(aScatter * 6.0 + vec3(0.0, 0.0, -3.0), p, it);

    // Cursor empurra as partículas
    vec2 dir = p.xy - uMouse;
    float f = exp(-dot(dir, dir) * 2.5) * uMouseStrength;
    p.xy += normalize(dir + 0.0001) * f * 0.35;
    p.z += f * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 + f) / -mv.z;

    // Mais claro na frente (z maior), perto do cursor e nas explosões
    vMix = f + burst * 0.5 + (p.z + 1.1) * 0.25;
    vRand = aRand;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHighlight;
  uniform float uOpacity;

  varying float vMix;
  varying float vRand;

  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float soft = smoothstep(0.5, 0.05, r);

    vec3 color = mix(uColor, uHighlight, clamp(vMix, 0.0, 1.0));
    gl_FragColor = vec4(color, soft * uOpacity * (0.5 + 0.5 * vRand));
  }
`;

// Altura de referência de todas as formas (unidades 3D)
const SHAPE_HEIGHT = 2.4;

// Pontos distribuídos por igual na superfície da esfera (espiral de Fibonacci)
function sphereFrom(count) {
  const out = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const r = SPHERE_RADIUS * (0.97 + Math.random() * 0.06);
    out[i * 3] = Math.cos(golden * i) * radius * r;
    out[i * 3 + 1] = y * r;
    out[i * 3 + 2] = Math.sin(golden * i) * radius * r;
  }
  return out;
}

// Desenha o texto num canvas 2D e sorteia pontos dentro das letras
function textFrom(text, count) {
  const W = 1400;
  const H = 420;
  const fontSize = 320;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#fff";
  ctx.font = `800 ${fontSize}px "Source Code Pro", ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);

  const data = ctx.getImageData(0, 0, W, H).data;
  const pixels = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      if (data[(y * W + x) * 4 + 3] > 128) pixels.push(x, y);
    }
  }

  const scale = 3.2 / fontSize;
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = Math.floor(Math.random() * (pixels.length / 2)) * 2;
    out[i * 3] = (pixels[p] - W / 2 + Math.random() * 2) * scale;
    out[i * 3 + 1] = -(pixels[p + 1] - H / 2 + Math.random() * 2) * scale;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.35;
  }
  return out;
}

function randomDirections(count) {
  const out = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.randomDirection().multiplyScalar(0.5 + Math.random() * 0.5);
    out.set([v.x, v.y, v.z], i * 3);
  }
  return out;
}

// Textura de "bolinha de luz" para as estrelas e o brilho atrás da esfera
function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d");
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

export async function createParticleScene(container, state, { reducedMotion = false } = {}) {
  // As letras usam a fonte do site: espera ela carregar antes de desenhar
  try {
    await document.fonts.load('800 320px "Source Code Pro"');
  } catch {
    /* segue com a fonte de fallback */
  }

  const isSmall = window.innerWidth < 768;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 10);
  const glow = glowTexture();

  // ---------- Campo de estrelas ----------
  const starCount = isSmall ? 700 : 1500;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 80;
    starPositions[i * 3 + 1] = -55 + Math.random() * 85;
    starPositions[i * 3 + 2] = -10 - Math.random() * 50;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    size: 0.35,
    map: glow,
    color: HIGHLIGHT,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ---------- Esfera que se transforma ----------
  const count = isSmall ? 3200 : 6000;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(sphereFrom(count), 3));
  geometry.setAttribute("aCode", new THREE.BufferAttribute(textFrom("</>", count), 3));
  geometry.setAttribute("aMono", new THREE.BufferAttribute(textFrom("MM", count), 3));
  geometry.setAttribute("aScatter", new THREE.BufferAttribute(randomDirections(count), 3));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(Float32Array.from({ length: count }, Math.random), 1));

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uIntro: { value: reducedMotion ? 1 : 0 },
      uSize: { value: isSmall ? 36 : 40 },
      uPixelRatio: { value: pixelRatio },
      uMouse: { value: new THREE.Vector2(999, 999) },
      uMouseStrength: { value: 0 },
      uColor: { value: COLOR },
      uHighlight: { value: HIGHLIGHT },
      uOpacity: { value: 0 },
    },
  });
  const shape = new THREE.Points(geometry, material);
  scene.add(shape);

  // Brilho suave atrás da esfera
  const core = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glow,
      color: new THREE.Color("#6f8fff"),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  scene.add(core);

  // ---------- Conversão tela → mundo 3D (plano z = 0) ----------
  let viewW = 1;
  let viewH = 1;
  let worldH = 1;
  let worldW = 1;

  const resize = () => {
    viewW = container.clientWidth;
    viewH = container.clientHeight;
    if (!viewW || !viewH) return;
    renderer.setSize(viewW, viewH, false);
    camera.aspect = viewW / viewH;
    camera.updateProjectionMatrix();
    worldH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    worldW = worldH * camera.aspect;
  };

  const anchorKeys = ["sphere", "code", "mono"];
  const anchors = anchorKeys.map(() => ({ x: 0, y: 0, scale: 1, vis: 0 }));

  const readAnchor = (key, target) => {
    const el = document.querySelector(`[data-shape="${key}"]`);
    const rect = el?.getBoundingClientRect();
    if (!rect || rect.width === 0) {
      target.vis = 0;
      return false;
    }
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    target.x = (cx / viewW - 0.5) * worldW;
    target.y = -(cy / viewH - 0.5) * worldH;
    target.scale = ((rect.height / viewH) * worldH) / SHAPE_HEIGHT;
    // Visível quando o centro da âncora está perto do meio da tela
    const dy = Math.abs(cy / viewH - 0.5);
    target.vis = THREE.MathUtils.clamp(1 - (dy - 0.3) / 0.4, 0, 1);
    return true;
  };

  // ---------- Interação ----------
  const pointer = new THREE.Vector2();
  const pointerTarget = new THREE.Vector2();
  const mouseClient = { x: -9999, y: -9999 };
  let strengthTarget = 0;
  let lastMove = 0;

  const onPointerMove = (event) => {
    mouseClient.x = event.clientX;
    mouseClient.y = event.clientY;
    pointerTarget.set((event.clientX / viewW) * 2 - 1, -(event.clientY / viewH) * 2 + 1);
    strengthTarget = 1;
    lastMove = performance.now();
  };

  // ---------- Loop ----------
  const clock = new THREE.Clock();
  const smooth = { morph: 0, scroll: window.scrollY };
  let frame = null;

  const tick = () => {
    frame = requestAnimationFrame(tick);

    const time = reducedMotion ? 0 : clock.getElapsedTime();
    if (performance.now() - lastMove > 1500) strengthTarget = 0;
    pointer.lerp(pointerTarget, 0.05);

    const ease = reducedMotion ? 1 : 0.12;
    smooth.morph += (state.morph - smooth.morph) * ease;
    smooth.scroll += (window.scrollY - smooth.scroll) * ease;

    // Estrelas: paralaxe com o mouse e com a rolagem (as de trás mexem menos, pela perspectiva)
    stars.position.x = -pointer.x * 1.2;
    stars.position.y = -pointer.y * 0.8 + smooth.scroll * 0.004;
    stars.rotation.z = time * 0.003;

    // Esfera: interpola entre as duas âncoras da etapa atual
    const m = smooth.morph;
    const seg = m <= 1 ? 0 : 1;
    const t = THREE.MathUtils.smootherstep(m - seg, 0, 1);
    const a = anchors[seg];
    const b = anchors[seg + 1];
    const hasA = readAnchor(anchorKeys[seg], a);
    const hasB = readAnchor(anchorKeys[seg + 1], b);
    if (!hasA) Object.assign(a, { x: b.x, y: b.y, scale: b.scale });
    if (!hasB) Object.assign(b, { x: a.x, y: a.y, scale: a.scale });

    const x = THREE.MathUtils.lerp(a.x, b.x, t);
    const y = THREE.MathUtils.lerp(a.y, b.y, t);
    const scale = Math.max(THREE.MathUtils.lerp(a.scale, b.scale, t), 0.001);
    const opacity = THREE.MathUtils.lerp(a.vis, b.vis, t);

    // Na fase da esfera ela fica levemente inclinada; nas letras, de frente
    const spherePhase = seg === 0 ? 1 - t : 0;
    shape.position.set(x, y, 0);
    shape.scale.setScalar(scale);
    shape.rotation.x = SPHERE_TILT * spherePhase - pointer.y * 0.25;
    shape.rotation.y = pointer.x * 0.3;

    core.position.set(x, y, 0);
    core.scale.setScalar(scale * 3.2);
    core.material.opacity = opacity * spherePhase * (0.22 + Math.sin(time * 1.2) * 0.03) * state.intro;

    const u = material.uniforms;
    u.uTime.value = time;
    u.uMorph.value = m;
    u.uIntro.value = state.intro;
    u.uOpacity.value = opacity;
    u.uMouseStrength.value += (strengthTarget - u.uMouseStrength.value) * 0.08;
    u.uMouse.value.set(
      ((mouseClient.x / viewW - 0.5) * worldW - x) / scale,
      (-(mouseClient.y / viewH - 0.5) * worldH - y) / scale
    );

    shape.visible = opacity > 0.01;
    core.visible = core.material.opacity > 0.01;
    renderer.render(scene, camera);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  if (!reducedMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });
  tick();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("pointermove", onPointerMove);
    resizeObserver.disconnect();
    geometry.dispose();
    material.dispose();
    starGeometry.dispose();
    starMaterial.dispose();
    core.material.dispose();
    glow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
