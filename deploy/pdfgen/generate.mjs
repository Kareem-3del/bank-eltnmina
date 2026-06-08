/* Regenerate the per-page "download this page" PDFs for the REDF report site.
 *
 * The pages are GSAP/ScrollTrigger driven: .anim-element / .reveal / .row-trigger
 * start hidden and reveal on scroll (and reverse when scrolled past), counters
 * animate from 0, and there's an entrance curtain + a floating actions-box.
 * A naive headless print would capture blank sections. So per page we:
 *   1. render at desktop width, emulate reduced-motion (disables Lenis + the
 *      curtain, and makes counters jump to their final value),
 *   2. force-load every image and scroll-sweep to fire all ScrollTriggers,
 *   3. finalize: kill ScrollTriggers, force every reveal element to its visible
 *      end-state, drop the curtain + the floating actions-box,
 *   4. print one continuous tall page (matches the prior single-page format).
 *
 * Usage:
 *   node generate.mjs                # all langs, all pages
 *   node generate.mjs en strategic-direction   # one page (smoke test)
 */
import puppeteer from "puppeteer";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdir } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(__dirname, "../../frontend");
const OUT_ROOT = resolve(FRONTEND, "assets/pdf");
const BASE = process.env.BASE || "http://localhost:8124";
const WIDTH = 1440;

// Every content page (index.html is the home — it has no per-page PDF, matching
// actions.js which omits the download-page button there). MT-final.pdf is the
// original 172-page report and is intentionally left alone.
const SLUGS = [
  "introduction", "chairman-message", "ceo-message",
  "executive-summary-1", "executive-summary",
  "strategic-direction", "performance-summary", "current-state",
  "housing-support-program", "housing-support-empowerment-achievements",
  "digital-achievements", "government-enablers", "training-programs",
  "notable-achievements", "subsidized-finance-cost",
  "opportunities-and-enablers", "subsidiaries", "challenges-and-support",
  "conclusion",
];

const argLang = process.argv[2];
const argSlug = process.argv[3];
const LANGS = argLang ? [argLang] : ["en", "ar"];
const slugsFor = () => (argSlug ? [argSlug] : SLUGS);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function renderOne(browser, lang, slug) {
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: 1024, deviceScaleFactor: 1 });
  // Order matters: emulateMediaType must come BEFORE emulateMediaFeatures, or
  // the type call clobbers the features (both map to Emulation.setEmulatedMedia).
  await page.emulateMediaType("screen");
  await page.emulateMediaFeatures([
    { name: "prefers-reduced-motion", value: "reduce" },
  ]);

  const url = `${BASE}/${lang}/${slug}.html`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 90000 });

  const reduced = await page.evaluate(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  if (!reduced) throw new Error("reduced-motion not active — counters would animate");

  // Fonts + force-load lazy images + scroll-sweep to fire every ScrollTrigger.
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    document.querySelectorAll("img").forEach((i) => {
      i.loading = "eager";
      if (i.dataset && i.dataset.src && !i.src) i.src = i.dataset.src;
    });
    await new Promise((res) => {
      let y = 0;
      const step = () => {
        window.scrollTo(0, y);
        y += 500;
        if (y < document.body.scrollHeight) setTimeout(step, 25);
        else { window.scrollTo(0, 0); res(); }
      };
      step();
    });
  });

  // Wait for every image to actually finish decoding.
  await page.evaluate(() =>
    Promise.all(
      [...document.images]
        .filter((i) => !i.complete)
        .map((i) => new Promise((r) => { i.onload = i.onerror = r; }))
    )
  );

  // Finalize: everything to its end-state, remove transient chrome.
  await page.evaluate(() => {
    try { window.ScrollTrigger?.getAll().forEach((t) => t.kill()); } catch {}
    try { window.__lenis?.destroy?.(); } catch {}
    const sel = ".anim-element, .reveal, .row-trigger, [data-gsap-img]";
    try {
      window.gsap?.set(sel, { clearProps: "all" });
      window.gsap?.set(sel, { opacity: 1, x: 0, y: 0, scale: 1, rotationY: 0, filter: "none" });
    } catch {}
    document.querySelectorAll(".anim-element").forEach((el) => {
      el.style.opacity = "1"; el.style.transform = "none"; el.style.filter = "none";
    });
    document.querySelectorAll(".reveal").forEach((el) => {
      el.classList.add("is-visible");
      el.style.opacity = "1"; el.style.transform = "none";
    });
    document.querySelectorAll(".row-trigger").forEach((el) => {
      el.style.opacity = "1"; el.style.transform = "none";
    });
    document.querySelectorAll("[data-curtain], .page-curtain, .actions-box")
      .forEach((el) => el.remove());
    // Chart.js canvases may have been sized while their container was still
    // mid-reveal (wrong dimensions) and won't redraw on their own. Now that
    // everything is at full size, force a no-animation redraw to final state.
    try {
      document.querySelectorAll("canvas").forEach((cv) => {
        const c = window.Chart?.getChart?.(cv);
        if (c) { c.resize(); c.update("none"); }
      });
    } catch {}
    window.scrollTo(0, 0);
  });

  await sleep(500); // let layout settle after finalize

  const height = await page.evaluate(() =>
    Math.ceil(Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    ))
  );

  const outDir = resolve(OUT_ROOT, lang);
  await mkdir(outDir, { recursive: true });
  const out = resolve(outDir, `${slug}.pdf`);
  await page.pdf({
    path: out,
    width: `${WIDTH}px`,
    height: `${height}px`,
    printBackground: true,
    pageRanges: "1",
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  await page.close();
  return { out, height };
}

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});

let ok = 0, fail = 0;
for (const lang of LANGS) {
  for (const slug of slugsFor()) {
    try {
      const { height } = await renderOne(browser, lang, slug);
      console.log(`OK   ${lang}/${slug}.pdf  (${height}px tall)`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${lang}/${slug}.pdf  ${e.message}`);
      fail++;
    }
  }
}
await browser.close();
console.log(`\nDone: ${ok} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
