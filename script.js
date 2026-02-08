const taglines = [
  "Good food starts at home.",
  "Cooked by people. Delivered with care.",
  "Where great cooks meet busy lives.",
  "From pot to plate — without stress.",
];

const testimonials = [
  {
    text: "I stopped eating random food outside. This feels like home.",
    author: "Busy Professional",
  },
  {
    text: "I’ve made more money cooking from home than I ever imagined.",
    author: "Home Cook",
  },
  {
    text: "FoodieCircle is how I feed my family without stress.",
    author: "Chidinma • Lekki",
  },
];

let taglineIndex = 0;
let testimonialIndex = 0;

function rotateTagline() {
  const el = document.getElementById("tagline");
  if (!el) return;
  el.textContent = taglines[taglineIndex];
  taglineIndex = (taglineIndex + 1) % taglines.length;
}

function initTaglineRotation() {
  if (!document.getElementById("tagline")) return;
  rotateTagline();
  setInterval(rotateTagline, 5000);
}

function renderTestimonial() {
  const container = document.getElementById("testimonial-card");
  if (!container) return;
  const story = testimonials[testimonialIndex];
  container.innerHTML = `
    <div class="story-card">
      <p>“${story.text}”</p>
      <span>${story.author}</span>
    </div>
  `;
}

function bindTestimonialNav() {
  const buttons = document.querySelectorAll('[data-testimonial]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.testimonial === "next" ? 1 : -1;
      testimonialIndex = (testimonialIndex + dir + testimonials.length) % testimonials.length;
      renderTestimonial();
    });
  });
}

function bindNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function highlightActiveNav() {
  const nav = document.querySelectorAll('[data-nav]');
  const page = document.body.dataset.page;
  if (!page) return;
  nav.forEach((link) => {
    if (link.dataset.nav === page) {
      link.classList.add("active");
    }
  });
}

function setYear() {
  const el = document.getElementById("year");
  if (el) {
    el.textContent = new Date().getFullYear();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  initTaglineRotation();
  renderTestimonial();
  bindTestimonialNav();
  bindNavToggle();
  highlightActiveNav();
  setYear();
});
