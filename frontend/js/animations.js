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
  const isMobile     = window.matchMedia("(max-width: 880px)").matches;
  const isRTL        = document.documentElement.dir === "rtl";

  const { gsap } = window;
  const ScrollTrigger = window.ScrollTrigger;
  const ScrollToPlugin = window.ScrollToPlugin;
  if (ScrollTrigger)  gsap.registerPlugin(ScrollTrigger);
  if (ScrollToPlugin) gsap.registerPlugin(ScrollToPlugin);

  document.documentElement.classList.add("is-anim-ready");

  /* ------ Lenis smooth scroll ----------------------------------------- */
  let lenis = null;
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
      { scaleY: 0, duration: 1.1, ease: "expo.inOut",
        onComplete: () => curtain.classList.add("is-done") }
    );
  } else if (curtain) {
    curtain.classList.add("is-done");
  }

  /* ------ Hero entrance (only on pages that have a .hero) ------------- */
  const hero = document.querySelector(".hero, .page-head, .contact-hero");
  if (hero && !reduceMotion) {
    const heading = hero.querySelector(".h-display, .h-1");
    const lead    = hero.querySelector(".lead, .hero__lead, .page-head__lead");
    const eyebrow = hero.querySelector(".eyebrow, .chapter-indicator");
    const actions = hero.querySelector(".hero__actions");
    const meta    = hero.querySelector(".hero__meta");
    const visual  = hero.querySelector(".mosaic, .vm, .hero__visual");

    tlEnter
      .from(eyebrow, { y: 20, opacity: 0, duration: 0.7, ease: "power2.out" }, "-=0.6")
      .from(heading, { y: 40, opacity: 0, duration: 1.0, ease: "expo.out" },   "-=0.5")
      .from(lead,    { y: 24, opacity: 0, duration: 0.8, ease: "power2.out" }, "-=0.7")
      .from(actions, { y: 18, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.6")
      .from(meta,    { y: 18, opacity: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
      .from(visual,  { y: 60, opacity: 0, scale: 1.05, duration: 1.2, ease: "expo.out" }, "-=0.9");
  }

  /* ------ Header drop-in --------------------------------------------- */
  const header = document.querySelector("[data-header]");
  if (header && !reduceMotion) {
    gsap.from(header, { y: -24, opacity: 0, duration: 0.7, ease: "power2.out", delay: 0.2 });
  }

  /* ------ Reveal-on-scroll (.reveal / utility classes) --------------- */
  // Royal cards run their own choreography below; exclude them here.
  const revealEls = document.querySelectorAll(".reveal:not([data-royal]), .anim-fadeinup, .anim-zoomin");
  if (revealEls.length && ScrollTrigger) {
    if (reduceMotion) {
      revealEls.forEach(el => {
        el.classList.add("is-visible");
        gsap.set(el, { clearProps: "all" });
      });
    } else {
      revealEls.forEach(el => {
        const isZoom = el.classList.contains("anim-zoomin");
        const fromVars = isZoom
          ? { opacity: 0, scale: 1.12 }
          : { opacity: 0, y: 60 };
        const toVars = isZoom
          ? { opacity: 1, scale: 1, duration: 1.6, ease: "expo.out" }
          : { opacity: 1, y: 0,     duration: 1.4, ease: "expo.out" };

        gsap.fromTo(el, fromVars, {
          ...toVars,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
            once: true,
          },
          onStart: () => el.classList.add("is-visible"),
        });
      });
    }
  }

  /* ------ Stagger groups --------------------------------------------- */
  if (ScrollTrigger && !reduceMotion) {
    const staggerGroups = [
      { sel: ".pillar-rows", child: ".pillar-row"  },
      { sel: ".board__featured", child: ".board-feature" },
      { sel: ".quote-grid",   child: ".quote"      },
      { sel: ".channels",     child: ".channel"    },
      { sel: ".vm",           child: ".vm__card"   },
      { sel: ".committees",   child: ".committee-pill" },
      { sel: ".office__grid", child: ".office__col" },
      { sel: ".footer__grid", child: ":scope > *"  },
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
            once: true,
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
          once: true,
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
      const wrap  = document.createElement("span");
      const inner = document.createElement("span");
      wrap.className  = "split-word";
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

  const royalsSection = document.querySelector(".royals");
  const royalCards    = document.querySelectorAll("[data-royal]");

  if (royalsSection && ScrollTrigger) {
    const title    = royalsSection.querySelector(".section-header h2");
    const eyebrow  = royalsSection.querySelector(".section-header .eyebrow");
    const lead     = royalsSection.querySelector(".section-header .lead");
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
          once: true,
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
        const img      = card.querySelector(".royal-card__portrait img");
        const crown    = card.querySelector(".royal-card__crown");
        const badge    = card.querySelector(".royal-card__badge");
        const rank     = card.querySelector(".royal-card__rank");
        const name     = card.querySelector(".royal-card__name");
        const role     = card.querySelector(".royal-card__role");
        const quote    = card.querySelector(".royal-card__quote");

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
        if (role)  cardTl.from(role,  { y: 14, opacity: 0, duration: 0.35 }, "-=0.25");
        if (quote) cardTl.from(quote, { y: 16, opacity: 0, duration: 0.45 }, "-=0.2");

        // Cards animate with strong overlap: Crown Prince begins while King
        // is still finishing — keeps the section snappy.
        master.add(cardTl, i === 0 ? ">-0.1" : "<+0.4");
      });
    }
  }

  /* ------ Animated counters (replaces main.js) ----------------------- */
  const counters = document.querySelectorAll("[data-counter]");
  counters.forEach(el => {
    const target   = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || "0", 10);

    if (reduceMotion || !ScrollTrigger) {
      el.textContent = formatNumber(target, decimals);
      return;
    }

    const proxy = { value: 0 };
    gsap.to(proxy, {
      value: target,
      duration: 2.4,
      ease: "power1.inOut",
      onUpdate: () => { el.textContent = formatNumber(proxy.value, decimals); },
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once: true,
      },
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
        { yPercent: 30, opacity: 0.4 },
        {
          yPercent: -10,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".banner-stat",
            start: "top bottom",
            end: "bottom top",
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
      const cx = window.innerWidth  / 2;
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
  const navEl    = document.querySelector("[data-nav]");
  const navTog   = document.querySelector("[data-nav-toggle]");
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
      const img    = visual ? visual.querySelector("img") : null;
      const bigNum = row.querySelector("[data-pillar-num]");
      const list   = row.querySelector(".pillar-row__list");
      const items  = list ? list.querySelectorAll("li") : [];

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
            once: true,
          },
        });
      }
    });
  }
})();
