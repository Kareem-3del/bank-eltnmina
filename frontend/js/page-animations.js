document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("is-anim-ready");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(".row-trigger", { opacity: 0, y: 20 });

    gsap.to(".row-trigger", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        stagger: { each: 0.15, from: "start" },
        scrollTrigger: {
            trigger: ".anim-table",
            start: "top 40%",        // ← يبدأ لما الجدول يدخل الشاشة
            end: "bottom 40%",       // ← يتعكس لما الجدول يطلع من الشاشة
            toggleActions: "play reverse play reverse",
            invalidateOnRefresh: true,
            fastScrollEnd: true,
        }
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

});