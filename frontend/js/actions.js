/* ==========================================================================
   actions.js — sticky side-action buttons
     · 4 floating icon buttons: previous page, next page, download this
       page (PDF), download full report (PDF).
     · Auto-injected if .actions-box is missing on the page, otherwise the
       existing markup is wired.
     · Page order is shared between AR and EN; the same page name routes
       to the matching language folder.
   ========================================================================== */
(() => {
  "use strict";

  // Reading order across the report. Matches the printed-PDF flow.
  // 'index' is the cover/home; the rest mirror the report's chapters.
  const ORDER = [
    "index",
    "ceos-message",
    "introduction",
    "executive-summary",
    "fund-role",
    "current-state",
    "strategy",
    "performance-summary",
    "challenges-and-support",
    "conclusion",
    "contact"
  ];

  // Display labels per slug (used for accessible labels and tooltips).
  const LABELS = {
    ar: {
      "index": "الرئيسية",
      "ceos-message": "كلمة الرئيس التنفيذي",
      "introduction": "المقدمة",
      "executive-summary": "الملخص التنفيذي",
      "fund-role": "دور الصندوق",
      "current-state": "الوضع الراهن",
      "strategy": "التوجه الاستراتيجي",
      "performance-summary": "موجز الأداء",
      "challenges-and-support": "التحديات والدعم",
      "conclusion": "الخاتمة",
      "contact": "تواصل معنا",
      prev: "الصفحة السابقة",
      next: "الصفحة التالية",
      dlPage: "تنزيل هذه الصفحة (PDF)",
      dlAll: "تنزيل التقرير الكامل (PDF)"
    },
    en: {
      "index": "Home",
      "ceos-message": "CEO's Message",
      "introduction": "Introduction",
      "executive-summary": "Executive Summary",
      "fund-role": "Fund Role",
      "current-state": "Current State",
      "strategy": "Strategic Direction",
      "performance-summary": "Performance Summary",
      "challenges-and-support": "Challenges & Support",
      "conclusion": "Conclusion",
      "contact": "Contact Us",
      prev: "Previous page",
      next: "Next page",
      dlPage: "Download this page (PDF)",
      dlAll: "Download the full report (PDF)"
    }
  };

  const isAR = (document.documentElement.getAttribute("lang") || "en")
    .toLowerCase().startsWith("ar");
  const lang = isAR ? "ar" : "en";
  const labels = LABELS[lang];

  // Current page slug (filename without extension). Treat empty / "/" as index.
  const path = window.location.pathname;
  const filename = (path.split("/").pop() || "index.html");
  const slug = filename.replace(/\.html$/i, "") || "index";

  const idx = ORDER.indexOf(slug);
  // Pages outside the report flow (current-state-old, etc.) get prev/next disabled.
  const prevSlug = idx > 0 ? ORDER[idx - 1] : null;
  const nextSlug = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null;

  // Resolve a slug to a same-language URL. The <base href="../"> on the
  // pages means we should prefix with "ar/" or "en/" relative to root.
  const urlFor = (s) => `${lang}/${s}.html`;

  // PDF assets — naming convention assets/pdf/redf-2025-<slug>-<lang>.pdf.
  const pagePdf = `assets/pdf/${isAR ? "ar" : "en"}/${slug}.pdf`;
  const fullPdf = `assets/pdf/${isAR ? "ar" : "en"}/MT-final.pdf`;

  const ICONS = {
    prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    dlPage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/></svg>`,
    dlAll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="10" x2="12" y2="16"/><polyline points="9 13 12 16 15 13"/></svg>`
  };

  // In RTL the visual "previous" arrow should point right; we swap the icons.
  // (Visually: previous in AR looks like →, next looks like ←.)
  const prevIcon = isAR ? ICONS.next : ICONS.prev;
  const nextIcon = isAR ? ICONS.prev : ICONS.next;


  function injectMarkup() {
    let box = document.querySelector(".actions-box");
    if (box) {
      // Replace existing static markup with the new functional version
      box.remove();
    }
    box = document.createElement("ul");
    box.className = "actions-box";
    box.setAttribute("aria-label", isAR ? "إجراءات الصفحة" : "Page actions");
    box.innerHTML = `
      <li class="action-box">
        <a class="action-box__link" data-action="prev"
           ${prevSlug ? `href="${urlFor(prevSlug)}"` : 'href="#" aria-disabled="true"'}
           aria-label="${labels.prev}${prevSlug ? ` — ${labels[prevSlug]}` : ''}"
           title="${labels.prev}${prevSlug ? ` — ${labels[prevSlug]}` : ''}">
          ${prevIcon}
        </a>
      </li>
      <li class="action-box">
        <a class="action-box__link">
          ${nextIcon}
        </a>
      </li>
      ${slug !== "index" ? `
      <li class="action-box">
        <a class="action-box__link" data-action="download-page"
           href="${pagePdf}" download>
          ${ICONS.dlPage}
        </a>
      </li>
      `
        : ""
      }
      <li class="action-box">
        <a class="action-box__link" data-action="download-all"
           href="${fullPdf}" download
           aria-label="${labels.dlAll}" title="${labels.dlAll}">
          ${ICONS.dlAll}
        </a>
      </li>
    `;
    document.body.appendChild(box);

    // Disabled state for missing prev/next (e.g., index has no prev, contact has no next).
    box.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
      a.classList.add("is-disabled");
      a.addEventListener("click", (e) => e.preventDefault());
    });
  }

  // Defer until DOM is ready so we always inject after the page body exists.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMarkup, { once: true });
  } else {
    injectMarkup();
  }
})();
