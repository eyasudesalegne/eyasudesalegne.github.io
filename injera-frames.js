(() => {
  const stage = document.querySelector('.injera-stage');
  const fallback = document.querySelector('.injera-frame-fallback');
  if (!stage || stage.dataset.framesAttached === 'true') return;
  stage.dataset.framesAttached = 'true';

  const canvas = document.createElement('canvas');
  canvas.className = 'injera-frame-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none;opacity:1;transform:scale(1.01);filter:saturate(1.04) contrast(1.02) brightness(.93);';
  stage.appendChild(canvas);
  const ctx = canvas.getContext('2d', { alpha: true });

  const paths = Array.from({ length: 9 }, (_, i) => `assets/${i + 1}.webp`);
  const frames = new Array(paths.length).fill(null);
  let started = false;
  let start = 0;
  const hold = 1150;
  const fade = 1450;
  const cycle = hold + fade;

  function load(path) {
    return new Promise((ok, bad) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => ok(img);
      img.onerror = bad;
      img.src = path;
    });
  }

  function resize() {
    const r = stage.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.floor(r.width * d));
    const h = Math.max(1, Math.floor(r.height * d));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  function cover(img, alpha) {
    const w = canvas.width, h = canvas.height;
    const s = Math.max(w / img.width, h / img.height);
    const dw = img.width * s, dh = img.height * s;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.restore();
  }

  function ease(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
  }

  function grade(t) {
    const w = canvas.width, h = canvas.height;
    const v = ctx.createRadialGradient(w * .5, h * .46, w * .12, w * .5, h * .5, Math.max(w, h) * .66);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(.66, 'rgba(5,9,19,.05)');
    v.addColorStop(1, 'rgba(5,9,19,.48)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(43,183,255,.05)');
    g.addColorStop(.55, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(255,79,139,.07)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function draw(a, b, mix, t) {
    if (!a) return;
    resize();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    cover(a, 1);
    if (b) cover(b, mix);
    grade(t);
  }

  function loaded() {
    return frames.filter(Boolean);
  }

  function loop(ts) {
    if (!start) start = ts;
    const imgs = loaded();
    if (imgs.length) {
      const e = ts - start;
      const i = Math.floor(e / cycle) % imgs.length;
      const phase = e % cycle;
      const j = imgs.length > 1 ? (i + 1) % imgs.length : i;
      const mix = ease(Math.max(0, Math.min(1, (phase - hold) / fade)));
      draw(imgs[i], imgs[j], mix, e / 1800);
    }
    requestAnimationFrame(loop);
  }

  function begin() {
    if (started) return;
    started = true;
    if (fallback) fallback.style.opacity = '0';
    requestAnimationFrame(loop);
  }

  async function init() {
    try {
      frames[0] = await load(paths[0]);
      draw(frames[0], null, 0, 0);
      if (fallback) fallback.src = paths[0];
      load(paths[1]).then(img => { frames[1] = img; begin(); }).catch(begin);
      for (let i = 2; i < paths.length; i++) load(paths[i]).then(img => { frames[i] = img; }).catch(() => {});
    } catch (_) {
      canvas.style.display = 'none';
    }
  }

  window.addEventListener('resize', () => {
    const imgs = loaded();
    if (imgs[0]) draw(imgs[0], imgs[1] || imgs[0], 0, 0);
  });
  init();
})();
