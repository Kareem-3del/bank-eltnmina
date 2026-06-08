document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.add("is-anim-ready");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const curtain = document.querySelector("[data-curtain]");
    const tlEnter = gsap.timeline();

    const animClasses = [
        'anim-float-up', 'anim-float-down', 'anim-pulse', 'anim-down', 'anim-shake',
        'anim-swing', 'anim-grow', 'anim-slide-right', 'anim-slide-left',
        'anim-slide-fast', 'anim-spin', 'anim-fade', "anim-shake-rev"
    ];

    function getAnimClass(el) {
        if (el.classList.contains('js-float-up-enabled')) return 'anim-float-up';
        if (el.classList.contains('js-float-down-enabled')) return 'anim-float-down';
        if (el.classList.contains('js-pulse-enabled')) return 'anim-pulse';
        if (el.classList.contains('js-pulse-down-enabled')) return 'anim-pulse-down';
        if (el.classList.contains('js-shake-enabled')) return 'anim-shake';
        if (el.classList.contains('js-shake-rev-enabled')) return 'anim-shake-rev';
        if (el.classList.contains('js-swing-enabled')) return 'anim-swing';
        if (el.classList.contains('js-grow-enabled')) return 'anim-grow';
        if (el.classList.contains('js-slide-right-enabled')) return 'anim-slide-right';
        if (el.classList.contains('js-slide-left-enabled')) return 'anim-slide-left';
        if (el.classList.contains('js-slide-fast-enabled')) return 'anim-slide-fast';
        if (el.classList.contains('js-spin-enabled')) return 'anim-spin';
        if (el.classList.contains('js-fade-enabled')) return 'anim-fade';
        return null;
    }

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

    const elements = document.querySelectorAll('.anim-element');

    elements.forEach((el) => {
        const animationType = el.dataset.anim || 'fade-up';
        const delay = parseFloat(el.dataset.delay) || 0;

        // الـ fromTo states
        const fromVars = {};
        const toVars = {};

        switch (animationType) {
            case 'fade-up':
                Object.assign(fromVars, { opacity: 0, y: 50 });
                Object.assign(toVars, { opacity: 1, y: 0 });
                break;
            case 'slide-left':
                Object.assign(fromVars, { opacity: 0, x: 100 });
                Object.assign(toVars, { opacity: 1, x: 0 });
                break;
            case 'slide-right':
                Object.assign(fromVars, { opacity: 0, x: -100 });
                Object.assign(toVars, { opacity: 1, x: 0 });
                break;
            case 'fade-in':
                Object.assign(fromVars, { opacity: 0 });
                Object.assign(toVars, { opacity: 1 });
                break;
            case 'zoom-in':
                Object.assign(fromVars, { opacity: 0, scale: 0.8 });
                Object.assign(toVars, { opacity: 1, scale: 1 });
                break;

            case 'image-reveal':
                // حركة سريعة: تبدأ من 95% حجم وتكبر للـ 100% مع ظهور ناعم
                Object.assign(fromVars, { opacity: 0, scale: 0.95 });
                Object.assign(toVars, { opacity: 1, scale: 1 });
                break;
            case 'ethereal':
                // يبدأ بـ ضبابية واختفاء، وينتهي بوضوح كامل
                gsap.set(el, { filter: 'blur(10px)', opacity: 0 });
                Object.assign(fromVars, { filter: 'blur(10px)', opacity: 0 });
                Object.assign(toVars, { filter: 'blur(0px)', opacity: 1 });
                break;
            case 'powerful':
                gsap.set(el, { transformPerspective: 1000, rotationY: 45, brightness: 0, scale: 0.9 });

                Object.assign(fromVars, { rotationY: 45, brightness: 0, scale: 0.9 });
                Object.assign(toVars, { rotationY: 0, brightness: 1, scale: 1 });
                break;
            default:
                Object.assign(fromVars, { opacity: 0, y: 50 });
                Object.assign(toVars, { opacity: 1, y: 0 });
        }

        // ضع العنصر في الحالة الابتدائية فوراً
        gsap.set(el, fromVars);
        gsap.fromTo(el, fromVars, {
            ...toVars,
            duration: 1,
            ease: "power2.inOut",
            delay: delay,
            scrollTrigger: {
                trigger: el,
                start: "top 85%", // يبدأ لما يوصل لـ 85% من الشاشة
                end: "bottom 15%",   // التوقيت اللي بيبدأ عنده الـ reverse
                // play: لما يظهر
                // reverse: لما يختفي (يعكس الحركة)
                // play: لما ترجع تاني
                // reverse: لما تطلع خالص
                toggleActions: "play reverse play reverse",
                markers: false
            },
            onComplete: () => {
                const targetClass = getAnimClass(el);
                if (targetClass) el.classList.add(targetClass);
            },
            onReverseStart: () => {
                el.classList.remove(...animClasses);
            },
            onReverseComplete: () => {
                gsap.set(el, { clearProps: "transform, opacity" });
            }
        });
    });

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
            if (el.dataset.counterLoop !== undefined) return;

            const { scale } = expandUnitForCounter(el);
            let target = parseFloat(el.dataset.counter) * scale;
            let decimals = parseInt(el.dataset.decimals || "0", 10);
            if (scale > 1) decimals = 0;
            const duration = parseFloat(el.dataset.duration || "3.5");

            const finalFormattedText = formatNumber(target, decimals);

            // حطه في body عشان ميورثش أي opacity أو transform من الأب
            const clone = el.cloneNode(false);
            clone.style.cssText = `
            visibility: hidden;
            position: fixed;
            top: 0;
            left: 0;
            opacity: 1;
            transform: none;
            white-space: nowrap;
            width: auto;
            pointer-events: none;
            font-size: ${getComputedStyle(el).fontSize};
            font-family: ${getComputedStyle(el).fontFamily};
            font-weight: ${getComputedStyle(el).fontWeight};
            letter-spacing: ${getComputedStyle(el).letterSpacing};
        `;
            clone.textContent = finalFormattedText;
            document.body.appendChild(clone); // ← body مباشرة

            const finalWidth = clone.getBoundingClientRect().width;
            clone.remove();

            el.style.width = `${Math.ceil(finalWidth) + 1}px`;
            el.style.display = "inline-block";
            el.style.whiteSpace = "nowrap";

            // باقي كود الـ counter زي ما هو
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
                    const step = parseFloat(el.dataset.step || "1");
                    let val = proxy.value;


                    const progress = proxy.value / target;
                    let finalValue;

                    if (progress > 0.98) {
                        finalValue = target; // اعرض الرقم الأصلي (83014)
                    } else {
                        finalValue = Math.round(val / step) * step; // استمر في التقريب أثناء العد
                    }

                    el.textContent = formatNumber(finalValue, decimals);
                },
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
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

    /* ------ Banner stat — loop count + pulse (home hero number) -------- */
    function reserveCounterWidth(el, text) {
        const clone = el.cloneNode(false);
        clone.style.cssText = `
            visibility: hidden;
            position: fixed;
            top: 0;
            left: 0;
            opacity: 1;
            transform: none;
            white-space: nowrap;
            width: auto;
            pointer-events: none;
            font-size: ${getComputedStyle(el).fontSize};
            font-family: ${getComputedStyle(el).fontFamily};
            font-weight: ${getComputedStyle(el).fontWeight};
            letter-spacing: ${getComputedStyle(el).letterSpacing};
        `;
        clone.textContent = text;
        document.body.appendChild(clone);
        const finalWidth = clone.getBoundingClientRect().width;
        clone.remove();
        el.style.width = `${Math.ceil(finalWidth) + 1}px`;
        el.style.display = "inline-block";
        el.style.whiteSpace = "nowrap";
    }

    function initBannerStatCounterLoop() {
        const bannerNum = document.querySelector(".banner-stat__num");
        const pulseEl = bannerNum?.querySelector(".banner-stat__pulse");
        const el = pulseEl?.querySelector("[data-counter-loop]");
        if (!el || !pulseEl || !bannerNum) return;

        const target = parseFloat(el.dataset.counter);
        const decimals = 0;
        const countDuration = parseFloat(el.dataset.duration || "2.4");
        const finalText = formatNumber(target, decimals);
        const isLargeScreen = window.matchMedia("(min-width: 1440px)").matches;
        const peakScale = isLargeScreen ? 1.12 : 1.18;
        const growDuration = 1.6;

        reserveCounterWidth(el, finalText);

        if (reduceMotion || !ScrollTrigger) {
            el.textContent = finalText;
            return;
        }

        const proxy = { value: 0 };
        let loopStarted = false;
        let loopTl = null;

        const startLoop = () => {
            if (loopStarted) return;
            loopStarted = true;

            gsap.set(pulseEl, { scale: 1, transformOrigin: "center center" });

            loopTl = gsap.timeline({ repeat: -1, repeatDelay: 0.35 });

            loopTl.call(() => {
                proxy.value = 0;
                el.textContent = formatNumber(0, decimals);
            });

            loopTl.to(proxy, {
                value: target,
                duration: countDuration,
                ease: "power2.out",
                onUpdate: () => {
                    el.textContent = formatNumber(proxy.value, decimals);
                },
            });

            loopTl.to(
                pulseEl,
                { scale: peakScale, duration: growDuration, ease: "power2.out" },
                "+=0.15",
            );

            loopTl.to(pulseEl, { scale: peakScale, duration: 1.5 });

            loopTl.to(pulseEl, {
                scale: 1,
                duration: 0.55,
                ease: "power2.inOut",
            });
        };

        const triggerEl = document.querySelector(".banner-stat") || bannerNum;

        ScrollTrigger.create({
            trigger: triggerEl,
            start: "top 90%",
            once: true,
            onEnter: startLoop,
        });

        ScrollTrigger.refresh();
        requestAnimationFrame(() => {
            const rect = triggerEl.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
                startLoop();
            }
        });
    }

    document.fonts.ready.then(() => {
        initBannerStatCounterLoop();
        initKpiAchievementsImg();
    });

    /* ------ KPI achievements image — desktop height sync ---------------- */
    function initKpiAchievementsImg() {
        const section = document.getElementById("achievements");
        const anchor = section?.querySelector("[data-kpi-img-anchor]");
        const kpiImg = section?.querySelector(".kpi-img");
        const img = kpiImg?.querySelector("img");
        const desktopMq = window.matchMedia("(min-width: 981px)");

        if (!section || !anchor || !kpiImg || !img) return;

        const resetKpiImg = () => {
            kpiImg.style.top = "";
            kpiImg.style.height = "";
            kpiImg.style.width = "";
            img.style.height = "";
            img.style.width = "";
        };

        const syncKpiImg = () => {
            if (!desktopMq.matches) {
                resetKpiImg();
                return;
            }

            const sectionRect = section.getBoundingClientRect();
            const anchorRect = anchor.getBoundingClientRect();
            const top = Math.max(0, anchorRect.bottom - sectionRect.top);
            const height = sectionRect.height - top;

            if (height < 48) return;

            kpiImg.style.top = `${top}px`;
            kpiImg.style.bottom = "0";
            kpiImg.style.height = `${height}px`;
            kpiImg.style.width = "auto";

            img.style.height = "100%";
            img.style.width = "auto";
        };

        const scheduleSync = () => requestAnimationFrame(syncKpiImg);

        if (img.complete) scheduleSync();
        else img.addEventListener("load", scheduleSync, { once: true });

        window.addEventListener("resize", scheduleSync);

        if ("ResizeObserver" in window) {
            const ro = new ResizeObserver(scheduleSync);
            ro.observe(section);
            ro.observe(anchor);
        }

        desktopMq.addEventListener("change", scheduleSync);
        scheduleSync();
    }

    // إعادة تطبيق حالة الـ anim-element لاحقاً

});