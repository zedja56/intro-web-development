"use strict";

const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.getElementById("site-nav");
const mobileQuery = window.matchMedia("(max-width: 768px)");

function setMenu(open) {
  siteNav.classList.toggle("is-open", open);
  menuToggle.setAttribute("aria-expanded", String(open));
}

function toggleMenu() {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
}

menuToggle.addEventListener("click", toggleMenu);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (!lightbox.hidden) {
    closeLightbox();
  } else if (siteNav.classList.contains("is-open")) {
    setMenu(false);
    menuToggle.focus();
  }
});

mobileQuery.addEventListener("change", () => setMenu(false));

// Smooth scrolling for in-page links
function smoothScrollTo(event) {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.getElementById(link.getAttribute("href").slice(1));
  if (!target) return;

  event.preventDefault();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  history.pushState(null, "", link.getAttribute("href"));
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  setMenu(false);
}

document.addEventListener("click", smoothScrollTo);

// Project filtering
const filterButtons = document.querySelectorAll(".filter-btn");
const projectCards = document.querySelectorAll("#projects article");
const filterStatus = document.getElementById("filter-status");

function filterProjects(category) {
  let visible = 0;
  projectCards.forEach((card) => {
    const show = category === "all" || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible += 1;
  });

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  filterStatus.textContent = `Showing ${visible} ${visible === 1 ? "project" : "projects"}`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => filterProjects(button.dataset.filter));
});

// Lightbox
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = lightbox.querySelector(".lightbox-close");
let lastFocused = null;

function openLightbox(image) {
  lastFocused = document.activeElement;
  lightboxImg.src = image.currentSrc || image.src;
  lightboxImg.alt = image.alt;
  lightbox.hidden = false;
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.removeAttribute("src");
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll("#projects img").forEach((image) => {
  image.tabIndex = 0;
  image.setAttribute("role", "button");
  image.addEventListener("click", () => openLightbox(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(image);
    }
  });
});

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

// Contact form validation
const form = document.querySelector("#contact form");
const formStatus = document.getElementById("form-status");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validators = {
  name: (value) => (value.trim() ? "" : "Please enter your name."),
  email: (value) => {
    if (!value.trim()) return "Please enter your email address.";
    return emailPattern.test(value.trim()) ? "" : "Please enter a valid email address.";
  },
  message: (value) => {
    if (!value.trim()) return "Please enter a message.";
    return value.trim().length >= 10 ? "" : "Your message should be at least 10 characters.";
  },
};

function validateField(field) {
  const error = validators[field.name](field.value);
  document.getElementById(`${field.id}-error`).textContent = error;
  field.classList.toggle("invalid", Boolean(error));
  field.classList.toggle("valid", !error);
  field.setAttribute("aria-invalid", String(Boolean(error)));
  return !error;
}

const fields = Array.from(form.elements).filter((el) => el.name in validators);

fields.forEach((field) => {
  field.addEventListener("input", () => {
    formStatus.textContent = "";
    if (field.classList.contains("invalid") || field.classList.contains("valid")) {
      validateField(field);
    }
  });
  field.addEventListener("blur", () => validateField(field));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const results = fields.map(validateField);
  const firstInvalid = fields[results.indexOf(false)];

  if (firstInvalid) {
    formStatus.textContent = "Please fix the highlighted fields.";
    firstInvalid.focus();
    return;
  }

  formStatus.textContent = "Thanks! Your message is ready to send.";
  form.reset();
  fields.forEach((field) => {
    field.classList.remove("valid", "invalid");
    field.removeAttribute("aria-invalid");
  });
});
