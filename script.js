const heroImages = document.querySelectorAll('.hero-image');
let current = 0;

if (heroImages.length > 1) {
  setInterval(() => {
    heroImages[current].classList.remove('active');
    current = (current + 1) % heroImages.length;
    heroImages[current].classList.add('active');
  }, 4200);
}

const hourEl = document.getElementById('h');
const minuteEl = document.getElementById('m');
const secondEl = document.getElementById('s');
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');

if (navToggle && mainNav) {
  function setNavOpen(isOpen) {
    mainNav.classList.toggle('is-open', isOpen);
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = !mainNav.classList.contains('is-open');
    setNavOpen(isOpen);
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setNavOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) setNavOpen(false);
  });
}

if (hourEl && minuteEl && secondEl) {
  // Create a rolling 24-hour promo countdown.
  let target = new Date(Date.now() + 24 * 60 * 60 * 1000);

  function tick() {
    const now = new Date();
    let diff = Math.floor((target - now) / 1000);

    if (diff <= 0) {
      target = new Date(Date.now() + 24 * 60 * 60 * 1000);
      diff = Math.floor((target - now) / 1000);
    }

    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    hourEl.textContent = String(h).padStart(2, '0');
    minuteEl.textContent = String(m).padStart(2, '0');
    secondEl.textContent = String(s).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialPrevBtn = document.getElementById('testimonialPrev');
const testimonialNextBtn = document.getElementById('testimonialNext');
const testimonialCards = testimonialTrack ? Array.from(testimonialTrack.querySelectorAll('.testimonial-card')) : [];

if (testimonialTrack && testimonialPrevBtn && testimonialNextBtn && testimonialCards.length) {
  let testimonialIndex = 0;
  let testimonialVisibleCards = 4;
  let testimonialMaxIndex = 0;

  function getVisibleTestimonialCards() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    if (window.innerWidth <= 1200) return 3;
    return 4;
  }

  function getTestimonialGap() {
    const styles = window.getComputedStyle(testimonialTrack);
    return Number.parseFloat(styles.gap || styles.columnGap || '0') || 0;
  }

  function setTestimonialTrackPosition() {
    const firstCard = testimonialCards[0];
    if (!firstCard) return;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const offset = testimonialIndex * (cardWidth + getTestimonialGap());
    testimonialTrack.style.transform = `translateX(${-offset}px)`;
  }

  function setTestimonialSlide(nextIndex) {
    if (nextIndex < 0) {
      testimonialIndex = testimonialMaxIndex;
    } else if (nextIndex > testimonialMaxIndex) {
      testimonialIndex = 0;
    } else {
      testimonialIndex = nextIndex;
    }
    setTestimonialTrackPosition();
  }

  function syncTestimonialLayout() {
    testimonialVisibleCards = getVisibleTestimonialCards();
    testimonialMaxIndex = Math.max(0, testimonialCards.length - testimonialVisibleCards);
    if (testimonialIndex > testimonialMaxIndex) testimonialIndex = 0;
    setTestimonialTrackPosition();
  }

  testimonialPrevBtn.addEventListener('click', () => setTestimonialSlide(testimonialIndex - 1));
  testimonialNextBtn.addEventListener('click', () => setTestimonialSlide(testimonialIndex + 1));
  window.addEventListener('resize', syncTestimonialLayout);

  syncTestimonialLayout();
}

const carouselSlides = Array.from(document.querySelectorAll('.feedback-slide'));
const carouselTrack = document.getElementById('feedbackCarouselTrack');
const carouselDotsWrap = document.getElementById('feedbackCarouselDots');
const carouselPrevBtn = document.getElementById('feedbackCarouselPrev');
const carouselNextBtn = document.getElementById('feedbackCarouselNext');
const feedbackLightbox = document.getElementById('feedbackLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');

if (carouselSlides.length && carouselDotsWrap && carouselTrack) {
  let carouselIndex = 0;
  let visibleSlides = 3;
  let maxIndex = 0;
  let carouselDots = [];

  function getVisibleSlides() {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function getTrackGap() {
    const styles = window.getComputedStyle(carouselTrack);
    return Number.parseFloat(styles.gap || styles.columnGap || '0') || 0;
  }

  function setTrackPosition() {
    const firstSlide = carouselSlides[0];
    if (!firstSlide) return;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const offset = carouselIndex * (slideWidth + getTrackGap());
    carouselTrack.style.transform = `translateX(${-offset}px)`;
  }

  function renderDots() {
    carouselDotsWrap.innerHTML = '';
    const pageCount = maxIndex + 1;
    for (let i = 0; i < pageCount; i += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `feedback-dot${i === carouselIndex ? ' is-active' : ''}`;
      dot.setAttribute('aria-label', `切换到第 ${i + 1} 组`);
      dot.dataset.index = String(i);
      carouselDotsWrap.appendChild(dot);
    }
    carouselDots = Array.from(carouselDotsWrap.querySelectorAll('.feedback-dot'));
  }

  function setActiveSlide(nextIndex) {
    const clampedIndex = Math.min(Math.max(nextIndex, 0), maxIndex);
    carouselIndex = clampedIndex;
    carouselSlides.forEach((slide, index) => {
      const isVisible = index >= carouselIndex && index < carouselIndex + visibleSlides;
      slide.classList.toggle('is-active', isVisible);
    });
    carouselDots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === carouselIndex);
    });
    setTrackPosition();
  }

  function syncLayout() {
    visibleSlides = getVisibleSlides();
    maxIndex = Math.max(0, carouselSlides.length - visibleSlides);
    if (carouselIndex > maxIndex) carouselIndex = 0;
    renderDots();
    setActiveSlide(carouselIndex);
  }

  syncLayout();

  function nextSlide() {
    if (carouselIndex >= maxIndex) {
      setActiveSlide(0);
      return;
    }
    setActiveSlide(carouselIndex + 1);
  }

  function prevSlide() {
    if (carouselIndex <= 0) {
      setActiveSlide(maxIndex);
      return;
    }
    setActiveSlide(carouselIndex - 1);
  }

  carouselSlides.forEach((slide, index) => {
    slide.addEventListener('click', () => {
      if (feedbackLightbox && lightboxImage) {
        const img = slide.querySelector('img');
        if (!img) return;
        lightboxImage.src = img.src;
        lightboxImage.alt = img.alt;
        feedbackLightbox.classList.add('is-open');
        feedbackLightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  carouselDotsWrap.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    const nextIndex = Number(target.dataset.index);
    if (!Number.isNaN(nextIndex)) setActiveSlide(nextIndex);
  });

  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', prevSlide);
  }

  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', nextSlide);
  }

  window.addEventListener('resize', syncLayout);
  setInterval(nextSlide, 3200);
}

if (feedbackLightbox && lightboxImage) {
  function closeLightbox() {
    feedbackLightbox.classList.remove('is-open');
    feedbackLightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.src = '';
    document.body.style.overflow = '';
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  feedbackLightbox.addEventListener('click', (event) => {
    if (event.target === feedbackLightbox) closeLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && feedbackLightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

const addToCartButtons = Array.from(document.querySelectorAll('.add-to-cart-btn'));
const cartTrigger = document.getElementById('cartTrigger');
const cartHeaderTrigger = document.getElementById('cartHeaderTrigger');
const cartCount = document.getElementById('cartCount');
const cartCountHeader = document.getElementById('cartCountHeader');
const cartDrawer = document.getElementById('cartDrawer');
const cartBackdrop = document.getElementById('cartBackdrop');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartTotal = document.getElementById('cartTotal');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutPayBtn = document.getElementById('checkoutPayBtn');
const checkoutEmail = document.getElementById('checkoutEmail');
const checkoutPhone = document.getElementById('checkoutPhone');
const checkoutFirstName = document.getElementById('checkoutFirstName');
const checkoutLastName = document.getElementById('checkoutLastName');
const checkoutAddress = document.getElementById('checkoutAddress');
const checkoutApartment = document.getElementById('checkoutApartment');
const checkoutPostcode = document.getElementById('checkoutPostcode');
const checkoutCity = document.getElementById('checkoutCity');
const checkoutState = document.getElementById('checkoutState');

if (cartTrigger && cartDrawer && cartBackdrop && cartItems && cartEmpty && cartTotal) {
  const CART_KEY = 'chewiekids-cart-v1';
  const PRODUCT_IMAGE_MAP = {
    '入门之选 · 初体验配套': 'Package1.png',
    '多宝配套 · 3套': 'Package2.png',
    '超值配套 · 5套': 'Package3.png'
  };
  let cart = [];

  function formatRM(value) {
    return `RM${value.toLocaleString('en-MY')}`;
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cart = parsed
          .filter((item) => item && item.name && item.price && item.qty)
          .map((item) => ({
            ...item,
            image: item.image || PRODUCT_IMAGE_MAP[item.name] || ''
          }));
      }
    } catch {
      cart = [];
    }
  }

  function getTotalQty() {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }

  function getTotalAmount() {
    return cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  }

  function renderCart() {
    const totalQty = String(getTotalQty());
    cartCount.textContent = totalQty;
    if (cartCountHeader) cartCountHeader.textContent = totalQty;
    cartTotal.textContent = formatRM(getTotalAmount());
    cartItems.innerHTML = '';

    if (!cart.length) {
      cartEmpty.style.display = 'block';
      return;
    }

    cartEmpty.style.display = 'none';
    cart.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'cart-item';
      const imageMarkup = item.image
        ? `<img class="cart-item-image" src="${item.image}" alt="${item.name}" loading="lazy" />`
        : '';
      card.innerHTML = `
        <div class="cart-item-row">
          ${imageMarkup}
          <div class="cart-item-body">
            <p class="cart-item-title">${item.name}</p>
            <div class="cart-item-meta">
              <span>${formatRM(item.price)}</span>
              <div>
                <span class="qty-controls">
                  <button type="button" data-action="decrease" data-name="${item.name}">-</button>
                  <strong>${item.qty}</strong>
                  <button type="button" data-action="increase" data-name="${item.name}">+</button>
                </span>
                <button type="button" class="remove-item-btn" data-action="remove" data-name="${item.name}">删除</button>
              </div>
            </div>
          </div>
        </div>
      `;
      cartItems.appendChild(card);
    });
  }

  function openCart() {
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    cartBackdrop.classList.add('is-open');
    cartBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    cartBackdrop.classList.remove('is-open');
    cartBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function addToCart(name, price, image) {
    const found = cart.find((item) => item.name === name);
    if (found) {
      found.qty += 1;
      if (!found.image && image) found.image = image;
    } else {
      cart.push({ name, price, qty: 1, image: image || PRODUCT_IMAGE_MAP[name] || '' });
    }
    saveCart();
    renderCart();
  }

  function buildCheckoutPayload() {
    const firstName = checkoutFirstName ? checkoutFirstName.value.trim() : '';
    const lastName = checkoutLastName ? checkoutLastName.value.trim() : '';
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty
      })),
      totalAmount: getTotalAmount(),
      customer: {
        name: fullName,
        email: checkoutEmail ? checkoutEmail.value.trim() : '',
        mobile: checkoutPhone ? checkoutPhone.value.trim() : '',
        firstName,
        lastName,
        address: checkoutAddress ? checkoutAddress.value.trim() : '',
        apartment: checkoutApartment ? checkoutApartment.value.trim() : '',
        postcode: checkoutPostcode ? checkoutPostcode.value.trim() : '',
        city: checkoutCity ? checkoutCity.value.trim() : '',
        state: checkoutState ? checkoutState.value.trim() : ''
      }
    };
  }

  function validateCheckout() {
    if (!cart.length) {
      alert('购物车是空的，请先加入配套。');
      return false;
    }

    if (!checkoutPhone || !checkoutFirstName || !checkoutLastName || !checkoutAddress || !checkoutPostcode || !checkoutCity || !checkoutState) return false;
    if (
      !checkoutPhone.value.trim() ||
      !checkoutFirstName.value.trim() ||
      !checkoutLastName.value.trim() ||
      !checkoutAddress.value.trim() ||
      !checkoutPostcode.value.trim() ||
      !checkoutCity.value.trim() ||
      !checkoutState.value.trim()
    ) {
      alert('请先填写完整必填资料（电话、名字、姓氏、地址、邮编、城市、州属）。');
      return false;
    }

    return true;
  }

  loadCart();
  renderCart();

  addToCartButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name || '配套';
      const price = Number(btn.dataset.price || '0');
      const image = btn.dataset.image || PRODUCT_IMAGE_MAP[name] || '';
      if (!price) return;
      addToCart(name, price, image);
    });
  });

  cartItems.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const action = target.dataset.action;
    const name = target.dataset.name;
    if (!action || !name) return;

    const item = cart.find((entry) => entry.name === name);
    if (!item) return;

    if (action === 'increase') {
      item.qty += 1;
    } else if (action === 'decrease') {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter((entry) => entry.name !== name);
      }
    } else if (action === 'remove') {
      cart = cart.filter((entry) => entry.name !== name);
    }

    saveCart();
    renderCart();
  });

  cartTrigger.addEventListener('click', openCart);
  cartHeaderTrigger?.addEventListener('click', openCart);
  cartClose?.addEventListener('click', closeCart);
  cartBackdrop.addEventListener('click', closeCart);

  checkoutPayBtn?.addEventListener('click', async () => {
    if (!validateCheckout()) return;

    const originalText = checkoutPayBtn.textContent;
    checkoutPayBtn.disabled = true;
    checkoutPayBtn.textContent = '正在创建账单...';

    try {
      const payload = buildCheckoutPayload();
      const response = await fetch('/api/billplz/create-bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || '创建 Billplz 账单失败');
      }

      window.location.href = result.url;
    } catch (error) {
      alert(error instanceof Error ? error.message : '创建账单失败，请稍后重试。');
    } finally {
      checkoutPayBtn.disabled = false;
      checkoutPayBtn.textContent = originalText || '付款';
    }
  });

  checkoutForm?.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}
