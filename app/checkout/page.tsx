'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
import { ShieldCheck, CheckCircle2, Lock, Truck, Zap, Package, ArrowRight, RefreshCw } from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directProductId = searchParams.get('productId') || searchParams.get('id');
  const paymentParam = searchParams.get('payment') || searchParams.get('paymentMethod');

  const directProduct = directProductId && HOPEKRAFT_PRODUCTS[directProductId] 
    ? HOPEKRAFT_PRODUCTS[directProductId] 
    : HOPEKRAFT_PRODUCTS.easel;

  // Selected payment method initialized from URL parameter ('online' or 'cod')
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>(
    paymentParam === 'online' ? 'online' : 'cod'
  );

  // Form Fields - Fresh & Empty by Default (Zero prefilled dummy data)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ₹100 Instant Discount for Online Payment
  const discountAmount = paymentMethod === 'online' ? 100 : 0;
  const effectiveTotal = Math.max(0, directProduct.price - discountAmount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter your Full Name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter complete delivery address');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter your city');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setFormError('Please enter a valid 6-digit pincode');
      return;
    }

    setLoading(true);

    const orderPayload = {
      customer: {
        name: name.trim(),
        phone: cleanPhone,
        address: address.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        state: 'India'
      },
      items: [
        {
          id: directProduct.id,
          name: directProduct.name,
          price: directProduct.price,
          qty: 1,
          image: directProduct.image
        }
      ],
      subtotal: directProduct.price,
      discount: discountAmount,
      shipping: 0,
      total: effectiveTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending'
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Failed to place order');
      }

      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="app-container storefront-shell" style={{ maxWidth: '520px', margin: '0 auto', background: '#FAF7F2', minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Top Header with Back to Product */}
      <Header hideSearch backHref={`/product/${directProduct.id}`} />

      {/* FAST SPLASH & GLOW ANIMATION KEYFRAMES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fastSplashSweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          35% {
            transform: translateX(250%) skewX(-25deg);
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
          }
        }

        .hk-brown-checkout-btn {
          background: linear-gradient(135deg, #8C4320 0%, #26140B 100%) !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(38, 20, 11, 0.38);
        }

        .hk-brown-checkout-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0) 100%);
          animation: fastSplashSweep 1.6s infinite ease-in-out;
          pointer-events: none;
        }

        .hk-green-checkout-btn {
          background: linear-gradient(135deg, #15803D 0%, #0D5426 100%) !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          position: relative;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(21, 128, 61, 0.45);
        }

        .hk-green-checkout-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%);
          animation: fastSplashSweep 1.6s infinite ease-in-out;
          pointer-events: none;
        }
      `}} />

      <main style={{ padding: '10px 14px' }}>
        {/* Compact 1-Screen Order Box */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #EAE3D6', padding: '16px', boxShadow: '0 4px 18px rgba(45, 30, 20, 0.05)' }}>
          
          {/* Item Mini Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#FBF9F5', padding: '10px 12px', borderRadius: '10px', border: '1px solid #EFEAE1', marginBottom: '12px' }}>
            <img 
              src={directProduct.image} 
              alt={directProduct.name} 
              style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E5E0D8' }} 
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#2B1B17', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {directProduct.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#8C4320' }}>
                  ₹{directProduct.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#887B70', textDecoration: 'line-through' }}>
                  ₹{directProduct.oldPrice.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2E7D32', background: '#E8F5E9', padding: '1px 5px', borderRadius: '3px' }}>
                  Free Delivery
                </span>
              </div>
            </div>
          </div>

          {/* ACTIVE CHOICE NOTIFICATION & SWITCH BANNER */}
          {paymentMethod === 'online' ? (
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '1.5px solid #10B981',
              borderRadius: '10px',
              padding: '9px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#065F46', lineHeight: 1.2 }}>
                    Online Payment Selected • ₹100 OFF Applied!
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#047857' }}>
                    Paying ₹{effectiveTotal.toLocaleString('en-IN')} instead of ₹{directProduct.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #059669',
                  color: '#065F46',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                }}
              >
                Switch to COD
              </button>
            </div>
          ) : (
            <div style={{
              background: '#FAF7F2',
              border: '1.5px solid #D5CEBE',
              borderRadius: '10px',
              padding: '9px 12px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.25rem' }}>💵</span>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#382314', lineHeight: 1.2 }}>
                    Cash on Delivery Selected
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#6A5F56' }}>
                    Pay ₹{directProduct.price.toLocaleString('en-IN')} in cash at doorstep
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentMethod('online')}
                style={{
                  background: '#15803D',
                  border: 'none',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  padding: '5px 9px',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.3)'
                }}
              >
                Save ₹100 Online ⚡
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid #F0ECE4', paddingBottom: '8px' }}>
            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#2B1B17', margin: 0 }}>
              Express Doorstep Delivery
            </h1>
            <span style={{ fontSize: '0.7rem', color: '#2E7D32', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
              <Lock size={12} /> Secure
            </span>
          </div>

          {formError && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '8px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
              ⚠️ {formError}
            </div>
          )}

          {/* Compact Input Form */}
          <form onSubmit={handlePlaceOrder}>
            {/* Row 1: Name & Phone (2-col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '3px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #D5CEBE', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '3px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #D5CEBE', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Row 2: Complete Address */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '3px' }}>
                Delivery Address (Flat / House No., Landmark) *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House #12, 3rd Main, Indiranagar"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #D5CEBE', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box', resize: 'none' }}
              />
            </div>

            {/* Row 3: City & Pincode (2-col) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '3px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bangalore"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #D5CEBE', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '3px' }}>
                  Pincode (6-Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560038"
                  style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #D5CEBE', fontSize: '0.85rem', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* INTERACTIVE PAYMENT METHOD CARDS (Instant Switching Allowed) */}
            <div style={{ background: '#FAF7F2', borderRadius: '12px', padding: '10px 12px', border: '1.5px solid #EAE2D5', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#382314' }}>
                  Choose Payment Method:
                </span>
                <span style={{ fontSize: '0.66rem', color: '#6A5F56' }}>
                  (Click any option to switch)
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Option 1: Pay Online (₹100 Instant Discount) */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: paymentMethod === 'online' ? '2px solid #16A34A' : '1px solid #D5CEBE',
                    background: paymentMethod === 'online' ? '#F0FDF4' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: paymentMethod === 'online' ? '0 2px 8px rgba(22, 163, 74, 0.15)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      style={{ accentColor: '#16A34A', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#14532D' }}>
                          ⚡ Pay Online (UPI / Card / NetBanking)
                        </span>
                        <span style={{ fontSize: '0.62rem', fontWeight: 900, background: '#16A34A', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>
                          SAVE ₹100
                        </span>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#166534', marginTop: '1px' }}>
                        Instant automated verification • Zero handling fee
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#15803D' }}>
                      ₹{(directProduct.price - 100).toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#887B70', textDecoration: 'line-through' }}>
                      ₹{directProduct.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Option 2: Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '9px',
                    border: paymentMethod === 'cod' ? '2px solid #8C4320' : '1px solid #D5CEBE',
                    background: paymentMethod === 'cod' ? '#FDF8F3' : '#FFFFFF',
                    cursor: 'pointer',
                    boxShadow: paymentMethod === 'cod' ? '0 2px 8px rgba(140, 67, 32, 0.12)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      style={{ accentColor: '#8C4320', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <div>
                      <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#2B1B17' }}>
                        💵 Cash on Delivery (COD)
                      </span>
                      <div style={{ fontSize: '0.68rem', color: '#6A5F56', marginTop: '1px' }}>
                        Inspect parcel and pay in cash at doorstep
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 900, color: '#2B1B17' }}>
                    ₹{directProduct.price.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER PRICE BREAKDOWN ROW */}
            <div style={{ background: '#F8F6F1', borderRadius: '10px', padding: '10px 12px', border: '1px solid #EAE3D6', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#554A40', marginBottom: '4px' }}>
                <span>Item Subtotal:</span>
                <span style={{ fontWeight: 700 }}>₹{directProduct.price.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#2E7D32', marginBottom: '4px' }}>
                <span>Express Courier Shipping:</span>
                <span style={{ fontWeight: 700 }}>FREE (₹0)</span>
              </div>
              {paymentMethod === 'online' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#15803D', fontWeight: 800, marginBottom: '4px' }}>
                  <span>⚡ Instant Online Discount:</span>
                  <span>- ₹100</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed #D5CEBE', marginTop: '4px' }}>
                <span style={{ fontSize: '0.84rem', color: '#2B1B17', fontWeight: 800 }}>Total Payable Amount:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: paymentMethod === 'online' ? '#15803D' : '#8C4320' }}>
                  ₹{effectiveTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* DYNAMIC CONFIRM BUTTON (Adapts text, color and splash to chosen method) */}
            <button
              type="submit"
              disabled={loading}
              className={paymentMethod === 'online' ? 'hk-green-checkout-btn' : 'hk-brown-checkout-btn'}
              style={{
                width: '100%',
                minHeight: '52px',
                padding: '14px 20px',
                borderRadius: '12px',
                fontSize: '0.98rem',
                fontWeight: 900,
                letterSpacing: '0.3px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <span>⏳ Placing Order...</span>
              ) : paymentMethod === 'online' ? (
                <>
                  <Zap size={20} fill="#FFD700" color="#FFD700" />
                  <span>PAY ONLINE (₹100 OFF) - ₹{effectiveTotal.toLocaleString('en-IN')} ➔</span>
                </>
              ) : (
                <>
                  <Package size={20} color="#FFAA00" />
                  <span>CONFIRM ORDER (COD) - ₹{effectiveTotal.toLocaleString('en-IN')} ➔</span>
                </>
              )}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.68rem', color: '#776E65', marginTop: '10px' }}>
              <ShieldCheck size={14} color="#2E7D32" />
              <span>100% Verified Purchase • Instant SMS Tracking Included</span>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center', background: '#FAF7F2', minHeight: '100vh', fontFamily: 'sans-serif' }}>Loading Secure Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
