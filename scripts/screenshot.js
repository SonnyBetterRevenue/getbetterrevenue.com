// Capture full-page screenshots of the site at 4 breakpoints for rebrand verification.
// Run: NODE_PATH=<global-node-modules> node scripts/screenshot.js
// Override defaults with env: URL=http://localhost:8080 OUT=.screenshots/before

const { chromium } = require("playwright");

const URL = process.env.URL || "http://localhost:8080";
const OUT = process.env.OUT || ".screenshots/before";

const BREAKPOINTS = [
  { name: "desktop-xl", width: 1920, height: 1080 },
  { name: "desktop-md", width: 1024, height: 768 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 480, height: 800 },
];

(async () => {
  const browser = await chromium.launch();
  for (const bp of BREAKPOINTS) {
    const ctx = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${OUT}/${bp.name}.png`, fullPage: true });
    console.log(`${bp.name}: saved`);
    await ctx.close();
  }
  await browser.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
