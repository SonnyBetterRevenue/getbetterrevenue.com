// Walk through the 3-step audit flow and screenshot each step.
// Run: NODE_PATH=<global-modules> node scripts/verify-audit-flow.js

const { chromium } = require("playwright");
const URL = process.env.URL || "http://localhost:4321/audit.html";
const OUT = process.env.OUT || ".screenshots/audit-flow";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  await page.goto(URL, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/step1.png`, fullPage: true });

  // Test validation: try submitting empty
  await page.click('#contactForm button[type="submit"]');
  await page.waitForTimeout(200);
  const validationErr = await page.textContent("#contactError");
  console.log("validation msg empty:", validationErr?.trim() || "(none)");

  // Fill and advance
  await page.fill("#businessName", "Acme Pet Spa");
  await page.fill("#contactName", "Jane Owner");
  await page.fill("#email", "jane@acme.com");
  await page.click('#contactForm button[type="submit"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/step2.png`, fullPage: true });

  // Try submitting questions empty
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.click('#auditForm button[type="submit"]');
  await page.waitForTimeout(200);
  const auditErr = await page.textContent("#auditError");
  console.log("audit empty msg:", auditErr?.trim() || "(none)");

  // Answer all questions
  await page.click('input[name="industry"][value="pet_veterinary"]');
  await page.click('input[name="tenure"][value="3_to_10"]');
  await page.click('input[name="revenue"][value="1m_3m"]');
  await page.click('input[name="trajectory"][value="grew_steadily"]');
  await page.click('input[name="recurring"][value="balanced"]');
  await page.click('input[name="concentration"][value="under_5"]');
  await page.click('input[name="seasonality"][value="mild_swings"]');
  await page.click('input[name="platform"][value="somewhat"]');
  await page.click('input[name="keyman"][value="customers_leave"]');
  await page.click('input[name="authority"][value="me_alone"]');

  await page.screenshot({ path: `${OUT}/step2-filled.png`, fullPage: true });

  await page.click('#auditForm button[type="submit"]');
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/step3.png`, fullPage: true });

  if (errors.length) {
    console.error("ERRORS:", errors);
    process.exit(1);
  }
  console.log("flow OK");
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
