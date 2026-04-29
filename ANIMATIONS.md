# Animation Rules — REDF Annual Report Website

Reference: Al Rajhi Bank annual report (`guides_helper/example/`).
These are the animation choices we follow. Do not invent new patterns; pick from this list.

---

## Stack — what we use

- **GSAP** — every JS animation goes through GSAP. No CSS keyframes for motion, no jQuery `.animate()`, no Framer Motion.
- **ScrollTrigger** (GSAP plugin) — anything that fires while scrolling.
- **ScrollToPlugin** (GSAP plugin) — for anchor-link smooth jumps.
- **Lenis** — page-wide smooth/inertial scrolling. Disable on mobile (native momentum is better).
- **Swiper.js** — every carousel, slider, or photo gallery.
- **Native CSS `transition`** — only for hover states and class-flip styling (header shrink, button color, link underline).

Do not add: Locomotive Scroll, AOS, WOW.js, ScrollReveal, Framer Motion, Anime.js, Three.js. One animation engine, one carousel library — that is the whole budget.

---

## Easing rules

- Scroll-tied animations (`scrub: true`) → `ease: "none"`. Always.
- One-shot reveals (entrance animations) → `Expo.easeOut` or `Power2.easeOut`. Decelerates hard at the end, feels premium.
- Page transitions, big curtain reveals → `Expo.easeInOut`.
- Counters and number tweens → `power1.inOut`.
- Never use `linear` for one-shot reveals. Never use `bounce` or `elastic` — they look cheap on a financial report.

---

## Durations

- UI feedback (hover, button press, menu hover-image swap) → 200–400ms.
- Reveal-on-scroll → 1.5–2.5s.
- Page transitions → 1.5s.
- Carousel slide change → 600–900ms.
- Counter count-up → 2.5s.

If something feels slow, lower the duration before changing the ease. If something feels janky, raise it.

---

## Use GSAP to make…

### 1. Page enter (load) animation
- Curtain panel scales away (`scaleY: 0` from `1`).
- Header drops in from `y: -20`, fades in.
- Hero photo lifts up from `y: 80` while fading in.
- Section heading rises from `y: 20`, staggered.

Apply on every page so navigation feels intentional.

### 2. Reveal-on-scroll utility
Two utility classes only — do not invent more:
- `.anim-fadeinup` → element rises from `y: 100`, fades in. Default for paragraphs, cards, stat blocks.
- `.anim-zoomin` → element scales from `1.2 → 1`, fades in. Use for images and feature blocks.

Both fire once when the element enters the viewport. Do not use scrub for these.

### 3. Image parallax on scroll
- Inside an `overflow: hidden` wrapper, translate the image by `yPercent: 30` tied to `scrub: true`.
- Use on full-bleed photos (the villa shot from page 7, hero family photo from page 8, section dividers).
- Do not parallax small images, headshots, or icons.

### 4. Pinned section with horizontal or staged scroll
- Reserve for one or two key story moments — the strategic pillars, the 50-year timeline, or the Vision 2030 alignment.
- `pin: true`, `scrub: 1`, end after `+=1500` to `+=2000` of scroll distance.
- Never pin more than two sections per page; users get lost.

### 5. Animated number counters
- Every big stat in the report animates from 0 to its final value when scrolled into view.
- Required for: 66.2% homeownership rate, 920,126 families, SR 613.6 Bn financing, 83,014 contracts, 1,885,600+ registered beneficiaries.
- Fires once (`once: true`). Snap to integers (or one decimal for percentages).

### 6. SVG line draw
- For the 50-year timeline or any decorative connecting path.
- Animate `strokeDashoffset` from full path length down to 0.
- Tie to scroll position (`scrub: true`) so the line draws as the user moves down.

### 7. Heading word-by-word reveal
- Headings split into words, each word rises and fades in with a 100ms stagger.
- Use sparingly — only on section titles ("Chairman's Message", "Strategic Direction", "Financial Statements"), not on every paragraph.
- Skip on body copy. It slows reading.

### 8. Mouse-move parallax on the hero
- Hero image and caption shift slightly opposite to mouse position.
- Image moves less, caption moves more — creates depth.
- Disable on mobile and on `prefers-reduced-motion`.

### 9. Sticky header state change
- After scrolling past ~70px, toggle a `.header--scrolled` class.
- Style the change in CSS (smaller padding, solid background, shadow) with a `transition: all .3s ease`.
- No JS animation here — just the class flip and CSS transition.

### 10. Lazy image cross-fade
- Images load when they hit `-50%` of the bottom of the viewport.
- Old placeholder fades out as the real image fades in.
- Required for the report — there are 170+ pages worth of images.

### 11. Anchor-link smooth scroll
- All in-page links (`href="#section"`) scroll smoothly to the target.
- Duration ~1.5s with `Expo.easeInOut`.
- Respect a `data-offset` attribute on links for sticky-header offset.

### 12. Menu open/close
- Stagger the menu items in (`y: 80 → 0`, opacity, 50ms stagger).
- Reverse the same animation on close.
- Hover on a menu item swaps the side preview image with a fade + slight scale.

---

## Use Swiper to make…

- Photo sliders (hero carousel, project gallery).
- Testimonial / quote sliders.
- Multi-card carousels (board members, success stories).

Swiper config rules:
- `speed: 600–900` for slide change.
- `parallax: true` so captions move at a different rate than backgrounds.
- `dynamicBullets: true` for pagination.
- `grabCursor: true` on desktop, `simulateTouch: true`.
- Always provide custom `nextEl` / `prevEl` arrows — never rely on default Swiper styling.
- Lazy-load slides with `lazy: { loadPrevNext: true }`.

---

## Use CSS (not GSAP) for…

- Hover color, hover scale (`transform: scale(1.02)`), underline grow on links.
- Button press feedback.
- Icon spin on loading states.
- Header shrink on scroll (class flip + CSS transition).
- Mobile drawer slide if it is a single transform.

If the animation is hover-only and one property, it goes in CSS. Anything multi-step or scroll-driven goes through GSAP.

---

## Hard rules — do not break

1. **No emojis or AOS-style attributes** like `data-aos="fade-up"`. Reveal animations use the two utility classes above and nothing else.
2. **No autoplay carousels** that move faster than 5 seconds per slide. The user is reading.
3. **No looping background animations** (pulsing dots, floating shapes, infinite spinners). One-shot or scroll-tied only.
4. **No animation on text the user is reading**. Reveal once, then it stays still. Never re-trigger.
5. **`prefers-reduced-motion` must be respected.** Wrap entrance animations in a check; on reduced-motion, skip the animation and show the final state immediately.
6. **Mobile: kill smooth scroll, kill mouse-parallax, keep entrance animations short** (~50% of desktop duration).
7. **Test on a slow laptop.** If a section drops below 50fps while scrolling, simplify it. Parallax and pin are the usual culprits.
8. **No animation longer than 3 seconds.** If you need longer, you are doing the wrong animation.
9. **One hero animation per page.** Mouse parallax OR image scrub OR pinned scroll — not all three.
10. **Stagger > 0.15s feels slow.** Keep stagger at 0.05–0.1s for menu items, 0.15s for large content blocks.

---

## Animation budget per page

A typical content page should have:
- 1 page-enter transition.
- 1 hero parallax or pin (optional).
- Reveal-on-scroll on body content.
- Counters on any visible stat.
- 1 carousel if there is one.

Total time the user waits on animation before they can read: under 2 seconds. If it is longer, cut something.
