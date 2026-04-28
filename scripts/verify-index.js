// Screenshot the rebranded index at desktop + mobile and capture pageerrors.
const { chromium } = require("playwright");
const URL = process.env.URL || "http://localhost:4321/";
const OUT = process.env.OUT || ".screenshots";

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  for (const [label, viewport] of [
    ["index-desktop", { width: 1440, height: 900 }],
    ["index-mobile", { width: 390, height: 844 }],
  ]) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    page.on("pageerror", (e) =>
      errors.push(`${label} pageerror: ${e.message}`),
    );
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`${label} console: ${m.text()}`);
    });
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${label}-top.png` });
    // Walk the page so IntersectionObserver fires every .reveal before capturing fullPage.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.6;
      const total = document.body.scrollHeight;
      for (let y = 0; y <= total; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, total);
      await new Promise((r) => setTimeout(r, 800));
    });
    await page.screenshot({ path: `${OUT}/${label}-full.png`, fullPage: true });
    await ctx.close();
  }

  await browser.close();
  if (errors.length) {
    console.error("ERRORS:", errors);
    process.exit(1);
  }
  console.log("index OK");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
