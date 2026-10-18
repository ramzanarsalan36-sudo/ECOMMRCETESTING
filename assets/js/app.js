/**
 * HOPEKRAFT - Wooden Toys & Learning Essentials
 * Core Application Logic: Cart State, PDP Dynamic Rendering, Checkout & Wishlist
 * Zero Popups: Pure, direct page navigation (index -> product -> checkout)
 */

// Product Catalog
const HOPEKRAFT_PRODUCTS = {
  easel: {
    id: 'easel',
    name: 'HOPEKRAFT Wooden Kids Easel',
    tagline: '2-in-1 Magnetic Dry-Erase Whiteboard & Traditional Blackboard with Integrated Craft Storage Shelf.',
    subtitle: 'Double-Sided Whiteboard & Blackboard',
    price: 3499,
    oldPrice: 4999,
    discount: '30% OFF',
    eyebrow: 'PREMIUM PINELAND COLLECTION',
    image: 'assets/images/easel_full.jpg',
    url: 'product.html?id=easel',
    thumbnails: [
      { src: 'assets/images/easel_full.jpg', label: 'Whiteboard' },
      { src: 'assets/images/easel_thumb_blackboard.jpg', label: 'Chalkboard' },
      { src: 'assets/images/easel_thumb_tray.jpg', label: 'Wood Tray' },
      { src: 'assets/images/easel_thumb_wood.jpg', label: 'Joinery' }
    ],
    features: [
      { icon: '🎨', text: 'Double-Sided Board' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🧲', text: 'Magnetic Whiteboard' },
      { icon: '🎁', text: 'Free Markers & Chalk' }
    ]
  },
  blocks: {
    id: 'blocks',
    name: 'Wooden Alphabet & Number Blocks',
    tagline: 'Handcrafted solid beechwood alphabet and number blocks with smooth rounded corners and vivid non-toxic colors.',
    subtitle: 'Natural Beechwood Montessori Blocks',
    price: 1299,
    oldPrice: 1799,
    discount: '28% OFF',
    eyebrow: 'MONTESSORI EARLY LEARNING',
    image: 'assets/images/product_blocks.png',
    url: 'product.html?id=blocks',
    thumbnails: [
      { src: 'assets/images/product_blocks.png', label: 'Blocks Set' },
      { src: 'assets/images/promo_blocks.png', label: 'Storage Bag' }
    ],
    features: [
      { icon: '🔤', text: 'Full A-Z & Numbers' },
      { icon: '🌿', text: '100% Solid Beechwood' },
      { icon: '🖐️', text: 'Sensory Tactile Play' },
      { icon: '🎒', text: 'Includes Cotton Bag' }
    ]
  },
  rings: {
    id: 'rings',
    name: 'Wooden Stacking Ring Tower',
    tagline: 'Classic rainbow wooden stacking ring tower designed to develop fine motor coordination and color recognition.',
    subtitle: 'Rainbow Polished Beechwood Ring Stack',
    price: 999,
    oldPrice: 1399,
    discount: '29% OFF',
    eyebrow: 'TODDLER SENSORY ESSENTIALS',
    image: 'assets/images/product_rings.png',
    url: 'product.html?id=rings',
    thumbnails: [
      { src: 'assets/images/product_rings.png', label: 'Stack View' }
    ],
    features: [
      { icon: '🌈', text: '7 Rainbow Ring Sizes' },
      { icon: '🪵', text: 'Weighted Safety Base' },
      { icon: '👶', text: 'Choke-Proof Topper' },
      { icon: '💧', text: 'Non-Toxic Water Paint' }
    ]
  },
  train: {
    id: 'train',
    name: 'Wooden Train Set',
    tagline: 'Classic magnetic connector wooden toy train with steam locomotive, passenger coaches, and cargo wagons.',
    subtitle: 'Classic Magnetic Locomotive & Carriages',
    price: 1499,
    oldPrice: 1999,
    discount: '25% OFF',
    eyebrow: 'CREATIVE TRACK COLLECTION',
    image: 'assets/images/product_train.png',
    url: 'product.html?id=train',
    thumbnails: [
      { src: 'assets/images/product_train.png', label: 'Train Set' }
    ],
    features: [
      { icon: '🚂', text: 'Locomotive + 3 Wagons' },
      { icon: '🧲', text: 'Strong Magnetic Couplers' },
      { icon: '🛤️', text: 'Universal Track Fit' },
      { icon: '🛡️', text: 'Child-Safe Non-Toxic' }
    ]
  }
};

// ==========================================
// CART & ORDER STATE MANAGEMENT (LocalStorage)
// ==========================================

function getCart() {
  try {
    const stored = localStorage.getItem('hopekraft_cart');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading cart from localStorage', e);
  }
  return [{ id: 'easel', qty: 1 }];
}

function saveCart(cart) {
  try {
    localStorage.setItem('hopekraft_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart to localStorage', e);
  }
  updateCartBadge();
}

// Navigates directly from Product Page to Checkout Page
function buyNowDirect(productId) {
  saveCart([{ id: productId, qty: 1 }]);
  window.location.href = 'checkout.html';
}

// Handler for PDP Buy Now buttons (reads current active product from URL or fallback)
function onPdpBuyNowClick() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || 'easel';
  buyNowDirect(productId);
}

function updateCartBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.header-cart-count').forEach(badge => {
    badge.textContent = totalCount;
    badge.style.display = totalCount > 0 ? 'flex' : 'none';
  });
}

// ==========================================
// DYNAMIC PDP (PRODUCT DETAILS PAGE) RENDERER
// ==========================================

function loadProductDetailsPage() {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || 'easel';
  const product = HOPEKRAFT_PRODUCTS[productId] || HOPEKRAFT_PRODUCTS.easel;

  // Update Page Title
  document.title = `${product.name} - HOPEKRAFT Wooden Toys`;

  // Update Main Image
  const mainImg = document.getElementById('pdp-main-image');
  if (mainImg) {
    mainImg.src = product.image;
    mainImg.alt = product.name;
  }

  // Update Thumbnails Grid
  const thumbsContainer = document.querySelector('.pdp-thumbnails-grid');
  if (thumbsContainer && product.thumbnails) {
    thumbsContainer.innerHTML = product.thumbnails.map((t, idx) => `
      <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-img-src="${t.src}" title="${t.label}">
        <img src="${t.src}" alt="${t.label}">
        <span class="thumb-caption">${t.label}</span>
      </button>
    `).join('');
    setupPdpGallery();
  }

  // Update Titles & Eyebrow
  const eyebrowElem = document.querySelector('.pdp-category-eyebrow');
  if (eyebrowElem) eyebrowElem.textContent = product.eyebrow;

  const titleElem = document.querySelector('.pdp-product-title');
  if (titleElem) titleElem.textContent = product.name;

  const taglineElem = document.querySelector('.pdp-product-tagline');
  if (taglineElem) taglineElem.textContent = product.tagline;

  // Update Prices
  const priceCurrent = document.querySelector('.pdp-price-current');
  if (priceCurrent) priceCurrent.textContent = `₹${product.price.toLocaleString('en-IN')}`;

  const priceOld = document.querySelector('.pdp-price-old');
  if (priceOld) priceOld.textContent = `₹${product.oldPrice.toLocaleString('en-IN')}`;

  const saveBadge = document.querySelector('.pdp-save-badge');
  if (saveBadge) saveBadge.textContent = product.discount;

  // Update Key Features
  const featuresContainer = document.querySelector('.pdp-key-features');
  if (featuresContainer && product.features) {
    featuresContainer.innerHTML = product.features.map(f => `
      <div class="key-feature-pill">
        <span class="kf-icon">${f.icon}</span>
        <span>${f.text}</span>
      </div>
    `).join('');
  }

  // Bind Buy Now Buttons
  const buyBtn = document.getElementById('pdp-buy-now-btn');
  if (buyBtn) {
    buyBtn.onclick = (e) => {
      e.preventDefault();
      buyNowDirect(product.id);
    };
  }

  const stickyBuyBtn = document.querySelector('.mobile-sticky-buy-bar .sticky-btn-buy');
  if (stickyBuyBtn) {
    stickyBuyBtn.onclick = (e) => {
      e.preventDefault();
      buyNowDirect(product.id);
    };
  }

  const stickyPrice = document.querySelector('.sticky-buy-price');
  if (stickyPrice) stickyPrice.textContent = `₹${product.price.toLocaleString('en-IN')}`;

  const stickyOld = document.querySelector('.sticky-buy-old');
  if (stickyOld) stickyOld.textContent = `₹${product.oldPrice.toLocaleString('en-IN')} (${product.discount})`;
}

// ==========================================
// DEDICATED CHECKOUT PAGE RENDERER
// ==========================================

function renderCheckoutPage() {
  const previewContainer = document.getElementById('checkout-items-preview');
  const subtotalElem = document.getElementById('checkout-subtotal');
  const totalElem = document.getElementById('checkout-total');
  const btnPlaceOrder = document.getElementById('btn-place-order');

  if (!previewContainer) return;

  const cart = getCart();
  let totalAmount = 0;
  let html = '';

  cart.forEach(item => {
    const product = HOPEKRAFT_PRODUCTS[item.id] || HOPEKRAFT_PRODUCTS.easel;
    const itemTotal = product.price * item.qty;
    totalAmount += itemTotal;

    html += `
      <div style="display: flex; align-items: center; gap: 10px; padding: 6px 0;">
        <div style="width: 44px; height: 44px; min-width: 44px; border-radius: 8px; overflow: hidden; background: #FAF7F0; border: 1px solid var(--color-border);">
          <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1; font-size: 0.82rem; line-height: 1.2;">
          <p style="font-weight: 700; color: var(--color-text-main); margin-bottom: 2px;">${product.name}</p>
          <span style="color: var(--color-text-muted);">Qty: ${item.qty} × ₹${product.price.toLocaleString('en-IN')}</span>
        </div>
        <span style="font-weight: 800; font-size: 0.88rem; color: var(--color-text-main);">₹${itemTotal.toLocaleString('en-IN')}</span>
      </div>
    `;
  });

  previewContainer.innerHTML = html;
  if (subtotalElem) subtotalElem.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
  if (totalElem) totalElem.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
  if (btnPlaceOrder) btnPlaceOrder.textContent = `Place Order • ₹${totalAmount.toLocaleString('en-IN')}`;
}

function submitOrder() {
  const nameInput = document.getElementById('cust-name');
  const phoneInput = document.getElementById('cust-phone');
  const addressInput = document.getElementById('cust-address');
  const cityInput = document.getElementById('cust-city');

  const name = nameInput ? nameInput.value.trim() : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const address = addressInput ? addressInput.value.trim() : '';
  const city = cityInput && cityInput.value.trim() ? cityInput.value.trim() : 'Bengaluru';

  if (!name) {
    showToast('⚠️ Please enter your Full Name.');
    if (nameInput) nameInput.focus();
    return;
  }
  if (!phone) {
    showToast('⚠️ Please enter your Mobile Number.');
    if (phoneInput) phoneInput.focus();
    return;
  }
  if (!address) {
    showToast('⚠️ Please enter your Delivery Address.');
    if (addressInput) addressInput.focus();
    return;
  }

  const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
  let paymentText = 'Cash on Delivery (COD)';
  if (paymentRadio && paymentRadio.value === 'upi') paymentText = 'Instant UPI (GPay / PhonePe / Paytm)';
  if (paymentRadio && paymentRadio.value === 'card') paymentText = 'Online Card / NetBanking Payment';

  const orderId = '#HK-' + Math.floor(10000 + Math.random() * 90000);

  // Extract ordered items before clearing cart
  const cart = getCart();
  const itemNames = cart.map(item => {
    const prod = HOPEKRAFT_PRODUCTS[item.id] || HOPEKRAFT_PRODUCTS.easel;
    return `${prod.name} (Qty: ${item.qty} • ₹${(prod.price * item.qty).toLocaleString('en-IN')})`;
  }).join(', ') || 'HOPEKRAFT Wooden Toy';

  // Hide checkout form grid and show confirmation screen
  const mainGrid = document.getElementById('checkout-main-grid');
  const successScreen = document.getElementById('order-confirmed-view');

  if (mainGrid) mainGrid.style.display = 'none';
  if (successScreen) {
    successScreen.style.display = 'block';
    const nameSpan = document.getElementById('confirm-cust-name');
    const orderIdSpan = document.getElementById('confirm-order-id');
    const addressSpan = document.getElementById('confirm-address');
    const paymentSpan = document.getElementById('confirm-payment');
    const itemsSpan = document.getElementById('confirm-items');

    if (nameSpan) nameSpan.textContent = name;
    if (orderIdSpan) orderIdSpan.textContent = orderId;
    if (addressSpan) addressSpan.textContent = `${address}, ${city}`;
    if (paymentSpan) paymentSpan.textContent = paymentText;
    if (itemsSpan) itemsSpan.textContent = itemNames;
  }

  // Clear cart after order placement
  localStorage.removeItem('hopekraft_cart');
  updateCartBadge();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// INLINE SEARCH ON HOME PAGE
// ==========================================

function setupInlineSearch() {
  const searchBar = document.getElementById('inline-search-bar');
  const headerBtn = document.getElementById('header-search-toggle');
  const closeBtn = document.getElementById('inline-search-close');
  const searchInput = document.getElementById('inline-search-input');

  const toggleSearch = () => {
    if (!searchBar) return;
    const isActive = searchBar.classList.toggle('active');
    if (isActive && searchInput) {
      searchInput.focus();
    }
  };

  if (headerBtn) headerBtn.addEventListener('click', toggleSearch);
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (searchBar) searchBar.classList.remove('active');
      if (searchInput) {
        searchInput.value = '';
        filterProducts('');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterProducts(e.target.value.trim().toLowerCase());
    });
  }
}

function filterProducts(query) {
  const cards = document.querySelectorAll('#products-grid-container .product-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const text = (card.getAttribute('data-title') || card.textContent).toLowerCase();
    if (!query || text.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ==========================================
// WISHLIST TOGGLE
// ==========================================

function setupWishlist() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const isLiked = btn.classList.toggle('active');
      showToast(isLiked ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
    });
  });
}

// ==========================================
// PDP IMAGE GALLERY SWITCHER
// ==========================================

function setupPdpGallery() {
  const mainImg = document.getElementById('pdp-main-image');
  const thumbBtns = document.querySelectorAll('.pdp-thumb-btn');

  if (!mainImg || !thumbBtns.length) return;

  thumbBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      thumbBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const newSrc = btn.getAttribute('data-img-src');
      if (newSrc && mainImg) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.src = newSrc;
          mainImg.style.opacity = '1';
        }, 120);
      }
    });
  });
}

// ==========================================
// PDP ACCORDION TOGGLE
// ==========================================

function toggleAccordion(button) {
  const body = button.nextElementSibling;
  const arrow = button.querySelector('.acc-arrow');
  if (!body) return;

  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? 'block' : 'none';
  if (arrow) {
    arrow.textContent = isHidden ? '▴' : '▾';
  }
}

// ==========================================
// TOAST NOTIFICATION UTILITY
// ==========================================

let toastTimer = null;
function showToast(message, actionHtml = '') {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;

  toast.innerHTML = message + (actionHtml ? actionHtml : '');
  toast.classList.add('active');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 3400);
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupWishlist();
  setupPdpGallery();
  setupInlineSearch();

  // If on product.html, dynamically populate product details from query string
  if (window.location.pathname.includes('product.html') || window.location.href.includes('product.html')) {
    loadProductDetailsPage();
  }

  // If on checkout.html, dynamically populate checkout order summary
  if (window.location.pathname.includes('checkout.html') || window.location.href.includes('checkout.html')) {
    renderCheckoutPage();
  }
});
