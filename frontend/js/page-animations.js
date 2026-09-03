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

    let resizeTimer;

    const isAR = (document.documentElement.getAttribute("lang") || "ar")
        .toLowerCase()
        .startsWith("ar");
    const lang = isAR ? "ar" : "en";

    const labels = {
        ar: {
            more: "اقرأ المزيد",
            less: "عرض أقل"
        },
        en: {
            more: "Read more",
            less: "Show less"
        }
    };

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

    function initAnimations() {


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
                    markers: false,
                    invalidateOnRefresh: true,
                },
                onComplete: () => {
                    const targetClass = getAnimClass(el);
                    if (targetClass) el.classList.add(targetClass);
                },
                onReverseStart: () => {
                    el.classList.remove(...animClasses);
                },
                onReverseComplete: () => {
                    el.classList.remove(...animClasses);
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
    }

    initAnimations();

    // تشغيل عند تغيير حجم الشاشة (Resize)

    //read more btn
    document.querySelectorAll('.js-read-more-btn').forEach(btn => {


        // 2. ضبط النص الابتدائي
        btn.textContent = labels[lang].more;

        // 3. ربط الحدث
        btn.addEventListener('click', function () {
            // نستخدم previousElementSibling للوصول للحاوية التي تسبق الزر مباشرة
            const content = this.previousElementSibling;

            if (content && content.classList.contains('js-read-more-content')) {
                const isOpen = content.classList.contains('is-open');
                content.classList.toggle('is-open', !isOpen);
                ScrollTrigger.refresh();

                if (this.closest('.mobile-sec')) {
                    this.closest('.mobile-sec').classList.toggle('is-read-more-active', !isOpen);
                }

                // تغيير النص
                this.textContent = !isOpen
                    ? labels[lang].less
                    : labels[lang].more;

                setTimeout(() => {
                    ScrollTrigger.refresh();
                }, 500); // 500ms هي نفس مدة الـ transition في الـ CSS
            }
        });
    });
    /* ------ Target-vs-Achieved bracket SVGs — draw-on-scroll ----------- */
    // Each .pie-sec holds an SVG made of two right-angle "bracket" strokes
    // (outer = target / white, inner = achieved / #EEE9E9) plus the % value
    // rendered as fill-path glyphs. We draw the strokes like a progress line
    // (stroke-dashoffset 0), then float the number up once they land.
    function initBracketSvgDraw() {
        const svgs = document.querySelectorAll(".pie-sec svg");
        if (!svgs.length) return;

        svgs.forEach((svg, svgIndex) => {
            if (svg.dataset.drawInit === "1") return;
            svg.dataset.drawInit = "1";

            const paths = Array.from(svg.querySelectorAll("path"));
            // Stroke paths carry a `stroke`; the % glyphs are filled only.
            const strokes = paths.filter((p) => p.getAttribute("stroke"));
            const glyphs = paths.filter((p) => !p.getAttribute("stroke"));
            if (!strokes.length) return;

            const lengths = strokes.map((p) => {
                let len = 0;
                try {
                    len = p.getTotalLength();
                } catch (e) {
                    len = 0;
                }
                return len || 0;
            });

            // Final (rest) state used both for reduced-motion and as the
            // tween destination.
            const showFinal = () => {
                strokes.forEach((p) => {
                    p.style.strokeDasharray = "none";
                    p.style.strokeDashoffset = "0";
                });
                glyphs.forEach((g) => {
                    g.style.opacity = "1";
                    g.style.transform = "none";
                });
            };

            if (reduceMotion || !ScrollTrigger) {
                showFinal();
                return;
            }

            // Initial hidden state: strokes fully "undrawn", number lifted.
            strokes.forEach((p, i) => {
                const len = lengths[i];
                gsap.set(p, {
                    strokeDasharray: len,
                    strokeDashoffset: len,
                });
            });
            gsap.set(glyphs, {
                opacity: 0,
                yPercent: 18,
                transformOrigin: "center bottom",
            });

            // The two brackets race from a shared start. In this artwork the
            // gray (#EEE9E9) bracket carries the HIGHER value (e.g. 86) and
            // the white bracket the lower one (e.g. 80), so the gray stroke
            // draws FAST and the white stroke draws SLOW — 86 fills in ahead
            // of 80. Each chart also gets its own pace via a per-SVG speed
            // factor, and the whole draw lands at ~3s. The timeline then
            // loops every 5s while the graphic is on screen (paused/restarted
            // as you scroll past).
            const FAST_BASE = 1.7; // higher number — quicker
            const SLOW_BASE = 2.6; // lower number — slower
            const SPEED_FACTORS = [1.0, 0.85, 1.15, 0.95];
            const factor = SPEED_FACTORS[svgIndex % SPEED_FACTORS.length];
            const CYCLE = 5; // seconds between repeats

            // The white stroke sits next to the lower number; everything else
            // (the gray bracket) carries the higher number and draws faster.
            const isFast = (p) => {
                const s = (p.getAttribute("stroke") || "").toLowerCase();
                const isWhite =
                    s === "white" || s === "#fff" || s === "#ffffff";
                return !isWhite;
            };

            // yoyo: instead of snapping back to 0 and redrawing, each repeat
            // plays the draw in REVERSE (un-draws back to 0) and then forward
            // again — a smooth draw-in / draw-out loop that always starts
            // from 0. repeatDelay gives a short breath at the empty end.
            const tl = gsap.timeline({
                paused: true,
                repeat: -1,
                yoyo: true,
                repeatDelay: 0.4,
                defaults: { ease: "power2.out" },
            });

            // Both strokes start together (position 0) but finish at
            // different times because their durations differ.
            strokes.forEach((p) => {
                const dur = (isFast(p) ? FAST_BASE : SLOW_BASE) * factor;
                tl.to(p, { strokeDashoffset: 0, duration: dur }, 0);
            });

            // Numbers rise in just as the slower stroke is landing.
            const drawEnd = SLOW_BASE * factor;
            tl.to(
                glyphs,
                { opacity: 1, yPercent: 0, duration: 0.85, stagger: 0.12 },
                Math.max(0, drawEnd - 0.5),
            );

            // Hold the finished 80/86 on screen so each forward leg lasts
            // ~CYCLE (5s) before it reverses back down. With yoyo this hold
            // also plays at the top of the reverse leg, so the full value
            // lingers at the turnaround.
            tl.to({}, { duration: Math.max(0.3, CYCLE - tl.duration()) });

            // Loop only while visible; pause off-screen, restart on return.
            ScrollTrigger.create({
                trigger: svg,
                start: "top 85%",
                end: "bottom 15%",
                onEnter: () => tl.restart(true),
                onEnterBack: () => tl.restart(true),
                onLeave: () => tl.pause(),
                onLeaveBack: () => tl.pause(),
            });
        });
    }
    document.fonts.ready.then(initBracketSvgDraw);

    /* ------ Org structure chart — draw-on-scroll (reversible) ---------- */
    // The first-level org chart (.org-svg-chart, desktop only) is authored as
    // connector strokes + a stack of white <rect> boxes each followed by its
    // <text> caption(s). We:
    //   1. group every box with its caption(s) into a <g.org-node> so they
    //      scale/fade as one unit,
    //   2. draw the solid connector wires one by one with a steady pen,
    //   3. reveal each box at the exact moment its wire reaches it (so the
    //      line visibly travels to المخاطر, then المخاطر appears, and so on),
    //   4. fade the dashed relationship-lines in last.
    // The whole thing is one timeline that PLAYS on enter and REVERSES on
    // leave (either scroll direction) — fully reversible.
    function initOrgChartDraw() {
        const svg = document.querySelector(".org-svg-chart");
        if (!svg || svg.dataset.orgInit === "1") return;
        svg.dataset.orgInit = "1";

        const SVGNS = "http://www.w3.org/2000/svg";

        // Connector wires are the two top-level <g stroke="#fff"> groups:
        // the first is solid, the second carries stroke-dasharray (dashed).
        const wireGroups = Array.from(svg.querySelectorAll(":scope > g[stroke]"));
        const solidWires = wireGroups[0]
            ? Array.from(wireGroups[0].querySelectorAll("path"))
            : [];
        const dashedWires = wireGroups[1]
            ? Array.from(wireGroups[1].querySelectorAll("path"))
            : [];

        // Wrap each box (rect) plus its trailing caption text(s) and any icon
        // <path> into a node group. The SVG is authored rect, text…/icon-path,
        // rect, text…, so a single forward pass groups each box with its label
        // and icon — they fade/scale in as one unit. The connector <g> groups
        // come first and carry no rect, so they're left untouched.
        const nodes = [];
        let current = null;
        Array.from(svg.children).forEach((el) => {
            const tag = el.tagName.toLowerCase();
            if (tag === "rect") {
                const g = document.createElementNS(SVGNS, "g");
                g.setAttribute("class", "org-node");
                svg.insertBefore(g, el);
                g.appendChild(el);
                current = g;
                nodes.push(g);
            } else if ((tag === "text" || tag === "path") && current) {
                current.appendChild(el);
            }
        });
        if (!nodes.length) return;

        // Final (rest) state — also used verbatim for reduced motion.
        const showFinal = () => {
            [...solidWires, ...dashedWires].forEach((p) => {
                p.style.strokeDasharray = "";
                p.style.strokeDashoffset = "0";
                p.style.opacity = "1";
            });
            nodes.forEach((g) => {
                g.style.opacity = "1";
                g.style.transform = "none";
            });
        };

        if (reduceMotion || !ScrollTrigger) {
            showFinal();
            return;
        }

        // --- Geometry: measure every solid wire and sample points along it ---
        // We draw each wire with a STEADY pen (ease "none"), so the pen's
        // position is linear in time: a box that sits at fraction f along a
        // wire is reached at wireStart + f * WIRE_DUR. That lets us pop each
        // box at the exact instant the line arrives at it.
        const TIMING = { WIRE_DUR: 1.1, WIRE_GAP: 0.42, BOX_DUR: 0.7 };

        const wireInfo = solidWires.map((p) => {
            let len = 0;
            try {
                len = p.getTotalLength();
            } catch (e) {
                len = 0;
            }
            const samples = Math.max(2, Math.round(len / 5));
            const pts = [];
            for (let i = 0; i <= samples; i++) {
                let pt = { x: 0, y: 0 };
                try {
                    pt = p.getPointAtLength((len * i) / samples);
                } catch (e) { }
                pts.push(pt);
            }
            const minY = pts.reduce((m, pt) => Math.min(m, pt.y), Infinity);
            return { p, len, pts, minY };
        });

        // Draw order follows the org flow: highest wires (smallest y) first,
        // so the chart fills out from the board downward.
        wireInfo.sort((a, b) => a.minY - b.minY);
        wireInfo.forEach((w, i) => {
            w.start = i * TIMING.WIRE_GAP;
        });
        const drawEnd = wireInfo.length
            ? wireInfo[wireInfo.length - 1].start + TIMING.WIRE_DUR
            : 0;

        // Distance from a point to a box rect (0 if inside).
        const distToRect = (pt, r) => {
            const dx = Math.max(r.x - pt.x, 0, pt.x - (r.x + r.width));
            const dy = Math.max(r.y - pt.y, 0, pt.y - (r.y + r.height));
            return Math.hypot(dx, dy);
        };

        // For each box, find the wire (and the point along it) that comes
        // closest to the box — that's the line "arriving" at it. The box is
        // revealed at the moment the pen passes that point.
        nodes.forEach((g) => {
            const rect = g.querySelector("rect");
            const r = {
                x: parseFloat(rect.getAttribute("x")),
                y: parseFloat(rect.getAttribute("y")),
                width: parseFloat(rect.getAttribute("width")),
                height: parseFloat(rect.getAttribute("height")),
            };
            let best = { d: Infinity, time: 0 };
            wireInfo.forEach((w) => {
                const last = w.pts.length - 1 || 1;
                w.pts.forEach((pt, idx) => {
                    const d = distToRect(pt, r);
                    if (d < best.d) {
                        const f = idx / last;
                        best = { d, time: w.start + f * TIMING.WIRE_DUR };
                    }
                });
            });
            g.__revealAt = best.d < Infinity ? best.time : 0;
        });

        // Initial hidden state.
        wireInfo.forEach((w) => {
            gsap.set(w.p, {
                strokeDasharray: w.len,
                strokeDashoffset: w.len,
            });
        });
        gsap.set(dashedWires, { opacity: 0 });
        gsap.set(nodes, {
            opacity: 0,
            scale: 0.55,
            transformOrigin: "50% 50%",
        });

        // One reversible, slow timeline. Each wire draws at a steady pace, and
        // its destination box pops in the moment the line reaches it (line →
        // box → next line → box …). Dashed relationship-lines fade in last.
        // ScrollTrigger drives it via toggleActions so it plays on enter and
        // un-draws (reverse) on leave, in either scroll direction; attaching
        // the timeline also keeps the state correct if the chart is already in
        // view on load.
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: svg,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play reverse play reverse",
                invalidateOnRefresh: true,
            },
        });

        wireInfo.forEach((w) => {
            tl.to(
                w.p,
                { strokeDashoffset: 0, duration: TIMING.WIRE_DUR, ease: "none" },
                w.start,
            );
        });
        nodes.forEach((g) => {
            tl.to(
                g,
                {
                    opacity: 1,
                    scale: 1,
                    duration: TIMING.BOX_DUR,
                    ease: "expo.out",
                },
                g.__revealAt,
            );
        });
        tl.to(
            dashedWires,
            { opacity: 1, duration: 1.2, stagger: 0.4, ease: "power2.out" },
            Math.max(0, drawEnd - 0.4),
        );
    }
    document.fonts.ready.then(initOrgChartDraw);

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
            const duration = parseFloat(
                el.dataset.duration ||
                (el.closest(".budget-sec, .banner-section") ? "5" : "3.5")
            );

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

    function initCounterLoop({ el, pulseEl, triggerEl, staggerDelay = 0 }) {
        if (!el || !pulseEl || !triggerEl) return;

        const { scale } = expandUnitForCounter(el);
        const target = parseFloat(el.dataset.counter) * scale;
        let decimals = parseInt(el.dataset.decimals || "0", 10);
        if (scale > 1) decimals = 0;
        const step = parseFloat(el.dataset.step || "0");
        const countDuration = parseFloat(el.dataset.duration || "2.4");
        const finalText = formatNumber(target, decimals);
        const isLargeScreen = window.matchMedia("(min-width: 1440px)").matches;
        const peakScale = isLargeScreen ? 1.1 : 1.15;
        const growDuration = 1.6;

        reserveCounterWidth(el, finalText);

        if (reduceMotion || !ScrollTrigger) {
            el.textContent = finalText;
            return;
        }

        const proxy = { value: 0 };
        let loopStarted = false;

        const applyValue = (raw) => {
            let val = raw;
            if (step > 0 && target > 0) {
                const progress = raw / target;
                val = progress > 0.98 ? target : Math.round(raw / step) * step;
            }
            el.textContent = formatNumber(val, decimals);
        };

        const startLoop = () => {
            if (loopStarted) return;
            loopStarted = true;

            gsap.set(pulseEl, { scale: 1, transformOrigin: "center center" });

            const loopTl = gsap.timeline({
                repeat: -1,
                repeatDelay: 0.35,
                delay: staggerDelay,
            });

            loopTl.call(() => {
                proxy.value = 0;
                applyValue(0);
            });

            loopTl.to(proxy, {
                value: target,
                duration: countDuration,
                ease: "power2.out",
                onUpdate: () => applyValue(proxy.value),
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

        const maybeStart = () => {
            const rect = triggerEl.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                startLoop();
            }
        };

        ScrollTrigger.create({
            trigger: triggerEl,
            start: "top 95%",
            once: true,
            onEnter: startLoop,
        });

        ScrollTrigger.refresh();
        requestAnimationFrame(maybeStart);
    }

    function initBannerStatCounterLoop() {
        const bannerNum = document.querySelector(".banner-stat__num");
        const pulseEl = bannerNum?.querySelector(".banner-stat__pulse");
        const el = pulseEl?.querySelector("[data-counter-loop]");
        if (!el || !pulseEl) return;

        initCounterLoop({
            el,
            pulseEl,
            triggerEl: document.querySelector(".banner-stat") || bannerNum,
        });
    }

    function initHeroCounterLoops() {
        const heroCounter = document.querySelector(".hero-counter");
        if (!heroCounter) return;

        const triggerEl = document.querySelector(".new-hero") || heroCounter;

        heroCounter.querySelectorAll("[data-counter-loop]").forEach((el, index) => {
            const pulseEl = el.closest(".counter-title__pulse");
            if (!pulseEl) return;

            initCounterLoop({
                el,
                pulseEl,
                triggerEl,
                staggerDelay: index * 0.45,
            });
        });
    }

    /* ------ Every other counter on the page — loop count + pulse -------- */
    // Hero and banner-stat counters are wired above by their own dedicated
    // init functions (they use a purpose-built .counter-title__pulse /
    // .banner-stat__pulse wrapper for the scale animation). Every remaining
    // [data-counter-loop] on the page — the KPI card/bar values and the
    // smaller inline stat numbers in their description text — pulses the
    // counter element itself instead, so numbers keep moving (count up,
    // reset, count up again) rather than sitting still once scrolled into
    // view.
    function initRemainingCounterLoops() {
        document.querySelectorAll("[data-counter-loop]").forEach((el, index) => {
            if (el.closest(".hero-counter") || el.closest(".banner-stat__num")) return;

            initCounterLoop({
                el,
                pulseEl: el,
                triggerEl: el.closest(".kpi-card, .kpi-bar, .home-final-metric, .cta-strip") || el,
                staggerDelay: (index % 8) * 0.12,
            });
        });
    }

    document.fonts.ready.then(() => {
        initBannerStatCounterLoop();
        initHeroCounterLoops();
        initRemainingCounterLoops();
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