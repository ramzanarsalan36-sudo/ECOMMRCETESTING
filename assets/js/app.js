/**
 * HOPEKRAFT - Wooden Toys & Learning Essentials
 * Core Application Logic: Cart State, PDP Gallery, Inline Search, Checkout & Wishlist
 * Zero Popups: Pure, direct page navigation (cart.html & checkout.html)
 */

// Product Catalog
const HOPEKRAFT_PRODUCTS = {
  easel: {
    id: 'easel',
    name: 'HOPEKRAFT Wooden Kids Easel',
    subtitle: 'Double-Sided Whiteboard & Blackboard',
    price: 3499,
    oldPrice: 4999,
    image: 'assets/images/product_easel.png',
    url: 'product.html'
  },
  blocks: {
    id: 'blocks',
    name: 'Wooden Alphabet & Number Blocks',
    subtitle: 'Natural Beechwood Montessori Blocks',
    price: 1299,
    oldPrice: 1799,
    image: 'assets/images/product_blocks.png',
    url: 'product.html?id=blocks'
  },
  rings: {
    id: 'rings',
    name: 'Wooden Stacking Ring Tower',
    subtitle: 'Rainbow Polished Beechwood Ring Stack',
    price: 999,
    oldPrice: 1399,
    image: 'assets/images/product_rings.png',
    url: 'product.html?id=rings'
  },
  train: {
    id: 'train',
    name: 'Wooden Train Set',
    subtitle: 'Classic Magnetic Locomotive & Carriages',
    price: 1499,
    oldPrice: 1999,
    image: 'assets/images/product_train.png',
    url: 'product.html?id=train'
  }
};

// ==========================================
// CART STATE MANAGEMENT (LocalStorage)
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
  // Default sample cart item
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

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, qty: qty });
  }
  saveCart(cart);

  const product = HOPEKRAFT_PRODUCTS[productId] || { name: 'Item' };
  showToast(`✅ Added ${product.name} to Cart!`, `<a href="cart.html">View Cart →</a>`);
}

function buyNowDirect(productId) {
  saveCart([{ id: productId, qty: 1 }]);
  window.location.href = 'checkout.html';
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
// DEDICATED CART PAGE RENDERER
// ==========================================

function renderCartPage() {
  const container = document.getElementById('cart-items-list');
  const emptyView = document.getElementById('cart-empty-view');
  const gridWrap = document.getElementById('cart-grid-wrap');
  const countLabel = document.getElementById('cart-item-count-label');
  const subtotalElem = document.getElementById('summary-subtotal');
  const totalElem = document.getElementById('summary-total');

  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (gridWrap) gridWrap.style.display = 'none';
    if (emptyView) emptyView.style.display = 'block';
    if (countLabel) countLabel.textContent = '0 items';
    return;
  }

  if (gridWrap) gridWrap.style.display = 'grid';
  if (emptyView) emptyView.style.display = 'none';

  let totalAmount = 0;
  let totalItems = 0;

  let html = '';
  cart.forEach(item => {
    const product = HOPEKRAFT_PRODUCTS[item.id] || {
      id: item.id,
      name: 'HOPEKRAFT Toy',
      subtitle: 'Wooden Learning Essential',
      price: 3499,
      image: 'assets/images/product_easel.png',
      url: 'product.html'
    };

    const itemTotal = product.price * item.qty;
    totalAmount += itemTotal;
    totalItems += item.qty;

    html += `
      <div class="cart-item-card" data-id="${product.id}">
        <div class="cart-item-thumb">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="cart-item-info">
          <a href="${product.url}" class="cart-item-name">${product.name}</a>
          <span class="cart-item-meta">${product.subtitle}</span>
          <span class="cart-item-price">₹${product.price.toLocaleString('en-IN')}</span>

          <div class="cart-item-controls">
            <div class="qty-stepper">
              <button class="qty-btn" onclick="changeCartQty('${product.id}', -1)" aria-label="Decrease quantity">−</button>
              <span class="qty-input">${item.qty}</span>
              <button class="qty-btn" onclick="changeCartQty('${product.id}', 1)" aria-label="Increase quantity">+</button>
            </div>
            <button class="cart-remove-btn" onclick="removeCartItem('${product.id}')">
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (countLabel) countLabel.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
  if (subtotalElem) subtotalElem.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
  if (totalElem) totalElem.textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
}

function changeCartQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveCart(cart);
  renderCartPage();
}

function removeCartItem(productId) {
  let cart = getCart();
  cart = cart.filter(i => i.id !== productId);
  saveCart(cart);
  renderCartPage();
  showToast('Item removed from cart');
}

function applyCoupon() {
  const input = document.getElementById('coupon-code-input');
  if (!input) return;
  const code = input.value.trim().toUpperCase();
  if (code === 'HOPE10' || code === 'WELCOME10') {
    showToast('🎉 Coupon Applied! 10% Extra Discount');
    const totalElem = document.getElementById('summary-total');
    if (totalElem) {
      const current = parseInt(totalElem.textContent.replace(/[^\d]/g, ''), 10);
      const discounted = Math.round(current * 0.9);
      totalElem.textContent = `₹${discounted.toLocaleString('en-IN')}`;
    }
  } else if (code.length > 0) {
    showToast('Invalid promo code. Try HOPE10');
  }
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

  const name = nameInput ? nameInput.value.trim() : 'Customer';
  const address = addressInput ? addressInput.value.trim() : 'Flat 402, Bengaluru';
  const city = cityInput ? cityInput.value.trim() : 'Bengaluru';

  const paymentRadio = document.querySelector('input[name="payment-method"]:checked');
  let paymentText = 'Cash on Delivery (COD)';
  if (paymentRadio && paymentRadio.value === 'upi') paymentText = 'Instant UPI';
  if (paymentRadio && paymentRadio.value === 'card') paymentText = 'Card / NetBanking';

  const orderId = '#HK-' + Math.floor(10000 + Math.random() * 90000);

  // Hide form, show confirmation screen
  const mainGrid = document.getElementById('checkout-main-grid');
  const successScreen = document.getElementById('order-confirmed-view');

  if (mainGrid) mainGrid.style.display = 'none';
  if (successScreen) {
    successScreen.style.display = 'block';
    const nameSpan = document.getElementById('confirm-cust-name');
    const orderIdSpan = document.getElementById('confirm-order-id');
    const addressSpan = document.getElementById('confirm-address');
    const paymentSpan = document.getElementById('confirm-payment');

    if (nameSpan) nameSpan.textContent = name;
    if (orderIdSpan) orderIdSpan.textContent = orderId;
    if (addressSpan) addressSpan.textContent = `${address}, ${city}`;
    if (paymentSpan) paymentSpan.textContent = paymentText;
  }

  // Clear cart after successful order
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
  const bottomBtn = document.getElementById('bottom-search-toggle');
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
  if (bottomBtn) bottomBtn.addEventListener('click', toggleSearch);
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

  // Bind Add to Cart buttons
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const productId = btn.getAttribute('data-add-cart') || 'easel';
      addToCart(productId, 1);
    });
  });
});
