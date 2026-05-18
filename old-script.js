/* ============================================================
   MONGINIS FUTURISTIC — script.js
   All interactivity for the cyberpunk bakery website.

   FEATURES:
   1. Navbar scroll effect + hamburger menu
   2. Active nav link highlighting
   3. Menu filter tabs
   4. Scroll reveal animations
   5. Scroll-to-top button
   6. Contact form with validation
   7. Cart button feedback
   8. Animated number counters (stats bar)
   9. Typing effect in terminal (hero)
   ============================================================ */


/* ============================================================
   1. NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  hamburger.addEventListener('click', function () {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}


/* ============================================================
   2. ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {
    let current = '';

    sections.forEach(function (sec) {
      if (window.scrollY >= sec.offsetTop - 120) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach(function (link) {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = 'var(--neon)';
      }
    });
  });
}


/* ============================================================
   3. MENU FILTER TABS
   ============================================================ */
function initMenuFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cakeCards  = document.querySelectorAll('.cake-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cakeCards.forEach(function (card) {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          card.offsetHeight; // Reflow trick to restart animation
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}


/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.section-header, .review-card, .about-content, .about-visual, .contact-info, .contact-form-wrap'
  );

  elements.forEach(function (el) { el.classList.add('reveal'); });

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(function (el) {
    observer.observe(el);
  });
}


/* ============================================================
   5. SCROLL-TO-TOP BUTTON
   ============================================================ */
function initScrollTop() {
  const btn = document.getElementById('scrollTop');

  window.addEventListener('scroll', function () {
    btn.classList.toggle('visible', window.scrollY > 300);
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}


/* ============================================================
   6. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const submit  = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name  = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !phone) {
      alert('MISSING INPUT: Please fill in name and phone number.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      alert('INVALID INPUT: Please enter a valid 10-digit phone number.');
      return;
    }

    // Loading state on button
    const orig = submit.querySelector('span').textContent;
    submit.querySelector('span').textContent = 'PROCESSING...';
    submit.disabled = true;

    // Simulate 1.5s API call
    setTimeout(function () {
      submit.querySelector('span').textContent = orig;
      submit.disabled = false;
      success.style.display = 'block';
      form.reset();

      setTimeout(function () { success.style.display = 'none'; }, 5000);
    }, 1500);
  });
}


/* ============================================================
   7. ADD TO CART BUTTON FEEDBACK
   ============================================================ */
function initCartButtons() {
  document.querySelectorAll('.card-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const orig = btn.textContent;
      btn.textContent = '✓ ADDED';
      btn.style.background = 'var(--neon)';
      btn.style.color = '#000';
      btn.disabled = true;

      setTimeout(function () {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
      }, 2000);
    });
  });
}


/* ============================================================
   8. ANIMATED NUMBER COUNTERS
   Counts up from 0 when stats bar scrolls into view
   ============================================================ */
function initCounters() {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  let triggered  = false;

  function animateNum(el, target, duration) {
    let current  = 0;
    const step   = target / (duration / 16);
    const timer  = setInterval(function () {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.round(current);
    }, 16);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          statNums.forEach(function (el) {
            animateNum(el, parseInt(el.getAttribute('data-target')), 1800);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);
}


/* ============================================================
   9. TERMINAL TYPING EFFECT
   Gradually reveals lines in the hero terminal card
   ============================================================ */
function initTerminalEffect() {
  const terminal = document.querySelector('.hero-terminal');
  if (!terminal) return;

  const lines = terminal.querySelectorAll('.t-line');

  // Hide all lines initially
  lines.forEach(function (line) { line.style.opacity = '0'; });

  // Reveal them one by one with a delay
  lines.forEach(function (line, i) {
    setTimeout(function () {
      line.style.transition = 'opacity 0.3s ease';
      line.style.opacity = '1';
    }, i * 350 + 800); // Start after 0.8s, stagger by 350ms each
  });
}


/* ============================================================
   10. CARD HOVER SCAN LINE EFFECT
   Adds a moving scan line effect on card hover (CSS handles
   the animation, but we can reinitialize it per hover)
   ============================================================ */
function initCardEffects() {
  document.querySelectorAll('.cake-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      const scanLine = card.querySelector('.card-scan-line');
      if (scanLine) {
        scanLine.style.animation = 'none';
        scanLine.offsetHeight; // reflow
        scanLine.style.animation = '';
      }
    });
  });
}


/* ============================================================
   INIT — Run all on page load
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initActiveLinks();
  initMenuFilters();
  initScrollReveal();
  initScrollTop();
  initContactForm();
  initCartButtons();
  initCounters();
  initTerminalEffect();
  initCardEffects();

  console.log('[MONGINIS_OS v2.0] System boot complete ✓');
});
