'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { useCart } from '@/components/CartProvider';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck, RefreshCw, ArrowLeft } from 'lucide-react';

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
      {/* Top Header with Back button to Storefront */}
      <Header hideSearch backHref="/" />

      <main className="page-container" style={{ maxWidth: '820px', margin: '0 auto', padding: '12px 14px 40px' }}>
        {/* Breadcrumb Header with Back Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#F0ECE4',
                border: '1px solid #DFD8CD',
                color: '#2B1B17',
                textDecoration: 'none'
              }}
              title="Back to Products"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>
                Shopping Cart
              </h1>
              <span style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
                {totalCount} {totalCount === 1 ? 'item' : 'items'} in your cart
              </span>
            </div>
          </div>

          <Link
            href="/"
            style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ← Add More Items
          </Link>
        </div>

        {/* Free Express Delivery Progress Bar */}
        <div
          style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '12px',
            fontSize: '0.76rem',
            color: '#166534',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Truck size={16} color="#16A34A" />
          <span>
            <strong>Free Express Delivery:</strong> You qualify for 100% free doorstep shipping across India!
          </span>
        </div>

        {cart.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {cart.map(item => {
                const product = HOPEKRAFT_PRODUCTS[item.id] || HOPEKRAFT_PRODUCTS.easel;
                const itemTotal = product.price * item.qty;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      padding: '12px',
                      background: '#FFFFFF',
                      border: '1px solid #EAE3D6',
                      borderRadius: '12px',
                      alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        minWidth: '64px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#FAF7F0',
                        border: '1px solid #EAE3D6'
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link
                        href={`/product/${product.id}`}
                        style={{
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          color: '#2B1B17',
                          textDecoration: 'none',
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {product.name}
                      </Link>
                      <div style={{ fontSize: '0.82rem', color: '#8C4320', fontWeight: 800, marginTop: '2px' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Quantity Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#FAF7F0',
                        border: '1px solid #DFD8CD',
                        borderRadius: '6px',
                        padding: '2px'
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        aria-label="Decrease quantity"
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          background: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        aria-label="Increase quantity"
                        style={{
                          width: '24px',
                          height: '24px',
                          border: 'none',
                          background: 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#475569'
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Line Total & Remove */}
                    <div style={{ textAlign: 'right', minWidth: '70px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#2B1B17' }}>
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#DC2626',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          marginTop: '3px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          padding: 0
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={11} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Checkout Card (Mobile Adjusted) */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '1.5px solid #EAE3D6',
                padding: '14px',
                boxShadow: '0 4px 14px rgba(45, 30, 20, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#554A40', marginBottom: '6px' }}>
                <span>Subtotal ({totalCount} items):</span>
                <span style={{ fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#16A34A', fontWeight: 700, marginBottom: '6px' }}>
                  <span>Coupon Discount ({couponCode}):</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#2E7D32', marginBottom: '8px' }}>
                <span>Delivery Charges:</span>
                <span style={{ fontWeight: 800 }}>FREE</span>
              </div>

              {/* Coupon Row */}
              <form onSubmit={handleApply} style={{ display: 'flex', gap: '6px', margin: '8px 0 10px 0' }}>
                <input
                  type="text"
                  placeholder="Promo code (e.g. HOPE10)"
                  value={inputCoupon}
                  onChange={(e) => setInputCoupon(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid #D5CEBE',
                    fontSize: '0.8rem',
                    outline: 'none',
                    background: '#FAFAFA'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '7px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#2B1B17',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Apply
                </button>
              </form>

              {couponCode && (
                <div style={{ fontSize: '0.74rem', color: '#16A34A', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>✓ 10% OFF applied with {couponCode}</span>
                  <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.72rem' }}>
                    Remove
                  </button>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '8px',
                  borderTop: '1px dashed #D5CEBE',
                  marginBottom: '12px'
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#2B1B17' }}>Grand Total:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-primary)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                style={{
                  width: '100%',
                  minHeight: '46px',
                  padding: '12px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #8C4320 0%, #26140B 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 900,
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(38, 20, 11, 0.28)',
                  boxSizing: 'border-box'
                }}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={17} />
              </Link>

              {/* Trust Notes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-around',
                  fontSize: '0.7rem',
                  color: '#776E65',
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid #F0ECE4'
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                  <ShieldCheck size={12} color="#16A34A" /> Child Safe
                </span>
                <span>💵 COD Available</span>
                <span>🔄 7-Day Returns</span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div
            style={{
              textAlign: 'center',
              padding: '40px 16px',
              background: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #EAE3D6'
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🧸</div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2B1B17', margin: '0 0 6px' }}>
              Your Cart is Empty
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#776E65', margin: '0 0 16px' }}>
              Explore our bestselling wooden easels and developmental toys!
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--color-primary)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '0.85rem',
                textDecoration: 'none'
              }}
            >
              <ArrowLeft size={15} /> Continue Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
