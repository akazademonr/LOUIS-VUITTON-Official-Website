/**
 * LOUIS VUITTON — Main JavaScript
 * Grid animation, spotlight effect, overlays, cart, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';


  // ══════════════════════════════════════════
  //  GRID CANVAS
  // ══════════════════════════════════════════

  const gridCanvas = document.getElementById('grid-canvas');
  const ctx = gridCanvas.getContext('2d');
  let gw, gh;
  const mouse = { x: 0.5, y: 0.5 };

  function resizeGrid() {
    gw = gridCanvas.width = window.innerWidth;
    gh = gridCanvas.height = window.innerHeight;
  }

  resizeGrid();
  window.addEventListener('resize', resizeGrid);

  function drawGrid() {
    ctx.clearRect(0, 0, gw, gh);
    const cell = 48;
    const ox = (mouse.x - 0.5) * 18;
    const oy = (mouse.y - 0.5) * 18;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.8;

    for (let x = (ox % cell + cell) % cell - cell; x < gw + cell; x += cell) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gh);
      ctx.stroke();
    }

    for (let y = (oy % cell + cell) % cell - cell; y < gh + cell; y += cell) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(gw, y);
      ctx.stroke();
    }

    const cx = mouse.x * gw;
    const cy = mouse.y * gh;

    for (let x = (ox % cell + cell) % cell - cell; x < gw + cell; x += cell) {
      for (let y = (oy % cell + cell) % cell - cell; y < gh + cell; y += cell) {
        const d = Math.hypot(x - cx, y - cy);
        if (d < 180) {
          ctx.beginPath();
          ctx.arc(x, y, 2.2 * (1 - d / 180), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80,80,80,${0.6 * (1 - d / 180)})`;
          ctx.fill();
        }
      }
    }
  }


  // ══════════════════════════════════════════
  //  SPOTLIGHT / CURSOR EFFECT
  // ══════════════════════════════════════════

  const spotlight = document.getElementById('spotlight');
  const imgReveal = document.getElementById('img-reveal');

  const invertTargets = [
    document.getElementById('brand-logo'),
    ...document.querySelectorAll('.nav-links a'),
    ...document.querySelectorAll('.nav-icons a'),
    document.querySelector('.collection-tag'),
    document.querySelector('.hero-title'),
    document.querySelector('.hero-subtitle'),
    document.getElementById('cta-explore'),
    document.querySelector('.bottom-left'),
    ...document.querySelectorAll('#socials a'),
  ].filter(Boolean);

  let cursorX = -300, cursorY = -300;
  let spotX = -300, spotY = -300;
  let velX = 0, velY = 0;
  let prevX = -300, prevY = -300;

  // Dynamic half based on CSS variable
  function getHalf() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cursor-size')) / 2 || 90;
  }

  let HALF = getHalf();
  window.addEventListener('resize', () => { HALF = getHalf(); });


  // ── Mouse Events ──

  document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
  });

  document.addEventListener('mouseleave', () => { spotlight.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { spotlight.style.opacity = '1'; });


  // ── Touch Events (Mobile) ──

  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    cursorX = t.clientX;
    cursorY = t.clientY;
    mouse.x = t.clientX / window.innerWidth;
    mouse.y = t.clientY / window.innerHeight;
    spotlight.style.opacity = '1';
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    cursorX = t.clientX;
    cursorY = t.clientY;
    mouse.x = t.clientX / window.innerWidth;
    mouse.y = t.clientY / window.innerHeight;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    spotlight.style.opacity = '0';
  });


  // ── Echo Particles ──

  let lastEchoTime = 0;

  function spawnEcho(x, y, speed) {
    if (speed < 4) return;
    const now = performance.now();
    if (now - lastEchoTime < 55) return;
    lastEchoTime = now;

    const el = document.createElement('div');
    el.className = 'echo';
    const sz = HALF * 2 * (0.6 + Math.random() * 0.3);
    el.style.cssText = `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }


  // ── Animation Loop ──

  function animate() {
    requestAnimationFrame(animate);

    const ease = 0.095;
    spotX += (cursorX - spotX) * ease;
    spotY += (cursorY - spotY) * ease;

    velX = spotX - prevX;
    velY = spotY - prevY;
    const speed = Math.hypot(velX, velY);
    prevX = spotX;
    prevY = spotY;

    spotlight.style.left = spotX + 'px';
    spotlight.style.top = spotY + 'px';
    imgReveal.style.clipPath = `circle(${HALF}px at ${spotX}px ${spotY}px)`;

    spawnEcho(spotX, spotY, speed);

    // Invert elements when spotlight overlaps
    invertTargets.forEach((el) => {
      const r = el.getBoundingClientRect();
      const elCx = r.left + r.width / 2;
      const elCy = r.top + r.height / 2;
      const dist = Math.hypot(spotX - elCx, spotY - elCy);

      if (dist < HALF + 20) {
        el.classList.add('inverted');
      } else {
        el.classList.remove('inverted');
      }
    });

    drawGrid();
  }

  requestAnimationFrame(animate);


  // ══════════════════════════════════════════
  //  MOBILE MENU
  // ══════════════════════════════════════════

  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
    });

    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      });
    });
  }


  // ══════════════════════════════════════════
  //  SEARCH OVERLAY
  // ══════════════════════════════════════════

  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchCloseBtn = document.getElementById('search-close');
  const btnSearch = document.getElementById('btn-search');

  function openSearch() {
    searchOverlay.classList.add('open');
    setTimeout(() => searchInput.focus(), 350);
  }

  function closeSearch() {
    searchOverlay.classList.remove('open');
    searchInput.value = '';
    searchInput.blur();
  }

  btnSearch.addEventListener('click', (e) => {
    e.preventDefault();
    openSearch();
  });

  searchCloseBtn.addEventListener('click', closeSearch);


  // ══════════════════════════════════════════
  //  CART DRAWER
  // ══════════════════════════════════════════

  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartCloseBtn = document.getElementById('cart-close');
  const btnCart = document.getElementById('btn-cart');
  const cartCountEl = document.getElementById('cart-count');
  const cartTotalEl = document.getElementById('cart-total');
  const cartItemsEl = document.getElementById('cart-items');
  const cartBadgeEl = document.querySelector('.cart-badge');

  const cartData = [
    { id: 1, name: 'Keepall Bandoulière 50', variant: 'Monogram Eclipse — One Size', price: 2370 },
    { id: 2, name: 'LV Trainer Sneaker', variant: 'Damier — Size 42', price: 1090 },
  ];

  function openCart() {
    cartDrawer.classList.add('open');
    cartBackdrop.classList.add('open');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartBackdrop.classList.remove('open');
  }

  function updateCartUI() {
    const total = cartData.reduce((s, i) => s + i.price, 0);
    cartCountEl.textContent = `(${cartData.length})`;
    cartTotalEl.textContent = `€${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    cartBadgeEl.textContent = cartData.length;

    if (cartData.length === 0) {
      cartBadgeEl.style.display = 'none';
      cartItemsEl.innerHTML = '<p style="font-family:var(--font-body);font-size:0.8rem;color:rgba(17,17,17,0.4);text-align:center;padding:48px 0;">Your bag is empty.</p>';
    } else {
      cartBadgeEl.style.display = 'flex';
    }
  }

  btnCart.addEventListener('click', (e) => {
    e.preventDefault();
    openCart();
  });

  cartCloseBtn.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  // Remove items with animation
  cartItemsEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-item-remove')) {
      const item = e.target.closest('.cart-item');
      const id = parseInt(item.dataset.id);
      const idx = cartData.findIndex((i) => i.id === id);
      if (idx > -1) cartData.splice(idx, 1);

      item.style.transition = 'opacity 0.3s, transform 0.3s';
      item.style.opacity = '0';
      item.style.transform = 'translateX(20px)';

      setTimeout(() => {
        item.remove();
        updateCartUI();
      }, 300);
    }
  });


  // ══════════════════════════════════════════
  //  KEYBOARD SHORTCUTS
  // ══════════════════════════════════════════

  document.addEventListener('keydown', (e) => {
    // ESC closes all overlays
    if (e.key === 'Escape') {
      if (searchOverlay.classList.contains('open')) closeSearch();
      if (cartDrawer.classList.contains('open')) closeCart();
      if (mobileMenu && mobileMenu.classList.contains('open')) {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
      }
    }

    // Ctrl/Cmd + K opens search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
  });


  // ══════════════════════════════════════════
  //  PAGE LOADER / IMAGE PRELOADER
  // ══════════════════════════════════════════

  const loader = document.getElementById('page-loader');
  const imagesToPreload = [
    'images/nigga3.png',
    'images/nigga4.png',
  ];

  let loadedCount = 0;

  function checkLoaded() {
    loadedCount++;
    if (loadedCount >= imagesToPreload.length) {
      loader.classList.add('loaded');
    }
  }

  imagesToPreload.forEach((src) => {
    const img = new Image();
    img.onload = checkLoaded;
    img.onerror = checkLoaded;
    img.src = src;
  });

  // Fallback: remove loader after 3 seconds max
  setTimeout(() => loader.classList.add('loaded'), 3000);


  // ══════════════════════════════════════════
  //  PREVENT DEFAULT ON # LINKS
  // ══════════════════════════════════════════

  document.querySelectorAll('a[href="#"]').forEach((a) => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

});
