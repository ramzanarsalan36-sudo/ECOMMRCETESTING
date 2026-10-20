'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/components/CartProvider';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQty,
    subtotal,
    discount,
    couponCode,
    applyCoupon,
    removeCoupon,
    total,
    totalCount
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCoupon.trim()) return;
    const ok = applyCoupon(inputCoupon);
    if (ok) setInputCoupon('');
  };

  return (
    <div className="app-container storefront-shell">
      <Header hideSearch />

      <main className="page-container">
        {/* Breadcrumb Header */}
        <div className="page-header-title-bar">
          <div>
            <h1 className="page-title">Shopping Cart</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              <span>{totalCount} {totalCount === 1 ? 'item' : 'items'}</span> in your cart
            </p>
          </div>
          <Link href="/#bestsellers" className="back-link">
            ← Continue Shopping
          </Link>
        </div>

        {/* Free Express Delivery Progress Bar */}
        <div className="free-shipping-card">
          <div className="free-shipping-text">
            <span>🎉</span>
            <span><strong>Free Express Shipping Unlocked!</strong> You qualify for 100% free doorstep delivery across India.</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: '100%' }}></div>
          </div>
        </div>

        {cart.length > 0 ? (
          <div className="cart-grid">
            {/* Left Column: Items List */}
            <div className="cart-items-wrapper">
              {cart.map(item => {
                const product = HOPEKRAFT_PRODUCTS[item.id] || HOPEKRAFT_PRODUCTS.easel;
                const itemTotal = product.price * item.qty;

                return (
                  <div key={item.id} className="cart-item-card" style={{ display: 'flex', gap: '16px', padding: '16px', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', marginBottom: '12px', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', minWidth: '80px', borderRadius: '10px', overflow: 'hidden', background: '#FAF7F0', border: '1px solid var(--color-border)' }}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                        {product.eyebrow}
                      </div>
                      <Link href={`/product/${product.id}`} style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--color-text-main)', textDecoration: 'none', display: 'block', margin: '2px 0 6px' }}>
                        {product.name}
                      </Link>
                      <div style={{ fontSize: '0.88rem', color: 'var(--color-text-body)', fontWeight: 600 }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="cart-qty-stepper">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="qty-display">{item.qty}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div style={{ textAlign: 'right', minWidth: '80px' }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-main)' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: '#E8604C', cursor: 'pointer', fontSize: '0.78rem', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        title="Remove item"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary & Checkout CTA */}
            <div className="order-summary-card">
              <h2 className="summary-title">Order Summary</h2>

              <div className="summary-line">
                <span>Subtotal ({totalCount} items)</span>
                <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>

              {discount > 0 && (
                <div className="summary-line coupon-discount-line">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="summary-line">
                <span>Shipping</span>
                <span className="summary-free-tag">FREE (₹0)</span>
              </div>

              <div className="summary-line">
                <span>Estimated Delivery</span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>2-3 Business Days</span>
              </div>

              {/* Coupon Code Row */}
              <form onSubmit={handleApply} className="coupon-row">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Promo code (e.g. HOPE10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                />
                <button type="submit" className="coupon-btn">
                  Apply
                </button>
              </form>

              {couponCode && (
                <div style={{ fontSize: '0.78rem', color: '#2E8B57', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '-4px 0 10px' }}>
                  <span>✓ 10% OFF applied with {couponCode}</span>
                  <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#E8604C', cursor: 'pointer', textDecoration: 'underline' }}>
                    Remove
                  </button>
                </div>
              )}

              <div className="summary-line total">
                <span>Grand Total</span>
                <span style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <Link href="/checkout" className="btn-checkout-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </Link>

              {/* Trust Badges */}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} color="#2E8B57" /> 100% Certified Child-Safe Materials
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💵</span> Cash on Delivery (COD) &amp; Instant UPI Available
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} color="#FFAA00" /> 7-Day Easy Doorstep Returns
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="cart-empty-box" style={{ display: 'block' }}>
            <div className="cart-empty-icon">🧸</div>
            <h2 className="cart-empty-title">Your Cart is Currently Empty</h2>
            <p className="cart-empty-sub">Explore our bestselling wooden toys, easels, and developmental blocks!</p>
            <Link href="/#bestsellers" className="btn-pill" style={{ background: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-block', textDecoration: 'none' }}>
              Browse Best Sellers →
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
