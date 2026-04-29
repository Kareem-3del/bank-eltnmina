# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **design + content staging area** for a future website rebuild of the **Real Estate Development Fund (REDF) Annual Report 2025**. There is no application code yet — `frontend/` is empty. The work so far is preparing the source material an implementation will need:

- `DESIGN.md` — the canonical design system ("Visionary Trust"). Front-matter holds the Material-3-style color/typography/spacing tokens; the body documents brand, components, and editorial rules. Treat this as the source of truth for any UI work.
- `ANIMATIONS.md` — the animation policy (which library to use, easing/duration rules, "use GSAP to make X" list, hard rules including reduced-motion and per-page animation budget).
- `guides_helper/guide_images/{en,mt}/<NN_section>/` — page images extracted from the original annual report PDFs, **already organized into website-page folders** (`01_home`, `03_about`, `04_board`, `08_strategy`, `17_financials`, `99_dividers`, etc.). Each `en/` folder contains a `page.md` documenting that page's sections, the actual extracted body text, key stats, and UI suggestions. **`mt/` (Arabic) currently has the images but no `page.md` files** — content mirrors the EN structure page-for-page.
- `guides_helper/example/` — Al Rajhi Bank's annual report site, saved as a reference. The Al Rajhi stack (GSAP + ScrollTrigger + smooth-scrollbar + Swiper) is what `ANIMATIONS.md` is patterned on.
- `assets/saudi-riyal.svg` — the official Saudi Riyal symbol glyph (Royal Decree, Feb 2025). See "Currency" rule below.

The original PDFs that produced the page images are no longer in the repo; the JPGs and the extracted text in each `page.md` are now the working source.

## Working in this repo

There is no build, lint, or test pipeline yet. When implementation starts in `frontend/`, add the corresponding tooling and update this file.

For now the typical task is one of:
- Editing `DESIGN.md` or `ANIMATIONS.md` to refine the system before code.
- Adding or updating a `page.md` inside an `en/<section>/` folder. The category folder names already encode the intended sitemap order (`01_home` … `23_contact`, plus `99_dividers` for decorative pages that are not navigable but provide hero/banner imagery).
- Mirroring `page.md` files into `mt/<section>/` for the Arabic edition (RTL; same structure, translated copy).
- Reading specific page images via the `Read` tool when text needs to be re-extracted from a JPG (no PDF, no OCR pipeline — the visual read is the extraction method).

When the implementation begins, the natural mapping is one route per `en/NN_section/` folder, with `99_dividers` content reused as full-bleed hero/interstitial banners rather than its own route.

## Non-obvious rules baked into the design

These will trip you up if you skim the docs:

- **Saudi Riyal currency**: never write `SAR` or the legacy `﷼` ligature. Inline the SVG at `assets/saudi-riyal.svg` (it uses `fill="currentColor"`), placed **before** the numeral in both EN and AR, height ~0.85em (~0.95em for display sizes). Examples and exact spacing rules are in `DESIGN.md` § Currency.
- **Sharp corners only**: every container, card, button, banner, table cell, input, modal — `border-radius: 0`. The single exception is status dots inside data tables. This is intentional; do not "soften" it.
- **No emojis in UI** (also a user-global rule). Use Lucide / Heroicons or real images.
- **Yellow highlight (#f1e48c) is Arabic-only**. Do not introduce it in EN layouts.
- **Numerals are always Western digits** in both editions. The percent sign **precedes** the number in AR (`%85`), follows in EN (`85%`).
- **Bilingual is wholesale mirroring, not per-component overrides**: prefer `direction: rtl` with logical CSS properties (`margin-inline-start`, etc.) over flipping each piece by hand.
- **Animations**: one engine (GSAP), one carousel library (Swiper), one smooth-scroll library (Lenis). `ANIMATIONS.md` lists banned alternatives (AOS, Framer Motion, Locomotive, etc.) — do not introduce them.
- **`scrub`-tied scroll animations must use `ease: "none"`**. One-shot reveals use `Expo.easeOut` or `Power2.easeOut`. No `bounce` / `elastic` anywhere — they look cheap on a financial report.
- **`prefers-reduced-motion` is non-negotiable**: skip entrance animations and show the final state.

## Editing notes for `page.md` files

Each `en/<section>/page.md` follows the same shape and future code will likely consume them as content sources:
- Source-image filename refs (`page-NNN.jpg`) — keep these accurate; the image filenames are the canonical key.
- Section title (matches the printed report's numbering, e.g. `2.2 Strategic Direction`).
- Section-by-section body text extracted from the report.
- Stat callouts (the big numbers that drive counter animations on the website).
- A short "UI suggestion" block at the bottom — this is intent, not commitment; revise as the site takes shape.

When extending a `page.md`, preserve the section-title hierarchy (`##` for sections, `###` for subsections) and quote blocks (`>`) for direct copy from the report — those will likely be the parsing seams later.

## Date / locale context

User's locale is Saudi Arabia. The report uses both Gregorian and Hijri years (`Annual Report 2025 / 1446 – 1447`). Hijri dates appear in some contracts/dates inside the report — preserve them where they appear, do not silently convert.
