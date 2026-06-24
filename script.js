const root = document.documentElement;
const year = document.getElementById("year");
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  root.dataset.theme = savedTheme;
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (!document.querySelector('link[href="injera.css"]')) {
  const injeraStylesheet = document.createElement("link");
  injeraStylesheet.rel = "stylesheet";
  injeraStylesheet.href = "injera.css";
  document.head.appendChild(injeraStylesheet);
}

const profileImage = document.querySelector(".profile-visual img");
if (profileImage) {
  profileImage.src = "./assets/profile_picture.png";
}

const injeraMarkup = `
  <section class="section-shell reveal injera-section" id="injera-map">
    <div class="section-heading">
      <p class="eyebrow">Identity map</p>
      <h2>The circles that made me.</h2>
      <p>A fresh injera begins as a simple line from the side. Click it and it turns into a circle: culture, science, writing, engineering, and human purpose arranged around one center.</p>
    </div>

    <div class="injera-layout">
      <div class="injera-stage" aria-live="polite">
        <canvas id="injeraCanvas" class="injera-canvas" aria-label="Interactive 3D injera identity map"></canvas>
        <button class="injera-3d-start" type="button" aria-label="Flip the fresh injera into a top-view identity map">
          <span class="injera-instruction">Click the fresh injera</span>
        </button>
        <span class="injera-loading">Loading 3D scene</span>
      </div>

      <article class="injera-story-panel">
        <p class="eyebrow">Click the injera</p>
        <h3 id="injeraStoryTitle">Fresh from the side</h3>
        <p id="injeraStoryText">The first view is simple: warmth, steam, and a line. When it turns, the surface becomes a map. Each bubble opens one part of the story.</p>
        <p class="injera-story-hint">Hover bubbles to raise them. Click one to read that part.</p>
      </article>
    </div>
  </section>
`;

const valuesMarkup = `
  <section class="section-shell reveal human-section" id="values">
    <div class="section-heading">
      <p class="eyebrow">Life, work & values</p>
      <h2>Seeing clearly, building carefully, staying human.</h2>
    </div>

    <div class="human-story-card compact-human-story">
      <p class="eyebrow">The human question</p>
      <p>I am drawn to systems that reveal what is hidden: a cell under a microscope, a disease pattern in an image, a brain circuit in a simulation, or a quiet failure inside society. But seeing is not enough. What matters is whether what we build helps people understand, heal, decide, and live with more dignity.</p>
      <p>For me, good technology is not only accurate or powerful. It is careful. It explains itself. It remains accountable. It respects the patient, the researcher, the student, and the ordinary person who lives inside systems they did not design.</p>
    </div>

    <div class="value-grid human-values">
      <article class="value-card">
        <span>01</span>
        <h3>To see clearly</h3>
        <p>I value tools that reveal hidden patterns without pretending to know more than they do.</p>
      </article>
      <article class="value-card">
        <span>02</span>
        <h3>To build responsibly</h3>
        <p>Systems should be reproducible, explainable, inspectable, and honest about their limits.</p>
      </article>
      <article class="value-card">
        <span>03</span>
        <h3>To stay close to life</h3>
        <p>The point of engineering is not abstraction. It is human life, dignity, access, and care.</p>
      </article>
      <article class="value-card">
        <span>04</span>
        <h3>To write against forgetting</h3>
        <p>Writing helps me examine identity, trust, power, memory, and the systems that shape people.</p>
      </article>
    </div>

    <div class="life-photo-grid" aria-label="Future photo story placeholders">
      <figure class="life-photo-card life-card-one"><figcaption>Life outside the lab</figcaption></figure>
      <figure class="life-photo-card life-card-two"><figcaption>Work that stays human</figcaption></figure>
      <figure class="life-photo-card life-card-three"><figcaption>Books, memory, and meaning</figcaption></figure>
    </div>
  </section>
`;

const main = document.querySelector("main");
if (main && !document.getElementById("injera-map")) {
  main.insertAdjacentHTML("afterbegin", injeraMarkup);
}

if (!document.querySelector('script[src="injera-3d.js"]')) {
  const injeraScript = document.createElement("script");
  injeraScript.type = "module";
  injeraScript.src = "injera-3d.js";
  document.body.appendChild(injeraScript);
}

const aboutSection = document.getElementById("about");
if (aboutSection && !document.getElementById("values")) {
  aboutSection.insertAdjacentHTML("afterend", valuesMarkup);
}

const navLinks = document.getElementById("navLinks");
if (navLinks && !navLinks.querySelector('a[href="#injera-map"]')) {
  const circlesLink = document.createElement("a");
  circlesLink.href = "#injera-map";
  circlesLink.textContent = "Circles";
  const aboutLink = navLinks.querySelector('a[href="#about"]');
  navLinks.insertBefore(circlesLink, aboutLink || navLinks.firstElementChild);
}

if (navLinks && !navLinks.querySelector('a[href="#values"]')) {
  const valuesLink = document.createElement("a");
  valuesLink.href = "#values";
  valuesLink.textContent = "Values";
  const workLink = navLinks.querySelector('a[href="#work"]');
  navLinks.insertBefore(valuesLink, workLink || navLinks.firstElementChild);
}

const injeraStage = document.querySelector(".injera-stage");
const injeraTitle = document.getElementById("injeraStoryTitle");
const injeraText = document.getElementById("injeraStoryText");

function setInjeraStory(title, text) {
  if (injeraTitle) injeraTitle.textContent = title;
  if (injeraText) injeraText.textContent = text;
}

function openInjeraMap() {
  if (!injeraStage) return;
  injeraStage.classList.add("is-open");
  setInjeraStory(
    "The circles that made me",
    "Each circle is one part of the same person: origin, research, building, writing, seeing, and a human-centered future."
  );
}

window.openInjeraMap = openInjeraMap;
window.setInjeraStory = setInjeraStory;

const navToggle = document.querySelector(".nav-toggle");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

document.querySelectorAll(".theme-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  });
});

const filterButtons = document.querySelectorAll(".filter");
const projectCards = document.querySelectorAll(".project-card");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const categories = card.dataset.category || "";
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));

const sections = document.querySelectorAll("main section[id]");
const navItems = document.querySelectorAll(".nav-links a[href^='#']");

const activeNavObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navItems.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);

sections.forEach((section) => activeNavObserver.observe(section));
