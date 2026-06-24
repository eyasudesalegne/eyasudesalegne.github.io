import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("injeraCanvas");
const stage = document.querySelector(".injera-stage");
const startButton = document.querySelector(".injera-3d-start");
const loading = document.querySelector(".injera-loading");

if (!canvas || !stage) {
  throw new Error("Injera 3D canvas not found.");
}

const stories = [
  {
    key: "Eyasu",
    label: "Eyasu",
    radius: 0,
    angle: 0,
    scale: 1.12,
    title: "Eyasu",
    text: "At the center is one question: how can I build things that remain useful, honest, and human? My work moves between biomedical engineering, imaging, AI, software, and writing, but the center is the same: life, dignity, and clarity."
  },
  {
    key: "research",
    label: "Research",
    radius: 1.45,
    angle: -90,
    scale: 0.92,
    title: "The researcher",
    text: "This part is drawn to hidden patterns: disease in images, cells under a microscope, circuits in simulation, and the invisible structure behind biological systems."
  },
  {
    key: "build",
    label: "Build",
    radius: 1.55,
    angle: -38,
    scale: 0.86,
    title: "The builder",
    text: "This is the engineering side: instruments, reconstruction pipelines, reproducible software, and systems that can be tested instead of only described."
  },
  {
    key: "write",
    label: "Write",
    radius: 1.53,
    angle: 12,
    scale: 0.82,
    title: "The writer",
    text: "Writing lets me examine identity, trust, power, control, failure, and the human consequences of systems that people inherit but did not design."
  },
  {
    key: "human",
    label: "Human",
    radius: 1.45,
    angle: 61,
    scale: 0.88,
    title: "Human-centered technology",
    text: "Technology should serve human life. It should strengthen judgment, widen access, and respect people instead of reducing them to data points or performance scores."
  },
  {
    key: "origin",
    label: "Origin",
    radius: 1.47,
    angle: 118,
    scale: 0.86,
    title: "Origin and belonging",
    text: "Culture is not separate from science. The things we build carry where we come from, what we value, and who we hope the work will serve."
  },
  {
    key: "seeing",
    label: "Seeing",
    radius: 1.56,
    angle: 176,
    scale: 0.85,
    title: "Seeing hidden life",
    text: "Microscopy, OCT, and imaging are ways of seeing what ordinary vision cannot see. But the goal is not only to see more; it is to understand better."
  },
  {
    key: "future",
    label: "Future",
    radius: 1.52,
    angle: -146,
    scale: 0.84,
    title: "The future",
    text: "The future I want to work toward is not colder or more automated. It is more accessible, more explainable, more careful, and more accountable to human life."
  }
];

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
const sideCamera = new THREE.Vector3(0, 0.48, 6.4);
const topCamera = new THREE.Vector3(0, 5.8, 0.38);
const lookAt = new THREE.Vector3(0, 0, 0);
camera.position.copy(sideCamera);
camera.lookAt(lookAt);

const root = new THREE.Group();
scene.add(root);

const ambient = new THREE.HemisphereLight(0xffffff, 0x0b1020, 1.25);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffe1a5, 2.5);
keyLight.position.set(-2.5, 4.3, 3.8);
scene.add(keyLight);

const cyanLight = new THREE.PointLight(0x38d5ff, 1.8, 8.5);
cyanLight.position.set(-2.8, 1.6, 2.7);
scene.add(cyanLight);

const pinkLight = new THREE.PointLight(0xff4f8b, 1.4, 8.5);
pinkLight.position.set(3.2, 1.2, -2.4);
scene.add(pinkLight);

const heatLight = new THREE.PointLight(0xff9d4d, 2.0, 5.4);
heatLight.position.set(0, 0.7, 2.15);
scene.add(heatLight);

function createInjeraTexture(size = 1024) {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = size;
  textureCanvas.height = size;
  const ctx = textureCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(size * 0.38, size * 0.33, size * 0.02, size * 0.5, size * 0.5, size * 0.58);
  gradient.addColorStop(0, "#fff0b9");
  gradient.addColorStop(0.26, "#efb664");
  gradient.addColorStop(0.58, "#b26935");
  gradient.addColorStop(0.88, "#5a2a14");
  gradient.addColorStop(1, "#32160a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 22;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.75));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.45));
  }
  ctx.putImageData(image, 0, 0);

  for (let i = 0; i < 620; i += 1) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const dx = x - size / 2;
    const dy = y - size / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > size * 0.49) continue;
    const r = 1.5 + Math.random() * 7.8;
    const alpha = 0.06 + Math.random() * 0.15;
    ctx.beginPath();
    ctx.fillStyle = `rgba(58, 27, 10, ${alpha})`;
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 248, 205, ${alpha * 0.42})`;
    ctx.arc(x - r * 0.22, y - r * 0.25, r * 0.33, 0, Math.PI * 2);
    ctx.fill();
  }

  const sheen = ctx.createLinearGradient(0, 0, size, size * 0.65);
  sheen.addColorStop(0, "rgba(255,255,255,.18)");
  sheen.addColorStop(0.35, "rgba(255,255,255,.035)");
  sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function createTextSprite(text) {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, c.width, c.height);
  ctx.font = "800 34px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.38)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "rgba(255,248,225,.96)";
  ctx.fillText(text, c.width / 2, c.height / 2);
  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.62, 0.23, 1);
  return sprite;
}

const injeraTexture = createInjeraTexture();
const topMaterial = new THREE.MeshStandardMaterial({
  map: injeraTexture,
  bumpMap: injeraTexture,
  bumpScale: 0.045,
  roughness: 0.78,
  metalness: 0.0,
  color: 0xffffff
});
const edgeMaterial = new THREE.MeshStandardMaterial({
  color: 0x8a4d24,
  roughness: 0.86,
  metalness: 0.02
});

const topDisc = new THREE.Mesh(new THREE.CircleGeometry(2.28, 192), topMaterial);
topDisc.rotation.x = -Math.PI / 2;
topDisc.position.y = 0.095;
root.add(topDisc);

const sideWall = new THREE.Mesh(new THREE.CylinderGeometry(2.28, 2.28, 0.2, 192, 1, true), edgeMaterial);
sideWall.position.y = 0;
root.add(sideWall);

const rim = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.075, 18, 192), edgeMaterial);
rim.rotation.x = Math.PI / 2;
rim.position.y = 0.105;
root.add(rim);

const underGlow = new THREE.Mesh(
  new THREE.CircleGeometry(2.55, 128),
  new THREE.MeshBasicMaterial({ color: 0xffb45d, transparent: true, opacity: 0.12, depthWrite: false })
);
underGlow.rotation.x = -Math.PI / 2;
underGlow.position.y = -0.13;
root.add(underGlow);

const clickableObjects = [];
let selected = null;
let hovered = null;

stories.forEach((story) => {
  const angle = (story.angle * Math.PI) / 180;
  const x = Math.cos(angle) * story.radius;
  const z = Math.sin(angle) * story.radius;
  const radius = story.key === "Eyasu" ? 0.31 : 0.23;

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 42, 22, 0, Math.PI * 2, 0, Math.PI * 0.58),
    new THREE.MeshStandardMaterial({
      color: story.key === "Eyasu" ? 0xffd28a : 0xe19a55,
      roughness: 0.62,
      metalness: 0.02,
      emissive: story.key === "Eyasu" ? 0x241000 : 0x120804,
      emissiveIntensity: story.key === "Eyasu" ? 0.18 : 0.10
    })
  );
  dome.scale.set(story.scale, 0.42 * story.scale, story.scale);
  dome.position.set(x, 0.2, z);
  dome.userData.story = story;
  dome.userData.base = dome.position.clone();
  dome.userData.baseScale = dome.scale.clone();
  clickableObjects.push(dome);
  root.add(dome);

  const label = createTextSprite(story.label);
  label.position.set(x, 0.54, z);
  label.userData.owner = dome;
  root.add(label);
  dome.userData.label = label;

  if (story.key === "Eyasu") {
    selected = dome;
  }
});

const steamSprites = [];
function createSteamTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 172, 5, 64, 120, 90);
  g.addColorStop(0, "rgba(255,255,255,.42)");
  g.addColorStop(0.45, "rgba(255,255,255,.16)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 256);
  return new THREE.CanvasTexture(c);
}
const steamTexture = createSteamTexture();
for (let i = 0; i < 44; i += 1) {
  const material = new THREE.SpriteMaterial({
    map: steamTexture,
    transparent: true,
    opacity: 0.24 + Math.random() * 0.25,
    depthWrite: false
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.set((Math.random() - 0.5) * 3.9, 0.18 + Math.random() * 0.32, 1.45 + (Math.random() - 0.5) * 0.25);
  const scale = 0.45 + Math.random() * 0.55;
  sprite.scale.set(scale * 0.45, scale, 1);
  sprite.userData.speed = 0.22 + Math.random() * 0.24;
  sprite.userData.drift = (Math.random() - 0.5) * 0.15;
  sprite.userData.start = sprite.position.clone();
  steamSprites.push(sprite);
  scene.add(sprite);
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(999, 999);
let opened = false;
let targetCamera = sideCamera.clone();
let targetLook = lookAt.clone();
let lastTime = performance.now();

function resize() {
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(1, rect.width);
  const height = Math.max(1, rect.height);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function setStory(mesh) {
  const story = mesh.userData.story;
  selected = mesh;
  if (window.setInjeraStory) {
    window.setInjeraStory(story.title, story.text);
  } else {
    const title = document.getElementById("injeraStoryTitle");
    const text = document.getElementById("injeraStoryText");
    if (title) title.textContent = story.title;
    if (text) text.textContent = story.text;
  }
}

function openScene() {
  opened = true;
  stage.classList.add("is-open");
  targetCamera = topCamera.clone();
  targetLook = new THREE.Vector3(0, 0, 0);
  if (window.openInjeraMap) window.openInjeraMap();
  if (startButton) startButton.setAttribute("aria-hidden", "true");
}

function updatePointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

canvas.addEventListener("pointermove", updatePointer);
canvas.addEventListener("pointerleave", () => {
  pointer.set(999, 999);
  hovered = null;
});
canvas.addEventListener("click", () => {
  if (!opened) {
    openScene();
    return;
  }
  if (hovered) setStory(hovered);
});

if (startButton) {
  startButton.addEventListener("click", openScene);
}

function animate() {
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  camera.position.lerp(targetCamera, 1 - Math.pow(0.0008, dt));
  const currentLook = new THREE.Vector3();
  camera.getWorldDirection(currentLook);
  camera.lookAt(targetLook);

  root.rotation.y += opened ? dt * 0.055 : dt * 0.018;
  root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, opened ? 0 : 0.02, 0.04);

  heatLight.intensity = 1.75 + Math.sin(now * 0.003) * 0.32;
  underGlow.material.opacity = 0.10 + Math.sin(now * 0.0024) * 0.025;

  raycaster.setFromCamera(pointer, camera);
  const hits = opened ? raycaster.intersectObjects(clickableObjects, false) : [];
  hovered = hits.length ? hits[0].object : null;
  canvas.style.cursor = opened && hovered ? "pointer" : "default";

  clickableObjects.forEach((mesh) => {
    const active = mesh === selected;
    const over = mesh === hovered;
    const lift = active ? 0.13 : over ? 0.18 : 0;
    const scalar = active ? 1.12 : over ? 1.22 : 1;
    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, mesh.userData.base.y + lift, 0.15);
    mesh.scale.lerp(mesh.userData.baseScale.clone().multiplyScalar(scalar), 0.15);
    mesh.material.emissiveIntensity = THREE.MathUtils.lerp(mesh.material.emissiveIntensity, active || over ? 0.26 : 0.10, 0.10);
    if (mesh.userData.label) {
      mesh.userData.label.position.y = mesh.position.y + 0.34;
      mesh.userData.label.material.opacity = opened ? 0.98 : 0;
    }
  });

  steamSprites.forEach((sprite) => {
    sprite.position.y += sprite.userData.speed * dt;
    sprite.position.x += sprite.userData.drift * dt;
    const age = sprite.position.y - sprite.userData.start.y;
    sprite.material.opacity = opened ? THREE.MathUtils.lerp(sprite.material.opacity, 0, 0.035) : Math.max(0, 0.42 - age * 0.18);
    if (sprite.position.y > 2.7) {
      sprite.position.copy(sprite.userData.start);
      sprite.position.x += (Math.random() - 0.5) * 0.35;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
if (loading) loading.classList.add("is-hidden");
requestAnimationFrame(animate);
window.addEventListener("resize", resize);
