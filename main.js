document.addEventListener('DOMContentLoaded', () => {

  /* ═══════════════════════════════════════════════════════════
     1. PRELOADER
  ═══════════════════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');

  if (preloader) {
    if (sessionStorage.getItem('lc_visited')) {
      preloader.style.display = 'none';
    } else {
      sessionStorage.setItem('lc_visited', '1');
      document.body.style.overflow = 'hidden';

      const minDisplay = 1800;
      const startTime  = Date.now();

      function dismissPreloader() {
        preloader.classList.add('preloader--exit');
        preloader.addEventListener('transitionend', () => {
          preloader.style.display = 'none';
          document.body.style.overflow = '';
        }, { once: true });
      }

      window.addEventListener('load', () => {
        const elapsed   = Date.now() - startTime;
        const remaining = Math.max(0, minDisplay - elapsed);
        setTimeout(dismissPreloader, remaining);
      });

      /* Sécurité : 5 s max quoi qu'il arrive */
      setTimeout(() => {
        if (!preloader.classList.contains('preloader--exit')) dismissPreloader();
      }, 5000);
    }
  }


  /* ═══════════════════════════════════════════════════════════
     2. NAVBAR — SCROLL & COMPACTAGE
  ═══════════════════════════════════════════════════════════ */
  const navbar = document.querySelector('.navbar');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ═══════════════════════════════════════════════════════════
     3. MENU MOBILE — DRAWER DEPUIS LA DROITE
  ═══════════════════════════════════════════════════════════ */
  const burger   = document.querySelector('.navbar__hamburger');
  const navMenu  = document.querySelector('.navbar__nav');
  const closeBtn = document.querySelector('.navbar__close-btn');
  const closeItem = document.querySelector('.navbar__close-item');

  /* Injection du backdrop (fermé au clic sur l'extérieur) */
  const backdrop = document.createElement('div');
  backdrop.className = 'navbar__backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  navbar.insertAdjacentElement('afterend', backdrop);

  /* Injection du logo dans l'en-tête du drawer */
  if (closeItem && closeBtn) {
    const drawerLogo = document.createElement('span');
    drawerLogo.className = 'navbar__drawer-logo';
    drawerLogo.innerHTML = 'Le&nbsp;<em>Complexe</em>';
    closeItem.insertBefore(drawerLogo, closeBtn);
  }

  function openMenu() {
    burger.classList.add('open');
    navMenu.classList.add('open');
    backdrop.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Fermer le menu');
    document.body.style.overflow = 'hidden';
    if (closeBtn) {
      closeBtn.removeAttribute('tabindex');
      setTimeout(() => closeBtn.focus(), 50);
    }
  }

  function closeMenu() {
    burger.classList.remove('open');
    navMenu.classList.remove('open');
    backdrop.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.style.overflow = '';
    if (closeBtn) closeBtn.setAttribute('tabindex', '-1');
    burger.focus();
  }

  if (burger && navMenu) {
    if (closeBtn) closeBtn.setAttribute('tabindex', '-1');

    burger.addEventListener('click', () => {
      burger.classList.contains('open') ? closeMenu() : openMenu();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    /* Clic sur le backdrop = ferme */
    backdrop.addEventListener('click', closeMenu);

    /* Clic sur un lien de navigation = ferme */
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    /* Touche Échap */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
    });

    /* Focus trap dans le drawer ouvert */
    navMenu.addEventListener('keydown', e => {
      if (!navMenu.classList.contains('open') || e.key !== 'Tab') return;
      const focusable = [...navMenu.querySelectorAll('a, button:not([tabindex="-1"])')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     4. LIEN ACTIF DANS LA NAVBAR
  ═══════════════════════════════════════════════════════════ */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    link.classList.toggle('active', href === page || (page === '' && href === 'index.html'));
  });


  /* ═══════════════════════════════════════════════════════════
     5. SMOOTH SCROLL ANCRES
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* ═══════════════════════════════════════════════════════════
     6. INTERSECTION OBSERVER — ANIMATIONS AU SCROLL
  ═══════════════════════════════════════════════════════════ */
  const ANIM_SELECTOR = '.fade-in, .anim-left, .anim-right, .anim-zoom, .anim-scale';
  const animEls = document.querySelectorAll(ANIM_SELECTOR);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay;
      el.classList.add('visible');
      io.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animEls.forEach(el => io.observe(el));


  /* ═══════════════════════════════════════════════════════════
     7. COMPTEURS ANIMÉS
  ═══════════════════════════════════════════════════════════ */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const startTs  = performance.now();

    function tick(now) {
      const elapsed  = now - startTs;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + (progress === 1 ? suffix : '');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const counterEls = document.querySelectorAll('.counter[data-target]');
  if (counterEls.length) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterIO.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => counterIO.observe(el));
  }


  /* ═══════════════════════════════════════════════════════════
     8. EFFET RIPPLE SUR LES BOUTONS
  ═══════════════════════════════════════════════════════════ */
  function createRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left  - size / 2;
    const y    = e.clientY - rect.top   - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  document.querySelectorAll('.btn-reserve, .btn-outline-ivory').forEach(btn => {
    btn.addEventListener('click', createRipple);
  });


  /* ═══════════════════════════════════════════════════════════
     9. NAVBAR — OPACITÉ PROGRESSIVE AU SCROLL (Hero)
  ═══════════════════════════════════════════════════════════ */
  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    /* Rien de supplémentaire — le heroScale CSS gère l'animation d'entrée */
  }


  /* ═══════════════════════════════════════════════════════════
     11. FORMULAIRE RÉSERVATION — confirmation visuelle
  ═══════════════════════════════════════════════════════════ */
  const bookingForm = document.querySelector('.booking-form form');
  const formSuccess = document.querySelector('.form-success');

  if (bookingForm && formSuccess) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      bookingForm.style.display = 'none';
      formSuccess.classList.add('visible');
    });
  }


  /* ═══════════════════════════════════════════════════════════
     12. LIGHTBOX GALERIE
  ═══════════════════════════════════════════════════════════ */
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = lightbox?.querySelector('.lightbox__img');
  const lbCaption   = lightbox?.querySelector('.lightbox__caption');
  const lbCounter   = lightbox?.querySelector('.lightbox__counter');
  const lbClose     = lightbox?.querySelector('.lightbox__close');
  const lbPrev      = lightbox?.querySelector('.lightbox__btn--prev');
  const lbNext      = lightbox?.querySelector('.lightbox__btn--next');

  if (lightbox) {
    let items   = [];
    let current = 0;

    document.querySelectorAll('.gallery-masonry__item').forEach(item => {
      item.addEventListener('click', () => {
        items   = [...document.querySelectorAll('.gallery-masonry__item:not(.hidden)')];
        current = items.indexOf(item);
        showLightbox();
      });
    });

    function showLightbox() {
      const item = items[current];
      const img  = item.querySelector('img');
      const cap  = item.querySelector('.gallery-masonry__label');

      lbImg.classList.add('loading');
      lbImg.src = img.src.replace(/w=\d+/, 'w=1600');
      lbImg.onload = () => lbImg.classList.remove('loading');
      if (lbCaption && cap) lbCaption.textContent = cap.textContent;
      if (lbCounter)        lbCounter.textContent = `${current + 1} / ${items.length}`;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    lbClose?.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lbPrev?.addEventListener('click',  () => { current = (current - 1 + items.length) % items.length; showLightbox(); });
    lbNext?.addEventListener('click',  () => { current = (current + 1) % items.length;                showLightbox(); });

    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   { current = (current - 1 + items.length) % items.length; showLightbox(); }
      if (e.key === 'ArrowRight')  { current = (current + 1) % items.length;                showLightbox(); }
    });
  }


  /* ═══════════════════════════════════════════════════════════
     13. FILTRE GALERIE
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      document.querySelectorAll('.gallery-masonry__item').forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.classList.toggle('hidden', !show);
      });
    });
  });


  /* ═══════════════════════════════════════════════════════════
     14. ANIMATION IMAGE PROGRESSIVE (lazy load)
  ═══════════════════════════════════════════════════════════ */
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    img.classList.add('img-lazy');
    if (img.complete) {
      img.classList.add('img-loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('img-loaded'), { once: true });
    }
  });

});
