/*
 * Better Revenue Website — Script
 *
 * GOOGLE SHEETS SETUP:
 * 1. Create a new Google Sheet
 * 2. Add headers in row 1: Timestamp | Name | Business | Email | Phone | Bottleneck
 * 3. Go to Extensions > Apps Script
 * 4. Replace the code with:
 *
 *    function doPost(e) {
 *      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
 *      var data = JSON.parse(e.postData.contents);
 *      sheet.appendRow([
 *        new Date(),
 *        data.name,
 *        data.business,
 *        data.email,
 *        data.phone,
 *        data.bottleneck
 *      ]);
 *      return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
 *        .setMimeType(ContentService.MimeType.JSON);
 *    }
 *
 * 5. Click Deploy > New deployment
 * 6. Type: Web app | Execute as: Me | Who has access: Anyone
 * 7. Copy the URL and paste it below
 */

const GOOGLE_SHEETS_URL = ""; // Paste your Apps Script URL here

// ===== Navbar scroll effect =====
const navbar = document.getElementById("navbar");

window.addEventListener(
  "scroll",
  () => {
    navbar.classList.toggle("scrolled", window.scrollY > 50);
  },
  { passive: true },
);

// ===== Mobile menu toggle =====
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navMenu.classList.toggle("open");
});

// Close menu on link click
navMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("active");
    navMenu.classList.remove("open");
  });
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

// ===== Scroll reveal animations =====
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.1 },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

// ===== Form submission =====
const form = document.getElementById("contactForm");
const successMsg = document.getElementById("formSuccess");
const errorMsg = document.getElementById("formError");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector(".btn-submit");
  btn.classList.add("loading");
  successMsg.style.display = "none";
  errorMsg.style.display = "none";

  const data = {
    name: form.name.value,
    business: form.business.value,
    email: form.email.value,
    phone: form.phone.value,
    bottleneck: form.bottleneck.value,
  };

  if (!GOOGLE_SHEETS_URL) {
    // No backend configured — show success anyway for testing
    form.reset();
    successMsg.style.display = "block";
    btn.classList.remove("loading");
    return;
  }

  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    form.reset();
    successMsg.style.display = "block";
  } catch (err) {
    errorMsg.style.display = "block";
  } finally {
    btn.classList.remove("loading");
  }
});
