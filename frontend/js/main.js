/* ==========================================================================
   main.js — site-wide interactions
     · mobile menu toggle (with focus trap)
     · sticky header scroll-state class flip
     · reveal-on-scroll (IntersectionObserver)
     · animated stat counters
     · smooth anchor scroll respecting reduced-motion
   No external libraries. Designed so a future GSAP layer can take over the
   reveal/counter logic without touching markup.
   ========================================================================== */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // animations.js owns reveals, counters, and anchor scroll when GSAP is loaded.
  const hasGsap = !!window.gsap;

  /* ------ Mobile menu toggle ------------------------------------------- */
  const nav    = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");

  if (nav && toggle) {
    const closeMenu = () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      isOpen ? closeMenu() : openMenu();
    });

    // Close on link click (mobile)
    nav.querySelectorAll(".nav__link").forEach(link => {
      link.addEventListener("click", () => {
        if (window.matchMedia("(max-width: 880px)").matches) closeMenu();
      });
    });

    // Esc closes menu
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
    });

    // Resize past breakpoint resets state
    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 880px)").matches) closeMenu();
    });
  }

  /* ------ Sticky header scroll-state ----------------------------------- */
  const header = document.querySelector("[data-header]");
  if (header) {
    let ticking = false;
    const update = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  /* ------ Reveal on scroll -------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && !hasGsap) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(el => el.classList.add("is-visible"));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      revealEls.forEach(el => io.observe(el));
    }
  }

  /* ------ Animated counters ------------------------------------------- */
  const counters = document.querySelectorAll("[data-counter]");
  if (counters.length && !hasGsap) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(el => {
        el.textContent = formatNumber(parseFloat(el.dataset.counter), el);
      });
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(el => io.observe(el));
    }
  }

  function animateCounter(el) {
    const target   = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 2200;
    const start    = performance.now();

    function tick(now) {
      const elapsed = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - elapsed, 3);
      const value = target * eased;
      el.textContent = formatNumber(value, el, decimals);
      if (elapsed < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(target, el, decimals);
    }
    requestAnimationFrame(tick);
  }

  function formatNumber(value, el, decimals = parseInt(el.dataset.decimals || "0", 10)) {
    const fixed = value.toFixed(decimals);
    return Number(fixed).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /* ------ Smooth anchor scroll (skipped when animations.js is active) -- */
  if (!hasGsap) document.querySelectorAll('a[href^="#"]').forEach(link => {
    const hash = link.getAttribute("href");
    if (!hash || hash === "#" || hash.length < 2) return;

    link.addEventListener("click", (e) => {
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
      window.scrollTo({
        top,
        behavior: reduceMotion ? "auto" : "smooth"
      });
    });
  });

  /* ------ Set current-page nav state ---------------------------------- */
  // Compares the trailing filename of each link against the current page,
  // so it works the same in /index.html and /ar/index.html.
  const here = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".nav__link").forEach(link => {
    const href = (link.getAttribute("href") || "").split("#")[0].split("/").pop().toLowerCase();
    if (href && href === here) link.setAttribute("aria-current", "page");
  });

  /* ------ Footer year ------------------------------------------------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* =====================================================================
     Staggered overlay menu
     · DOM is built on first invocation from a bilingual config
     · CSS owns the stagger via per-nth-child transition-delay
     · JS owns open/close, focus return, escape, and image swap on hover
     ===================================================================== */
  initStaggeredMenu();

  function initStaggeredMenu() {
    const isAR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("ar");
    const inSubdir = /\/ar\//.test(window.location.pathname) || window.location.pathname.endsWith("/ar/");
    const root = inSubdir ? "../" : "";
    const currentFilename = () => (window.location.pathname.split("/").pop() || "index.html");

    const config = isAR ? {
      title: "تصفح التقرير",
      label: "القائمة",
      labelOpen: "إغلاق",
      brand: "صندوق التنمية العقارية",
      brandSub: "التقرير السنوي 2025",
      links: [
        { href: "index.html",          text: "الرئيسية",     img: "family.jpg",   caption: "أسرٌ تنتقل إلى منازلها الجديدة" },
        { href: "about.html",          text: "عن الصندوق",   img: "chairman.png", caption: "رسالة رئيس مجلس الإدارة" },
        { href: "strategy.html",       text: "الاستراتيجية", img: "villas.jpg",   caption: "أربع ركائز · رؤية 2030" },
        { href: "index.html#impact",   text: "الأثر",        img: "family.jpg",   caption: "أكثر من 920,000 أسرة منذ 2017" },
        { href: "contact.html",        text: "تواصل معنا",   img: "cto.png",      caption: "نحن هنا لمساعدتك" }
      ],
      contact: [
        { label: "مركز الاتصال", value: "920000507",        href: "tel:920000507" },
        { label: "البريد",        value: "info@redf.gov.sa", href: "mailto:info@redf.gov.sa" }
      ],
      langSelf: "AR",
      langOther: { code: "EN", href: "en/" + currentFilename() }
    } : {
      title: "Browse the report",
      label: "Menu",
      labelOpen: "Close",
      brand: "Real Estate Development Fund",
      brandSub: "Annual Report 2025",
      links: [
        { href: "index.html",          text: "Home",     img: "family.jpg",   caption: "Saudi families moving into new homes" },
        { href: "about.html",          text: "About",    img: "chairman.png", caption: "Letter from the Chairman" },
        { href: "index.html#strategy", text: "Strategy", img: "villas.jpg",   caption: "Four pillars · Vision 2030" },
        { href: "index.html#impact",   text: "Impact",   img: "family.jpg",   caption: "920,000+ families since 2017" },
        { href: "contact.html",        text: "Contact",  img: "cto.png",      caption: "We're here to help" }
      ],
      contact: [
        { label: "Contact Center", value: "920000507",        href: "tel:920000507" },
        { label: "Email",          value: "info@redf.gov.sa", href: "mailto:info@redf.gov.sa" }
      ],
      langSelf: "EN",
      langOther: { code: "AR", href: "ar/" + currentFilename() }
    };

    // The legacy hamburger drawer is replaced by this overlay menu — remove the old toggle.
    document.querySelectorAll("[data-nav-toggle]").forEach(btn => btn.remove());

    const triggers = document.querySelectorAll("[data-menu-trigger]");
    if (!triggers.length) return;

    triggers.forEach(t => {
      t.classList.add("menu-trigger");
      t.innerHTML = `<span>${config.label}</span><span class="menu-trigger__icon" aria-hidden="true"></span>`;
      t.setAttribute("aria-controls", "staggered-menu");
      t.setAttribute("aria-expanded", "false");
    });

    const isCurrentLink = (href) => {
      const here = currentFilename().toLowerCase();
      const target = (href || "").split("#")[0].split("/").pop().toLowerCase();
      return target === here;
    };

    const menu = document.createElement("div");
    menu.className = "staggered-menu";
    menu.id = "staggered-menu";
    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", config.title);
    menu.setAttribute("hidden", "");
    menu.innerHTML = `
      <div class="staggered-menu__top">
        <a href="${root}${isAR ? "ar/" : ""}index.html" class="staggered-menu__brand">
          <img src="${root}assets/logo.png" alt="" />
          <span><small style="opacity:.6;font-weight:400;font-size:11px;letter-spacing:.06em">${config.brandSub}</small></span>
        </a>
        <button type="button" class="staggered-menu__close" data-menu-close>
          <span>${config.labelOpen}</span>
          <span class="staggered-menu__close-x" aria-hidden="true"></span>
        </button>
      </div>

      <div class="staggered-menu__body">
        <ul class="staggered-menu__list" role="list">
          ${config.links.map((link, i) => `
            <li class="staggered-menu__item${isCurrentLink(link.href) ? " is-current" : ""}">
              <a class="staggered-menu__link" href="${link.href}"
                 data-preview="${link.img}" data-caption="${link.caption}">
                <span class="staggered-menu__num">${String(i + 1).padStart(2, "0")}</span>
                <span class="staggered-menu__label">${link.text}</span>
                <span class="staggered-menu__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
              </a>
            </li>
          `).join("")}
        </ul>

        <aside class="staggered-menu__preview" aria-hidden="true">
          ${config.links.map((link, i) => `
            <img class="staggered-menu__preview-img${i === 0 ? " is-active" : ""}"
                 data-img="${link.img}"
                 src="${root}assets/${link.img}" alt="" loading="lazy" />
          `).join("")}
          <div class="staggered-menu__preview-caption" data-preview-caption>${config.links[0].caption}</div>
        </aside>
      </div>

      <div class="staggered-menu__bottom">
        <div class="staggered-menu__lang" aria-label="Language">
          <a href="#" aria-current="true">${config.langSelf}</a>
          <span style="opacity:.4">·</span>
          <a href="${config.langOther.href}">${config.langOther.code}</a>
        </div>
        <div class="staggered-menu__contact">
          ${config.contact.map(c => `
            <span><strong>${c.label}</strong><a href="${c.href}">${c.value}</a></span>
          `).join("")}
        </div>
      </div>
    `;
    document.body.appendChild(menu);

    let lastFocused = null;

    const open = () => {
      lastFocused = document.activeElement;
      menu.removeAttribute("hidden");
      requestAnimationFrame(() => menu.classList.add("is-open"));
      document.body.classList.add("menu-open");
      triggers.forEach(t => t.setAttribute("aria-expanded", "true"));
      setTimeout(() => {
        const first = menu.querySelector(".staggered-menu__link");
        if (first) first.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 480);
    };

    const close = () => {
      menu.classList.remove("is-open");
      document.body.classList.remove("menu-open");
      triggers.forEach(t => t.setAttribute("aria-expanded", "false"));
      setTimeout(() => {
        menu.setAttribute("hidden", "");
        if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true });
      }, reduceMotion ? 0 : 600);
    };

    triggers.forEach(t => t.addEventListener("click", open));
    menu.querySelector("[data-menu-close]").addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });

    menu.querySelectorAll(".staggered-menu__link").forEach(link => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";
        if (href.includes("#")) setTimeout(close, 100);
      });
    });

    const previewImgs = menu.querySelectorAll(".staggered-menu__preview-img");
    const previewCap  = menu.querySelector("[data-preview-caption]");

    const activatePreview = (link) => {
      const target = link.dataset.preview;
      const cap    = link.dataset.caption;
      previewImgs.forEach(img => img.classList.toggle("is-active", img.dataset.img === target));
      if (previewCap && cap) previewCap.textContent = cap;
    };

    menu.querySelectorAll(".staggered-menu__link").forEach(link => {
      link.addEventListener("mouseenter", () => activatePreview(link));
      link.addEventListener("focus", () => activatePreview(link));
    });

    menu.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const focusable = menu.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

})();
