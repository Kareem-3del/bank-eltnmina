/* ==========================================================================
   animations.js — GSAP + ScrollTrigger + Lenis layer
     · page-enter curtain
     · Lenis smooth scroll (desktop, non-reduced-motion)
     · ScrollTrigger reveals (.reveal / .anim-fadeinup / .anim-zoomin)
     · scrub parallax for .parallax wrappers and the home banner-stat
     · GSAP-driven counters
     · staggered enters for pillars / board / quotes / channels / nav menu
     · hero mouse-parallax (desktop only)
     · ScrollToPlugin anchor scroll routed through Lenis when present
   Boots only if window.gsap exists; main.js detects the same and stands down.
   ========================================================================== */

(() => {
  "use strict";

  if (!window.gsap) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 880px)").matches;
  const isRTL = document.documentElement.dir === "rtl";
  // The home page (identified by its bespoke .new-hero block) gets a
  // deliberately MORE AGGRESSIVE motion treatment — bigger travel, harder
  // zoom, 3D tilt and overshoot — than the restrained inner pages.
  const isHome = !!document.querySelector(".new-hero");

  const { gsap } = window;
  const ScrollTrigger = window.ScrollTrigger;
  const ScrollToPlugin = window.ScrollToPlugin;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  document.documentElement.classList.add("is-anim-ready");

  // Recompute trigger positions once everything (images, fonts) has settled,
  // so reveals fire at the right scroll offsets even on image-heavy pages.
  if (ScrollTrigger) {
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  /* ------ Lenis smooth scroll ----------------------------------------- */
  let lenis = null;
  const staggeredMenu = document.querySelector("staggered-menu")
  if (window.Lenis && !reduceMotion && !isMobile) {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    if (ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    window.__lenis = lenis;
  }

  /* ------ Page-enter curtain ------------------------------------------ */
  const curtain = document.querySelector("[data-curtain]");
  const tlEnter = gsap.timeline();

  if (curtain && !reduceMotion) {
    tlEnter.fromTo(
      curtain,
      { scaleY: 1 },
      {
        scaleY: 0, duration: 1.1, ease: "expo.inOut",
        onComplete: () => curtain.classList.add("is-done")
      }
    );
  } else if (curtain) {
    curtain.classList.add("is-done");
  }

  /* ------ Hero entrance (only on pages that have a .hero) ------------- */
  // The AR home uses a custom `.new-hero` block whose inner elements have
  // different class names; its own choreography lives further below
  // ("AR new-hero entrance choreography"). To avoid GSAP "target null"
  // warnings, this generic pass guards each tween and skips it if the
  // selector misses on the current page.
  const hero = document.querySelector(".hero, .page-head, .contact-hero");
  if (hero && !reduceMotion) {
    const heading = hero.querySelector(".h-display, .h-1");
    const lead = hero.querySelector(".lead, .hero__lead, .page-head__lead");
    const eyebrow = hero.querySelector(".eyebrow, .chapter-indicator");
    const actions = hero.querySelector(".hero__actions");
    const meta = hero.querySelector(".hero__meta");
    const visual = hero.querySelector(".mosaic, .vm, .hero__visual");

    if (eyebrow) tlEnter.from(eyebrow, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.6");
    if (heading) tlEnter.from(heading, { y: 40, opacity: 0, duration: 1.0, ease: "expo.out" }, "-=0.5");
    if (lead) tlEnter.from(lead, { y: 24, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.7");
    if (actions) tlEnter.from(actions, { y: 18, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.6");
    if (meta) tlEnter.from(meta, { y: 18, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.5");
    if (visual) tlEnter.from(visual, { y: 60, opacity: 0, scale: 1.05, duration: 1.2, ease: "expo.out" }, "-=0.9");
  }

  /* ------ Header drop-in --------------------------------------------- */
  const header = document.querySelector("[data-header]");
  if (header && !reduceMotion) {
    gsap.from(header, { y: -24, opacity: 0, duration: 0.7, ease: "power2.out", delay: 0.2 });
  }

  /* ------ AR new-hero entrance choreography -------------------------- */
  // The Arabic home uses a custom .new-hero block (title, lead text,
  // counter row, CTA button + portrait image). We orchestrate a single
  // entrance timeline on page load — the image scales in from a soft
  // zoom while the text stack stagger-rises beside it, then the
  // counters and button settle in. After the entrance, the image
  // floats subtly to keep the panel feeling alive.
  const newHero = document.querySelector(".new-hero");
  if (newHero && !reduceMotion) {
    const titleEl = newHero.querySelector(".hero-title");
    const textEl = newHero.querySelector(".hero-text");
    const counters = newHero.querySelectorAll(".counter-item");
    const btnEl = newHero.querySelector(".custom-btn");
    const imgEl = newHero.querySelector(".hero-image img, .hero-image");
    const imgFrame = newHero.querySelector(".hero-image");

    // Per-word split for the title so we can stagger the words upward
    // out of a clip-path mask. Falls back gracefully if missing.
    let titleWords = [];
    if (titleEl && !titleEl.dataset.splitDone) {
      const html = titleEl.innerHTML;
      // Replace <br> with a delimiter we can split on, preserving line breaks.
      const parts = html.split(/<br\s*\/?>/i);
      titleEl.innerHTML = "";
      parts.forEach((part, lineIdx) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = part;
        const text = tmp.textContent.trim();
        text.split(/\s+/).filter(Boolean).forEach((word, i, arr) => {
          const wrap = document.createElement("span");
          const inner = document.createElement("span");
          wrap.className = "hero-title__word";
          inner.className = "hero-title__inner";
          inner.textContent = word;
          wrap.appendChild(inner);
          titleEl.appendChild(wrap);
          if (i < arr.length - 1) titleEl.appendChild(document.createTextNode(" "));
          titleWords.push(inner);
        });
        if (lineIdx < parts.length - 1) titleEl.appendChild(document.createElement("br"));
      });
      titleEl.dataset.splitDone = "1";
    }

    // Scroll-tied so the hero replays its entrance whenever it re-enters the
    // viewport: plays on load, reverses once it's fully scrolled past (off
    // screen, so no visible jump), and plays again when you scroll back up.
    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: {
        trigger: newHero,
        start: "top bottom",   // counts as entered as soon as any part shows (true on load)
        end: "bottom top",     // only "left" once fully scrolled past
        toggleActions: "play reverse play reverse",
      },
    });

    if (imgEl) {
      tl.from(imgEl, {
        opacity: 0,
        scale: 1.32,
        rotation: 1.5,
        duration: 1.5,
        ease: "expo.out",
      }, 0);
    }

    if (titleWords.length) {
      gsap.set(titleWords, { yPercent: 110 });
      tl.to(titleWords, {
        yPercent: 0,
        duration: 1.1,
        stagger: 0.08,
      }, 0.15);
    } else if (titleEl) {
      tl.from(titleEl, { y: 40, opacity: 0, duration: 1.0 }, 0.15);
    }

    if (textEl) {
      tl.from(textEl, {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      }, "-=0.6");
    }

    if (counters.length) {
      tl.from(counters, {
        y: 70,
        scale: 0.8,
        rotationX: -60,
        transformPerspective: 700,
        transformOrigin: "50% 100%",
        opacity: 0,
        duration: 0.9,
        ease: "back.out(1.8)",
        stagger: 0.12,
      }, "-=0.45");
    }

    if (btnEl) {
      tl.from(btnEl, {
        scale: 0.7,
        opacity: 0,
        duration: 0.7,
        ease: "back.out(2.4)",
      }, "-=0.30");
    }

    // Subtle ambient float on the portrait — runs forever, sine in/out.
    if (imgFrame) {
      gsap.to(imgFrame, {
        y: -10,
        duration: 3.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.5,
      });
    }

    // Cinematic scroll parallax: the portrait drifts up as you scroll past the
    // hero. Uses yPercent only — the entrance owns scale/opacity/rotation and
    // the float owns the frame's y, so there is no transform clash.
    if (imgEl && ScrollTrigger) {
      gsap.fromTo(imgEl,
        { yPercent: 0 },
        {
          yPercent: -24,
          ease: "none",
          scrollTrigger: {
            trigger: newHero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
  } else if (newHero && reduceMotion) {
    // With reduced-motion preference, snap to final state — no transforms.
    newHero.querySelectorAll(".hero-title, .hero-text, .counter-item, .custom-btn, .hero-image img")
      .forEach(el => gsap.set(el, { clearProps: "all", opacity: 1 }));
  }

  /* ------ Reveal-on-scroll (.reveal / utility classes) --------------- */
  // Royal cards and the CEO message run their own choreography below; exclude
  // them from the generic reveal pass so they don't double-animate.
  /* ------ Reveal-on-scroll (.reveal / utility classes) --------------- */
  // Royal cards and the CEO message run their own choreography below; exclude
  // them from the generic reveal pass so they don't double-animate.
  const revealEls = document.querySelectorAll(".reveal:not([data-royal]):not([data-ceo-message]), .anim-fadeinup, .anim-zoomin");
  if (revealEls.length && ScrollTrigger) {
    if (reduceMotion) {
      revealEls.forEach(el => {
        el.classList.add("is-visible");
        gsap.set(el, { clearProps: "all" });
      });
    } else {
      revealEls.forEach(el => {
        const isZoom = el.classList.contains("anim-zoomin");

        // تعديل ذكي: تقليل مسافة الـ y من 60 إلى 30 لتقليل جهد الحسابات (Reflow) للمتصفح أثناء السكرول السريع
        const fromVars = isZoom
          ? { opacity: 0, scale: 1.12 }
          : { opacity: 0, y: 30 };

        const toVars = isZoom
          ? { opacity: 1, scale: 1, duration: 1.4, ease: "power2.out" } // استبدال expo بـ power2 لسرعة الاستجابة اللحظية
          : { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" };

        // إيقاف الـ CSS transitions برمجياً قبل بدء التحريك لمنع التلعثم
        gsap.set(el, { transition: "none" });

        gsap.fromTo(el, fromVars, {
          ...toVars,
          lazy: false, // يمنع GSAP من تأجيل رندر العنصر للدورة القادمة
          scrollTrigger: {
            trigger: el,
            start: "top 90%", // جعلناه يبدأ مبكراً (90% بدل 88%) ليتفادى قفزة السكرول السريع
            // ثنائي الاتجاه: يظهر عند النزول ويُعكَس عند الصعود ثم يتكرر
            toggleActions: "play none none reverse",
            fastScrollEnd: true, // ينهي الأنيميشن فوراً لو تخطاه المستخدم بسرعة خارقة
          },
          onStart: () => el.classList.add("is-visible"),
        });
      });
    }
  }

  /* ------ Specialized Image Zoom Reveal (Anti-Jump) ------------------ */
  const gsapImages = document.querySelectorAll("[data-gsap-img]");
  if (gsapImages.length && ScrollTrigger && !reduceMotion) {
    gsapImages.forEach(wrapper => {
      const img = wrapper.querySelector("img");
      if (!img) return;

      gsap.fromTo(img,
        { scale: 1.15, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.3,
          ease: "power1.out",
          lazy: false,
          scrollTrigger: {
            trigger: wrapper,
            start: "top 92%", // يبدأ التحريك قبل ظهور الحاوية تماماً للعين
            toggleActions: "play none none reverse",
            fastScrollEnd: true
          }
        }
      );
    });
  }

  /* ------ Stagger groups --------------------------------------------- */
  if (ScrollTrigger && !reduceMotion) {
    const staggerGroups = [
      { sel: ".pillar-rows", child: ".pillar-row" },
      { sel: ".board__featured", child: ".board-feature" },
      { sel: ".quote-grid", child: ".quote" },
      { sel: ".channels", child: ".channel" },
      { sel: ".vm", child: ".vm__card" },
      { sel: ".committees", child: ".committee-pill" },
      { sel: ".office__grid", child: ".office__col" },
      { sel: ".footer__grid", child: ":scope > *" },
    ];
    staggerGroups.forEach(({ sel, child }) => {
      document.querySelectorAll(sel).forEach(group => {
        const children = group.querySelectorAll(child);
        if (!children.length) return;
        gsap.from(children, {
          y: 40,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: group,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });

    /* ------ Board roster — per-row slide-in from start edge -------- */
    document.querySelectorAll(".board-roster").forEach(roster => {
      const rows = roster.querySelectorAll(".board-roster__row");
      if (!rows.length) return;
      const isRTL = (document.documentElement.dir || "").toLowerCase() === "rtl";
      const fromX = isRTL ? 28 : -28;
      gsap.from(rows, {
        x: fromX,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: roster,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    });

    /* ------ Auto-reveal: catch-all for body content -------------------- */
    // Sweeps every page so headings, paragraphs, list items, images, cards,
    // boxes and CTAs get a scroll-triggered entrance even when the markup
    // hasn't been hand-tagged with `.reveal`. Direction varies by element
    // TYPE so each page reads like the reference report's WOW.js vocabulary:
    //   · headings / labels → drop in from above   (fadeInDown)
    //   · images / figures / buttons → zoom in       (zoomIn)
    //   · cards / boxes → rise + alternate side-drift (fadeInUp/Left/Right)
    //   · body copy → rise from below                 (fadeInUp)
    // Anything already wired into a bespoke timeline opts out below, and
    // content INSIDE a revealing card rides with the card (no double-move).
    const CARD_SEL = ".card,.kpi-card,.kpi-bar,.box,.finbox,.na-inv__card,.na-kpi__card,.starting-sec__box,.intro-box__item,.banner-stat";

    const autoSelectors = [
      "section p",
      "section h1", "section h2", "section h3", "section h4",
      "section li",
      "section figure",
      "section blockquote",
      "section img:not([data-gsap-img] img)",
      "section .btn", "section .rmbtn", "section .cta",
      ".card", ".kpi-card", ".kpi-bar", ".na-inv__card", ".na-kpi__card",
      ".starting-sec__box", ".gov-enbl-sec .box", ".box", ".finbox", ".pillar-row",
      ".msg-sec__content-desc, .msg-sec__content-desc2",
      ".banner-stat", ".intro-box__item", ".stat", ".kpi-card__label",
    ].join(",");

    const skipMatcher = [
      ".reveal", ".anim-fadeinup", ".anim-zoomin",
      ".no-auto-reveal", "[data-royal]", "[data-ceo-message]",
      ".hero *", ".page-head *", ".contact-hero *", ".new-hero *",
      ".banner-stat__num *", "[data-counter]",
      "[data-auto-reveal-done]",
    ].join(",");

    // Pick a direction-aware from-state for one element. `i` is its index
    // among its siblings, used to alternate the side-drift on cards so a
    // row of boxes fans in from left/right rather than all from one axis.
    const slideX = isRTL ? (isHome ? -70 : -34) : (isHome ? 70 : 34);
    function autoRevealFrom(el, i) {
      if (el.matches("h1,h2,h3,h4,.eyebrow,.section-header h2,.kpi-card__label,.stat__label")) {
        // headings: drop in from above — on home they tilt down in 3D
        return isHome
          ? { opacity: 0, y: -64, rotationX: -55, transformPerspective: 800, transformOrigin: "50% 100%" }
          : { opacity: 0, y: -26 };                          // fadeInDown
      }
      if (el.matches("img,figure,picture,.btn,.rmbtn,.cta")) {
        return isHome
          ? { opacity: 0, scale: 1.28, y: 26 }
          : { opacity: 0, scale: 1.08, y: 10 };              // zoomIn
      }
      if (el.matches(CARD_SEL)) {
        const drift = (i % 2 === 0) ? -slideX : slideX;      // fadeInUp + alt side
        return isHome
          ? { opacity: 0, y: 80, x: drift, scale: 0.86, rotationY: (i % 2 === 0 ? -22 : 22), transformPerspective: 900 }
          : { opacity: 0, y: 30, x: drift, scale: 1.02 };
      }
      return isHome
        ? { opacity: 0, y: 64, scale: 0.94 }
        : { opacity: 0, y: 28 };                             // fadeInUp (default)
    }

    const autoEls = Array.from(document.querySelectorAll(autoSelectors))
      .filter(el => {
        if (el.matches(skipMatcher)) return false;
        // skip if any ancestor already owns a timeline
        if (el.closest("[data-royal], [data-ceo-message], .hero, .page-head, .contact-hero, .new-hero")) return false;
        // content inside a revealing card rides WITH the card — don't move it too
        const cardAncestor = el.closest(CARD_SEL);
        if (cardAncestor && cardAncestor !== el) return false;
        // skip tiny inline elements (icons inside paragraphs already moved)
        const r = el.getBoundingClientRect();
        if (r.width < 24 && r.height < 24) return false;
        return true;
      });

    // Each element gets its OWN ScrollTrigger-owned fromTo — the same proven
    // pattern as the `.reveal` pass and stagger groups above. This fires
    // correctly for elements already in the viewport at load (a batch would
    // not), and survives ScrollTrigger.refresh() without freezing mid-tween.
    // A small per-sibling delay gives a row of items a staggered feel.
    autoEls.forEach(el => {
      const sibIdx = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      const toVars = {
        opacity: 1, y: 0, x: 0, scale: 1,
        // home overshoots hard (back.out) and runs a touch longer for drama
        duration: isHome ? 1.2 : 0.95,
        ease: isHome ? "back.out(1.6)" : "power2.out",
        delay: (sibIdx % 6) * (isHome ? 0.08 : 0.05),
        overwrite: "auto",
        lazy: false,
        onStart: () => el.setAttribute("data-auto-reveal-done", "1"),
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          // ثنائي الاتجاه: يظهر عند النزول ويُعكَس عند الصعود
          toggleActions: "play none none reverse",
          fastScrollEnd: true,
        },
      };
      // flatten any 3D tilt the home from-state introduced
      if (isHome) { toVars.rotationX = 0; toVars.rotationY = 0; }
      gsap.fromTo(el, autoRevealFrom(el, sibIdx), toVars);
    });

    /* ------ Table-row reveal (financial tables) ------------------------ */
    // Each data table's body rows stagger up as the table enters view —
    // gives the dense financial pages a sense of the numbers populating.
    document.querySelectorAll("table tbody").forEach(tbody => {
      const rows = tbody.querySelectorAll("tr");
      if (rows.length < 2) return;
      gsap.from(rows, {
        opacity: 0,
        y: 16,
        duration: 0.55,
        ease: "power2.out",
        stagger: 0.045,
        scrollTrigger: {
          trigger: tbody.closest("table") || tbody,
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  /* ------ Royal Endorsement choreography ----------------------------- */
  // Split a heading into per-word spans for the writing-in animation.
  function splitIntoWords(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent.trim();
    el.textContent = "";
    const inners = [];
    text.split(/\s+/).forEach((word, i, arr) => {
      const wrap = document.createElement("span");
      const inner = document.createElement("span");
      wrap.className = "split-word";
      inner.className = "split-word__inner";
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
      inners.push(inner);
    });
    el.dataset.splitDone = "1";
    return inners;
  }

  // Tokenize a pull-quote, walking its child nodes. Plain text becomes
  // per-word spans (slide-up reveals); <span class="num"> children become
  // atomic "number slots" that we count up from 0 to their target value
  // (preserving any non-numeric suffix like "%"). Returns:
  //   { words: HTMLElement[],  numbers: { el, target, decimals, suffix }[] }
  // The same word array contains every animated inner — so animating
  // `words` with stagger covers regular words AND number slots in source
  // order, and the counter animations are layered on top of the number
  // slots only.
  function splitPullQuote(el) {
    if (!el || el.dataset.pullSplitDone) {
      // Already processed once; pull cached references off the element.
      const cachedWords = Array.from(el.querySelectorAll(".split-word__inner"));
      const cachedNums = (el.__pullNumbers || []);
      return { words: cachedWords, numbers: cachedNums };
    }
    const words = [];
    const numbers = [];
    const original = Array.from(el.childNodes);
    el.innerHTML = "";

    original.forEach((node, idx) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (p === "") return;
          if (/^\s+$/.test(p)) {
            el.appendChild(document.createTextNode(" "));
          } else {
            const wrap = document.createElement("span");
            const inner = document.createElement("span");
            wrap.className = "split-word";
            inner.className = "split-word__inner";
            inner.textContent = p;
            wrap.appendChild(inner);
            el.appendChild(wrap);
            words.push(inner);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const isNum = node.classList && node.classList.contains("num");
        const raw = node.textContent.trim();
        const m = isNum ? raw.match(/^([0-9]+(?:\.[0-9]+)?)(.*)$/) : null;
        const wrap = document.createElement("span");
        wrap.className = "split-word";
        const inner = document.createElement("span");
        inner.className = "split-word__inner" + (isNum ? " num" : "");
        if (m) {
          const decimals = m[1].includes(".") ? m[1].split(".")[1].length : 0;
          const target = parseFloat(m[1]);
          const suffix = m[2] || "";
          // Start the slot at 0 with the suffix already in place so its
          // visual width is close to the final width (avoids reflow).
          inner.textContent = (0).toFixed(decimals) + suffix;
          wrap.appendChild(inner);
          el.appendChild(wrap);
          words.push(inner);
          numbers.push({ el: inner, target, decimals, suffix });
        } else {
          inner.textContent = raw;
          wrap.appendChild(inner);
          el.appendChild(wrap);
          words.push(inner);
        }
      }
    });

    el.dataset.pullSplitDone = "1";
    el.__pullNumbers = numbers;
    return { words, numbers };
  }

  const royalsSection = document.querySelector(".royals");
  const royalCards = document.querySelectorAll("[data-royal]");

  if (royalsSection && ScrollTrigger) {
    const title = royalsSection.querySelector(".section-header h2");
    const eyebrow = royalsSection.querySelector(".section-header .eyebrow");
    const lead = royalsSection.querySelector(".section-header .lead");
    const titleWords = title ? splitIntoWords(title) : [];

    if (reduceMotion) {
      royalCards.forEach(card => {
        card.classList.add("is-visible");
        gsap.set(card, { clearProps: "all" });
      });
    } else {
      // Master timeline: title writes itself, then each card animates in
      // sequence — King first, Crown Prince after King has fully landed.
      const master = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: {
          trigger: royalsSection,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      if (eyebrow) master.from(eyebrow, { y: 14, opacity: 0, duration: 0.4 });
      if (titleWords.length) {
        master.from(titleWords, {
          y: "100%",
          opacity: 0,
          duration: 0.55,
          stagger: 0.04,
          ease: "power3.out",
        }, "-=0.25");
      }
      if (lead) master.from(lead, { y: 14, opacity: 0, duration: 0.45 }, "-=0.35");

      royalCards.forEach((card, i) => {
        const portrait = card.querySelector(".royal-card__portrait");
        const img = card.querySelector(".royal-card__portrait img");
        const crown = card.querySelector(".royal-card__crown");
        const badge = card.querySelector(".royal-card__badge");
        const rank = card.querySelector(".royal-card__rank");
        const name = card.querySelector(".royal-card__name");
        const role = card.querySelector(".royal-card__role");
        const quote = card.querySelector(".royal-card__quote");

        // Make the name write itself word-by-word too.
        const nameWords = splitIntoWords(name);
        gsap.set(card, { autoAlpha: 1 });
        card.classList.add("is-visible");

        const cardTl = gsap.timeline({ defaults: { ease: "power3.out" } });

        if (portrait) {
          cardTl.fromTo(portrait,
            { clipPath: "inset(0 0 100% 0)", y: 32, opacity: 0 },
            { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 0.7 }
          );
        }
        if (img) {
          cardTl.fromTo(img,
            { scale: 1.12 },
            { scale: 1, duration: 0.9, ease: "power2.out" },
            "<0.03"
          );
        }
        if (crown) cardTl.from(crown, { scale: 0.7, opacity: 0, duration: 0.3 }, "-=0.45");
        if (badge) cardTl.from(badge, { y: 12, opacity: 0, duration: 0.35 }, "-=0.25");

        if (rank) cardTl.from(rank, { y: 14, opacity: 0, duration: 0.35 }, "-=0.4");
        if (nameWords.length) {
          cardTl.from(nameWords, {
            y: "100%",
            opacity: 0,
            duration: 0.45,
            stagger: 0.025,
            ease: "power3.out",
          }, "-=0.2");
        } else if (name) {
          cardTl.from(name, { y: 18, opacity: 0, duration: 0.4 }, "-=0.2");
        }
        if (role) cardTl.from(role, { y: 14, opacity: 0, duration: 0.35 }, "-=0.25");
        if (quote) cardTl.from(quote, { y: 16, opacity: 0, duration: 0.45 }, "-=0.2");

        // Cards animate with strong overlap: Crown Prince begins while King
        // is still finishing — keeps the section snappy.
        master.add(cardTl, i === 0 ? ">-0.1" : "<+0.4");
      });
    }
  }

  /* ------ Message blocks choreography (CEO + Chairman) --------------- */
  // The Chairman ("message--chair") and CEO message articles both carry
  // the [data-ceo-message] hook. They share a family of animations but
  // the Chairman's block has a richer structure (teal photo+nameplate
  // frame, accented <em> word in the title, riyal glyphs inline) so it
  // gets a dedicated, smoother timeline. The simple CEO block keeps its
  // tighter entrance.
  document.querySelectorAll("[data-ceo-message]").forEach((article) => {
    if (reduceMotion || !ScrollTrigger) {
      article.classList.add("is-visible");
      gsap.set(article, { clearProps: "all", opacity: 1 });
      return;
    }

    gsap.set(article, { opacity: 1, y: 0 });
    article.classList.add("is-visible");

    const isChair = article.classList.contains("message--chair");
    if (isChair) runChairTimeline(article);
    else runMessageTimeline(article);
  });

  function runMessageTimeline(article) {
    const photoWrap = article.querySelector(".message__photo");
    const photoImg = article.querySelector(".message__photo img");
    const name = article.querySelector(".message__name");
    const role = article.querySelector(".message__role");
    const eyebrow = article.querySelector(".eyebrow");
    const titleEl = article.querySelector(".message__title");
    const paras = article.querySelectorAll(".message__body > p");
    const pull = article.querySelector(".message__pull");
    const titleWords = titleEl ? splitIntoWords(titleEl) : [];

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: { trigger: article, start: "top 78%", toggleActions: "play none none reverse" },
    });

    if (photoWrap) {
      tl.fromTo(photoWrap,
        { clipPath: "inset(0 0 100% 0)", y: 24, opacity: 0 },
        { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 0.95 },
        0
      );
    }
    if (photoImg) {
      tl.fromTo(photoImg, { scale: 1.14 }, { scale: 1, duration: 1.4, ease: "power2.out" }, 0.05);
    }
    if (name) tl.from(name, { y: 14, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.55");
    if (role) tl.from(role, { y: 12, opacity: 0, duration: 0.45, ease: "power3.out" }, "-=0.4");

    if (eyebrow) tl.from(eyebrow, { y: 14, opacity: 0, duration: 0.45 }, "-=0.85");
    if (titleWords.length) {
      tl.from(titleWords, { yPercent: 110, opacity: 0, duration: 0.7, stagger: 0.05, ease: "power3.out" }, "-=0.3");
    } else if (titleEl) {
      tl.from(titleEl, { y: 28, opacity: 0, duration: 0.7 }, "-=0.3");
    }

    if (paras.length) {
      tl.from(paras, { y: 22, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.12 }, "-=0.35");
    }

    if (pull) {
      const wipeFrom = isRTL ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
      tl.fromTo(pull,
        { clipPath: wipeFrom, y: 18, opacity: 0 },
        { clipPath: "inset(0 0 0 0)", y: 0, opacity: 1, duration: 0.85, ease: "expo.out" },
        paras.length ? "-=0.55" : "-=0.2"
      );
    }

    if (photoImg) {
      gsap.fromTo(photoImg,
        { yPercent: -3 },
        {
          yPercent: 5, ease: "none",
          scrollTrigger: { trigger: article, start: "top bottom", end: "bottom top", scrub: true }
        }
      );
    }
  }

  // Chairman timeline. Sequence:
  //  1. The teal photo-frame draws in via a top→bottom clip-path while the
  //     portrait inside gently zooms out of a 1.18 scale.
  //  2. The teal nameplate panel slides up from underneath the photo.
  //  3. Name + role lines stagger upward inside the nameplate.
  //  4. Title splits per word and writes itself; the highlighted <em>
  //     word gets a delayed accent pop on top.
  //  5. Body paragraphs stagger up; riyal glyphs inside scale-in softly.
  //  6. The pull-quote wipes from the inline-start edge, then the numbers
  //     inside ride a tiny scale pop for emphasis.
  //  7. A long, gentle scrub keeps the portrait drifting inside the frame
  //     as the section passes through view.
  function runChairTimeline(article) {
    const frame = article.querySelector(".message__photo-frame");
    const photoWrap = article.querySelector(".message__photo");
    const photoImg = article.querySelector(".message__photo img");
    const nameplate = article.querySelector(".message__nameplate");
    const name = article.querySelector(".message__name");
    const roles = article.querySelectorAll(".message__nameplate .message__role");
    const titleEl = article.querySelector(".message__title");
    const titleEm = titleEl ? titleEl.querySelector("em") : null;
    const paras = article.querySelectorAll(".message__body > p");
    const riyals = article.querySelectorAll(".message__body .riyal");
    const pull = article.querySelector(".message__pull");

    // Per-word split for the title — preserves the <em> wrapper so we can
    // style/animate it as a single unit AFTER the words land.
    let titleWords = [];
    if (titleEl && !titleEl.dataset.splitDone) {
      const fragments = [];
      titleEl.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          fragments.push({ kind: "text", value: node.textContent });
        } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "em") {
          fragments.push({ kind: "em", value: node.textContent });
        } else {
          fragments.push({ kind: "html", value: node.outerHTML || node.textContent });
        }
      });
      titleEl.innerHTML = "";
      fragments.forEach((frag, idx) => {
        const wordsArr = frag.value.trim().split(/\s+/).filter(Boolean);
        const container = frag.kind === "em" ? document.createElement("em") : null;
        const target = container || titleEl;
        wordsArr.forEach((word, i) => {
          const wrap = document.createElement("span");
          const inner = document.createElement("span");
          wrap.className = "split-word";
          inner.className = "split-word__inner";
          inner.textContent = word;
          wrap.appendChild(inner);
          target.appendChild(wrap);
          if (i < wordsArr.length - 1) target.appendChild(document.createTextNode(" "));
          titleWords.push(inner);
        });
        if (container) titleEl.appendChild(container);
        if (idx < fragments.length - 1) titleEl.appendChild(document.createTextNode(" "));
      });
      titleEl.dataset.splitDone = "1";
    }
    const titleEmEl = titleEl ? titleEl.querySelector("em") : null;

    // The frame doesn't clip its children by default (only the photo div
    // does). For the nameplate slide-up to look like it rises from behind
    // the photo we need the frame itself to clip — set it before the
    // timeline runs and leave it (the border keeps a clean look anyway).
    if (frame) gsap.set(frame, { overflow: "hidden" });

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: { trigger: article, start: "top 80%", toggleActions: "play none none reverse" },
    });

    if (frame) {
      tl.fromTo(frame,
        { clipPath: "inset(0 0 100% 0)", y: 28, opacity: 0 },
        { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 0.7 },
        0
      );
    } else if (photoWrap) {
      tl.fromTo(photoWrap,
        { clipPath: "inset(0 0 100% 0)", y: 24, opacity: 0 },
        { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 0.6 },
        0
      );
    }
    if (photoImg) {
      tl.fromTo(photoImg,
        { scale: 1.18 },
        { scale: 1, duration: 0.95, ease: "power2.out" },
        0.04
      );
    }
    if (nameplate) {
      tl.fromTo(nameplate,
        { yPercent: 100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, ease: "expo.out" },
        "-=0.38"
      );
    }
    if (name) tl.from(name, { y: 14, opacity: 0, duration: 0.32, ease: "power3.out" }, "-=0.35");
    if (roles.length) {
      tl.from(roles, { y: 12, opacity: 0, duration: 0.3, ease: "power3.out", stagger: 0.05 }, "-=0.24");
    }

    if (titleWords.length) {
      tl.from(titleWords, {
        yPercent: 110,
        opacity: 0,
        duration: 0.5,
        stagger: 0.04,
        ease: "power3.out",
      }, "-=0.48");
    } else if (titleEl) {
      tl.from(titleEl, { y: 28, opacity: 0, duration: 0.45 }, "-=0.4");
    }

    // Accent pop on the <em> highlight word — soft scale + saturate sweep.
    if (titleEmEl) {
      tl.fromTo(titleEmEl,
        { scale: 0.94, filter: "saturate(0.4)" },
        { scale: 1, filter: "saturate(1)", duration: 0.45, ease: "power2.out" },
        "-=0.25"
      );
    }

    if (paras.length) {
      tl.from(paras, {
        y: 24,
        opacity: 0,
        duration: 0.4,
        ease: "power3.out",
        stagger: 0.08,
      }, "-=0.3");
    }

    if (riyals.length) {
      tl.from(riyals, {
        scale: 0.6,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        stagger: 0.05,
        transformOrigin: "center center",
      }, "-=0.4");
    }

    // Pull-quote: the teal-bg banner sweeps in cleanly (no text yet,
    // so it reads as a clean colored bar growing from the inline-start
    // edge), then the words rise into the now-finished background, and
    // the percentages count up from 0 alongside.
    if (pull) {
      const tokens = splitPullQuote(pull);

      // Hide the words BEFORE the bg-wipe runs — otherwise the text
      // would flash visible during the clip-wipe and then snap back to
      // hidden when the per-word `from` registers, which read poorly.
      if (tokens.words.length) {
        gsap.set(tokens.words, { yPercent: 110, opacity: 0 });
      }

      // 1. Background bar sweeps in from the inline-start. With the
      //    text hidden the wipe reads as a single confident gesture.
      const wipeFrom = isRTL ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)";
      tl.fromTo(pull,
        { clipPath: wipeFrom, opacity: 1 },
        { clipPath: "inset(0 0 0 0)", duration: 0.55, ease: "expo.out" },
        paras.length ? "-=0.38" : "-=0.15"
      );

      // 2. Words rise into the now-revealed bar.
      if (tokens.words.length) {
        tl.to(tokens.words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.35,
          ease: "power3.out",
          stagger: 0.02,
        }, "-=0.27");
      }

      // 3. Each .num token counts from 0 to its target value,
      //    synchronized with the moment its word-slot lands.
      tokens.numbers.forEach((tok, i) => {
        const proxy = { v: 0 };
        const startOffset = `-=${Math.max(0.05, 0.35 - i * 0.14)}`;
        tl.to(proxy, {
          v: tok.target,
          duration: 0.6,
          ease: "power2.out",
          onUpdate: () => {
            const fixed = proxy.v.toFixed(tok.decimals);
            tok.el.textContent = Number(fixed).toLocaleString("en-US", {
              minimumFractionDigits: tok.decimals,
              maximumFractionDigits: tok.decimals,
            }) + tok.suffix;
          },
        }, startOffset);
      });
    }

    // Long, slow scrub — the portrait drifts inside its frame as the
    // section passes through. Bigger range than the simple CEO scrub for
    // a more cinematic feel since the frame is the focal element.
    if (photoImg) {
      gsap.fromTo(photoImg,
        { yPercent: -4 },
        {
          yPercent: 6, ease: "none",
          scrollTrigger: { trigger: article, start: "top bottom", end: "bottom top", scrub: 0.8 }
        }
      );
    }
  }

  /* ------ AR CEO letter ("رسالة الرئيس التنفيذي") -------------------- */
  // Bespoke entrance for the .boss-latter-sec block on the AR home page.
  // Markup is custom (boss-letter-title, boss-image-container, boss-content,
  // boss-rate, hero-counter) so the standard message timeline doesn't fit.
  // Sequence:
  //  1. Section title splits per-word and writes itself; the underline
  //     divider draws in from the inline-start edge.
  //  2. Portrait container wipes in (clip-path top→bottom) while the
  //     image inside scales out of a soft zoom; the dark overlay fades up
  //     and the inner nameplate (name + role + hairline) slides up from
  //     beneath the photo.
  //  3. Body paragraph rises in.
  //  4. "أبرز الإنجازات" heading rises, then each rate-item staggers up
  //     with its icon scaling-in alongside.
  //  5. The counter row stagger-rises; the counter values themselves are
  //     animated by the global [data-counter] pass.
  //  6. A gentle scrub keeps the portrait drifting inside its frame.
  document.querySelectorAll("[data-ceo-letter]").forEach((section) => {
    const titleEl = section.querySelector(".boss-letter-title h2");
    const titleDiv = section.querySelector(".boss-letter-title .divider");
    const imgFrame = section.querySelector(".boss-image-container");
    const imgWrap = section.querySelector(".boss-img");
    const imgEl = section.querySelector(".boss-img img");
    const overlay = section.querySelector(".boss-inner .overlay");
    const innerTitle = section.querySelector(".boss-inner .title");
    const innerName = section.querySelector(".boss-inner .title h2");
    const innerRole = section.querySelector(".boss-inner .title p");
    const innerDiv = section.querySelector(".boss-inner .title .divider");
    const bodyPara = section.querySelector(".boss-content > p");
    const rateHead = section.querySelector(".boss-rate h2");
    const rateItems = section.querySelectorAll(".rate-item");
    const rateIcons = section.querySelectorAll(".rate-item img");
    const counters = section.querySelectorAll(".hero-counter .counter-item");

    if (reduceMotion || !ScrollTrigger) {
      section.classList.add("is-visible");
      gsap.set(section, { clearProps: "all", opacity: 1 });
      return;
    }

    // Frame must clip so the inner nameplate slide-up stays inside the
    // portrait card.
    if (imgFrame) gsap.set(imgFrame, { overflow: "hidden" });

    // Per-word split for the title — preserves <br>.
    let titleWords = [];
    if (titleEl && !titleEl.dataset.splitDone) {
      const parts = titleEl.innerHTML.split(/<br\s*\/?>/i);
      titleEl.innerHTML = "";
      parts.forEach((part, lineIdx) => {
        const tmp = document.createElement("div");
        tmp.innerHTML = part;
        const text = tmp.textContent.trim();
        const words = text.split(/\s+/).filter(Boolean);
        words.forEach((word, i) => {
          const wrap = document.createElement("span");
          const inner = document.createElement("span");
          wrap.className = "split-word";
          inner.className = "split-word__inner";
          inner.textContent = word;
          wrap.appendChild(inner);
          titleEl.appendChild(wrap);
          if (i < words.length - 1) titleEl.appendChild(document.createTextNode(" "));
          titleWords.push(inner);
        });
        if (lineIdx < parts.length - 1) titleEl.appendChild(document.createElement("br"));
      });
      titleEl.dataset.splitDone = "1";
    }

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: { trigger: section, start: "top 78%", toggleActions: "play none none reverse" },
    });

    // 1. Title + divider
    if (titleWords.length) {
      tl.from(titleWords, {
        yPercent: 110,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
      }, 0);
    } else if (titleEl) {
      tl.from(titleEl, { y: 30, opacity: 0, duration: 0.8 }, 0);
    }
    if (titleDiv) {
      const origin = isRTL ? "100% 50%" : "0% 50%";
      tl.fromTo(titleDiv,
        { scaleX: 0, transformOrigin: origin, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.7, ease: "expo.out" },
        "-=0.45"
      );
    }

    // 2. Portrait card + nameplate
    if (imgFrame) {
      tl.fromTo(imgFrame,
        { clipPath: "inset(0 0 100% 0)", y: 24, opacity: 0 },
        { clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 1.0 },
        "-=0.35"
      );
    }
    if (imgEl) {
      tl.fromTo(imgEl,
        { scale: 1.18 },
        { scale: 1, duration: 1.5, ease: "power2.out" },
        "<0.05"
      );
    }
    if (overlay) {
      tl.from(overlay, { opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.9");
    }
    if (innerTitle) {
      tl.fromTo(innerTitle,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.85, ease: "expo.out" },
        "-=0.55"
      );
    }
    if (innerName) tl.from(innerName, { y: 14, opacity: 0, duration: 0.5, ease: "power3.out" }, "-=0.55");
    if (innerRole) tl.from(innerRole, { y: 12, opacity: 0, duration: 0.45, ease: "power3.out" }, "-=0.4");
    if (innerDiv) {
      const origin = isRTL ? "100% 50%" : "0% 50%";
      tl.fromTo(innerDiv,
        { scaleX: 0, transformOrigin: origin, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.3"
      );
    }

    // 3. Body paragraph
    if (bodyPara) {
      tl.from(bodyPara, { y: 22, opacity: 0, duration: 0.7, ease: "power3.out" }, "-=0.85");
    }

    // 4. Rate heading + items
    if (rateHead) {
      tl.from(rateHead, { y: 18, opacity: 0, duration: 0.55, ease: "power3.out" }, "-=0.45");
    }
    if (rateItems.length) {
      tl.from(rateItems, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
      }, "-=0.3");
    }
    if (rateIcons.length) {
      tl.from(rateIcons, {
        scale: 0.55,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1,
        transformOrigin: "center center",
      }, "-=0.85");
    }

    // 5. Counter row — values themselves run via the global counter pass.
    if (counters.length) {
      tl.from(counters, {
        y: 28,
        scale: 0.94,
        opacity: 0,
        duration: 0.7,
        ease: "expo.out",
        stagger: 0.12,
        transformOrigin: "center center",
      }, "-=0.35");
    }

    // 6. Slow scrub on the portrait
    if (imgEl) {
      gsap.fromTo(imgEl,
        { yPercent: -3 },
        {
          yPercent: 5, ease: "none",
          scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.8 }
        }
      );
    }
  });

  /* ------ Corporate Strategy section ("الإستراتيجية المؤسسية") ------- */
  // Editorial entrance for the .strategy-sec block on the AR home page.
  // Sequence (triggered when the section enters view):
  //   1. The section title splits per-word and rises; the dual-divider with
  //      its centered pin draws outward from the centre.
  //   2. For each `.strategy-info` row (alternating image/copy):
  //        · the image card wipes in with a clip-path reveal while the
  //          inner photo eases out of a soft zoom and the teal overlay
  //          fades through;
  //        · each `.strategy-content-item` rises with a small stagger,
  //          its title leading the body paragraph.
  //   3. A gentle scrub keeps each photo drifting inside its card while
  //      the section travels through the viewport.
  document.querySelectorAll("[data-strategy]").forEach((section) => {
    const titleEl = section.querySelector(".strategy-title");
    const dividers = section.querySelectorAll(".divider-2 > .divider");
    const pin = section.querySelector(".divider-2 > .pin");
    const rows = section.querySelectorAll(".strategy-info");

    if (reduceMotion || !ScrollTrigger) {
      section.classList.add("is-visible");
      gsap.set(section, { clearProps: "all", opacity: 1 });
      return;
    }

    // Per-word split for the section title.
    let titleWords = [];
    if (titleEl && !titleEl.dataset.splitDone) {
      const text = (titleEl.textContent || "").trim();
      const words = text.split(/\s+/).filter(Boolean);
      titleEl.textContent = "";
      words.forEach((word, i) => {
        const wrap = document.createElement("span");
        const inner = document.createElement("span");
        wrap.className = "split-word";
        inner.className = "split-word__inner";
        inner.textContent = word;
        wrap.appendChild(inner);
        titleEl.appendChild(wrap);
        if (i < words.length - 1) titleEl.appendChild(document.createTextNode(" "));
        titleWords.push(inner);
      });
      titleEl.dataset.splitDone = "1";
    }

    // Prime initial states explicitly via inline styles so the destination
    // (natural state) is unambiguous and not dictated by CSS gating.
    if (titleWords.length) gsap.set(titleWords, { yPercent: 110, opacity: 0 });
    if (dividers.length) gsap.set(dividers, { scaleX: 0, transformOrigin: "center center" });
    if (pin) gsap.set(pin, { scale: 0, opacity: 0 });

    // Title + divider timeline
    const headTl = gsap.timeline({
      defaults: { ease: "expo.out" },
      scrollTrigger: { trigger: section, start: "top 80%", toggleActions: "play none none reverse" },
    });

    if (titleWords.length) {
      headTl.to(titleWords, {
        yPercent: 0, opacity: 1,
        duration: 0.5, stagger: 0.035,
        ease: "power3.out",
      });
    }
    if (dividers.length) {
      headTl.to(dividers, {
        scaleX: 1, duration: 0.5, stagger: 0.05, ease: "power3.out",
      }, "-=0.35");
    }
    if (pin) {
      headTl.to(pin, {
        scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)",
      }, "-=0.18");
    }

    // Per-row choreography
    rows.forEach((row) => {
      const imageEl = row.querySelector(".strategy-image");
      const imgInner = row.querySelector(".strategy-image img");
      const overlay = row.querySelector(".strategy-overlay");
      const items = row.querySelectorAll(".strategy-content-item");
      const titles = row.querySelectorAll(".strategy-content-item .title");
      const paras = row.querySelectorAll(".strategy-content-item p");

      if (imageEl) gsap.set(imageEl, { overflow: "hidden" });

      // Prime initial states for the row.
      if (imageEl) gsap.set(imageEl, { clipPath: "inset(0 0 100% 0)", y: 28, opacity: 0 });
      if (imgInner) gsap.set(imgInner, { scale: 1.15 });
      if (overlay) gsap.set(overlay, { opacity: 0 });
      if (items.length) gsap.set(items, { y: 24, opacity: 0 });
      if (titles.length) gsap.set(titles, { y: 12, opacity: 0 });
      if (paras.length) gsap.set(paras, { y: 16, opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        scrollTrigger: { trigger: row, start: "top 85%", toggleActions: "play none none reverse" },
      });

      // Photo card: clip-path wipe + soft zoom-out + overlay fade.
      if (imageEl) {
        tl.to(imageEl, {
          clipPath: "inset(0 0 0% 0)", y: 0, opacity: 1, duration: 0.65,
        }, 0);
      }
      if (imgInner) {
        tl.to(imgInner, {
          scale: 1, duration: 0.9, ease: "power2.out",
        }, 0.04);
      }
      if (overlay) {
        tl.to(overlay, {
          opacity: 1, duration: 0.5, ease: "power2.out",
        }, 0.1);
      }

      // Copy: per-item stagger; inside each item, title leads paragraph.
      if (items.length) {
        tl.to(items, {
          y: 0, opacity: 1,
          duration: 0.4, stagger: 0.08, ease: "power3.out",
        }, "-=0.45");
      }
      if (titles.length) {
        tl.to(titles, {
          y: 0, opacity: 1,
          duration: 0.3, stagger: 0.06, ease: "power3.out",
        }, "-=0.35");
      }
      if (paras.length) {
        tl.to(paras, {
          y: 0, opacity: 1,
          duration: 0.35, stagger: 0.06, ease: "power3.out",
        }, "-=0.28");
      }

      // Subtle parallax drift on the photo as the row travels.
      if (imgInner) {
        gsap.fromTo(imgInner,
          { yPercent: -3 },
          {
            yPercent: 4, ease: "none",
            scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.8 },
          }
        );
      }
    });


  });

  /* ------ Animated counters (replaces main.js) ----------------------- */
  // Auto-expand abbreviated values: when a counter sits next to a
  // "million / billion / M / B / مليون / مليار / thousand / ألف" unit,
  // multiply the value to full numeric form and strip the unit so the
  // display reads e.g. "1,800,000" instead of "1.8 million".
  const WORD_UNITS = [
    { re: /\b(billion|بليون|بلیون|مليار)\b/i, scale: 1e9 },
    { re: /\b(million|مليون|ملايين|مليوناً|مليونًا|مليوناَ)\b/i, scale: 1e6 },
    { re: /\b(thousand|ألف|الف)\b/i, scale: 1e3 },
  ];
  // Single-letter abbreviations only match when the unit text contains
  // nothing else (e.g. the entire unit span is just "M" or "B"/"K").
  const LETTER_UNITS = [
    { re: /^\s*B\s*$/, scale: 1e9 },
    { re: /^\s*M\s*$/, scale: 1e6 },
    { re: /^\s*K\s*$/, scale: 1e3 },
  ];

  function matchUnit(txt, allowLetter) {
    for (const u of WORD_UNITS) if (u.re.test(txt)) return u;
    if (allowLetter) for (const u of LETTER_UNITS) if (u.re.test(txt)) return u;
    return null;
  }

  function expandUnitForCounter(el) {
    if (el.dataset.expanded === "1") return { scale: 1 };
    if (el.dataset.noExpand === "1") return { scale: 1 };

    // Search the parent (and one level up) for a unit text node or a
    // .kpi-card__unit span that immediately follows the counter span.
    const containers = [el.parentNode, el.parentNode && el.parentNode.parentNode].filter(Boolean);

    for (const container of containers) {
      if (!container) continue;
      // explicit unit spans
      const unitSpan = container.querySelector(".kpi-card__unit");
      if (unitSpan && container.contains(el) && unitSpan !== el) {
        const txt = unitSpan.textContent || "";
        const hit = matchUnit(txt, true);
        if (hit) {
          unitSpan.textContent = txt.replace(hit.re, "").replace(/\s+/g, " ").trim();
          if (!unitSpan.textContent) unitSpan.style.display = "none";
          el.dataset.expanded = "1";
          return { scale: hit.scale };
        }
      }

      // text-node siblings inside the same container
      let sib = el.nextSibling;
      let probed = 0;
      while (sib && probed < 4) {
        if (sib.nodeType === 3) {
          const txt = sib.textContent;
          const hit = matchUnit(txt, true);
          if (hit) {
            sib.textContent = txt.replace(hit.re, "").replace(/\s+/g, " ");
            el.dataset.expanded = "1";
            return { scale: hit.scale };
          }
        }
        sib = sib.nextSibling;
        probed++;
      }
    }
    return { scale: 1 };
  }

  document.fonts.ready.then(() => {
    const counters = document.querySelectorAll("[data-counter]");

    counters.forEach(el => {
      const { scale } = expandUnitForCounter(el);
      let target = parseFloat(el.dataset.counter) * scale;
      let decimals = parseInt(el.dataset.decimals || "0", 10);
      // expanded numbers should be shown as integers
      if (scale > 1) decimals = 0;
      const duration = parseFloat(el.dataset.duration || "3.5");

      const finalFormattedText = formatNumber(target, decimals);

      // إنشاء العنصر الوهمي
      const clone = el.cloneNode(false);
      clone.style.visibility = "hidden";
      clone.style.position = "absolute";
      clone.style.whiteSpace = "nowrap";
      clone.style.width = "auto";
      clone.style.pointerEvents = "none";
      clone.textContent = finalFormattedText;

      // حقنه في نفس الأب ليرث الخطوط المطبقة حالياً
      el.parentNode.appendChild(clone);

      // قياس العرض الفعلي بعد تحميل الخط الحقيقي
      const finalWidth = clone.getBoundingClientRect().width;

      // تطبيق العرض (مع إضافة 1px احتياطي للأمان وتجنب تقريب المتصفحات للأرقام العشرية)
      el.style.width = `${Math.ceil(finalWidth) + 1}px`;
      el.style.display = "inline-block";
      el.style.whiteSpace = "nowrap";

      clone.remove();

      // تشغيل أنميشن GSAP
      if (reduceMotion || !ScrollTrigger) {
        el.textContent = finalFormattedText;
        return;
      }

      const proxy = { value: 0 };
      gsap.to(proxy, {
        value: target,
        duration: duration,
        ease: "power1.inOut",
        onUpdate: () => {
          el.textContent = formatNumber(proxy.value, decimals);
        },
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          // العدّاد يتصاعد عند النزول ويتناقص عند الصعود ثم يتكرر
          toggleActions: "play none none reverse",
        },
      });
    });
  });
  function formatNumber(value, decimals) {
    const fixed = value.toFixed(decimals);
    return Number(fixed).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  /* ------ Image scrub parallax --------------------------------------- */
  if (ScrollTrigger && !reduceMotion) {
    document.querySelectorAll(".parallax > img, .parallax > picture > img").forEach(img => {
      gsap.fromTo(img,
        { yPercent: -8 },
        {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: img.closest(".parallax"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    /* Mosaic photo cells get a gentle scrub too, no wrapper needed. */
    document.querySelectorAll(".mosaic__cell--photo img").forEach(img => {
      gsap.fromTo(img,
        { yPercent: -6, scale: 1.06 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: img,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    /* Banner-stat number drifts up as the section passes through view. */
    const bannerNum = document.querySelector(".banner-stat__num");
    if (bannerNum) {
      gsap.fromTo(bannerNum,
        { yPercent: 45, opacity: 0.25, scale: isHome ? 0.55 : 0.9 },
        {
          yPercent: -14,
          opacity: 1,
          scale: isHome ? 1.08 : 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".banner-stat",
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        }
      );
    }
  }

  /* ------ Hero mouse-parallax (desktop only) ------------------------- */
  const mosaic = document.querySelector(".mosaic");
  if (mosaic && !reduceMotion && !isMobile) {
    const copy = document.querySelector(".hero__copy");
    const xTo = gsap.quickTo(mosaic, "x", { duration: 0.8, ease: "power2.out" });
    const yTo = gsap.quickTo(mosaic, "y", { duration: 0.8, ease: "power2.out" });
    const xCopy = copy ? gsap.quickTo(copy, "x", { duration: 1.0, ease: "power2.out" }) : null;
    const yCopy = copy ? gsap.quickTo(copy, "y", { duration: 1.0, ease: "power2.out" }) : null;

    window.addEventListener("mousemove", (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      xTo(dx * 12); yTo(dy * 12);
      if (xCopy) { xCopy(dx * -6); yCopy(dy * -6); }
    }, { passive: true });
  }

  /* ------ Anchor smooth scroll (Lenis-aware) -------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#" || hash.length < 2) return;

    link.addEventListener("click", (e) => {
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - headerH - 16;

      if (lenis) {
        lenis.scrollTo(offsetTop, { duration: 1.2, easing: (t) => 1 - Math.pow(1 - t, 4) });
      } else if (ScrollToPlugin && !reduceMotion) {
        gsap.to(window, { duration: 1.1, scrollTo: offsetTop, ease: "expo.inOut" });
      } else {
        window.scrollTo({ top: offsetTop, behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
  });

  /* ------ Mobile menu item stagger ----------------------------------- */
  const navEl = document.querySelector("[data-nav]");
  const navTog = document.querySelector("[data-nav-toggle]");
  const navItems = navEl ? navEl.querySelectorAll(".nav__link") : [];
  if (navEl && navTog && navItems.length && !reduceMotion) {
    const xFrom = isRTL ? -40 : 40;
    navTog.addEventListener("click", () => {
      // wait one frame for is-open class to apply layout
      requestAnimationFrame(() => {
        if (!navEl.classList.contains("is-open")) return;
        gsap.fromTo(navItems,
          { x: xFrom, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out", stagger: 0.05 }
        );
      });
    });
  }

  /* ------ Strategic Pillars: per-row scroll choreography ------------- */
  // Each row gets:
  //  · image scrub: small yPercent drift + scale ease-out
  //  · big-number scrub: drift + opacity-in
  //  · content stagger: eyebrow → title → desc → meta → list (handled by .reveal)
  if (ScrollTrigger && !reduceMotion) {
    document.querySelectorAll("[data-pillar-row]").forEach((row) => {
      const visual = row.querySelector("[data-pillar-visual]");
      const img = visual ? visual.querySelector("img") : null;
      const bigNum = row.querySelector("[data-pillar-num]");
      const list = row.querySelector(".pillar-row__list");
      const items = list ? list.querySelectorAll("li") : [];

      // Subtle ken-burns style image drift while the row passes through.
      if (img) {
        gsap.fromTo(img,
          { scale: 1.08, yPercent: -4 },
          {
            scale: 1.00,
            yPercent: 4,
            ease: "none",
            scrollTrigger: {
              trigger: visual,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }

      // Big ghost number rises into place + opacity-in
      if (bigNum) {
        gsap.fromTo(bigNum,
          { yPercent: 24, opacity: 0.4 },
          {
            yPercent: -6,
            opacity: 0.92,
            ease: "none",
            scrollTrigger: {
              trigger: visual || row,
              start: "top bottom",
              end: "center center",
              scrub: true,
            },
          }
        );
      }

      // List bullets stagger in once the row enters view
      if (items.length) {
        gsap.from(items, {
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: list,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      }
    });
  }
})();

// document.addEventListener("DOMContentLoaded", () => {
//   if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
//     gsap.registerPlugin(ScrollTrigger);

//     const imgWrappers = document.querySelectorAll("[data-gsap-img]");

//     imgWrappers.forEach((wrapper) => {
//       const img = wrapper.querySelector("img");
//       if (!img) return;

//       // الحل السحري للسكرول السريع: استخدام fromTo مباشر مع تخصيص الأداء
//       gsap.fromTo(img,
//         {
//           scale: 1.15, // قللنا النسبة قليلاً لتقليل مجهود كرت الشاشة أثناء الحركة السريعة
//           opacity: 0
//         },
//         {
//           scale: 1,
//           opacity: 1,
//           duration: 1.2,
//           ease: "power1.out", // تم تغيير الـ Ease ليكون أسرع في البداية فيلحق السكرول السريع
//           lazy: false,        // يجبر GSAP على تفعيل الأنيميشن فوراً دون انتظار الدورة القادمة للمتصفح
//           scrollTrigger: {
//             trigger: wrapper,
//             start: "top 92%",       // جعلناه يبدأ مبكراً قليلاً (92% بدل 88%) ليعطي الصورة وقتاً للاستعداد قبل أن تراها العين
//             toggleActions: "play none none none",
//             once: true,
//             fastScrollEnd: true,    // ميزة رهيبة: لو المستخدم سكرول بسرعة فظيعة، GSAP ينهي الأنيميشن فوراً ويمنع الـ Jump
//           }
//         }
//       );
//     });

//     // إجبار المتصفح على إعادة حساب كل الـ Triggers بعد تحميل الصفحة تماماً لضمان دقة الأبعاد
//     window.addEventListener("load", () => {
//       ScrollTrigger.refresh();
//     });
//   }
// });