const taglines = [
  "Good food starts at home.",
  "Cooked by people. Delivered with care.",
  "Where great cooks meet busy lives.",
  "From pot to plate — without stress.",
];

const testimonials = [
  {
    text: "I stopped eating random food outside. This feels like home.",
    author: "Amara",
    meta: "Product manager • Victoria Island",
    role: "buyer",
    roleLabel: "Buyer dashboard",
    rating: 5,
    highlight: "Meal planning relief",
    destination: "./hosting/dist/dashboard/buyer",
  },
  {
    text: "I’ve made more money cooking from home than I ever imagined.",
    author: "Chef Mimi",
    meta: "Vendor since 2021",
    role: "vendor",
    roleLabel: "Vendor cockpit",
    rating: 5,
    highlight: "Escrow confidence",
    destination: "./hosting/dist/dashboard/vendor",
  },
  {
    text: "FoodieCircle is how I feed my family without stress.",
    author: "Chidinma",
    meta: "Lekki mom of 3",
    role: "buyer",
    roleLabel: "Family planning view",
    rating: 5,
    highlight: "Bulk pots on tap",
    destination: "./hosting/dist/dashboard/buyer",
  },
  {
    text: "Escrow clears in minutes so I can restock ingredients fast.",
    author: "Chef Tunde",
    meta: "Charcoal grills • Yaba",
    role: "vendor",
    roleLabel: "Vendor payouts",
    rating: 5,
    highlight: "Faster payouts",
    destination: "./hosting/dist/dashboard/vendor",
  },
  {
    text: "We spot trust issues early, approve payouts, and keep riders moving.",
    author: "Kachi",
    meta: "Marketplace Ops lead",
    role: "admin",
    roleLabel: "Admin ops room",
    rating: 5,
    highlight: "Ops in one view",
    destination: "./hosting/dist/dashboard/admin",
  },
];

let taglineIndex = 0;
let testimonialIndex = 0;
let testimonialTimerId = null;
let progressTimerId = null;
let progressBarEl = null;
let progressLabelEl = null;
const TESTIMONIAL_INTERVAL = 6500;
const PROGRESS_TICK = 40;
const STORAGE_KEYS = {
  role: "foodiemarket_role",
  auth: "foodiemarket_auth",
};
const MOCK_PROFILES = {
  buyer: {
    name: "Lara Buyer",
    email: "lara@foodiecircle.com",
  },
  vendor: {
    name: "Chef Mimi",
    email: "chef@foodiecircle.com",
  },
  admin: {
    name: "Kachi Ops",
    email: "ops@foodiecircle.com",
  },
};

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
    <article class="story-card">
      <span class="story-card__badge">${story.highlight}</span>
      <p class="story-card__quote">“${story.text}”</p>
      <div class="story-card__meta">
        <div>
          <strong>${story.author}</strong>
          <span>${story.meta}</span>
        </div>
        <div class="story-card__rating" aria-label="Rated ${story.rating} out of 5">
          ${"★".repeat(story.rating)}
        </div>
      </div>
      <button
        type="button"
        class="story-card__cta"
        data-auth="mock"
        data-role="${story.role}"
        data-destination="${story.destination}"
      >
        Jump into ${story.roleLabel}
      </button>
    </article>
  `;
  resetTestimonialProgress(story.roleLabel);
}

function bindTestimonialNav() {
  const buttons = document.querySelectorAll('[data-testimonial]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dir = btn.dataset.testimonial === "next" ? 1 : -1;
      changeTestimonial(dir);
    });
  });
}

function changeTestimonial(direction) {
  testimonialIndex = (testimonialIndex + direction + testimonials.length) % testimonials.length;
  renderTestimonial();
  restartTestimonialCycle();
}

function restartTestimonialCycle() {
  if (testimonials.length <= 1) return;
  window.clearTimeout(testimonialTimerId);
  testimonialTimerId = window.setTimeout(() => changeTestimonial(1), TESTIMONIAL_INTERVAL);
  animateTestimonialProgress();
}

function setupTestimonialProgress() {
  const wrapper = document.getElementById("testimonial-progress");
  if (!wrapper) return;
  wrapper.innerHTML = `
    <div class="stories__progress-track">
      <div class="stories__progress-bar"></div>
    </div>
    <span class="stories__progress-label"></span>
  `;
  progressBarEl = wrapper.querySelector(".stories__progress-bar");
  progressLabelEl = wrapper.querySelector(".stories__progress-label");
}

function resetTestimonialProgress(labelText) {
  if (progressBarEl) {
    progressBarEl.style.width = "0%";
  }
  if (progressLabelEl) {
    progressLabelEl.textContent = labelText;
  }
}

function animateTestimonialProgress() {
  if (!progressBarEl) return;
  window.clearInterval(progressTimerId);
  let value = 0;
  progressBarEl.style.width = "0%";
  progressTimerId = window.setInterval(() => {
    value += (PROGRESS_TICK / TESTIMONIAL_INTERVAL) * 100;
    if (value >= 100) {
      progressBarEl.style.width = "100%";
      window.clearInterval(progressTimerId);
      return;
    }
    progressBarEl.style.width = `${value}%`;
  }, PROGRESS_TICK);
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

function getAppBasePath() {
  const base = document.body?.dataset?.appBase || "./hosting/dist";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

function initMockAuthLinks() {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest('[data-auth="mock"]') : null;
    if (!target) return;
    event.preventDefault();
    const role = target.dataset.role || "buyer";
    const profile = MOCK_PROFILES[role] || MOCK_PROFILES.buyer;
    const destination = target.dataset.destination || `${getAppBasePath()}/dashboard/${role}`;
    const payload = {
      name: profile.name,
      email: profile.email,
      role,
      verificationStatus: "verified",
    };
    window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(payload));
    window.localStorage.setItem(STORAGE_KEYS.role, role);
    window.location.href = destination;
  });
}

function initTestimonialCarousel() {
  const container = document.getElementById("testimonial-card");
  if (!container) return;
  setupTestimonialProgress();
  renderTestimonial();
  bindTestimonialNav();
  if (testimonials.length > 1) {
    restartTestimonialCycle();
  }
}

function initPaymentFlow() {
  const form = document.getElementById("payment-form");
  const stepsList = document.getElementById("payment-steps");
  const statusEl = document.getElementById("payment-status");
  const resultEl = document.getElementById("payment-result");
  if (!form || !stepsList || !statusEl) return;

  const stepItems = Array.from(stepsList.querySelectorAll("li"));
  const stepMessages = [
    "Capturing card token…",
    "Confirming bank hold…",
    "Notifying kitchen…",
    "Scheduling payout…",
  ];

  const resetSteps = () => {
    stepItems.forEach((item) => {
      item.classList.remove("active", "completed");
      const badge = item.querySelector("span");
      if (badge) badge.textContent = "Queued";
    });
    statusEl.textContent = "Waiting for input";
    if (resultEl) {
      resultEl.hidden = true;
    }
  };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Processing…";
    }
    resetSteps();

    const formData = new FormData(form);
    const amount = Number(formData.get("amount") || 0);
    try {
      for (let i = 0; i < stepItems.length; i++) {
        const item = stepItems[i];
        item.classList.add("active");
        const badge = item.querySelector("span");
        if (badge) badge.textContent = "In progress";
        statusEl.textContent = stepMessages[i] || "Processing…";
        await wait(1000);
        item.classList.remove("active");
        item.classList.add("completed");
        if (badge) badge.textContent = "Done";
      }
      statusEl.textContent = "Escrow funded successfully";
      if (resultEl) {
        const amountDisplay = amount ? amount.toLocaleString("en-NG") : "";
        const strong = resultEl.querySelector("strong");
        if (strong && amountDisplay) {
          strong.textContent = `Cook payout scheduled in 35 mins • NGN ${amountDisplay}`;
        }
        resultEl.hidden = false;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Simulate payment";
      }
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initTaglineRotation();
  initTestimonialCarousel();
  bindNavToggle();
  highlightActiveNav();
  setYear();
  initPaymentFlow();
  initMockAuthLinks();
});
