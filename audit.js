/*
 * Audit form flow — 3 steps:
 *   Step 1: contact info → stored in state, advances to Step 2
 *   Step 2: 9 audit questions → POST to backend (or no-op for now), advances to Step 3
 *   Step 3: thank-you confirmation
 *
 * BACKEND SETUP (when ready):
 *   Set SUBMIT_URL below to a webhook endpoint (n8n, Zapier, custom, Apps Script).
 *   Payload shape is in /docs/superpowers/specs/2026-04-27-valuation-audit-questions.md
 *   under "Downstream contract (JSON shape)".
 *
 * Until SUBMIT_URL is set, the form runs in demo mode — it accepts submissions and
 * advances to Step 3 without persisting anything. Useful for layout testing.
 */

const SUBMIT_URL = ""; // set when backend is wired

const state = {
  contact: null,
  audit: null,
};

const stepEls = {
  1: document.getElementById("step1"),
  2: document.getElementById("step2"),
  3: document.getElementById("step3"),
};

const stepDots = document.querySelectorAll(".audit-step-dot");

function showStep(n) {
  Object.entries(stepEls).forEach(([k, el]) => {
    el.classList.toggle("active", Number(k) === n);
  });
  stepDots.forEach((dot) => {
    const d = Number(dot.dataset.step);
    dot.classList.toggle("active", d === n);
    dot.classList.toggle("complete", d < n);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== Step 1: contact form =====
const contactForm = document.getElementById("contactForm");
const contactError = document.getElementById("contactError");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  contactError.classList.remove("visible");
  contactError.textContent = "";

  const businessName = contactForm.businessName.value.trim();
  const contactName = contactForm.contactName.value.trim();
  const email = contactForm.email.value.trim();
  const phone = contactForm.phone.value.trim();

  const errors = [];
  if (!businessName) errors.push("Business name is required.");
  if (!contactName) errors.push("Your name is required.");
  if (!email && !phone)
    errors.push("Please provide an email or a phone number (at least one).");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("That email doesn't look right.");

  if (errors.length) {
    contactError.textContent = errors.join(" ");
    contactError.classList.add("visible");
    return;
  }

  state.contact = { businessName, contactName, email, phone };
  showStep(2);
});

// ===== Step 2: audit questions =====
const auditForm = document.getElementById("auditForm");
const auditError = document.getElementById("auditError");
const backBtn = document.getElementById("backToContact");

backBtn.addEventListener("click", () => showStep(1));

auditForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  auditError.classList.remove("visible");
  auditError.textContent = "";

  const radioFields = [
    "industry",
    "tenure",
    "revenue",
    "trajectory",
    "recurring",
    "concentration",
    "seasonality",
    "platform",
    "authority",
  ];

  const answers = {};
  const missing = [];

  for (const f of radioFields) {
    const checked = auditForm.querySelector(`input[name="${f}"]:checked`);
    if (!checked) missing.push(f);
    else answers[f] = checked.value;
  }

  const keymanChecked = Array.from(
    auditForm.querySelectorAll('input[name="keyman"]:checked'),
  ).map((i) => i.value);
  if (!keymanChecked.length) missing.push("keyman");
  else answers.keyman = keymanChecked;

  if (missing.length) {
    auditError.textContent = "Please answer every question before submitting.";
    auditError.classList.add("visible");
    const firstMissing = auditForm.querySelector(`[name="${missing[0]}"]`);
    if (firstMissing) {
      firstMissing
        .closest(".audit-question")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  state.audit = answers;

  const btn = auditForm.querySelector(".btn-submit");
  btn.classList.add("loading");

  const payload = {
    submitted_at: new Date().toISOString(),
    contact: state.contact,
    audit: state.audit,
  };

  if (SUBMIT_URL) {
    try {
      await fetch(SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      auditError.textContent =
        "Something went wrong sending your audit. Please try again.";
      auditError.classList.add("visible");
      btn.classList.remove("loading");
      return;
    }
  } else {
    // Demo mode — log payload for verification, no network call
    console.log("[audit] demo mode — would POST:", payload);
  }

  btn.classList.remove("loading");
  showStep(3);
});
