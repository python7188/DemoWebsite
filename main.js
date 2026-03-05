/**
 * TajHotel — main.js v2
 * Premium progressive-enhanced interactivity
 */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const dbc = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ── LOADER ─────────────────────────────────────── */
  const loader = $('#loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 800);
    });
  }

  /* ── SCROLL PROGRESS ─────────────────────────────── */
  const prog = $('#scroll-progress');
  if (prog) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      prog.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── NAVBAR ──────────────────────────────────────── */
  const navbar = $('#navbar');
  if (navbar) {
    const onScroll = dbc(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, 8);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── MOBILE NAV ──────────────────────────────────── */
  const burger = $('.hamburger');
  const mNav = $('.mobile-nav');
  const mClose = $('.mobile-nav-close');
  if (burger && mNav) {
    const open = () => { mNav.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; mClose?.focus(); };
    const close = () => { mNav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; burger.focus(); };
    burger.addEventListener('click', open);
    mClose?.addEventListener('click', close);
    mNav.addEventListener('click', e => { if (e.target === mNav) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && mNav.classList.contains('open')) close(); });
    $$('a,button', mNav).forEach(el => el !== mClose && el.addEventListener('click', close));
  }

  /* ── HERO PARALLAX ───────────────────────────────── */
  const heroPar = $('.hero-parallax');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (heroPar && !reducedMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          heroPar.style.transform = `translateY(${window.scrollY * 0.3}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ── SCROLL REVEAL ────────────────────────────────── */
  const revEls = $$('.reveal');
  if (revEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = e.target.dataset.delay || 0;
          setTimeout(() => e.target.classList.add('in'), +delay);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    revEls.forEach((el, i) => { el.dataset.delay = el.dataset.delay || i * 55; io.observe(el); });
  } else { revEls.forEach(el => el.classList.add('in')); }

  /* ── LIGHTBOX ─────────────────────────────────────── */
  let lbImgs = [], lbIdx = 0;
  const lb = $('#lightbox');
  const lbImg = $('#lb-img');
  const lbCap = $('#lb-caption');
  const lbClose = $('#lb-close');
  const lbPrev = $('#lb-prev');
  const lbNext = $('#lb-next');

  function showLb(imgs, idx) { lbImgs = imgs; lbIdx = idx; lb?.classList.add('open'); lb?.removeAttribute('hidden'); document.body.style.overflow = 'hidden'; renderLb(); lbClose?.focus(); }
  function hideLb() { lb?.classList.remove('open'); lb?.setAttribute('hidden', ''); document.body.style.overflow = ''; }
  function renderLb() {
    if (!lbImg || !lbImgs[lbIdx]) return;
    lbImg.src = lbImgs[lbIdx].src; lbImg.alt = lbImgs[lbIdx].alt || '';
    if (lbCap) lbCap.textContent = lbImgs[lbIdx].caption || '';
    if (lbPrev) lbPrev.disabled = lbIdx === 0;
    if (lbNext) lbNext.disabled = lbIdx === lbImgs.length - 1;
  }
  lbClose?.addEventListener('click', hideLb);
  lbPrev?.addEventListener('click', () => { if (lbIdx > 0) { lbIdx--; renderLb(); } });
  lbNext?.addEventListener('click', () => { if (lbIdx < lbImgs.length - 1) { lbIdx++; renderLb(); } });
  lb?.addEventListener('click', e => { if (e.target === lb) hideLb(); });
  document.addEventListener('keydown', e => {
    if (!lb?.classList.contains('open')) return;
    if (e.key === 'Escape') hideLb();
    if (e.key === 'ArrowLeft' && lbIdx > 0) { lbIdx--; renderLb(); }
    if (e.key === 'ArrowRight' && lbIdx < lbImgs.length - 1) { lbIdx++; renderLb(); }
  });

  // Wire gallery items
  const gallItems = $$('.gallery-item[data-lb-src]');
  if (gallItems.length) {
    const imgs = gallItems.map(el => ({ src: el.dataset.lbSrc, alt: el.dataset.lbAlt || '', caption: el.dataset.lbCaption || '' }));
    gallItems.forEach((el, i) => {
      el.addEventListener('click', () => showLb(imgs, i));
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showLb(imgs, i); } });
    });
  }
  const carouselLbItems = $$('.carousel-lb[data-lb-src]');
  if (carouselLbItems.length) {
    const imgs = carouselLbItems.map(el => ({ src: el.dataset.lbSrc, alt: el.dataset.lbAlt || '', caption: el.dataset.lbCaption || '' }));
    carouselLbItems.forEach((el, i) => { el.addEventListener('click', () => showLb(imgs, i)); });
  }

  /* ── RESERVE MODAL ────────────────────────────────── */
  const resOvl = $('#reserve-overlay');
  function openRes() { resOvl?.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function closeRes() { resOvl?.classList.remove('open'); document.body.style.overflow = ''; }
  $$('[data-reserve]').forEach(el => el.addEventListener('click', openRes));
  $('#reserve-overlay .modal-x')?.addEventListener('click', closeRes);
  resOvl?.addEventListener('click', e => { if (e.target === resOvl) closeRes(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && resOvl?.classList.contains('open')) closeRes(); });

  /* ── CONFIRM MODAL ────────────────────────────────── */
  const confOvl = $('#confirm-overlay');
  function closeConf() { confOvl?.classList.remove('open'); document.body.style.overflow = ''; }
  $('#confirm-overlay .modal-x')?.addEventListener('click', closeConf);
  confOvl?.addEventListener('click', e => { if (e.target === confOvl) closeConf(); });

  /* ── FORM VALIDATION ──────────────────────────────── */
  function validateForm(form) {
    let ok = true;
    $$('[required]', form).forEach(f => {
      const g = f.closest('.form-group');
      if (!f.value.trim()) { g?.classList.add('err'); ok = false; }
      else g?.classList.remove('err');
    });
    const em = form.querySelector('[type="email"]');
    if (em && em.value && !/\S+@\S+\.\S+/.test(em.value)) {
      em.closest('.form-group')?.classList.add('err'); ok = false;
    }
    return ok;
  }

  const resFormMain = $('#reservation-form');
  if (resFormMain) {
    resFormMain.addEventListener('submit', e => {
      e.preventDefault();
      if (!validateForm(resFormMain)) return;
      const v = Object.fromEntries(new FormData(resFormMain).entries());
      // Populate confirm modal
      const fill = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
      fill('conf-name', v.fullName);
      fill('conf-date', v.date);
      fill('conf-time', v.time);
      fill('conf-party', v.partySize ? v.partySize + ' guest(s)' : '—');
      confOvl?.classList.add('open');
      document.body.style.overflow = 'hidden';
      const liveReg = $('#live-region');
      if (liveReg) liveReg.textContent = 'Your reservation has been submitted.';
      resFormMain.reset();
    });
  }

  /* ── ICS DOWNLOAD ─────────────────────────────────── */
  $('#conf-ics')?.addEventListener('click', e => {
    const raw = e.currentTarget.dataset.booking || '{}';
    let v = {}; try { v = JSON.parse(raw); } catch (_) { }
    const ds = (v.date || '').replace(/-/g, '');
    const ts = (v.time || '20:00').replace(':', '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TajHotel//EN', 'BEGIN:VEVENT',
      `DTSTART:${ds}T${ts}00`, `DTEND:${ds}T${ts}00`,
      `SUMMARY:Dinner at TajHotel Delhi`,
      `LOCATION:TajHotel, Connaught Place, New Delhi, India`,
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'tajhotel-reservation.ics'; a.click();
  });

  /* ── MENU PAGE ────────────────────────────────────── */
  const menuSearch = $('#menu-search');
  const catBtns = $$('.cat-btn[data-cat]');
  const menuItems = $$('.menu-item-card[data-name]');
  const noRes = $('#menu-no-results');
  let activeCat = 'all';
  let searchQ = '';

  function filterMenu() {
    let vis = 0;
    menuItems.forEach(card => {
      const name = (card.dataset.name || '').toLowerCase();
      const cat = (card.dataset.cat || '');
      const matchQ = !searchQ || name.includes(searchQ);
      const matchC = activeCat === 'all' || cat === activeCat;
      const show = matchQ && matchC;
      card.style.display = show ? '' : 'none';
      if (show) vis++;
    });
    if (noRes) noRes.style.display = vis === 0 ? '' : 'none';
    // hide empty sections
    $$('.menu-section').forEach(sec => {
      const visible = $$('.menu-item-card', sec).some(c => c.style.display !== 'none');
      sec.style.display = visible ? '' : 'none';
    });
  }

  if (menuSearch) {
    menuSearch.addEventListener('input', dbc(() => { searchQ = menuSearch.value.trim().toLowerCase(); filterMenu(); }, 200));
  }
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      filterMenu();
    });
  });

  /* ── ACTIVE NAV ───────────────────────────────────── */
  const pg = (location.pathname.split('/').pop() || 'index.html');
  $$('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === pg || (pg === '' && href === 'index.html')) a.setAttribute('aria-current', 'page');
  });

  /* ── STAR RATINGS ─────────────────────────────────── */
  $$('.star-rating').forEach(widget => {
    const stars = $$('button', widget);
    let cur = parseInt(widget.dataset.rating || '5', 10);
    const upd = v => { cur = v; stars.forEach((s, i) => { s.textContent = i < v ? '★' : '☆'; s.setAttribute('aria-pressed', i < v ? 'true' : 'false'); }); };
    upd(cur);
    stars.forEach((s, i) => {
      s.addEventListener('click', () => upd(i + 1));
      s.addEventListener('mouseover', () => stars.forEach((ss, ii) => ss.textContent = ii <= i ? '★' : '☆'));
      s.addEventListener('mouseout', () => upd(cur));
    });
  });

  /* ── SMOOTH PAGE TRANSITIONS ─────────────────────── */
  if (!reducedMotion) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a || !a.href || a.target || a.href.startsWith('#') || a.href.includes('mailto') || a.href.includes('tel')) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin) return;
      e.preventDefault();
      document.body.style.transition = 'opacity .25s ease';
      document.body.style.opacity = '0';
      setTimeout(() => { location.href = a.href; }, 260);
    });
    // Fade in on load
    document.body.style.opacity = '0';
    window.addEventListener('load', () => {
      document.body.style.transition = 'opacity .45s ease';
      document.body.style.opacity = '1';
    });
  }

})();
