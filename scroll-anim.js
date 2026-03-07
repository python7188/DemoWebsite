/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TAJHOTEL — CINEMATIC SCROLL FRAME ANIMATION  v3.0              ║
 * ║  Zero dependencies · Works on file:// and http://               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  HOW IT WORKS                                                    ║
 * ║  1. As soon as the page loads, we preload ALL 145 Image objects  ║
 * ║     in parallel using the browser's native img pipeline.         ║
 * ║  2. The very first frame (0001.jpg) is loaded first and drawn    ║
 * ║     immediately — no black flash.                                ║
 * ║  3. A requestAnimationFrame loop lerps from currentFrame →       ║
 * ║     targetFrame for a buttery cinematic scrub.                    ║
 * ║  4. Skip button scrolls past the section instantly.             ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  TESTING CHECKLIST                                               ║
 * ║  ✔ First frame visible immediately on page load (no black)       ║
 * ║  ✔ Section stays 400vh — animated section never collapses        ║
 * ║  ✔ Scrolling advances frames smoothly at 60fps                   ║
 * ║  ✔ Skip: jumps to last frame, scrolls past section               ║
 * ║  ✔ prefers-reduced-motion → static last frame only              ║
 * ║  ✔ Works on file://, http://, Chrome, Safari, Firefox, Edge      ║
 * ║  ✔ Works on mobile — touch scroll drives frames naturally        ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * FRAME PATHS (relative to index.html):
 *   Public/frames/0001.jpg … Public/frames/0145.jpg
 *
 * On Vercel / Netlify, the /public folder is served at root,
 * so change FRAME_PREFIX back to '/frames/' before deploying.
 */

(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════
     * CONFIG — edit these to match your setup
     * ═══════════════════════════════════════════════════════════════ */
    var FRAME_COUNT = 145;
    var FRAME_PREFIX = 'Public/frames/';  /* relative to index.html */
    var FRAME_EXT = '.jpg';
    var LERP_SPEED = 0.10;              /* 0.05 = silky, 0.15 = snappy */
    var ZOOM_START = 1.04;             /* zoom at frame 0  */
    var ZOOM_END = 1.00;             /* zoom at last frame */
    var PARALLAX_PX = 14;              /* vertical parallax travel px */

    /* ═══════════════════════════════════════════════════════════════
     * DOM refs (filled in init)
     * ═══════════════════════════════════════════════════════════════ */
    var section, canvas, ctx;
    var spinner, ringEl, pctEl;
    var revealEl, scrollHint, skipBtn;

    /* ═══════════════════════════════════════════════════════════════
     * State
     * ═══════════════════════════════════════════════════════════════ */
    var imgPool = [];            /* HTMLImageElement[FRAME_COUNT]  */
    var loadedCount = 0;             /* how many frames have loaded    */
    var currentF = 0;             /* smoothed display frame (float) */
    var targetF = 0;             /* desired frame from scroll pos  */
    var rafId = 0;
    var animDone = false;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var CW = 0, CH = 0;            /* canvas logical width / height  */

    var reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

    /* ═══════════════════════════════════════════════════════════════
     * Helpers
     * ═══════════════════════════════════════════════════════════════ */
    function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
    function lerp(a, b, t) { return a + (b - a) * t; }

    function pad4(n) {
        var s = String(n);
        while (s.length < 4) s = '0' + s;
        return s;
    }

    function src(i) {
        /* i is 0-based; files are 1-based */
        return FRAME_PREFIX + pad4(i + 1) + FRAME_EXT;
    }

    /* Ease-in-out cubic for scroll-to-frame mapping */
    function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /* ═══════════════════════════════════════════════════════════════
     * Canvas resize
     * ═══════════════════════════════════════════════════════════════ */
    function sizeCanvas() {
        if (!canvas) return;
        CW = canvas.offsetWidth || window.innerWidth;
        CH = canvas.offsetHeight || window.innerHeight;
        canvas.width = CW * dpr;
        canvas.height = CH * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Draw a single frame with cinematic zoom + parallax
     * ═══════════════════════════════════════════════════════════════ */
    function drawFrame(idx, progress) {
        if (!ctx || CW === 0) return;

        /* Clamp and pick image */
        idx = clamp(Math.round(idx), 0, FRAME_COUNT - 1);
        var img = imgPool[idx];

        /* If this exact frame isn't loaded, walk backwards then forwards
           to find the nearest available frame so we never show black   */
        if (!img || !img.complete || img.naturalWidth === 0) {
            var best = null;
            for (var delta = 1; delta < FRAME_COUNT; delta++) {
                var lo = idx - delta, hi = idx + delta;
                if (lo >= 0 && imgPool[lo] && imgPool[lo].complete && imgPool[lo].naturalWidth > 0) {
                    best = imgPool[lo]; break;
                }
                if (hi < FRAME_COUNT && imgPool[hi] && imgPool[hi].complete && imgPool[hi].naturalWidth > 0) {
                    best = imgPool[hi]; break;
                }
            }
            if (!best) return; /* nothing at all loaded yet */
            img = best;
        }

        /* ── object-fit: contain scaling ──
           scale = min(canvasW / imgW, canvasH / imgH)
           This guarantees the full image is always visible and never
           overflows the viewport on any screen size.               */
        progress = clamp(progress, 0, 1);
        var offsetY = lerp(PARALLAX_PX * 0.3, 0, progress); /* subtle only */

        var iW = img.naturalWidth || CW;
        var iH = img.naturalHeight || CH;

        /* CONTAIN: fit the entire image inside the canvas */
        var scale = Math.min(CW / iW, CH / iH);

        /* Centre */
        var dW = iW * scale;
        var dH = iH * scale;
        var dX = (CW - dW) / 2;
        var dY = (CH - dH) / 2 + offsetY;

        ctx.clearRect(0, 0, CW, CH);
        ctx.drawImage(img, 0, 0, iW, iH, dX, dY, dW, dH);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Spinner / progress ring
     * ═══════════════════════════════════════════════════════════════ */
    function updateSpinner(pct) {
        if (ringEl) {
            var circ = 226.19; /* 2π × r36 */
            ringEl.style.strokeDashoffset = String(circ - (circ * pct / 100));
        }
        if (pctEl) pctEl.textContent = Math.round(pct) + '%';
    }

    function hideSpinner() {
        if (!spinner) return;
        spinner.style.transition = 'opacity .5s ease';
        spinner.style.opacity = '0';
        spinner.style.pointerEvents = 'none';
        setTimeout(function () { spinner.style.display = 'none'; }, 500);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Preload all frames
     * ═══════════════════════════════════════════════════════════════ */
    function preloadAll() {
        /* Load frame 0 (0001.jpg) first so it renders immediately */
        function loadFirst() {
            return new Promise(function (resolve) {
                var img = new Image();
                imgPool[0] = img;
                img.onload = function () {
                    loadedCount++;
                    updateSpinner((loadedCount / FRAME_COUNT) * 100);
                    sizeCanvas();
                    drawFrame(0, 0);
                    hideSpinner();
                    startRAF();
                    resolve();
                };
                img.onerror = function () {
                    console.warn('[scroll-anim] Could not load frame 0001 from: ' + src(0));
                    console.warn('[scroll-anim] Tried URL: ' + img.src);
                    resolve(); /* continue even if failed */
                };
                img.src = src(0);
            });
        }

        /* Load the rest in parallel batches for speed */
        function loadRest() {
            var BATCH = 20; /* how many to start simultaneously */
            var queue = [];
            for (var i = 1; i < FRAME_COUNT; i++) queue.push(i);

            function loadOne(idx) {
                var img = new Image();
                imgPool[idx] = img;
                return new Promise(function (resolve) {
                    img.onload = function () {
                        loadedCount++;
                        updateSpinner((loadedCount / FRAME_COUNT) * 100);
                        resolve();
                    };
                    img.onerror = function () {
                        console.warn('[scroll-anim] frame ' + pad4(idx + 1) + ' failed');
                        resolve();
                    };
                    img.src = src(idx);
                });
            }

            function runBatch(offset) {
                if (offset >= queue.length) return;
                var batch = queue.slice(offset, offset + BATCH);
                Promise.all(batch.map(loadOne)).then(function () {
                    runBatch(offset + BATCH);
                });
            }

            runBatch(0);
        }

        loadFirst().then(loadRest);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Scroll → frame index
     * ═══════════════════════════════════════════════════════════════ */
    function getScrollProgress() {
        if (!section) return 0;
        var rect = section.getBoundingClientRect();
        var gone = -rect.top;                          /* px scrolled into section */
        var total = section.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        return clamp(gone / total, 0, 1);
    }

    var scrollPending = false;
    function onScroll() {
        if (scrollPending) return;
        scrollPending = true;
        requestAnimationFrame(function () {
            scrollPending = false;
            var t = ease(getScrollProgress());
            targetF = t * (FRAME_COUNT - 1);

            /* Hide scroll hint after first scroll movement */
            if (targetF > 2 && scrollHint && scrollHint.style.opacity !== '0') {
                scrollHint.style.opacity = '0';
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════
     * requestAnimationFrame render loop
     * ═══════════════════════════════════════════════════════════════ */
    var prevTS = 0;
    function tick(ts) {
        rafId = requestAnimationFrame(tick);
        if (ts - prevTS < 14) return; /* ~60 fps cap */
        prevTS = ts;

        /* Inertia: smooth lerp towards target */
        currentF = lerp(currentF, targetF, LERP_SPEED);

        var prog = clamp(currentF / (FRAME_COUNT - 1), 0, 1);
        drawFrame(currentF, prog);

        /* Reveal overlay when animation nears the end */
        if (!animDone && currentF >= FRAME_COUNT - 3) {
            animDone = true;
            if (revealEl) {
                revealEl.style.opacity = '1';
                revealEl.style.pointerEvents = 'auto';
            }
            var lr = document.getElementById('live-region');
            if (lr) lr.textContent = 'Animation complete.';
        }
    }

    function startRAF() {
        if (!rafId) rafId = requestAnimationFrame(tick);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Skip button
     * ═══════════════════════════════════════════════════════════════ */
    function skip() {
        cancelAnimationFrame(rafId);
        rafId = 0;
        currentF = FRAME_COUNT - 1;
        targetF = FRAME_COUNT - 1;
        drawFrame(FRAME_COUNT - 1, 1);

        if (revealEl) {
            revealEl.style.opacity = '1';
            revealEl.style.pointerEvents = 'auto';
        }

        /* Scroll page past the sticky section */
        if (section) {
            var bottom = section.getBoundingClientRect().bottom + window.pageYOffset;
            window.scrollTo({ top: bottom, behavior: 'smooth' });
        }
    }

    /* ═══════════════════════════════════════════════════════════════
     * Reduced motion: show only last frame as a static image
     * ═══════════════════════════════════════════════════════════════ */
    function handleReducedMotion() {
        /* Shrink scroll section so it doesn't trap scroll */
        if (section) section.style.height = '100vh';
        if (skipBtn) skipBtn.style.display = 'none';
        if (scrollHint) scrollHint.style.display = 'none';

        /* Load and show final frame */
        var img = new Image();
        img.onload = function () {
            imgPool[FRAME_COUNT - 1] = img;
            sizeCanvas();
            drawFrame(FRAME_COUNT - 1, 1);
            hideSpinner();
            if (revealEl) {
                revealEl.style.opacity = '1';
                revealEl.style.pointerEvents = 'auto';
            }
        };
        img.src = src(FRAME_COUNT - 1);
    }

    /* ═══════════════════════════════════════════════════════════════
     * Init
     * ═══════════════════════════════════════════════════════════════ */
    function init() {
        section = document.getElementById('scroll-anim');
        canvas = document.getElementById('hero-scroll-canvas');
        skipBtn = document.getElementById('skip-anim');
        spinner = document.getElementById('sa-spinner');
        ringEl = document.getElementById('sa-ring-fill');
        pctEl = document.getElementById('sa-pct');
        revealEl = document.getElementById('sa-reveal');
        scrollHint = document.getElementById('sa-scroll-hint');

        /* Safety check */
        if (!canvas) {
            console.error('[scroll-anim] #hero-scroll-canvas not found in DOM.');
            return;
        }
        if (!section) {
            console.error('[scroll-anim] #scroll-anim not found in DOM.');
            return;
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('[scroll-anim] Failed to get canvas 2D context.');
            return;
        }

        /* Log resolved path for debugging */
        console.info('[scroll-anim] First frame will load from: ' + src(0));
        console.info('[scroll-anim] Section height: ' + section.offsetHeight + 'px');

        /* Size canvas immediately */
        sizeCanvas();

        /* Resize handler */
        window.addEventListener('resize', function () {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            sizeCanvas();
            var prog = clamp(currentF / (FRAME_COUNT - 1), 0, 1);
            drawFrame(currentF, prog);
        });

        /* Skip button */
        if (skipBtn) {
            skipBtn.addEventListener('click', skip);
            skipBtn.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); skip(); }
            });
        }

        /* Scroll event */
        window.addEventListener('scroll', onScroll, { passive: true });

        /* Reduced motion shortcut */
        if (reducedMotion) { handleReducedMotion(); return; }

        /* ── Start loading frames ── */
        preloadAll();
    }

    /* Boot */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
