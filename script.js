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
        <button class="injera-side-view" type="button" aria-label="Flip the fresh injera into a top-view identity map">
          <span class="injera-steam" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>
          <span class="injera-heat" aria-hidden="true"></span>
          <span class="injera-edge" aria-hidden="true"></span>
          <span class="injera-instruction">Click the fresh injera</span>
        </button>

        <div class="injera-top-view" aria-label="Top-view injera identity map">
          <div class="injera-surface">
            <button class="injera-bubble injera-center active" style="--x:50%;--y:50%;--s:1.08" data-title="Eyasu" data-text="At the center is one question: how can I build things that remain useful, honest, and human? My work moves between biomedical engineering, imaging, AI, software, and writing, but the center is the same: life, dignity, and clarity.">Eyasu</button>
            <button class="injera-bubble" style="--x:50%;--y:18%;--s:.92" data-title="The researcher" data-text="This part is drawn to hidden patterns: disease in images, cells under a microscope, circuits in simulation, and the invisible structure behind biological systems.">Research</button>
            <button class="injera-bubble" style="--x:75%;--y:30%;--s:.86" data-title="The builder" data-text="This is the engineering side: instruments, reconstruction pipelines, reproducible software, and systems that can be tested instead of only described.">Build</button>
            <button class="injera-bubble" style="--x:79%;--y:58%;--s:.82" data-title="The writer" data-text="Writing lets me examine identity, trust, power, control, failure, and the human consequences of systems that people inherit but did not design.">Write</button>
            <button class="injera-bubble" style="--x:62%;--y:78%;--s:.86" data-title="Human-centered technology" data-text="Technology should serve human life. It should strengthen judgment, widen access, and respect people instead of reducing them to data points or performance scores.">Human</button>
            <button class="injera-bubble" style="--x:34%;--y:78%;--s:.84" data-title="Origin and belonging" data-text="Culture is not separate from science. The things we build carry where we come from, what we value, and who we hope the work will serve.">Origin</button>
            <button class="injera-bubble" style="--x:21%;--y:58%;--s:.84" data-title="Seeing hidden life" data-text="Microscopy, OCT, and imaging are ways of seeing what ordinary vision cannot see. But the goal is not only to see more; it is to understand better.">Seeing</button>
            <button class="injera-bubble" style="--x:25%;--y:31%;--s:.82" data-title="The future" data-text="The future I want to work toward is not colder or more automated. It is more accessible, more explainable, more careful, and more accountable to human life.">Future</button>
          </div>
        </div>
      </div>

      <article class="injera-story-panel">
        <p class="eyebrow">Click the injera</p>
        <h3 id="injeraStoryTitle">Fresh from the side</h3>
        <p id="injeraStoryText">The first view is simple: warmth, steam, and a line. When it turns, the surface becomes a map. Each bubble opens one part of the story.</p>
        <p class="injera-story-hint">Hover bubbles to grow them. Click one to read that part.</p>
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
const injeraSide = document.querySelector(".injera-side-view");
const injeraTitle = document.getElementById("injeraStoryTitle");
const injeraText = document.getElementById("injeraStoryText");
const injeraBubbles = document.querySelectorAll(".injera-bubble");
const injeraSurface = document.querySelector(".injera-surface");

function openInjeraMap() {
  if (!injeraStage) return;
  injeraStage.classList.add("is-open");
  if (injeraTitle && injeraText) {
    injeraTitle.textContent = "The circles that made me";
    injeraText.textContent = "Each circle is one part of the same person: origin, research, building, writing, seeing, and a human-centered future.";
  }
}

if (injeraSide) {
  injeraSide.addEventListener("click", openInjeraMap);
}

if (injeraStage) {
  injeraStage.addEventListener("pointermove", (event) => {
    const rect = injeraStage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const rotate = (x - 50) * 0.045;
    injeraStage.style.setProperty("--injera-mx", `${x}%`);
    injeraStage.style.setProperty("--injera-my", `${y}%`);
    if (injeraSurface) {
      injeraSurface.style.setProperty("--rz", `${rotate}deg`);
    }
  });

  injeraStage.addEventListener("pointerleave", () => {
    injeraStage.style.setProperty("--injera-mx", "50%");
    injeraStage.style.setProperty("--injera-my", "50%");
    if (injeraSurface) {
      injeraSurface.style.setProperty("--rz", "0deg");
    }
  });
}

injeraBubbles.forEach((bubble) => {
  bubble.addEventListener("click", () => {
    openInjeraMap();
    injeraBubbles.forEach((item) => item.classList.remove("active"));
    bubble.classList.add("active");
    if (injeraTitle && injeraText) {
      injeraTitle.textContent = bubble.dataset.title || "A circle of the story";
      injeraText.textContent = bubble.dataset.text || "This circle opens one part of the story.";
    }
  });
});

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
