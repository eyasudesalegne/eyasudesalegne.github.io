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
    transition:opacity .85s ease, transform 1.1s ease, filter .85s ease;
    filter:saturate(1.04) contrast(1.02) brightness(.92);
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

  function drawCover(image, progress = 0) {
    resize();
    const width = frameCanvas.width;
    const height = frameCanvas.height;
    ctx.clearRect(0, 0, width, height);

    const scale = Math.max(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    ctx.drawImage(image, x, y, drawWidth, drawHeight);

    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.46, width * 0.12, width * 0.5, height * 0.5, Math.max(width, height) * 0.64);
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(0.62, "rgba(5,9,19,.10)");
    vignette.addColorStop(1, "rgba(5,9,19,.68)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const cinematic = ctx.createLinearGradient(0, 0, width, height);
    cinematic.addColorStop(0, "rgba(43,183,255,.08)");
    cinematic.addColorStop(0.48, "rgba(0,0,0,0)");
    cinematic.addColorStop(1, "rgba(255,79,139,.11)");
    ctx.fillStyle = cinematic;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * (0.5 + Math.sin(progress) * 0.04), height * 0.56, 0, width * 0.5, height * 0.56, width * 0.42);
    glow.addColorStop(0, "rgba(246,211,139,.08)");
    glow.addColorStop(1, "rgba(246,211,139,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  let frames = [];
  let raf = 0;
  let start = 0;
  const frameDuration = 150;

  function hideFrames() {
    frameCanvas.style.opacity = "0";
    frameCanvas.style.transform = "scale(1.06)";
    frameCanvas.style.filter = "saturate(1.08) contrast(1.05) brightness(.55) blur(8px)";
    if (fallback) {
      fallback.style.opacity = "0";
      fallback.style.transform = "scale(1.06)";
      fallback.style.filter = "saturate(1.08) contrast(1.05) brightness(.55) blur(8px)";
    }
    cancelAnimationFrame(raf);
  }

  function animateFrameSequence(timestamp) {
    if (!start) start = timestamp;
    if (!frames.length) return;
    if (stage.classList.contains("is-open")) {
      hideFrames();
      return;
    }
    const elapsed = timestamp - start;
    const index = Math.floor(elapsed / frameDuration) % frames.length;
    drawCover(frames[index].image, elapsed / 1000);
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
    drawCover(frames[0].image, 0);
    raf = requestAnimationFrame(animateFrameSequence);
  }

  const observer = new MutationObserver(() => {
    if (stage.classList.contains("is-open")) {
      hideFrames();
      window.setTimeout(() => {
        frameCanvas.style.display = "none";
        if (fallback) fallback.style.display = "none";
      }, 950);
    }
  });
  observer.observe(stage, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => {
    if (frames[0] && !stage.classList.contains("is-open")) drawCover(frames[0].image, 0);
  });

  init();
})();
