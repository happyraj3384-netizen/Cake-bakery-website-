/* ============================================================
   MONGINIS BAKERY — script.js
   All the interactivity for the website.

   TABLE OF CONTENTS:
   1. Navbar: scroll shadow + hamburger menu toggle
   2. Smooth active link highlighting
   3. Menu filter tabs
   4. Scroll reveal animations
   5. Scroll-to-top button
   6. Contact form submission
   7. "Add to Cart" button feedback
   8. Init: run everything on page load
   ============================================================ */


/* ============================================================
   1. NAVBAR SCROLL SHADOW
   Adds a shadow to navbar when user scrolls down
   ============================================================ */
function initNavbar() {

  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  /* --- Scroll shadow --- */
  window.addEventListener('scroll', function () {

    // Add "scrolled" class when user goes past 20px
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

  });

  /* --- Hamburger menu toggle (mobile) --- */
  hamburger.addEventListener('click', function () {

    // Toggle open/close state
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');

  });

  /* --- Close menu when a link is clicked --- */
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

}


/* ============================================================
   2. ACTIVE NAV LINK HIGHLIGHT
   Highlights the nav link for the section currently in view
   ============================================================ */
function initActiveLinks() {

  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {

    let currentSection = '';

    // Check which section is currently visible
    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;  // 100px offset for navbar height
      if (window.scrollY >= sectionTop) {
        currentSection = section.getAttribute('id');
      }
    });

    // Add "active" style to matching nav link
    navItems.forEach(function (link) {
      link.style.color = '';  // Reset all to default
      if (link.getAttribute('href') === '#' + currentSection) {
        link.style.color = 'var(--pink-mid)';  // Highlight current
      }
    });

  });

}


/* ============================================================
   3. MENU FILTER TABS
   Shows/hides cake cards based on selected category
   ============================================================ */
function initMenuFilters() {

  const filterBtns = document.querySelectorAll('.filter-btn');
  const cakeCards  = document.querySelectorAll('.cake-card');

  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {

      // --- Update active button state ---
      filterBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');

      const selectedFilter = btn.getAttribute('data-filter');

      // --- Show or hide cards based on filter ---
      cakeCards.forEach(function (card) {
        const cardCategory = card.getAttribute('data-category');

        if (selectedFilter === 'all' || cardCategory === selectedFilter) {
          // Show this card
          card.classList.remove('hidden');
          // Re-trigger entrance animation
          card.style.animation = 'none';
          card.offsetHeight;  // Force browser to register the reset (reflow trick)
          card.style.animation = '';
        } else {
          // Hide this card
          card.classList.add('hidden');
        }
      });

    });
  });

}


/* ============================================================
   4. SCROLL REVEAL ANIMATIONS
   Elements fade in as they enter the viewport
   ============================================================ */
function initScrollReveal() {

  // Add "reveal" class to elements we want to animate
  const elementsToReveal = document.querySelectorAll(
    '.section-header, .cake-card, .review-card, .about-content, .about-visual, .contact-info, .contact-form-wrap, .stat-item'
  );

  elementsToReveal.forEach(function (el) {
    el.classList.add('reveal');
  });

  // Create an IntersectionObserver — it watches when elements enter the screen
  const observer = new IntersectionObserver(

    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Element is visible — add "visible" class to animate it in
          entry.target.classList.add('visible');
          // Stop watching this element (we only want the animation once)
          observer.unobserve(entry.target);
        }
      });
    },

    {
      threshold: 0.12,       // Trigger when 12% of element is visible
      rootMargin: '0px 0px -50px 0px'  // Trigger slightly before element reaches bottom of screen
    }

  );

  // Attach the observer to each element
  elementsToReveal.forEach(function (el) {
    observer.observe(el);
  });

}


/* ============================================================
   5. SCROLL-TO-TOP BUTTON
   Appears after scrolling down 300px, clicking scrolls back to top
   ============================================================ */
function initScrollTop() {

  const scrollTopBtn = document.getElementById('scrollTop');

  // Show/hide button based on scroll position
  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });

  // Scroll to top when button is clicked
  scrollTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'   // Smooth scrolling
    });
  });

}


/* ============================================================
   6. CONTACT FORM SUBMISSION
   Shows a success message when form is submitted
   ============================================================ */
function initContactForm() {

  const form           = document.getElementById('contactForm');
  const successMessage = document.getElementById('formSuccess');
  const submitBtn      = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (event) {

    // Prevent actual form submission (page reload)
    event.preventDefault();

    // --- Basic validation ---
    const name  = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();

    if (!name || !phone) {
      alert('Please fill in your name and phone number.');
      return;
    }

    // Validate phone: must be at least 10 digits
    const phoneDigits = phone.replace(/\D/g, '');  // Remove non-digits
    if (phoneDigits.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    // --- Show loading state on button ---
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending... ⏳';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // --- Simulate a 1.5 second API call delay ---
    setTimeout(function () {

      // Reset button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '';

      // Show success message
      successMessage.style.display = 'block';

      // Clear the form
      form.reset();

      // Hide success message after 5 seconds
      setTimeout(function () {
        successMessage.style.display = 'none';
      }, 5000);

    }, 1500);

  });

}


/* ============================================================
   7. ADD TO CART BUTTON FEEDBACK
   Button briefly changes text to confirm the action
   ============================================================ */
function initCartButtons() {

  // Get all "Add to Cart" buttons
  const cartBtns = document.querySelectorAll('.card-btn');

  cartBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {

      // Store original text
      const originalText = btn.textContent;

      // Change button to confirmation state
      btn.textContent = '✓ Added!';
      btn.style.background = '#4CAF8A';  // Green colour
      btn.disabled = true;

      // Reset after 2 seconds
      setTimeout(function () {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.disabled = false;
      }, 2000);

    });
  });

}


/* ============================================================
   8. STATS COUNTER ANIMATION
   Counts up numbers in the stats bar when they come into view
   ============================================================ */
function initCounterAnimation() {

  const statNums = document.querySelectorAll('.stat-num');

  // Extract the numeric value from text like "68+" or "10M+"
  function parseValue(text) {
    const num = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  // Get the suffix (like "+", "M+", etc.)
  function getSuffix(text) {
    return text.replace(/[0-9.]/g, '');
  }

  // Animate a single number from 0 to target
  function animateCounter(el, target, suffix, duration) {
    let start     = 0;
    const step    = target / (duration / 16);  // 60fps
    let current   = 0;

    const timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      // Display the number (round for clean look)
      el.textContent = Math.round(current) + suffix;
    }, 16);
  }

  // Use IntersectionObserver to trigger animation when stat bar is visible
  const observer = new IntersectionObserver(

    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {

          statNums.forEach(function (el) {
            const originalText = el.textContent;
            const targetValue  = parseValue(originalText);
            const suffix       = getSuffix(originalText);
            animateCounter(el, targetValue, suffix, 1500);  // 1.5 second animation
          });

          observer.unobserve(entry.target);  // Only animate once
        }
      });
    },

    { threshold: 0.5 }  // Trigger when 50% of stats bar is visible

  );

  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) observer.observe(statsBar);

}


/* ============================================================
   INIT — Run all functions when the page is fully loaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {

  initNavbar();             // Sticky navbar + hamburger
  initActiveLinks();        // Highlight current nav link
  initMenuFilters();        // Menu category tabs
  initScrollReveal();       // Fade-in animations on scroll
  initScrollTop();          // Scroll-to-top button
  initContactForm();        // Form validation + submission
  initCartButtons();        // Add to cart button feedback
  initCounterAnimation();   // Animated number counters

  console.log('🎂 Monginis website loaded successfully!');

});
