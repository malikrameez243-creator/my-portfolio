/* ==========================================================================
   MALIK RAMEEZ — Cinematic Portfolio
   Vanilla JS · zero dependencies · performance-first
   ========================================================================== */

(() => {
  'use strict';

  /* ---------- 1. CUSTOM CURSOR --------------------------------------- */
  const cursor = document.getElementById('cursor');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  // Only enable on devices with fine pointer
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (cursor && canHover) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.classList.add('is-active');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));

    // Hover targets grow the ring
    document.querySelectorAll('a, button, [data-magnetic], [data-tilt]').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // Smooth lerp loop for buttery feel
    const tick = () => {
      cx += (mx - cx) * 0.2;
      cy += (my - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      requestAnimationFrame(tick);
    };
    tick();
  }

  /* ---------- 2. SCROLL PROGRESS BAR --------------------------------- */
  const progress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrolled = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    if (progress) progress.style.width = `${pct}%`;
  };

  /* ---------- 3. NAV: SCROLL STATE + HIDE/SHOW ----------------------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 50);
    // hide on scroll down, show on scroll up
    if (y > lastY && y > 200) nav.classList.add('is-hidden');
    else nav.classList.remove('is-hidden');
    lastY = y;
    updateProgress();
  };

  /* ---------- 4. ACTIVE NAV LINK ON SCROLL --------------------------- */
  const navLinks = document.querySelectorAll('.nav__link');
  const sections = [...document.querySelectorAll('section[id]')];
  const setActiveLink = () => {
    const y = window.scrollY + 200;
    let current = sections[0]?.id;
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    navLinks.forEach((l) => {
      const href = l.getAttribute('href')?.replace('#', '');
      l.classList.toggle('is-active', href === current);
    });
  };

  /* ---------- 5. MOBILE BURGER --------------------------------------- */
  const burger = document.getElementById('navBurger');
  const navLinksEl = document.getElementById('navLinks');
  if (burger && navLinksEl) {
    burger.addEventListener('click', () => {
      const open = navLinksEl.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    // Close on link click
    navLinksEl.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        navLinksEl.classList.remove('is-open');
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- 6. SMOOTH SCROLL --------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- 7. REVEAL ON SCROLL (IntersectionObserver) ------------- */
  const reveals = document.querySelectorAll('.reveal, .reveal-stagger, .service-card, .work-card, .about__media, .about__copy, .section__head');
  reveals.forEach((el) => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  reveals.forEach((el) => io.observe(el));

  /* ---------- 8. HERO HUD CLOCK -------------------------------------- */
  const hudTime = document.getElementById('hudTime');
  const pad = (n) => String(n).padStart(2, '0');
  const tickHud = () => {
    if (!hudTime) return;
    const d = new Date();
    hudTime.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };
  tickHud();
  setInterval(tickHud, 1000);

  /* ---------- 9. COUNTER ANIMATION (HERO STATS) ---------------------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const dur = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      // easeOutExpo for dramatic slowdown
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => counterIO.observe(c));

  /* ---------- 10. PORTFOLIO FILTER ----------------------------------- */
  const filters = document.querySelectorAll('.filter');
  const workCards = document.querySelectorAll('.work-card');
  filters.forEach((f) => {
    f.addEventListener('click', () => {
      filters.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      f.classList.add('is-active');
      f.setAttribute('aria-selected', 'true');

      const cat = f.dataset.filter;
      workCards.forEach((card) => {
        const match = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- 11. MAGNETIC BUTTONS ----------------------------------- */
  if (canHover) {
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      const strength = 0.25;
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 12. 3D TILT ON HOVER ----------------------------------- */
  if (canHover) {
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  /* ---------- 13. CONTACT FORM --------------------------------------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();
      const emailOK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      status.classList.remove('is-error');

      if (!name || !emailOK || !message) {
        status.textContent = '⚠ Please fill in your name, a valid email, and a message.';
        status.classList.add('is-error');
        return;
      }
      // Simulated send — replace with real endpoint (e.g. fetch('/api/contact', {...}))
      const btn = form.querySelector('button[type="submit"]');
      const label = btn.querySelector('.btn__label');
      const original = label.textContent;
      btn.disabled = true;
      label.textContent = 'Sending…';

      setTimeout(() => {
        status.textContent = '✓ Message sent. I\'ll be in touch within 24 hours.';
        form.reset();
        btn.disabled = false;
        label.textContent = original;
      }, 1200);
    });
  }

  /* ---------- 14. FOOTER YEAR ---------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- 15. PARALLAX ON HERO ----------------------------------- */
  const heroVideo = document.getElementById('heroVideo');
  const onParallax = () => {
    if (!heroVideo) return;
    const y = window.scrollY;
    if (y < window.innerHeight) {
      heroVideo.style.transform = `translateY(${y * 0.15}px) scale(${1 + y * 0.0003})`;
    }
  };

  /* ---------- 16. MASTER SCROLL HANDLER ------------------------------ */
  let ticking = false;
  const masterScroll = () => {
    onScroll();
    setActiveLink();
    onParallax();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(masterScroll);
      ticking = true;
    }
  }, { passive: true });
  masterScroll();

  /* ---------- 17. HERO ENTRANCE ON LOAD ------------------------------ */
  window.addEventListener('load', () => {
    document.body.classList.add('is-ready');
  });

})();
