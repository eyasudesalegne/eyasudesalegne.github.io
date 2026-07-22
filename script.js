const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');

menuButton?.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});

navLinks?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.08 });

reveals.forEach((element) => revealObserver.observe(element));

const sections = document.querySelectorAll('main section[id]');
const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sectionLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach((section) => sectionObserver.observe(section));

const networkCanvas = document.getElementById('neuralNetwork');
const hero = document.querySelector('.hero');

if (networkCanvas && hero) {
  const context = networkCanvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactScreen = window.matchMedia('(max-width: 680px)').matches;
  const nodes = [];
  const signals = [];
  const pointer = { x: 0, y: 0, active: false };
  let width = 0;
  let height = 0;
  let frame = 0;
  let animationId = 0;
  let visible = true;

  const nodeCount = () => compactScreen ? 24 : Math.min(64, Math.max(38, Math.round(width / 23)));

  const makeNode = () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - .5) * .18,
    vy: (Math.random() - .5) * .18,
    radius: 1 + Math.random() * 1.35,
    phase: Math.random() * Math.PI * 2,
    pulse: 0
  });

  function resizeNetwork() {
    const bounds = networkCanvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    networkCanvas.width = Math.round(width * ratio);
    networkCanvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = nodeCount();
    while (nodes.length < count) nodes.push(makeNode());
    if (nodes.length > count) nodes.length = count;
  }

  function fireSignal(a, b, cursorDriven = false) {
    if (signals.length > 14) return;
    signals.push({ a, b, progress: 0, speed: cursorDriven ? .018 : .009 + Math.random() * .006 });
    nodes[a].pulse = 1;
  }

  function drawNetwork() {
    context.clearRect(0, 0, width, height);
    const maxDistance = compactScreen ? 110 : 145;
    const pointerRange = compactScreen ? 0 : 175;

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (!reduceMotion) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < -10 || node.x > width + 10) node.vx *= -1;
        if (node.y < -10 || node.y > height + 10) node.vy *= -1;

        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < pointerRange && distance > 1) {
            const influence = (1 - distance / pointerRange) * .018;
            node.x += dx * influence;
            node.y += dy * influence;
            node.pulse = Math.max(node.pulse, 1 - distance / pointerRange);
          }
        }
      }

      for (let j = i + 1; j < nodes.length; j += 1) {
        const other = nodes[j];
        const distance = Math.hypot(other.x - node.x, other.y - node.y);
        if (distance >= maxDistance) continue;
        const proximity = 1 - distance / maxDistance;
        const cursorEnergy = pointer.active
          ? Math.max(0, 1 - Math.min(Math.hypot(pointer.x - node.x, pointer.y - node.y), Math.hypot(pointer.x - other.x, pointer.y - other.y)) / pointerRange)
          : 0;
        context.beginPath();
        context.moveTo(node.x, node.y);
        context.lineTo(other.x, other.y);
        context.strokeStyle = `rgba(22,74,155,${.055 + proximity * .13 + cursorEnergy * .12})`;
        context.lineWidth = .55 + cursorEnergy * .45;
        context.stroke();

        if (!reduceMotion && Math.random() < .00012 + cursorEnergy * .0009) fireSignal(i, j, cursorEnergy > .2);
      }
    }

    signals.forEach((signal) => {
      const a = nodes[signal.a];
      const b = nodes[signal.b];
      if (!a || !b) { signal.progress = 2; return; }
      signal.progress += signal.speed;
      const x = a.x + (b.x - a.x) * signal.progress;
      const y = a.y + (b.y - a.y) * signal.progress;
      const glow = context.createRadialGradient(x, y, 0, x, y, 7);
      glow.addColorStop(0, 'rgba(22,114,220,.95)');
      glow.addColorStop(.28, 'rgba(49,187,180,.68)');
      glow.addColorStop(1, 'rgba(49,187,180,0)');
      context.fillStyle = glow;
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fill();
      if (signal.progress >= 1) b.pulse = 1;
    });
    for (let i = signals.length - 1; i >= 0; i -= 1) if (signals[i].progress >= 1) signals.splice(i, 1);

    nodes.forEach((node) => {
      const blink = .48 + Math.sin(frame * .018 + node.phase) * .22;
      const energy = Math.max(0, node.pulse);
      if (!reduceMotion) node.pulse *= .955;
      if (energy > .08) {
        context.fillStyle = `rgba(49,187,180,${energy * .15})`;
        context.beginPath();
        context.arc(node.x, node.y, node.radius + energy * 7, 0, Math.PI * 2);
        context.fill();
      }
      context.fillStyle = `rgba(18,70,142,${.28 + blink * .36 + energy * .32})`;
      context.beginPath();
      context.arc(node.x, node.y, node.radius + energy * .7, 0, Math.PI * 2);
      context.fill();
    });

    if (pointer.active && !compactScreen) {
      const halo = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 105);
      halo.addColorStop(0, 'rgba(22,74,155,.055)');
      halo.addColorStop(1, 'rgba(22,74,155,0)');
      context.fillStyle = halo;
      context.beginPath();
      context.arc(pointer.x, pointer.y, 105, 0, Math.PI * 2);
      context.fill();
    }

    frame += 1;
    if (!reduceMotion && visible) animationId = requestAnimationFrame(drawNetwork);
  }

  hero.addEventListener('pointermove', (event) => {
    const bounds = networkCanvas.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
  });
  hero.addEventListener('pointerleave', () => { pointer.active = false; });
  window.addEventListener('resize', resizeNetwork, { passive: true });

  const networkObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reduceMotion && !animationId) drawNetwork();
    if (!visible && animationId) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    }
  }, { threshold: .02 });

  networkObserver.observe(hero);
  resizeNetwork();
  drawNetwork();
}

const shineTargets = document.querySelectorAll([
  '.hero h1',
  '.about-content h2',
  '.section-intro h2',
  '.project h3',
  '.horizon-item h3',
  '.publication h3',
  '.book-list span',
  '.contact h2'
].join(','));

shineTargets.forEach((element) => {
  element.classList.add('cursor-shine');
  element.addEventListener('pointermove', (event) => {
    const bounds = element.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    element.style.setProperty('--shine-x', `${Math.max(0, Math.min(100, x))}%`);
    element.style.setProperty('--shine-y', `${Math.max(0, Math.min(100, y))}%`);
  });
  element.addEventListener('pointerleave', () => {
    element.style.setProperty('--shine-x', '50%');
    element.style.setProperty('--shine-y', '50%');
  });
});

const brainCanvas = document.getElementById('ambientBrain');

if (brainCanvas) {
  const brainContext = brainCanvas.getContext('2d');
  const reducedBrainMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smallBrainScreen = window.matchMedia('(max-width: 680px)').matches;
  const brainPoints = [];
  const brainEdges = [];
  let brainWidth = 0;
  let brainHeight = 0;
  let brainRatio = 1;
  let brainFrame = 0;
  let nextStrike = 260;
  let strike = null;

  function addMeshPoint(point) {
    brainPoints.push({ ...point, phase: Math.random() * Math.PI * 2 });
    return brainPoints.length - 1;
  }

  // Build a shallow frontal brain, not a globe. Its silhouette is deliberately
  // wider through the frontal/parietal lobes, narrower at the crown and base,
  // and split by a deep longitudinal fissure. A little depth keeps it alive
  // while a limited turn preserves the recognisable brain shape.
  const brainRows = smallBrainScreen ? 9 : 12;
  const brainColumns = smallBrainScreen ? 6 : 8;
  for (const side of [-1, 1]) {
    const grid = [];
    for (let rowIndex = 0; rowIndex < brainRows; rowIndex += 1) {
      const progress = rowIndex / (brainRows - 1);
      const y = .76 - progress * 1.28;
      // A hand-tuned cranial profile: rounded crown, broad upper cortex,
      // temporal taper and a pinched lower midline.
      const profile = Math.sin(Math.PI * (.08 + progress * .84));
      const temporalBulge = Math.exp(-Math.pow((progress - .62) / .2, 2)) * .09;
      const halfWidth = .3 + profile * .36 + temporalBulge;
      const row = [];
      for (let columnIndex = 0; columnIndex < brainColumns; columnIndex += 1) {
        const across = columnIndex / (brainColumns - 1);
        const fissure = .065 + Math.sin(progress * Math.PI) * .018;
        const fold = 1 + Math.sin(progress * 18 + across * 12 + side) * .025;
        const xMagnitude = fissure + across * (halfWidth - fissure) * fold;
        const depthCurve = Math.sin(across * Math.PI);
        row.push(addMeshPoint({
          x: side * xMagnitude,
          y: y + Math.sin(across * Math.PI * 3 + progress * 9) * .018,
          z: .09 + depthCurve * .2 + Math.sin(progress * 13 + across * 8) * .025,
          side,
          region: 'cerebrum'
        }));
      }
      grid.push(row);
    }
    for (let row = 0; row < grid.length; row += 1) {
      for (let column = 0; column < grid[row].length; column += 1) {
        if (column + 1 < grid[row].length) brainEdges.push([grid[row][column], grid[row][column + 1]]);
        if (row + 1 < grid.length) brainEdges.push([grid[row][column], grid[row + 1][column]]);
        if (row + 1 < grid.length && column + 1 < grid[row].length && (row + column) % 2 === 0) {
          brainEdges.push([grid[row][column], grid[row + 1][column + 1]]);
        }
      }
    }

    // Strong scalloped perimeter: these lobes make the object read as brain
    // even at the small mobile size seen in the footer.
    const outline = [];
    for (let step = 0; step <= 22; step += 1) {
      const progress = step / 22;
      const y = .76 - progress * 1.28;
      const profile = Math.sin(Math.PI * (.08 + progress * .84));
      const temporalBulge = Math.exp(-Math.pow((progress - .62) / .2, 2)) * .09;
      const scallop = Math.sin(progress * Math.PI * 9) * .028;
      outline.push(addMeshPoint({
        x: side * (.3 + profile * .36 + temporalBulge + scallop),
        y,
        z: .08,
        side,
        region: 'outline'
      }));
      if (step) brainEdges.push([outline[step - 1], outline[step]]);
    }

    // Trace both sides of the deep central fissure.
    let previousFissure = null;
    for (let step = 0; step < 10; step += 1) {
      const progress = step / 9;
      const fissurePoint = addMeshPoint({
        x: side * (.055 + Math.sin(progress * Math.PI) * .018),
        y: .72 - progress * .98,
        z: .34,
        side,
        region: 'fissure'
      });
      if (previousFissure !== null) brainEdges.push([previousFissure, fissurePoint]);
      previousFissure = fissurePoint;
    }
  }

  // A smaller ridged cerebellum sits below the right posterior lobe.
  const cerebellumRows = smallBrainScreen ? 4 : 5;
  const cerebellumColumns = smallBrainScreen ? 7 : 9;
  const cerebellumGrid = [];
  for (let row = 0; row < cerebellumRows; row += 1) {
    const latitude = -1.18 + (row / (cerebellumRows - 1)) * 2.36;
    const currentRow = [];
    for (let column = 0; column < cerebellumColumns; column += 1) {
      const longitude = (column / cerebellumColumns) * Math.PI * 2;
      const ridge = 1 + Math.sin(longitude * 4) * .06;
      currentRow.push(addMeshPoint({
        x: .28 + Math.cos(latitude) * Math.cos(longitude) * .25 * ridge,
        y: -.5 + Math.sin(latitude) * .17,
        z: -.04 + Math.cos(latitude) * Math.sin(longitude) * .12,
        side: 0,
        region: 'cerebellum'
      }));
    }
    cerebellumGrid.push(currentRow);
  }
  for (let row = 0; row < cerebellumGrid.length; row += 1) {
    for (let column = 0; column < cerebellumGrid[row].length; column += 1) {
      brainEdges.push([cerebellumGrid[row][column], cerebellumGrid[row][(column + 1) % cerebellumColumns]]);
      if (row + 1 < cerebellumGrid.length) brainEdges.push([cerebellumGrid[row][column], cerebellumGrid[row + 1][column]]);
    }
  }

  // The short brainstem gives the lower silhouette an anatomical anchor.
  let previousStemPoint = null;
  for (let step = 0; step < 5; step += 1) {
    const stemPoint = addMeshPoint({
      x: .08 + Math.sin(step * 1.3) * .018,
      y: -.47 - step * .075,
      z: .03 - step * .012,
      side: 0,
      region: 'stem'
    });
    if (previousStemPoint !== null) brainEdges.push([previousStemPoint, stemPoint]);
    previousStemPoint = stemPoint;
  }

  function resizeBrainCanvas() {
    brainRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    brainWidth = window.innerWidth;
    brainHeight = window.innerHeight;
    brainCanvas.width = Math.round(brainWidth * brainRatio);
    brainCanvas.height = Math.round(brainHeight * brainRatio);
    brainContext.setTransform(brainRatio, 0, 0, brainRatio, 0, 0);
  }

  function projectBrainPoint(point, angle, centerX, centerY, scale) {
    const cosY = Math.cos(angle);
    const sinY = Math.sin(angle);
    const cosX = Math.cos(.08);
    const sinX = Math.sin(.08);
    const rotatedX = point.x * cosY - point.z * sinY;
    const zY = point.x * sinY + point.z * cosY;
    const rotatedY = point.y * cosX - zY * sinX;
    const rotatedZ = point.y * sinX + zY * cosX;
    const perspective = 1 / (1.18 - rotatedZ * .18);
    return {
      x: centerX + rotatedX * scale * perspective,
      y: centerY - rotatedY * scale * perspective,
      z: rotatedZ,
      perspective
    };
  }

  function chooseStrikeTarget() {
    const candidates = Array.from(document.querySelectorAll('main h2'))
      .filter((heading) => {
        const rect = heading.getBoundingClientRect();
        return rect.bottom > 80 && rect.top < brainHeight - 70;
      });
    if (!candidates.length) return null;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const rect = target.getBoundingClientRect();
    return { element: target, x: Math.min(rect.right, brainWidth * .72), y: rect.top + rect.height * .52 };
  }

  function beginStrike(startX, startY) {
    const target = chooseStrikeTarget();
    if (!target) return;
    const segments = 8;
    const points = [{ x: startX, y: startY }];
    for (let i = 1; i < segments; i += 1) {
      const progress = i / segments;
      const bend = Math.sin(progress * Math.PI) * (Math.random() - .5) * 34;
      points.push({
        x: startX + (target.x - startX) * progress + bend,
        y: startY + (target.y - startY) * progress + (Math.random() - .5) * 18
      });
    }
    points.push({ x: target.x, y: target.y });
    strike = { target, points, age: 0, duration: 34 };
  }

  function drawBrainStrike() {
    if (!strike) return;
    strike.age += 1;
    const reveal = Math.min(1, strike.age / 9);
    const fade = Math.max(0, 1 - strike.age / strike.duration);
    const count = Math.max(2, Math.ceil(strike.points.length * reveal));
    brainContext.save();
    brainContext.beginPath();
    brainContext.moveTo(strike.points[0].x, strike.points[0].y);
    for (let i = 1; i < count; i += 1) brainContext.lineTo(strike.points[i].x, strike.points[i].y);
    brainContext.strokeStyle = `rgba(31,115,203,${fade * .3})`;
    brainContext.lineWidth = 3.2;
    brainContext.shadowColor = 'rgba(49,174,176,.45)';
    brainContext.shadowBlur = 9;
    brainContext.stroke();
    brainContext.strokeStyle = `rgba(122,224,213,${fade * .72})`;
    brainContext.lineWidth = .8;
    brainContext.stroke();
    brainContext.restore();

    if (strike.age === 9) {
      strike.target.element.classList.add('brain-struck');
      window.setTimeout(() => strike?.target.element.classList.remove('brain-struck'), 430);
    }
    if (strike.age >= strike.duration) strike = null;
  }

  function drawAmbientBrain() {
    brainContext.clearRect(0, 0, brainWidth, brainHeight);
    const scale = smallBrainScreen ? 46 : 64;
    const centerX = brainWidth - (smallBrainScreen ? 64 : 92);
    const centerY = brainHeight - (smallBrainScreen ? 72 : 96);
    // A gentle living turn instead of a full spin: the frontal anatomy stays
    // visible and never collapses into the circular profile of a globe.
    const angle = reducedBrainMotion ? 0 : Math.sin(brainFrame * .008) * .2;
    const projected = brainPoints.map((point) => projectBrainPoint(point, angle, centerX, centerY, scale));

    // The supplied anatomical neural-brain artwork provides the mesh itself.
    // Canvas remains responsible only for the living BCI pulse and lightning.

    const chipPulse = reducedBrainMotion ? .65 : .55 + Math.sin(brainFrame * .055) * .35;
    const chipSize = smallBrainScreen ? 6 : 8;
    const chipGlow = brainContext.createRadialGradient(centerX, centerY, 0, centerX, centerY, 24);
    chipGlow.addColorStop(0, `rgba(49,187,180,${.2 + chipPulse * .32})`);
    chipGlow.addColorStop(1, 'rgba(49,187,180,0)');
    brainContext.fillStyle = chipGlow;
    brainContext.beginPath();
    brainContext.arc(centerX, centerY, 24, 0, Math.PI * 2);
    brainContext.fill();
    brainContext.save();
    brainContext.translate(centerX, centerY);
    brainContext.rotate(angle * .7);
    brainContext.fillStyle = `rgba(20,83,156,${.55 + chipPulse * .4})`;
    brainContext.strokeStyle = `rgba(112,225,214,${.55 + chipPulse * .4})`;
    brainContext.lineWidth = 1;
    brainContext.fillRect(-chipSize / 2, -chipSize / 2, chipSize, chipSize);
    brainContext.strokeRect(-chipSize / 2, -chipSize / 2, chipSize, chipSize);
    brainContext.restore();

    if (!reducedBrainMotion && !smallBrainScreen && brainFrame >= nextStrike && !strike) {
      beginStrike(centerX - scale * .25, centerY - scale * .08);
      nextStrike = brainFrame + 430 + Math.floor(Math.random() * 260);
    }
    drawBrainStrike();
    brainFrame += 1;
    if (!reducedBrainMotion) requestAnimationFrame(drawAmbientBrain);
  }

  window.addEventListener('resize', resizeBrainCanvas, { passive: true });
  resizeBrainCanvas();
  drawAmbientBrain();
}
