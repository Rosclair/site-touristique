document.addEventListener('DOMContentLoaded', () => {

  /* 1. Navbar — opaque & compact après 80px de scroll
  ------------------------------------------------------ */
  const navbar = document.querySelector('.navbar');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* 2. IntersectionObserver — déclenche .fade-in → .visible
  ----------------------------------------------------------- */
  const fadeEls = document.querySelectorAll('.fade-in');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => {
    if (el.dataset.delay) el.style.transitionDelay = el.dataset.delay;
    io.observe(el);
  });


  /* 3. Smooth scroll sur les ancres internes
  -------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* 4. Hamburger menu — mobile (<768px)
  --------------------------------------- */
  const burger  = document.querySelector('.navbar__hamburger');
  const navMenu = document.querySelector('.navbar__nav');

  if (burger && navMenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      navMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        navMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }


  /* 5. Lien actif dans la navbar
  -------------------------------- */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
