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
  const nav = document.querySelector("[data-nav]");
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
    const target = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const duration = 2200;
    const start = performance.now();

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
    console.log("href", href)
    console.log("here = ", here)

    if (href && href === here) {
      link.setAttribute("aria-current", "page");
      // A dropdown parent (e.g. "أبرز الأعمال والإنجازات") should read as
      // active too when the current page is one of its own sub-pages.
      const parentLink = link.closest(".dropdown-menu")?.closest("li.dropdown")?.querySelector(":scope > .nav__link");
      if (parentLink) parentLink.setAttribute("aria-current", "page");
    }
  });

  /* ------ Two-state language switch ----------------------------------- */
  document.querySelectorAll(".nav__lang").forEach(link => {
    const isAR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("ar");
    const otherHref = link.getAttribute("href") || "#";
    const currentHref = `${isAR ? "ar" : "en"}/${here}`;
    const switcher = document.createElement("div");

    switcher.className = "nav__lang-switch";
    switcher.setAttribute("aria-label", isAR ? "تبديل اللغة" : "Switch language");
    switcher.innerHTML = `
      <a class="nav__lang-option${isAR ? "" : " is-active"}" href="${isAR ? otherHref : currentHref}" lang="en" ${isAR ? "" : "aria-current=\"true\""}>EN</a>
      <a class="nav__lang-option${isAR ? " is-active" : ""}" href="${isAR ? currentHref : otherHref}" lang="ar" ${isAR ? "aria-current=\"true\"" : ""}>AR</a>
    `;
    link.replaceWith(switcher);
  });

  /* ------ Footer year ------------------------------------------------- */
  const yr = document.querySelector("[data-year]");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ------ Remove routes that were intentionally dropped ---------------- */
  const removedRoutes = new Set([
    "housing-support-empowerment-achievements.html",
    "notable-achievements.html",
    "opportunities-and-enablers.html",
    "challenges-and-support.html"
  ]);

  document.querySelectorAll("a[href]").forEach(link => {
    const file = (link.getAttribute("href") || "").split("#")[0].split("/").pop().toLowerCase();
    if (!removedRoutes.has(file)) return;

    const item = link.closest("li");
    if (item) item.remove();
    else link.remove();
  });

  /* =====================================================================
     Staggered overlay menu
     · DOM is built on first invocation from a bilingual config
     · CSS owns the stagger via per-nth-child transition-delay
     · JS owns open/close, focus return, escape, and image swap on hover
     ===================================================================== */

  function generatedLinks(lang) {
    return lang === "ar" ? [
      {
        href: "index.html",
        text: "الرئيسية",
        img: "hero.webp",
        caption: "أسرٌ تنتقل إلى منازلها الجديدة"
      },

      {
        text: "التقديم",
        img: "introduction.webp",
        caption: "دور الصندوق في منظومة الإسكان",
        sublinks: [
          {
            href: "introduction.html",
            text: "المقدمة",
            img: "introduction.webp",
            caption: "دور الصندوق في منظومة الإسكان"
          },
          {
            href: "chairman-message.html",
            text: "رسالة رئيس مجلس الإدارة",
            img: "chairman-message.webp",
            caption: "كلمة عن مسيرة الصندوق"
          },
          {
            href: "ceo-message.html",
            text: "رسالة الرئيس التنفيذي",
            img: "chairman-message.webp",
            caption: "رسالة من الرئيس التنفيذي"
          },
          {
            href: "board-members.html",
            text: "أعضاء مجلس الإدارة",
            img: "board-hero.webp",
            caption: "قيادة الصندوق العقاري"
          },
          {
            href: "definitions.html",
            text: "التعريفات",
            img: "definitions-hero.webp",
            caption: "المصطلحات الواردة في التقرير"
          }
        ]
      },
      {
        text: "الملخص التنفيذي",
        img: "executive-summary.webp",
        caption: "نظرة شاملة على إنجازات العام",
        sublinks: [
          {
            href: "executive-summary-1.html",
            text: "الملخص التنفيذي 1",
            img: "executive-summary.webp",
            caption: "نظرة شاملة على إنجازات العام"
          },
          {
            href: "executive-summary.html",
            text: "الملخص التنفيذي 2",
            img: "executive-summary.webp",
            caption: "نظرة شاملة على إنجازات العام"
          }
        ]
      },
      {
        href: "strategic-direction.html",
        text: "التوجه الاستراتيجي",
        img: "strategic-direction.webp",
        caption: "أربع ركائز · رؤية 2030"
      },
      {
        href: "performance-summary.html",
        text: "موجز الأداء",
        img: "performance-summary.webp",
        caption: "أكثر من 920,000 أسرة منذ 2017"
      },
      {
        href: "current-state.html",
        text: "الوضع الراهن",
        img: "current-state.webp",
        caption: "الوضع الحالي لقطاع الإسكان"
      },
      {
        text: "أبرز الأعمال والإنجازات",
        img: "challenges-and-support.webp",
        caption: "أبرز الأعمال والإنجازات",
        sublinks: [
          {
            href: "fund-operational-capital-achievements-2025-1.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 1",
            img: "challenges-and-support.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "fund-operational-capital-achievements-2025-2.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 2",
            img: "digital-achievements-.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "fund-operational-capital-achievements-2025-3.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 3",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "fund-operational-capital-achievements-2025-4.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 4",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "fund-operational-capital-achievements-2025-5.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 5",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "fund-operational-capital-achievements-2025-6.html",
            text: "أعمال وإنجازات الصندوق التشغيلية والرأسمالية 6",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "digital-achievements-2025-1.html",
            text: "التحول الرقمي 1",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "digital-achievements-2025-2.html",
            text: "التحول الرقمي 2",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "digital-achievements-2025-3.html",
            text: "التحول الرقمي 3",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
          {
            href: "digital-achievements-2025-4.html",
            text: "التحول الرقمي 4",
            img: "government-enablers.webp",
            caption: "أبرز الأعمال والإنجازات",
          },
        ]
      },
      {
        href: "subsidiaries.html",
        text: "الشركات التابعة",
        img: "image%20(49).png",
        caption: "الشركات التابعة"
      },
      {
        href: "conclusion.html",
        text: "الخاتمة",
        img: "conclusion.webp",
        caption: "خلاصة عام 2025م"
      },
    ]
      :
      [
        {
          href: "index.html",
          text: "Home",
          img: "hero-en.webp",
          caption: "Families moving into their new homes"
        },

        {
          text: "Presentation",
          img: "introduction.webp",
          caption: "The Fund's role in the housing ecosystem",
          sublinks: [
            {
              href: "introduction.html",
              text: "Introduction",
              img: "introduction.webp",
              caption: "The Fund's role in the housing ecosystem"
            },
            {
              href: "chairman-message.html",
              text: "Chairman's Message",
              img: "chairman-message.webp",
              caption: "A word on the Fund's journey"
            },
            {
              href: "ceo-message.html",
              text: "CEO's Message",
              img: "chairman-message.webp",
              caption: "A message from the CEO"
            },
            {
              href: "board-members.html",
              text: "Board of Directors",
              img: "board-hero.webp",
              caption: "REDF leadership"
            },
            {
              href: "definitions.html",
              text: "Definitions",
              img: "definitions-hero.webp",
              caption: "Terms used in the report"
            }
          ]
        },
        {
          text: "Executive Summary",
          img: "executive-summary.webp",
          caption: "A comprehensive look at the year's achievements",
          sublinks: [
            {
              href: "executive-summary-1.html",
              text: "Executive Summary 1",
              img: "executive-summary.webp",
              caption: "A comprehensive look at the year's achievements"
            },
            {
              href: "executive-summary.html",
              text: "Executive Summary 2",
              img: "executive-summary.webp",
              caption: "A comprehensive look at the year's achievements"
            }
          ]
        },
        {
          href: "strategic-direction.html",
          text: "Strategic Direction",
          img: "strategic-direction.webp",
          caption: "Four Pillars · Vision 2030"
        },
        {
          href: "performance-summary.html",
          text: "Performance Summary",
          img: "performance-summary.webp",
          caption: "More than 920,000 families since 2017"
        },
        {
          href: "current-state.html",
          text: "Current State",
          img: "current-state.webp",
          caption: "The current status of the housing sector"
        },
        {
          text: "Key Achievements",
          img: "challenges-and-support.webp",
          caption: "Major works and accomplishments",
          sublinks: [
            {
              href: "fund-operational-capital-achievements-2025-1.html",
              text: "Operational and Capital Activities and Achievements 1",
              img: "challenges-and-support.webp",
              caption: "Key Achievements",
            },
            {
              href: "fund-operational-capital-achievements-2025-2.html",
              text: "Operational and Capital Activities and Achievements 2",
              img: "digital-achievements-.webp",
              caption: "Key Achievements",
            },
            {
              href: "fund-operational-capital-achievements-2025-3.html",
              text: "Operational and Capital Activities and Achievements 3",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "fund-operational-capital-achievements-2025-4.html",
              text: "Operational and Capital Activities and Achievements 4",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "fund-operational-capital-achievements-2025-5.html",
              text: "Operational and Capital Activities and Achievements 5",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "fund-operational-capital-achievements-2025-6.html",
              text: "Operational and Capital Activities and Achievements 6",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "digital-achievements-2025-1.html",
              text: "Digital Transformation 1",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "digital-achievements-2025-2.html",
              text: " Digital Transformation 2",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "digital-achievements-2025-3.html",
              text: " Digital Transformation 3",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
            {
              href: "digital-achievements-2025-4.html",
              text: " Digital Transformation 4",
              img: "government-enablers.webp",
              caption: "Key Achievements",
            },
          ]
        },
        {
          href: "subsidiaries.html",
          text: "Subsidiaries",
          img: "image%20(49).png",
          caption: "Subsidiary Companies"
        },
        {
          href: "conclusion.html",
          text: "Conclusion",
          img: "conclusion.webp",
          caption: "Summary of the year 2025"
        },
      ];
  }

  initStaggeredMenu();

  function initStaggeredMenu() {
    const isAR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("ar");
    const inSubdir = /\/ar\//.test(window.location.pathname) || window.location.pathname.endsWith("/ar/");
    const root = inSubdir ? "../" : "";
    const currentFilename = () => (window.location.pathname.split("/").pop() || "index.html");

    const config = isAR ?
      {
        title: "تصفح التقرير",
        label: "القائمة",
        labelOpen: "إغلاق",
        brand: "صندوق التنمية العقارية",
        brandSub: "التقرير السنوي 2025",
        links: generatedLinks("ar"),
        contact: [
          { label: "مركز الاتصال", value: "920000507", href: "tel:920000507" },
          { label: "البريد", value: "info@redf.gov.sa", href: "mailto:info@redf.gov.sa" }
        ],
        langSelf: "AR",
        langOther: { code: "EN", href: "en/" + currentFilename() }
      }
      :
      {
        title: "Browse Report",
        label: "Menu",
        labelOpen: "Close",
        brand: "Real Estate Development Fund",
        brandSub: "Annual Report 2025",
        links: generatedLinks("en"),
        contact: [
          { label: "Call Center", value: "920000507", href: "tel:920000507" },
          { label: "Email", value: "info@redf.gov.sa", href: "mailto:info@redf.gov.sa" }
        ],
        langSelf: "EN",
        langOther: { code: "AR", href: "ar/" + currentFilename() }
      }

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

    let initMenu = document.getElementById("staggered-menu")

    const menu = initMenu || document.createElement("div");
    menu.setAttribute("data-lenis-prevent", "");

    if (!initMenu) {
      menu.className = "staggered-menu";
      menu.id = "staggered-menu";
    }


    menu.setAttribute("role", "dialog");
    menu.setAttribute("aria-modal", "true");
    menu.setAttribute("aria-label", config.title);
    menu.setAttribute("hidden", "");
    menu.innerHTML = `
      <div class="staggered-menu__top">
        <a href="${root}${isAR ? "ar/" : ""}index.html" class="staggered-menu__brand">
          <img src="assets/logo.png" alt="" />
          <span><small style="opacity:.6;font-weight:400;font-size:11px;letter-spacing:.06em">${config.brandSub}</small></span>
        </a>
        <button type="button" class="staggered-menu__close" data-menu-close>
          <span>${config.labelOpen}</span>
          <span class="staggered-menu__close-x" aria-hidden="true"></span>
        </button>
      </div>

      <div class="staggered-menu__body">
        <ul class="staggered-menu__list" role="list">
          ${config.links.map((link, i) => {
      if (link.sublinks) {
        const activeSublink = link.sublinks.find(sub => isCurrentLink(sub.href));

        const parentHref = activeSublink ? (isAR ? `ar/${activeSublink.href}` : `en/${activeSublink.href}`) : "index.html";
        const parentImg = activeSublink ? activeSublink.img : link.img;
        const parentCaption = activeSublink ? activeSublink.caption : (link.caption || "");
        const hasActiveChild = activeSublink ? " is-current" : "";

        return `
                <li class="staggered-menu__item staggered-menu__dropdown${hasActiveChild}">
                  <a 
                  href="${parentHref}" data-caption="${parentCaption}" data-preview="${parentImg}" class="staggered-menu__link staggered-menu__dropdown-toggle${hasActiveChild}" data-dropdown-toggle>
                    <span class="staggered-menu__num">${String(i + 1).padStart(2, "0")}</span>
                    <span class="staggered-menu__label">${link.text}</span>
                    <span class="arrow" aria-hidden="true">
▼
                    </span>
                  </a>
                  <ul class="staggered-menu__dropdown-menu">
                    ${link.sublinks.map((sublink, j) => {
          // فحص حالة الرابط الفرعي الحالي هنا
          const isSubActive = isCurrentLink(sublink.href) ? " is-current" : "";

          return `
                        <li class="staggered-menu__dropdown-item${isSubActive}">
                          <a class="staggered-menu__dropdown-link${isSubActive}" href="${isAR ? `ar/${sublink.href}` : `en/${sublink.href}`}"
                             data-preview="${sublink.img}" data-caption="${sublink.caption}">
                            <span class="staggered-menu__num">${String(i + 1)}.${j + 1}</span>
                            <span class="staggered-menu__label">${sublink.text}</span>
                            <span class="staggered-menu__arrow" aria-hidden="true">
                              <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </span>
                          </a>
                        </li>
                      `;
        }).join("")}
                  </ul>
                </li>
              `;
      } else {
        return `
                <li class="staggered-menu__item${isCurrentLink(link.href) ? " is-current" : ""}">
                  <a class="staggered-menu__link${isCurrentLink(link.href) ? " is-current" : ""}" href="${isAR ? `ar/${link.href}` : `en/${link.href}`}"
                     data-preview="${link.img}" data-caption="${link.caption}">
                    <span class="staggered-menu__num">${String(i + 1).padStart(2, "0")}</span>
                    <span class="staggered-menu__label">${link.text}</span>
                    <span class="staggered-menu__arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24"><path d="M5 12h14M13 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </span>
                  </a>
                </li>
              `;
      }
    }).join("")}
        </ul>

        <aside class="staggered-menu__preview" aria-hidden="true">
        
        <img class="staggered-menu__preview-img is-active" 
        data-img="${isAR ? "hero.webp" : "hero-en.webp"}"
                 src="assets/${isAR ? "hero.webp" : "hero-en.webp"}" alt="" loading="lazy" />
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
    let closeTimer = null;
    const closeDuration = reduceMotion ? 0 : 900;

    const open = () => {
      lastFocused = document.activeElement;
      window.clearTimeout(closeTimer);
      menu.classList.remove("is-closing");
      menu.removeAttribute("hidden");

      if (window?.__lenis) window.__lenis.stop();

      requestAnimationFrame(() => menu.classList.add("is-open"));
      document.body.classList.add("menu-open");
      triggers.forEach(t => t.setAttribute("aria-expanded", "true"));
      // setTimeout(() => {
      //   const first = menu.querySelector(".staggered-menu__link");
      //   if (first) first.focus({ preventScroll: true });
      // }, reduceMotion ? 0 : 480);
    };

    const close = () => {
      if (menu.hasAttribute("hidden") || menu.classList.contains("is-closing")) return;

      window.clearTimeout(closeTimer);
      menu.classList.add("is-closing");
      menu.classList.remove("is-open");
      menu.classList.remove("is-index");

      // إعادة تشغيل Lenis
      triggers.forEach(t => t.setAttribute("aria-expanded", "false"));
      closeTimer = window.setTimeout(() => {
        menu.classList.remove("is-closing");
        menu.setAttribute("hidden", "");
        document.body.classList.remove("menu-open");
        if (window?.__lenis) window?.__lenis.start();
        if (lastFocused && document.contains(lastFocused)) lastFocused.focus({ preventScroll: true });
      }, closeDuration);
    };


    triggers.forEach(t => t.addEventListener("click", open));

    menu.querySelector("[data-menu-close]").addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });


    // أضف هذا الجزء بعد إضافة القائمة للـ DOM (بعد document.body.appendChild(menu))

    menu.addEventListener('click', (e) => {
      if (initMenu) {
        // 1. العثور على الرابط الذي تم الضغط عليه
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href') || '';

        // 2. التحقق من الشروط: هل الرابط يحتوي على "index" أو "gtm"؟
        const isIndexOrGtm = href.includes('index');

        // 3. منع الانتقال التلقائي إذا تحقق الشرط
        if (isIndexOrGtm) {
          e.preventDefault(); // هنا يتم منع المتصفح من فتح الرابط

          close(); // إغلاق المنيو
        }
      }

    });
    menu.querySelectorAll(".staggered-menu__link").forEach(link => {
      link.addEventListener("click", () => {
        const href = link.getAttribute("href") || "";

        if (href.includes("#")) setTimeout(close, 100);
      });
    });

    // Dropdown toggles
    document.querySelectorAll('[data-dropdown-toggle]').forEach(toggle => {
      console.log("toggle = ", toggle)
      toggle.addEventListener('click', (e) => {
        // منع الرابط من الانتقال لصفحة أخرى عند الضغط لفتح القائمة
        e.preventDefault();

        // كود فتح وإغلاق القائمة المنسدلة الخاص بك هنا، مثال:
        const parentLi = toggle.closest('.staggered-menu__dropdown');
        parentLi.classList.toggle('is-open'); // أو الكلاس المسؤول عن الفتح عندك
      });
    });
    const previewImgs = menu.querySelectorAll(".staggered-menu__preview-img");
    const previewCap = menu.querySelector("[data-preview-caption]");

    const activatePreview = (link) => {
      const target = link.dataset.preview;
      const cap = link.dataset.caption;
      previewImgs.forEach(img => img.classList.toggle("is-active", img.dataset.img === target));
      if (previewCap && cap) previewCap.textContent = cap;
    };

    menu.querySelectorAll(".staggered-menu__link, .staggered-menu__dropdown-link").forEach(link => {
      link.addEventListener("mouseenter", () => activatePreview(link));
      link.addEventListener("focus", () => activatePreview(link));
    });

    // menu.addEventListener("keydown", (e) => {
    //   if (e.key !== "Tab") return;
    //   const focusable = menu.querySelectorAll('a[href], button:not([disabled])');
    //   if (!focusable.length) return;
    //   const first = focusable[0];
    //   const last = focusable[focusable.length - 1];
    //   if (e.shiftKey && document.activeElement === first) {
    //     e.preventDefault();
    //     last.focus();
    //   } else if (!e.shiftKey && document.activeElement === last) {
    //     e.preventDefault();
    //     first.focus();
    //   }
    // });


  }


  // footer genreated
  function renderFooter() {
    const isAR = (document.documentElement.getAttribute("lang") || "en").toLowerCase().startsWith("ar");
    const lang = isAR ? "ar" : "en";

    // الحصول على مسار الصفحة الحالي للمقارنة وتحديد العنصر النشط (Active)
    const currentPath = window.location.pathname;

    const data = isAR ? {
      dir: "rtl",
      logo: "assets/logo-white.png",
      downloadText: "استعرض التقرير السنوي 2025م",
      pdfPath: "assets/pdf/ar/MT-final.pdf",
      ariaLabel: "محتويات التقرير",
      menu: generatedLinks("ar")
    } : {
      dir: "ltr",
      logo: "assets/logo-white.png",
      downloadText: "View Annual Report 2025",
      pdfPath: "assets/pdf/en/MT-final.pdf",
      ariaLabel: "Report contents",
      menu: generatedLinks("en")
    };

    const arrowSvg = `<span class="arrow"><svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_760_148)"><path d="M8 10L4 6.25H12L8 10Z" fill="white"/></g><defs><clipPath id="clip0_760_148"><rect width="16" height="15" fill="white"/></clipPath></defs></svg></span>`;
    const downloadSvg = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.00016 12.6668L3.3335 8.00016L8.00016 3.3335" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.6668 8H3.3335" stroke="white" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

    let menuHtml = '';

    data.menu.forEach(item => {
      const fullItemHref = item.href ? `${lang}/${item.href}` : "";
      const isItemActive = item.href && currentPath.includes(fullItemHref);

      if (item.sublinks) {
        let hasActiveSub = false;
        let activeSubHref = "";
        let subMenuHtml = '<ul class="dropdown-menu">';

        item.sublinks.forEach(sub => {
          const fullSubHref = `${lang}/${sub.href}`;
          const isSubActive = currentPath.includes(fullSubHref);

          if (isSubActive) {
            hasActiveSub = true;
            activeSubHref = fullSubHref; // حفظ رابط الفرعي الحالي النشط
          }

          subMenuHtml += `<li><a class="nav__link ${isSubActive ? 'active' : ''}" href="${fullSubHref}">${sub.text}</a></li>`;
        });
        subMenuHtml += '</ul>';

        // تفعيل الـ dropdown إذا كان الأب أو أحد فروعه نشطاً
        const dropdownClass = (isItemActive || hasActiveSub) ? 'dropdown active' : 'dropdown';

        // منطق الرابط للأب: إذا كان هناك فرع نشط، يأخذ رابطه، وإلا يصبح '#' (أو رابط الأب الأصلي إن وجد)
        const finalParentHref = hasActiveSub ? activeSubHref : (fullItemHref || '#');

        menuHtml += `
        <li class="${dropdownClass}">
          <a class="nav__link ${finalParentHref && finalParentHref !== "#" ? 'active' : ''}" href="${finalParentHref}">
            ${item.text}
            ${arrowSvg}
          </a>
          ${subMenuHtml}
        </li>`;
      } else {
        menuHtml += `
        <li>
          <a class="nav__link ${isItemActive ? 'active' : ''}" href="${fullItemHref}">${item.text}</a>
        </li>`;
      }
    });

    const footerHTML = `
    <footer class="site-footer" dir="${data.dir}">
      <div class="container">
        <div class="footer__head">
          <div class="footer__brand">
            <img src="${data.logo}" alt="Logo" />
          </div>
        </div>

        <ul class="footer__index" aria-label="${data.ariaLabel}">
          ${menuHtml}
        </ul>

        <div class="footer__bottom">
          <a class="footer-download__link" href="${data.pdfPath}" download>
            ${data.downloadText}
            ${downloadSvg}
          </a>
        </div>
      </div>
    </footer>
    `;

    const container = document.getElementById('footer-container');
    if (container) {
      container.innerHTML = footerHTML;
    }
  }

  renderFooter()
  /* ------ Footer Dropdown Accordion (Fixed Toggle) ---------------------- */
  const footerDropdowns = document.querySelectorAll(".site-footer .dropdown");

  footerDropdowns.forEach(dropdown => {
    const toggleBtn = dropdown.querySelector(".nav__link");
    const arrow = dropdown.querySelector(".arrow svg");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        // إلغاء الانتقال بالرابط تماماً ليعمل الزر كـ مـُفتاح فقط
        e.preventDefault();

        const isOpen = dropdown.classList.contains("is-open");

        // 1. إغلاق جميع الأكورديونات الأخرى في الفوتر
        footerDropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.remove("is-open");
            const otherArrow = otherDropdown.querySelector(".arrow svg");
            if (otherArrow) otherArrow.style.transform = "rotate(0deg)";
          }
        });

        // 2. التبديل بين الفتح والإغلاق للقائمة الحالية بسلاسة
        if (!isOpen) {
          dropdown.classList.add("is-open");
          if (arrow) arrow.style.transform = "rotate(180deg)";
        } else {
          dropdown.classList.remove("is-open");
          if (arrow) arrow.style.transform = "rotate(0deg)";
        }
      });
    }
  });

  // Ensure the DOM is fully loaded before creating the button
  document.addEventListener("DOMContentLoaded", () => {

    // 1. إنشاء الزر ديناميكياً وتجهيز السهم الداخلي
    const backToTopBtn = document.createElement("button");
    backToTopBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  `;
    backToTopBtn.className = "back-to-top-js";
    backToTopBtn.setAttribute("aria-label", "Back to top");

    // 2. حقن الزر داخل الجسم (body)
    document.body.appendChild(backToTopBtn);

    // متغير للتحكم في حالة ظهور الفوتر
    let isFooterVisible;

    // 3. مراقبة حركة السكرول لإظهار/إخفاء الزر بناءً على الارتفاع والفوتر
    window.addEventListener("scroll", () => {
      // يظهر الزر فقط إذا تجاوز السكرول 300px ولم يصل المستخدم للفوتر بعد
      // if (window.scrollY > 300 && !isFooterVisible) {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    });

    // 4. آلية الاختفاء الذكي عند الوصول للفوتر باستخدام IntersectionObserver
    const footer = document.querySelector(".site-footer");
    if (footer) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          // تحديث المتغير بناءً على ما إذا كان الفوتر مرئياً في الشاشة أم لا
          isFooterVisible = entry.isIntersecting;

          // إذا ظهر الفوتر، نسحب كلاس الظهور فوراً ليختفي الزر
          if (isFooterVisible) {
            backToTopBtn.classList.remove("show");
          } else if (window.scrollY > 300) {
            // إذا صعد المستخدم لأعلى واختفى الفوتر وكان السكرول فوق الـ 300px يعود الزر للظهور
            backToTopBtn.classList.add("show");
          }
        });
      }, {
        root: null,      // يراقب نافذة التصفح (Viewport) بالكامل
        threshold: 0.05  // يختفي الزر بمجرد ظهور أول 5% من الفوتر لضمان استجابة سريعة
      });

      observer.observe(footer);
    }

    // 5. وظيفة الصعود السلس إلى الأعلى عند الضغط
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });

  });

})();
