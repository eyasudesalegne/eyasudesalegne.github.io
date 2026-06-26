const root = document.documentElement;
const year = document.getElementById('year');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) root.dataset.theme = savedTheme;
if (year) year.textContent = new Date().getFullYear();

if (!document.querySelector('link[href^="typography.css"]')) {
  const typography = document.createElement('link');
  typography.rel = 'stylesheet';
  typography.href = 'typography.css?v=compact-type-20260625-1';
  document.head.appendChild(typography);
}

if (!document.querySelector('link[href^="hero-quote.css"]')) {
  const heroQuoteStyles = document.createElement('link');
  heroQuoteStyles.rel = 'stylesheet';
  heroQuoteStyles.href = 'hero-quote.css?v=quote-hero-20260625-3';
  document.head.appendChild(heroQuoteStyles);
}

if (!document.querySelector('link[href="injera.css"]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'injera.css';
  document.head.appendChild(link);
}

const profileImage = document.querySelector('.profile-visual img');
if (profileImage) profileImage.src = './assets/profile_picture.png';

function applyQuoteHero() {
  const hero = document.querySelector('.hero');
  const heroCopy = document.querySelector('.hero-copy');
  const heroPanel = document.querySelector('.hero-panel');
  const profileVisual = document.querySelector('.profile-visual');
  const img = document.querySelector('.profile-visual img');
  if (!hero || !heroCopy || !heroPanel || !img || hero.classList.contains('hero-quote-layout')) return;

  hero.classList.add('hero-quote-layout');

  const photo = document.createElement('figure');
  photo.className = 'hero-photo-left reveal';
  photo.setAttribute('aria-label', 'Profile portrait');
  photo.appendChild(img);

  const right = document.createElement('div');
  right.className = 'hero-right-stack';

  hero.insertBefore(photo, hero.firstElementChild);
  right.appendChild(heroCopy);
  right.appendChild(heroPanel);
  hero.appendChild(right);
  if (profileVisual) profileVisual.remove();

  const headline = heroCopy.querySelector('h1');
  if (headline) {
    headline.classList.add('hero-quote');
    headline.innerHTML = '“Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.”';
    if (!heroCopy.querySelector('.hero-quote-author')) {
      const author = document.createElement('p');
      author.className = 'hero-quote-author';
      author.textContent = '— Marie Curie';
      headline.insertAdjacentElement('afterend', author);
    }
  }

  const statusTitle = heroPanel.querySelector('.status-card h2');
  if (statusTitle) statusTitle.textContent = 'Medical Imaging and NeuroAI Engineer';
}

applyQuoteHero();

const injeraMarkup = `
  <section class="section-shell reveal injera-section" id="injera-map">
    <div class="section-heading">
      <p class="eyebrow">Identity sequence</p>
      <h2>The circles that made me.</h2>
      <p>A slow visual sequence built from injera frames: culture, care, memory, science, writing, and human purpose appearing one layer at a time.</p>
    </div>
    <div class="injera-layout">
      <div class="injera-stage frame-only-stage" aria-live="polite">
        <img class="injera-frame-fallback" src="assets/1.webp" alt="Injera frame animation preview" loading="eager" decoding="async" />
        <span class="injera-loading">Loading injera sequence</span>
      </div>
      <article class="injera-story-panel">
        <p class="eyebrow">Frame story</p>
        <h3 id="injeraStoryTitle">Built slowly, layer by layer</h3>
        <p id="injeraStoryText">The animation now follows the optimized WebP frame sequence from frame 1 to frame 8.</p>
        <p class="injera-story-hint">Using optimized WebP frames from assets.</p>
      </article>
    </div>
  </section>`;

const valuesMarkup = `
  <section class="section-shell reveal human-section" id="values">
    <div class="section-heading">
      <p class="eyebrow">Life, work & values</p>
      <h2>Seeing clearly, building carefully, staying human.</h2>
    </div>
    <div class="human-story-card compact-human-story">
      <p class="eyebrow">The human question</p>
      <p>I am drawn to systems that reveal what is hidden and to tools that help people understand, heal, decide, and live with more dignity.</p>
      <p>For me, good technology is careful, accountable, reproducible, and close to human life.</p>
    </div>
    <div class="value-grid human-values">
      <article class="value-card"><span>01</span><h3>To see clearly</h3><p>I value tools that reveal hidden patterns without pretending to know more than they do.</p></article>
      <article class="value-card"><span>02</span><h3>To build responsibly</h3><p>Systems should be reproducible, explainable, inspectable, and honest about their limits.</p></article>
      <article class="value-card"><span>03</span><h3>To stay close to life</h3><p>The point of engineering is human life, dignity, access, and care.</p></article>
      <article class="value-card"><span>04</span><h3>To write against forgetting</h3><p>Writing helps me examine identity, trust, power, memory, and the systems that shape people.</p></article>
    </div>
    <div class="life-photo-grid" aria-label="Future photo story placeholders">
      <figure class="life-photo-card life-card-one"><figcaption>Life outside the lab</figcaption></figure>
      <figure class="life-photo-card life-card-two"><figcaption>Work that stays human</figcaption></figure>
      <figure class="life-photo-card life-card-three"><figcaption>Books, memory, and meaning</figcaption></figure>
    </div>
  </section>`;

const main = document.querySelector('main');
if (main && !document.getElementById('injera-map')) main.insertAdjacentHTML('afterbegin', injeraMarkup);

if (!document.querySelector('script[src="injera-frames.js?v=webp-20260625-4"]')) {
  const s = document.createElement('script');
  s.src = 'injera-frames.js?v=webp-20260625-4';
  document.body.appendChild(s);
}

const aboutSection = document.getElementById('about');
if (aboutSection && !document.getElementById('values')) aboutSection.insertAdjacentHTML('afterend', valuesMarkup);

const navLinks = document.getElementById('navLinks');
if (navLinks && !navLinks.querySelector('a[href="#injera-map"]')) {
  const link = document.createElement('a');
  link.href = '#injera-map';
  link.textContent = 'Circles';
  navLinks.insertBefore(link, navLinks.querySelector('a[href="#about"]') || navLinks.firstElementChild);
}
if (navLinks && !navLinks.querySelector('a[href="#values"]')) {
  const link = document.createElement('a');
  link.href = '#values';
  link.textContent = 'Values';
  navLinks.insertBefore(link, navLinks.querySelector('a[href="#work"]') || navLinks.firstElementChild);
}

const navToggle = document.querySelector('.nav-toggle');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

document.querySelectorAll('.theme-toggle').forEach((button) => {
  button.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = nextTheme;
    localStorage.setItem('theme', nextTheme);
  });
});

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    document.querySelectorAll('.project-card').forEach((card) => {
      const categories = card.dataset.category || '';
      card.classList.toggle('is-hidden', !(filter === 'all' || categories.includes(filter)));
    });
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));

const sections = document.querySelectorAll('main section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
const activeNavObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navItems.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => activeNavObserver.observe(section));
