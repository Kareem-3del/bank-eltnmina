---
name: Visionary Trust
colors:
  surface: '#f6faf8'
  surface-dim: '#d6dbd9'
  surface-bright: '#f6faf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f5f2'
  surface-container: '#eaefec'
  surface-container-high: '#e5e9e7'
  surface-container-highest: '#dfe3e1'
  on-surface: '#181d1b'
  on-surface-variant: '#3e4946'
  inverse-surface: '#2c3130'
  inverse-on-surface: '#edf2ef'
  outline: '#6e7a76'
  outline-variant: '#bdc9c5'
  surface-tint: '#006b5f'
  primary: '#00685c'
  on-primary: '#ffffff'
  primary-container: '#008375'
  on-primary-container: '#f2fffb'
  inverse-primary: '#74d7c7'
  secondary: '#3c6660'
  on-secondary: '#ffffff'
  secondary-container: '#bce9e1'
  on-secondary-container: '#416a64'
  tertiary: '#4f5f5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#677876'
  on-tertiary-container: '#f3fffc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#91f4e3'
  primary-fixed-dim: '#74d7c7'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005047'
  secondary-fixed: '#bfebe4'
  secondary-fixed-dim: '#a4cfc8'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#244e48'
  tertiary-fixed: '#d4e6e3'
  tertiary-fixed-dim: '#b8cac7'
  on-tertiary-fixed: '#0e1e1d'
  on-tertiary-fixed-variant: '#3a4a48'
  background: '#f6faf8'
  on-background: '#181d1b'
  surface-variant: '#dfe3e1'
  divider-teal: '#86bdb7'
  ar-highlight: '#f1e48c'
  status-on-track: '#3aa776'
  status-behind: '#e89f3a'
  status-blocked: '#d8453d'
  status-completed: '#39a3c9'
typography:
  display-lg:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Public Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.4'
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
  ar-display-lg:
    fontFamily: Almarai
    fontSize: 44px
    fontWeight: '800'
    lineHeight: '1.3'
  ar-headline-lg:
    fontFamily: Almarai
    fontSize: 30px
    fontWeight: '700'
    lineHeight: '1.4'
  ar-body-md:
    fontFamily: Almarai
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.8'
rounded:
  none: 0
  sm: 0
  DEFAULT: 0
  md: 0
  lg: 0
  xl: 0
  full: 9999px
icons:
  riyal-svg: assets/saudi-riyal.svg
spacing:
  base: 8px
  margin-page: 64px
  margin-mobile: 20px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style

This design system is engineered for the financial and governmental landscape of Saudi Arabia, modeled on the Real Estate Development Fund (REDF) Annual Report 2025. It balances the heritage of national development with a forward-looking, modern digital presence. The personality is authoritative, reliable, and exceptionally clear, aimed at citizens and stakeholders who require transparency and stability.

The aesthetic follows a **Corporate / Modern editorial** style. It leverages high-quality whitespace to evoke a sense of premium service and accessibility. The visual language is structured and grid-bound, reflecting the organized nature of a major fund. Decorative flair is replaced by a recurring **photographic mosaic** motif — square photographs interleaved with solid teal and tinted-teal squares — which appears on covers, chapter openers, and section dividers. Every element earns its place by serving an informative or wayfinding purpose.

## Colors

The palette is anchored by the deep **REDF Teal (#008375)**, a color that symbolizes growth and professional integrity. This primary green is used for key branding elements, primary calls-to-action, banner headers, chapter indicators, and large display numerals.

Supporting this is a layered family of **tinted teals**: a near-mint container tint (#bce9e1 / #d4e6e3) for KPI cards and sub-blocks, and a richer mid-teal divider tone (#86bdb7) used for full-bleed chapter divider pages and accent squares in the photographic mosaic. The white background is the dominant surface, with tints used in 1–3 layers to create depth without shadows. Body type uses a near-black gray (#181d1b) so it reads as soft against the warm whites.

The Arabic edition introduces a single accent: a soft **highlight yellow (#f1e48c)** used as a marker-pen background behind a key Arabic phrase, the report-cover date band, and inline quoted terms. This accent is **Arabic-only** — it does not appear in the English layouts and should not be added there.

KPI and table status colors are functional only: green (#3aa776) for on-track, orange (#e89f3a) for behind, red (#d8453d) for significantly behind, and a cool blue (#39a3c9) for completed. They appear exclusively as small dots inside data tables.

## Typography

The Latin edition uses **Public Sans** across all interfaces. Chosen for its institutional clarity and neutral tone, it provides the "official" feel necessary for a government-affiliated fund. Headlines use bold weights and the primary teal color to command attention. Body text is prioritized for readability with generous line heights and a slightly wider tracking in smaller sizes.

The Arabic edition pairs Public Sans with **Almarai** — a geometric, low-contrast Arabic sans whose vertical proportions and stroke weight sit naturally next to Public Sans. Almarai is loaded in three weights: 400 (regular body), 700 (headline), and 800 (display). Arabic body text is **justified with kashida** (lam-extension) when set in narrow columns, producing the report's characteristic stretched-letter rhythm. Line height for Arabic is ~15–20% looser than the Latin counterpart to accommodate diacritics and tashkeel.

Numerals are always **Western (Hindu-Arabic) digits** in both editions for consistency in financial data. In Arabic, the percent sign **precedes** the number (`%85`) per typographic convention; in English it follows (`85%`). For dense data displays — KPI tables, financial indicators — typography levels remain strict so the user can navigate hierarchies effortlessly.

### Currency: the Saudi Riyal symbol
The legacy `SAR` letter token and the previous `﷼` ligature are **deprecated** in this system. All Saudi Riyal values use the new official **Saudi Riyal symbol** (Unicode U+20C1, approved by Royal Decree on 20 February 2025) rendered as the SVG at `assets/saudi-riyal.svg`. The glyph composes the Arabic letters ر / يَا / ل into a geometric mark and ships in a 1124 × 1256 viewBox with `fill="currentColor"`, so it inherits text color in any context.

**Rendering rules:**
- Place the symbol **before** the numeral in both EN and AR (e.g. `⃁ 613.6 Billion`, `‏⃁ ٦١٣٫٦ مليار`).
- Set the symbol height to **~0.85em** of the surrounding text and align to the cap-height baseline; never scale it taller than the digit ascenders.
- Use a small leading gap of `0.25em` between the symbol and the numeral.
- For display-size numerals (KPI cards, executive summary), bump the symbol to **~0.95em** so it reads as a peer of the figure rather than a subscript.
- Inherit color via `currentColor` — the symbol must follow the same teal / dark-gray rules as the surrounding text. Never recolor it independently.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1124.14 1256.39" role="img" aria-label="Saudi Riyal">
  <path fill="currentColor" d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z"/>
  <path fill="currentColor" d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z"/>
</svg>
```

Chapter indicators are a distinctive pattern: an oversized bold numeral (e.g. **`1`**) in primary teal, followed by `/4` in lighter teal, then the chapter title set in a softer teal weight on the same baseline (e.g. *"1/4 Executive Summary"*).

## Layout & Spacing

The system employs a **Fixed Grid** philosophy for desktop layouts, centering content within a 1280px container to maintain a composed, editorial look. A 12-column grid is the standard. Long-form pages use a **left rail** for the chapter/section title (typically spanning 2–3 columns) followed by a **3- or 4-column body** of justified narrative. KPI dashboards use a 2-up split between a tinted left card (strategy summary) and a wider right cluster of stat tiles.

Spacing is based on an 8px scale. Large sections are separated by significant vertical margins (64px+) to create a "breathable" interface that reduces cognitive load. Internal padding within components is generous so text never feels crowded by borders or adjacent elements. Page numbers and the running footer ("Real Estate Development Fund Annual Report 2025") sit at small label-sm size at the bottom edge, in the **outer margin** — left in EN, right in AR — never centered.

### RTL & Bilingual

Every page exists in mirrored EN and AR variants. The mirroring is wholesale: chapter indicators flip from top-left to top-right, photo mosaics flip orientation, page numbers move to the opposite footer corner, the Saudi national emblem and the REDF mark swap sides on the cover, and column reading order reverses. The grid itself does not change; only the directional flow does. When implementing in CSS, prefer `direction: rtl` with logical properties (`margin-inline-start`, `padding-inline-end`) rather than per-component overrides.

## Elevation & Depth

To maintain a flat, professional, and corporate aesthetic, this design system avoids heavy shadows. Instead, it uses **tonal layers** and **low-contrast outlines**.

Depth is created by stacking white cards on tinted-teal washes (#bce9e1, #d4e6e3, or the divider #86bdb7), or by giving a card a solid-teal banner header that visually anchors a lighter tinted body. For subtle separation, a 1px solid border in a slightly darker tint of the background is preferred over a drop shadow. If elevation is absolutely required for interaction (a hovered button, an active modal), use a soft, diffused ambient shadow with low opacity (4–8%) and a subtle teal tint.

## Shapes

The shape language is **rectilinear and architectural** — every container, banner, card, button, input, table cell, KPI tile, org-chart node, and divider page uses **sharp 90° corners** (`border-radius: 0`). The aesthetic is deliberately blueprint-like; rounding is treated as decoration that softens the grid and is therefore avoided. The single, narrow exception is the small status dot inside data tables, which uses `border-radius: 9999px` (`rounded.full`) because it's a circle by definition. Pills, badges, chips, modals, dropdowns, tooltips, and tags are all square-cornered.

This sharpness reinforces the photographic-mosaic motif: the square photo crops, the solid teal squares, and the UI surfaces all share the same edge geometry, so the whole report reads as one continuous grid.

## Components

### Buttons
Primary buttons are **solid REDF Teal**, sharp corners, white text, semi-bold, with a minimum width that makes them feel substantial (≥160px) and ~14px vertical padding. Secondary buttons use a 1.5px teal outline with a transparent background and primary-teal text. Tertiary buttons are text-only in primary teal. There are no rounded or pill-shaped buttons in this system. Hover state darkens the fill by ~6% and adds a subtle 4–8% teal-tinted shadow; pressed state inverts to the `primary-fixed-dim` tone with no shadow.

### Section Banner
The recurring header strip used to introduce a content block (e.g. "Strategy Update", "Programs and Products", "Monthly Support Deposits"). A solid `primary-container` (#008375) bar with **sharp corners**, full-width inside its parent column, ~56px tall, with **white** semi-bold heading text aligned to the leading edge (left in EN, right in AR). Pairs with a tinted body card directly underneath sharing the same width — no gap between banner and body, so the two read as one rectilinear unit.

### KPI / Stat Card
The primary vessel for executive-summary metrics. A light tinted-teal background (#e5efec) with **sharp corners** and generous padding (24–32px). Inside, stats are laid out as: an oversized **display-lg numeral in primary teal** (e.g. `83,014`, `⃁ 613.6`), a **label-bold teal sub-label** beneath it ("Total Beneficiaries", "Billion"), and a small grey description line. Currency figures use the inline Saudi Riyal SVG glyph at ~0.95em — never the letters "SAR" and never the legacy `﷼`. Multiple stats sit in a horizontal row separated only by whitespace — no internal dividers, no rounded inner cells. When the card has a heading, it gets a Section Banner flush on top.

### Standard Card
White background, **sharp corners**, subtle 1px border in `outline-variant`, generous internal padding. Used for narrative or list content. Header cards for specific fund sections may use a solid tertiary green or tinted teal background to distinguish them.

### Input Fields
Clean, sharp-cornered, and minimalist. 1px light gray border that transitions to a 1.5px primary teal on focus. Field height ~44px, padding 12px horizontal. Labels sit above the field in a bold, smaller font size for maximum clarity. Error state borders flip to `error` (#ba1a1a). No rounded corners, no inset shadows.

### Data Indicators
Financial indicators follow a consistent layout: an outlined icon at the top, a clear label, a large display-size number, and a sub-label for units (e.g. "Million", "Billion"). When the figure is monetary, the **Saudi Riyal SVG glyph precedes the numeral** (`⃁ 52.7`) and the unit word ("Billion") sits underneath as a sub-label — never as inline text after the number. A thin horizontal teal line anchors the elements when grouped.

### Tables
Used heavily for KPIs, salary brackets, and financial breakdowns. Header row: solid primary teal with **white** label-bold text, ~40px tall. Body rows alternate between `surface` (#f6faf8) and `surface-container-low` (#f0f5f2) for zebra striping. Cell padding is generous (16px+ vertical). Status indicators are small filled dots in their semantic color, never icons or emoji. Multi-line "Strategic Objective" rows use the tinted teal as a soft callout band that spans the full width above the related KPIs.

### Org-Chart Nodes & Connectors
Top-level nodes (Board, CEO, top-of-house departments) use **solid primary teal** rectangles with sharp corners and white centered semi-bold text. Secondary or advisory nodes use **light tinted teal** rectangles with primary-teal text — also sharp-cornered. Connector lines are 1–2px teal, **rectilinear only** — no curves, no rounded elbows — and terminate in small **square** joints at each node edge. Dashed teal lines indicate dotted-line / advisory relationships.

### Chapter Indicator (Page Header)
The signature wayfinding element. An oversized **bold teal numeral** (e.g. `1`, `2`) followed by `/N` in a lighter teal weight, then the chapter title in a soft teal at the same baseline. Sits at the top-left in EN, top-right in AR, with significant top margin (~80px). On chapter-opener pages, the numeral may swell to ~120px.

### Divider Page
A full-bleed page in `divider-teal` (#86bdb7) with no content, used between major report chapters. Implementations may add a small chapter glyph or numeral but the default is a pure color field. Treat as a section transition — not as a hero.

### Cover / Chapter-Opener Mosaic
The hero pattern from page 1 and section openers (e.g., "Overview of REDF's Current Status"). A 3×3 to 4×4 grid mixing photographs (families, homes, employees, cityscape) with solid `primary-container` and `divider-teal` squares. Photos are not rounded; they sit edge-to-edge with the colored squares, producing an architectural mosaic. Headlines overlay the colored squares directly, in white or near-white, with the emphasized phrase set in primary teal.

### Quote / Leadership Block
A full-bleed **primary-container teal** background, white serif-style quote text (still Public Sans, but italic-weighted via punctuation glyphs), a thin white horizontal divider underneath the quote, and the attribution in white label-bold below. Used for royal and chairman messages.

### Yellow Highlight (Arabic-only)
A marker-pen rectangle in `ar-highlight` (#f1e48c) sitting behind 1–3 words of body text, behind the report-cover date strip, or behind a section pull-quote. **Do not** introduce this color anywhere in the English edition — it is part of the Arabic-only typographic emphasis system.

### Photo Treatment
Editorial photography of Saudi families, employees, and homes is presented in **square crops** (aspect 1:1) with **sharp corners** and a slight cool/teal cast applied in post-processing so people read against the brand palette rather than fighting it. Portraits for Board of Directors are full-body cutouts on white, with a sharp-cornered tinted-teal pedestal card below carrying the name (semi-bold) and role (regular). Architectural photography (villas, neighborhoods) is rendered wide (≈16:9) and reserved for chapter-opener spreads. Avatars and circular profile crops are **not** part of this system — all photo containers are rectangles.

### Progress & Charts
Lines used in charts and organizational connectors are thin (1–2px) and use the secondary or primary green. Connectors are rectilinear, reinforcing the structured, grid-based nature of the fund. Bar and column charts default to teal-on-tinted-teal; only diverge to status colors when comparing on/off-track data.
