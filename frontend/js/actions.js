/* ==========================================================================
   actions.js — Dynamic Sticky Side-Action Buttons (Pure Array-Driven)
   ========================================================================== */
(() => {
  "use strict";

  // 1. تحديد لغة الصفحة الحالية بناءً على كود الـ HTML الداخلي
  const isAR = (document.documentElement.getAttribute("lang") || "ar")
    .toLowerCase().startsWith("ar");
  const lang = isAR ? "ar" : "en";

  // مصفوفة الصفحات المرتبة بالتسلسل الصحيح
  const pages = [
    {
      nameAr: "الرئيسية",
      nameEn: "Home",
      href: "index.html",
    },
    {
      nameAr: "المقدمة",
      nameEn: "Introduction",
      href: "introduction.html",
    },
    {
      nameAr: "رسالة رئيس مجلس الادارة",
      nameEn: "Chairman's Message",
      href: "chairman-message.html",
    },
    {
      nameAr: "رسالة الرئيس التنفيذي",
      nameEn: "CEO's Message",
      href: "ceo-message.html",
    },
    {
      nameAr: "الملخص التنفيذي 1",
      nameEn: "Executive Summary 1",
      href: "executive-summary-1.html",
    },
    {
      href: "executive-summary.html",
      nameAr: "الملخص التنفيذي 2",
      nameEn: "Executive Summary 2",
    },
    {
      href: "strategic-direction.html",
      nameAr: "التوجه الاستراتيجي",
      nameEn: "Strategic Direction",
    },
    {
      href: "performance-summary.html",
      nameAr: "موجز الاداء",
      nameEn: "Performance Summary",
    },
    {
      href: "current-state.html",
      nameAr: "الوضع الراهن",
      nameEn: "Current State",
    },
    {
      href: "housing-support-program.html",
      nameAr: "برنامج الدعم السكني",
      nameEn: "Housing Support Program",
    },
    {
      href: "housing-support-empowerment-achievements.html",
      nameAr: " إنجازات تمكين مستفيدي برامج الدعم السكني",
      nameEn: "Empowering Housing Support Beneficiaries",
    },
    {
      href: "digital-achievements.html",
      nameAr: "إنجازات التحول الرقمي",
      nameEn: "Digital Transformation",
    },
    {
      href: "government-enablers.html",
      nameAr: "مُمكِّنات الحوكمة",
      nameEn: "Governance Enablers",
    },
    {
      href: "training-programs.html",
      nameAr: "النشاطات الاجتماعية والجوائز",
      nameEn: "Social Activities & Awards",
    },
    {
      href: "notable-achievements.html",
      nameAr: "أعمال الحملات الاتصالية",
      nameEn: "Communication Campaigns",
    },
    {
      href: "subsidized-finance-cost.html",
      nameAr: "تكلفة التمويل المدعوم",
      nameEn: "Subsidized Finance Cost",
    },
    {
      href: "opportunities-and-enablers.html",
      nameAr: "الفرص و العوامل المساعدة",
      nameEn: "Opportunities & Enablers",
    },
    {
      href: "subsidiaries.html",
      nameAr: "الشركات التابعة",
      nameEn: "Subsidiaries",
    },
    {
      href: "challenges-and-support.html",
      nameAr: "التحديات و الدعم المطلوب",
      nameEn: "Challenges & Support",
    },
    {
      href: "conclusion.html",
      nameAr: "الخاتمة",
      nameEn: "Conclusion",
    },
  ];

  // نصوص الأمان الاحتياطية في حال تعطل المسار أو في الصفحات الطرفية
  const FALLBACK_LABELS = {
    ar: {
      prev: "الصفحة السابقة",
      next: "الصفحة التالية",
      dlPage: "تنزيل هذه الصفحة",
      dlAll: "تنزيل التقرير الكامل"
    },
    en: {
      prev: "Previous page",
      next: "Next page",
      dlPage: "Download this page",
      dlAll: "Download full report"
    }
  };
  const fallback = FALLBACK_LABELS[lang];

  // 2. دالة جلب اسم الملف الحالي بشكل نقي
  function currentFilename() {
    const path = window.location.pathname;
    return path.split("/").pop() || "index.html";
  }

  const filename = currentFilename();
  const slug = filename.replace(/\.html$/i, "") || "index";

  // 3. البحث عن رقم ترتيب الصفحة الحالية في المصفوفة (pages) المرفقة
  const idx = pages.findIndex(page => page.href === filename);

  const prevRaw = idx > 0 ? pages[idx - 1] : null;
  const nextRaw = idx >= 0 && idx < pages.length - 1 ? pages[idx + 1] : null;

  // تحويل البيانات للشكل النهائي واختيار الاسم بناءً على اللغة المفعّلة
  const prevPage = prevRaw ? {
    href: prevRaw.href,
    text: isAR ? prevRaw.nameAr : prevRaw.nameEn
  } : null;

  const nextPage = nextRaw ? {
    href: nextRaw.href,
    text: isAR ? nextRaw.nameAr : nextRaw.nameEn
  } : null;

  // مسارات الـ PDF الموجهة ديناميكياً بناءً على لغة واسم الصفحة الحالية
  const pagePdf = `assets/pdf/${lang}/${slug}.pdf`;
  const fullPdf = `assets/pdf/${lang}/MT-final.pdf`;

  // الأيقونات الرسومية الأنيقة (Feather SVG Icons)
  const ICONS = {
    prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="action-svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
    next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="action-svg"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
    dlPage: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="action-svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="18"/><polyline points="9 15 12 18 15 15"/></svg>`,
    dlAll: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="action-svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><line x1="12" y1="10" x2="12" y2="16"/><polyline points="9 13 12 16 15 13"/></svg>`
  };

  // استخراج العناوين تلقائياً من مصفوفة الـ pages بناءً على المتغيرات الجديدة
  const prevText = prevPage ? prevPage.text : fallback.prev;
  const nextText = nextPage ? nextPage.text : fallback.next;

  function injectMarkup() {
    let box = document.querySelector(".actions-box");
    if (box) {
      box.remove();
    }

    box = document.createElement("ul");
    box.className = "actions-box";
    box.setAttribute("aria-label", isAR ? "إجراءات الصفحة" : "Page actions");

    box.innerHTML = `
      <li class="action-box">
        <a class="action-box__link action-box__link-arrow " data-action="prev"
           ${prevPage ? `href="${isAR ? "ar" : "en"}/${prevPage.href}"` : 'href="#" aria-disabled="true"'}
           aria-label="${prevText}">
          ${ICONS.prev}
          <span class="action-text">${prevText}</span>
        </a>
      </li>
      <li class="action-box">
        <a class="action-box__link action-box__link-arrow" data-action="next"
           ${nextPage ? `href="${isAR ? "ar" : "en"}/${nextPage.href}"` : 'href="#" aria-disabled="true"'}
           aria-label="${nextText}">
          ${ICONS.next}
          <span class="action-text">${nextText}</span>
        </a>
      </li>
      ${filename !== "index.html" ? `
      <li class="action-box">
        <a class="action-box__link" data-action="download-page" href="${pagePdf}" download aria-label="${fallback.dlPage}">
          ${ICONS.dlPage}
          <span class="action-text">${fallback.dlPage}</span>
        </a>
      </li>
      ` : ""}
      <li class="action-box">
        <a class="action-box__link" data-action="download-all" href="${fullPdf}" download aria-label="${fallback.dlAll}">
          ${ICONS.dlAll}
          <span class="action-text">${fallback.dlAll}</span>
        </a>
      </li>
    `;

    document.body.appendChild(box);

    // حظر الروابط المعطلة (is-disabled) وتثبيتها برمجياً لمنع الانتقال الخاطئ
    box.querySelectorAll('a[aria-disabled="true"]').forEach((a) => {
      a.classList.add("is-disabled");
      a.addEventListener("click", (e) => e.preventDefault());
    });
  }

  // التحقق من تحميل عناصر الصفحة وبدء تشغيل الحقن الديناميكي
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectMarkup, { once: true });
  } else {
    injectMarkup();
  }
})();