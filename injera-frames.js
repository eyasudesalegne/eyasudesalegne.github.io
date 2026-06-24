(() => {
  const stage = document.querySelector(".injera-stage");
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
    z-index:3;
    pointer-events:none;
    opacity:1;
    transform:scale(1.01);
    transition:opacity .85s ease, transform 1.1s ease, filter .85s ease;
    filter:saturate(1.04) contrast(1.02) brightness(.92);
  `;
  stage.appendChild(frameCanvas);

  const ctx = frameCanvas.getContext("2d", { alpha: true });
  const frameCount = 14;
  const extensions = ["webp", "jpg", "jpeg", "png", "JPG", "JPEG", "PNG", "WEBP"];
  const directories = ["assets", "assets/injera", "assets/frames", "assets/injera-frames"];
  const nameVariants = (index) => {
    const n = String(index);
    const p = String(index).padStart(2, "0");
    return [n, p, `frame-${n}`, `frame-${p}`, `injera-${n}`, `injera-${p}`];
  };

  function candidatePaths(index) {
    const names = nameVariants(index);
    const paths = [];
    directories.forEach((dir) => {
      names.forEach((name) => {
        extensions.forEach((ext) => paths.push(`${dir}/${name}.${ext}`));
      });
    });
    return paths;
  }

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = path;
    });
  }

  async function loadFirst(index) {
    const paths = candidatePaths(index);
    for (const path of paths) {
      try {
        const image = await loadImage(path);
        return { image, path };
      } catch (_) {
        // Try the next likely filename.
      }
    }
    return null;
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
    vignette.addColorStop(0.63, "rgba(5,9,19,.14)");
    vignette.addColorStop(1, "rgba(5,9,19,.78)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    const cinematic = ctx.createLinearGradient(0, 0, width, height);
    cinematic.addColorStop(0, "rgba(43,183,255,.10)");
    cinematic.addColorStop(0.48, "rgba(0,0,0,0)");
    cinematic.addColorStop(1, "rgba(255,79,139,.13)");
    ctx.fillStyle = cinematic;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * (0.5 + Math.sin(progress) * 0.04), height * 0.56, 0, width * 0.5, height * 0.56, width * 0.42);
    glow.addColorStop(0, "rgba(246,211,139,.10)");
    glow.addColorStop(1, "rgba(246,211,139,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  let frames = [];
  let raf = 0;
  let start = 0;
  const frameDuration = 135;

  function animateFrameSequence(timestamp) {
    if (!start) start = timestamp;
    if (!frames.length) return;
    if (stage.classList.contains("is-open")) {
      frameCanvas.style.opacity = "0";
      frameCanvas.style.transform = "scale(1.06)";
      frameCanvas.style.filter = "saturate(1.08) contrast(1.05) brightness(.55) blur(8px)";
      cancelAnimationFrame(raf);
      return;
    }
    const elapsed = timestamp - start;
    const index = Math.floor(elapsed / frameDuration) % frames.length;
    drawCover(frames[index].image, elapsed / 1000);
    raf = requestAnimationFrame(animateFrameSequence);
  }

  async function init() {
    const loaded = [];
    for (let i = 1; i <= frameCount; i += 1) {
      const item = await loadFirst(i);
      if (item) loaded.push(item);
    }

    if (!loaded.length) {
      frameCanvas.style.display = "none";
      return;
    }

    frames = loaded;
    frameCanvas.dataset.loadedFrames = String(frames.length);
    frameCanvas.dataset.firstFrame = frames[0].path;
    drawCover(frames[0].image, 0);
    raf = requestAnimationFrame(animateFrameSequence);
  }

  const observer = new MutationObserver(() => {
    if (stage.classList.contains("is-open")) {
      frameCanvas.style.opacity = "0";
      frameCanvas.style.transform = "scale(1.06)";
      frameCanvas.style.filter = "saturate(1.08) contrast(1.05) brightness(.55) blur(8px)";
      window.setTimeout(() => {
        frameCanvas.style.display = "none";
      }, 950);
    }
  });
  observer.observe(stage, { attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", () => {
    if (frames[0] && !stage.classList.contains("is-open")) drawCover(frames[0].image, 0);
  });

  init();
})();
