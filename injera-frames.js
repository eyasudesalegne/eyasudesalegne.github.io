(() => {
  const stage = document.querySelector(".injera-stage");
  const fallback = document.querySelector(".injera-frame-fallback");
  if (!stage || stage.dataset.framesAttached === "true") return;
  stage.dataset.framesAttached = "true";

  const frameCanvas = document.createElement("canvas");
  frameCanvas.className = "injera-frame-canvas";
  frameCanvas.setAttribute("aria-hidden", "true");
  frameCanvas.style.cssText = `
    position:absolute;
    inset:0;
    width:100%;
    height:100%;
    z-index:4;
    pointer-events:none;
    opacity:1;
    transform:scale(1.01);
    filter:saturate(1.04) contrast(1.02) brightness(.93);
  `;
  stage.appendChild(frameCanvas);

  const ctx = frameCanvas.getContext("2d", { alpha: true });
  const framePaths = Array.from({ length: 14 }, (_, index) => `assets/${index + 1}.png`);

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve({ image: img, path });
      img.onerror = () => reject(new Error(`Could not load ${path}`));
      img.src = path;
    });
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(rect.width * dpr));
    const h = Math.max(1, Math.floor(rect.height * dpr));
    if (frameCanvas.width !== w || frameCanvas.height !== h) {
      frameCanvas.width = w;
      frameCanvas.height = h;
    }
  }

  function drawImageCover(image, alpha = 1) {
    const width = frameCanvas.width;
    const height = frameCanvas.height;
    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.restore();
  }

  function applyCinematicGrade(progress = 0) {
    const width = frameCanvas.width;
    const height = frameCanvas.height;

    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.46, width * 0.12, width * 0.5, height * 0.5, Math.max(width, height) * 0.66);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.62, "rgba(5,9,19,.08)");
    vignette.addColorStop(1, "rgba(5,9,19,.64)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const cinematic = ctx.createLinearGradient(0, 0, width, height);
    cinematic.addColorStop(0, "rgba(43,183,255,.07)");
    cinematic.addColorStop(0.52, "rgba(0,0,0,0)");
    cinematic.addColorStop(1, "rgba(255,79,139,.10)");
    ctx.fillStyle = cinematic;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * (0.5 + Math.sin(progress) * 0.035), height * 0.56, 0, width * 0.5, height * 0.56, width * 0.46);
    glow.addColorStop(0, "rgba(246,211,139,.07)");
    glow.addColorStop(1, "rgba(246,211,139,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  function drawBlend(current, next, alpha, progress) {
    resize();
    ctx.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
    drawImageCover(current, 1);
    drawImageCover(next, alpha);
    applyCinematicGrade(progress);
  }

  let frames = [];
  let raf = 0;
  let start = 0;
  const holdDuration = 620;
  const fadeDuration = 980;
  const cycleDuration = holdDuration + fadeDuration;

  function animateFrameSequence(timestamp) {
    if (!start) start = timestamp;
    if (!frames.length) return;

    const elapsed = timestamp - start;
    const step = Math.floor(elapsed / cycleDuration) % frames.length;
    const phase = elapsed % cycleDuration;
    const nextStep = (step + 1) % frames.length;
    const fadeRaw = Math.max(0, Math.min(1, (phase - holdDuration) / fadeDuration));
    const alpha = easeInOutSine(fadeRaw);

    drawBlend(frames[step].image, frames[nextStep].image, alpha, elapsed / 1600);
    raf = requestAnimationFrame(animateFrameSequence);
  }

  async function init() {
    const settled = await Promise.allSettled(framePaths.map(loadImage));
    frames = settled
      .filter((item) => item.status === "fulfilled")
      .map((item) => item.value)
      .sort((a, b) => {
        const an = Number((a.path.match(/\/(\d+)\.png$/) || [])[1] || 0);
        const bn = Number((b.path.match(/\/(\d+)\.png$/) || [])[1] || 0);
        return an - bn;
      });

    frameCanvas.dataset.loadedFrames = String(frames.length);
    frameCanvas.dataset.expectedFrames = String(framePaths.length);

    if (!frames.length) {
      frameCanvas.style.display = "none";
      return;
    }

    if (fallback) fallback.style.opacity = "0";
    drawBlend(frames[0].image, frames[1]?.image || frames[0].image, 0, 0);
    raf = requestAnimationFrame(animateFrameSequence);
  }

  window.addEventListener("resize", () => {
    if (frames[0]) drawBlend(frames[0].image, frames[1]?.image || frames[0].image, 0, 0);
  });

  init();
})();
