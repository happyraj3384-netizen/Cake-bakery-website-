/* ============================================================
   MONGINIS ECOMMERCE — script.js
   Complete e-commerce logic:
   - Product data & rendering
   - Shopping cart (add, remove, qty, total)
   - Checkout modal (3 steps)
   - Cash on Delivery
   - Razorpay payment integration
   - WhatsApp order system
   - Contact form
   - Scroll reveal, counters, navbar
   ============================================================ */

'use strict';

/* ============================================================
   PRODUCT DATA
   Add or edit products here. Categories: signature, seasonal, pastry, custom
   ============================================================ */
const PRODUCTS = [
  { id: 'p1',  name: 'Chocolate Truffle',    emoji: '🍫', bg: 'bg-choco',  cat: 'signature', badge: 'best',     desc: 'Rich dark chocolate layers with velvety ganache & cocoa dusting',    prices: { '500g': 249, '1kg': 449, '2kg': 849 } },
  { id: 'p2',  name: 'Butterscotch Delight', emoji: '🧈', bg: 'bg-butter', cat: 'signature', badge: 'hot',      desc: 'Classic butterscotch cream with golden praline and caramel swirls',  prices: { '500g': 199, '1kg': 399, '2kg': 749 } },
  { id: 'p3',  name: 'Red Velvet Dream',     emoji: '❤️', bg: 'bg-velvet', cat: 'signature', badge: 'new',      desc: 'Soft velvet sponge layered with luscious cream cheese frosting',       prices: { '500g': 279, '1kg': 499, '2kg': 949 } },
  { id: 'p4',  name: 'Alphonso Mango',       emoji: '🥭', bg: 'bg-mango',  cat: 'seasonal',  badge: 'seasonal', desc: 'Fresh Alphonso mango mousse on a light sponge — summer special',      prices: { '500g': 299, '1kg': 549, '2kg': 1049 } },
  { id: 'p5',  name: 'Strawberry Bliss',     emoji: '🍓', bg: 'bg-berry',  cat: 'seasonal',  badge: 'new',      desc: 'Fresh strawberry compote with vanilla cream on a soft chiffon base', prices: { '500g': 279, '1kg': 529, '2kg': 999 } },
  { id: 'p6',  name: 'Pineapple Fresh',      emoji: '🍍', bg: 'bg-pine',   cat: 'seasonal',  badge: null,       desc: 'Light pineapple cream cake with fresh fruit and whipped topping',    prices: { '500g': 199, '1kg': 379, '2kg': 699 } },
  { id: 'p7',  name: 'Classic Croissant',    emoji: '🥐', bg: 'bg-pastry', cat: 'pastry',    badge: 'hot',      desc: 'Buttery, flaky layers baked fresh every morning. Plain or chocolate', prices: { '1pc': 45, '4pc': 160, '6pc': 230 } },
  { id: 'p8',  name: 'Cheesecake Slice',     emoji: '🧀', bg: 'bg-cheese', cat: 'pastry',    badge: 'best',     desc: 'New York style baked cheesecake with a graham cracker crust',         prices: { '1pc': 89, '4pc': 320, 'full': 599 } },
  { id: 'p9',  name: 'Your Dream Cake',      emoji: '🎨', bg: 'bg-custom', cat: 'custom',    badge: 'custom',   desc: 'Fully personalised — choose design, flavour, size, tier & message',   prices: { '1kg': 799, '2kg': 1399, '3kg': 1999 } },
];

/* ============================================================
   CART STATE
   ============================================================ */
let cart = [];  // Array of { product, weight, price, qty }

/* ============================================================
   PRODUCT RENDERING
   ============================================================ */
function renderProducts(filter) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';

  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === filter);

  filtered.forEach(function(product) {
    const weights  = Object.keys(product.prices);
    const defaultW = weights[1] || weights[0];  // default to 1kg / middle option
    const defaultP = product.prices[defaultW];

    const card = document.createElement('div');
    card.className = 'product-card reveal';
    card.setAttribute('data-id', product.id);

    card.innerHTML = `
      <div class="pc-img-wrap ${product.bg}">
        ${product.emoji}
        ${product.badge ? `<span class="pc-badge ${product.badge}">${product.badge.toUpperCase()}</span>` : ''}
      </div>
      <div class="pc-body">
        <h3 class="pc-name">${product.name}</h3>
        <p class="pc-desc">${product.desc}</p>
        <div class="pc-weight">
          ${weights.map(function(w, i) {
            return `<button class="pc-w-btn${i === 1 || weights.length === 1 ? ' selected' : ''}" data-weight="${w}" data-price="${product.prices[w]}" onclick="selectWeight(this, '${product.id}')">${w}</button>`;
          }).join('')}
        </div>
        <div class="pc-footer">
          <div class="pc-price">₹${defaultP} <small>/ ${defaultW}</small></div>
          <button class="pc-add-btn" onclick="addToCart('${product.id}')">Add to Cart</button>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Re-trigger scroll reveal for new cards
  initRevealObserver();
}

/* ============================================================
   WEIGHT SELECTION ON PRODUCT CARD
   ============================================================ */
function selectWeight(btn, productId) {
  const card   = btn.closest('.product-card');
  const weight = btn.getAttribute('data-weight');
  const price  = btn.getAttribute('data-price');

  // Update selected button UI
  card.querySelectorAll('.pc-w-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // Update displayed price
  const priceEl = card.querySelector('.pc-price');
  priceEl.innerHTML = `₹${price} <small>/ ${weight}</small>`;
}

/* ============================================================
   ADD TO CART
   ============================================================ */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Find which weight is selected on the card
  const card   = document.querySelector(`.product-card[data-id="${productId}"]`);
  let weight, price;

  if (card) {
    const selectedBtn = card.querySelector('.pc-w-btn.selected');
    weight = selectedBtn ? selectedBtn.getAttribute('data-weight') : Object.keys(product.prices)[0];
    price  = parseInt(selectedBtn ? selectedBtn.getAttribute('data-price') : Object.values(product.prices)[0]);
  } else {
    // Called from hero buttons (no card context)
    const weights = Object.keys(product.prices);
    weight = weights[1] || weights[0];
    price  = product.prices[weight];
  }

  // Check if already in cart
  const existing = cart.find(item => item.id === productId && item.weight === weight);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, name: product.name, emoji: product.emoji, weight, price, qty: 1 });
  }

  // Visual feedback on button
  if (card) {
    const btn = card.querySelector('.pc-add-btn');
    btn.textContent = '✓ Added!';
    btn.classList.add('added');
    setTimeout(function() {
      btn.textContent = 'Add to Cart';
      btn.classList.remove('added');
    }, 1800);
  }

  renderCart();
  openCart();
  updateCartCount();
}

// Global function so HTML onclick can call it
window.addToCartById = addToCart;

/* ============================================================
   RENDER CART SIDEBAR
   ============================================================ */
function renderCart() {
  const itemsEl   = document.getElementById('cartItems');
  const emptyEl   = document.getElementById('cartEmpty');
  const footerEl  = document.getElementById('cartFooter');

  if (cart.length === 0) {
    emptyEl.style.display = 'block';
    footerEl.style.display = 'none';
    itemsEl.innerHTML = '';
    itemsEl.appendChild(emptyEl);
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  // Clear and rebuild cart items
  itemsEl.innerHTML = '';

  cart.forEach(function(item) {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="ci-emoji">${item.emoji}</div>
      <div class="ci-info">
        <div class="ci-name">${item.name} (${item.weight})</div>
        <div class="ci-price">₹${item.price * item.qty}</div>
      </div>
      <div class="ci-qty">
        <button class="ci-qty-btn" onclick="changeQty('${item.id}','${item.weight}',-1)">−</button>
        <span class="ci-qty-num">${item.qty}</span>
        <button class="ci-qty-btn" onclick="changeQty('${item.id}','${item.weight}',1)">+</button>
      </div>
      <button class="ci-remove" onclick="removeFromCart('${item.id}','${item.weight}')">✕</button>
    `;
    itemsEl.appendChild(el);
  });

  updateTotals();
}

/* ============================================================
   CART ACTIONS
   ============================================================ */
function changeQty(id, weight, delta) {
  const item = cart.find(i => i.id === id && i.weight === weight);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id, weight);
  else { renderCart(); updateCartCount(); }
}

function removeFromCart(id, weight) {
  cart = cart.filter(i => !(i.id === id && i.weight === weight));
  renderCart();
  updateCartCount();
}

function updateTotals() {
  const subtotal = cart.reduce(function(sum, item) { return sum + item.price * item.qty; }, 0);
  const delivery = subtotal > 0 ? 50 : 0;
  const total    = subtotal + delivery;

  document.getElementById('cartSubtotal').textContent = '₹' + subtotal;
  document.getElementById('cartDelivery').textContent = delivery > 0 ? '₹' + delivery : 'Free';
  document.getElementById('cartTotal').textContent    = '₹' + total;
}

function updateCartCount() {
  const count = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
  document.getElementById('cartCount').textContent = count;
}

/* ============================================================
   CART OPEN / CLOSE
   ============================================================ */
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   CHECKOUT MODAL
   ============================================================ */
function openCheckout() {
  if (cart.length === 0) return;

  // Populate order summary
  const list = document.getElementById('orderSummaryList');
  list.innerHTML = '';
  const subtotal = cart.reduce(function(sum, i) { return sum + i.price * i.qty; }, 0);

  cart.forEach(function(item) {
    const row = document.createElement('div');
    row.className = 'osl-item';
    row.innerHTML = `
      <span class="osl-name">${item.emoji} ${item.name} <span class="osl-qty">(${item.weight} × ${item.qty})</span></span>
      <span class="osl-price">₹${item.price * item.qty}</span>
    `;
    list.appendChild(row);
  });

  document.getElementById('co-subtotal').textContent = '₹' + subtotal;
  document.getElementById('co-total').textContent    = '₹' + (subtotal + 50);

  closeCart();
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  // Set min date for delivery to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('co-date').min = today;
  document.getElementById('co-date').value = today;
}

function closeCheckout() {
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   PLACE ORDER
   ============================================================ */
function placeOrder() {
  // Validate required fields
  const name    = document.getElementById('co-name').value.trim();
  const phone   = document.getElementById('co-phone').value.trim();
  const address = document.getElementById('co-address').value.trim();

  if (!name || !phone || !address) {
    alert('Please fill in your Name, Phone, and Delivery Address.');
    return;
  }
  if (phone.replace(/\D/g, '').length < 10) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  const subtotal      = cart.reduce(function(sum, i) { return sum + i.price * i.qty; }, 0);
  const total         = subtotal + 50;

  if (paymentMethod === 'razorpay') {
    processRazorpay(total, name, phone, address);
  } else if (paymentMethod === 'whatsapp') {
    sendWhatsAppOrder(name, phone, address);
  } else {
    // Cash on Delivery
    confirmOrder('COD', name, phone);
  }
}

/* ============================================================
   RAZORPAY INTEGRATION
   Replace 'YOUR_RAZORPAY_KEY' with your actual Razorpay Key ID
   from https://dashboard.razorpay.com/app/keys
   ============================================================ */
function processRazorpay(totalAmount, name, phone, address) {
  const options = {
    key: 'YOUR_RAZORPAY_KEY',         // ← Replace with your actual Key ID
    amount: totalAmount * 100,         // Razorpay expects amount in paise
    currency: 'INR',
    name: 'Monginis',
    description: 'Cake Order Payment',
    image: '',                         // Add your logo URL here
    handler: function(response) {
      // Payment successful
      console.log('Payment ID:', response.razorpay_payment_id);
      confirmOrder('Razorpay · ' + response.razorpay_payment_id, name, phone);
    },
    prefill: {
      name:    name,
      contact: phone,
    },
    notes: {
      address: address,
    },
    theme: {
      color: '#C8514A',  // Matches your brand rose color
    },
    modal: {
      ondismiss: function() {
        alert('Payment cancelled. Please try again or choose Cash on Delivery.');
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.open();
  } catch(e) {
    // Razorpay not loaded or key invalid — show demo message
    alert('Razorpay is not configured yet.\n\nTo enable: Replace YOUR_RAZORPAY_KEY in script.js with your actual Razorpay Key ID from dashboard.razorpay.com\n\nFor now, switching to COD.');
    confirmOrder('COD (Demo)', name, phone);
  }
}

/* ============================================================
   WHATSAPP ORDER
   Replace the phone number below with your actual WhatsApp business number
   Format: country code + number, no spaces or +
   ============================================================ */
function sendWhatsAppOrder(name, phone, address) {
  const subtotal = cart.reduce(function(sum, i) { return sum + i.price * i.qty; }, 0);
  const total    = subtotal + 50;

  // Build order message
  let msg = `🎂 *NEW ORDER — MONGINIS*\n\n`;
  msg += `*Customer:* ${name}\n`;
  msg += `*Phone:* ${phone}\n`;
  msg += `*Address:* ${address}\n\n`;
  msg += `*ORDER ITEMS:*\n`;

  cart.forEach(function(item) {
    msg += `• ${item.emoji} ${item.name} (${item.weight} × ${item.qty}) — ₹${item.price * item.qty}\n`;
  });

  msg += `\n*Subtotal:* ₹${subtotal}`;
  msg += `\n*Delivery:* ₹50`;
  msg += `\n*TOTAL:* ₹${total}`;
  msg += `\n\n_Payment: WhatsApp Order_`;

  const encodedMsg     = encodeURIComponent(msg);
  const whatsappNumber = '919876543210';  // ← Replace with your number (91 = India code)
  const waURL          = `https://wa.me/${whatsappNumber}?text=${encodedMsg}`;

  window.open(waURL, '_blank');
  confirmOrder('WhatsApp', name, phone);
}

/* ============================================================
   CONFIRM ORDER — Show success screen
   ============================================================ */
function confirmOrder(method, name, phone) {
  closeCheckout();

  // Generate random order ID
  const orderId = '#MNG-' + Math.floor(10000 + Math.random() * 90000);
  document.getElementById('orderId').textContent = orderId;

  // Set success message based on payment type
  let msg = '';
  if (method.startsWith('Razorpay')) {
    msg = `Payment confirmed! Your order ${orderId} is placed. We'll call ${phone} within 30 minutes.`;
  } else if (method === 'WhatsApp') {
    msg = `Your WhatsApp order ${orderId} has been sent! Our team will confirm shortly.`;
  } else {
    msg = `Order ${orderId} placed! Pay ₹${cart.reduce((s,i)=>s+i.price*i.qty,0)+50} on delivery. We'll call ${phone} within 30 minutes.`;
  }

  document.getElementById('successMsg').textContent = msg;
  document.getElementById('successModal').classList.add('open');
  document.getElementById('successOverlay').classList.add('open');

  // Clear cart after order
  cart = [];
  updateCartCount();
  renderCart();
}

/* ============================================================
   WHATSAPP FROM CART SIDEBAR
   ============================================================ */
function openWhatsAppFromCart() {
  if (cart.length === 0) return;

  const subtotal = cart.reduce(function(sum, i) { return sum + i.price * i.qty; }, 0);
  const total    = subtotal + 50;

  let msg = `🎂 *Hi! I'd like to order from Monginis*\n\n*Items:*\n`;
  cart.forEach(function(item) {
    msg += `• ${item.emoji} ${item.name} (${item.weight} × ${item.qty}) — ₹${item.price * item.qty}\n`;
  });
  msg += `\n*Total:* ₹${total} (incl. ₹50 delivery)`;

  const encodedMsg = encodeURIComponent(msg);
  window.open(`https://wa.me/919876543210?text=${encodedMsg}`, '_blank');
}

/* ============================================================
   SUCCESS CLOSE
   ============================================================ */
function closeSuccess() {
  document.getElementById('successModal').classList.remove('open');
  document.getElementById('successOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('cfSuccess');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name  = document.getElementById('cf-name').value.trim();
    const phone = document.getElementById('cf-phone').value.trim();

    if (!name || !phone) { alert('Please fill in your name and phone number.'); return; }
    if (phone.replace(/\D/g, '').length < 10) { alert('Please enter a valid phone number.'); return; }

    const btn     = form.querySelector('button[type="submit"]');
    const origTxt = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled    = true;

    setTimeout(function() {
      btn.textContent = origTxt;
      btn.disabled    = false;
      success.style.display = 'block';
      form.reset();
      setTimeout(function() { success.style.display = 'none'; }, 5000);
    }, 1400);
  });
}

/* ============================================================
   CATEGORY FILTER TABS
   ============================================================ */
function initCategoryTabs() {
  document.querySelectorAll('.cat-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProducts(btn.getAttribute('data-cat'));
    });
  });
}

/* ============================================================
   NAVBAR
   ============================================================ */
function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    document.getElementById('scrollTop').classList.toggle('visible', window.scrollY > 300);
  });

  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initRevealObserver() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function(el) {
    if (!el.classList.contains('visible')) observer.observe(el);
  });
}

/* ============================================================
   COUNTER ANIMATION (stats bar)
   ============================================================ */
function initCounters() {
  let done = false;
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !done) {
        done = true;
        document.querySelectorAll('.sn[data-target]').forEach(function(el) {
          const target = parseInt(el.getAttribute('data-target'));
          let cur = 0;
          const step = target / (1600 / 16);
          const t = setInterval(function() {
            cur += step;
            if (cur >= target) { cur = target; clearInterval(t); }
            el.textContent = Math.round(cur);
          }, 16);
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const bar = document.querySelector('.stats-bar');
  if (bar) observer.observe(bar);
}

/* ============================================================
   SCROLL-TO-TOP
   ============================================================ */
function initScrollTop() {
  document.getElementById('scrollTop').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   EVENT LISTENERS — Wire up all buttons
   ============================================================ */
function initEventListeners() {
  // Cart
  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('whatsappOrderBtn').addEventListener('click', openWhatsAppFromCart);

  // Checkout
  document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
  document.getElementById('checkoutOverlay').addEventListener('click', closeCheckout);
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

  // Success
  document.getElementById('successClose').addEventListener('click', closeSuccess);

  // Scroll top
  initScrollTop();
}

/* ============================================================
   INIT — Run everything on DOM ready
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  renderProducts('all');      // Render all products
  initCategoryTabs();         // Category filter buttons
  initNavbar();               // Sticky navbar + hamburger
  initContactForm();          // Contact form
  initCounters();             // Animated stat numbers
  initEventListeners();       // All button wiring

  // Initial scroll reveal for static elements
  document.querySelectorAll('.section-header, .about-content, .about-visual, .review-card, .contact-info, .contact-form-wrap').forEach(function(el) {
    el.classList.add('reveal');
  });
  initRevealObserver();

  console.log('🎂 Monginis Ecommerce loaded successfully!');
});
