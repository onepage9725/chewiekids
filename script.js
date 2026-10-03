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

const carouselSlides = Array.from(document.querySelectorAll('.feedback-slide'));
const carouselTrack = document.getElementById('feedbackCarouselTrack');
const carouselDotsWrap = document.getElementById('feedbackCarouselDots');
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
const checkoutWhatsAppBtn = document.getElementById('checkoutWhatsAppBtn');
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
  const SHOPEE_LINK = 'https://my.shp.ee/9YJatZ5g';
  const WHATSAPP_NUMBER = '601158559709';
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

  function buildOrderMessage() {
    const lines = cart.map((item) => `- ${item.name} x${item.qty} (${formatRM(item.price * item.qty)})`);
    const firstName = checkoutFirstName ? checkoutFirstName.value.trim() : '';
    const lastName = checkoutLastName ? checkoutLastName.value.trim() : '';
    const fullName = `${firstName} ${lastName}`.trim();
    const addressLine1 = checkoutAddress ? checkoutAddress.value.trim() : '';
    const apartment = checkoutApartment ? checkoutApartment.value.trim() : '';
    const postcode = checkoutPostcode ? checkoutPostcode.value.trim() : '';
    const city = checkoutCity ? checkoutCity.value.trim() : '';
    const state = checkoutState ? checkoutState.value.trim() : '';
    const email = checkoutEmail ? checkoutEmail.value.trim() : '';
    return [
      '你好，我要下单 Chewie Kids：',
      ...lines,
      `总金额：${formatRM(getTotalAmount())}`,
      `姓名：${fullName}`,
      `电话：${checkoutPhone ? checkoutPhone.value.trim() : ''}`,
      `Email：${email || '-'}`,
      `地址：${addressLine1}`,
      `Apartment/Suite：${apartment || '-'}`,
      `Postcode：${postcode}`,
      `City：${city}`,
      `State：${state}`
    ].join('\n');
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

  checkoutPayBtn?.addEventListener('click', () => {
    if (!validateCheckout()) return;
    window.open(SHOPEE_LINK, '_blank', 'noopener');
  });

  checkoutWhatsAppBtn?.addEventListener('click', () => {
    if (!validateCheckout()) return;
    const msg = encodeURIComponent(buildOrderMessage());
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener');
  });

  checkoutForm?.addEventListener('submit', (event) => {
    event.preventDefault();
  });
}
