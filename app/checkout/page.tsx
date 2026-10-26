'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
import { Lock, Zap, Package, ShieldCheck, Loader2, RotateCw, AlertTriangle } from 'lucide-react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directProductId = searchParams.get('productId') || searchParams.get('id');
  const paymentParam = searchParams.get('payment') || searchParams.get('paymentMethod');

  const directProduct =
    directProductId && HOPEKRAFT_PRODUCTS[directProductId]
      ? HOPEKRAFT_PRODUCTS[directProductId]
      : HOPEKRAFT_PRODUCTS.easel;

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>(
    paymentParam === 'online' ? 'online' : 'cod'
  );

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Easy Anti-Spam Captcha for Cash on Delivery
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showCaptchaWrongModal, setShowCaptchaWrongModal] = useState(false);
  const captchaInputRef = React.useRef<HTMLInputElement>(null);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

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
      setFormError('Please enter delivery address');
      return;
    }
    if (!city.trim()) {
      setFormError('Please enter your city');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setFormError('Please enter a 6-digit pincode');
      return;
    }

    // Easy Captcha Validation for Cash on Delivery
    if (paymentMethod === 'cod') {
      if (!captchaInput.trim() || captchaInput.trim() !== captchaCode) {
        setShowCaptchaWrongModal(true);
        generateCaptcha();
        return;
      }
    }

    setLoading(true);

    const customerDetails = {
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim() || 'hopekraft26@gmail.com',
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      state: 'India'
    };

    const orderItems = [
      {
        id: directProduct.id,
        name: directProduct.name,
        price: directProduct.price,
        qty: 1,
        image: directProduct.image
      }
    ];

    // --- CASE A: CASH ON DELIVERY (INSTANT WITH CAPTCHA) ---
    if (paymentMethod === 'cod') {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerDetails,
            items: orderItems,
            paymentMethod: 'cod'
          })
        });

        const data = await res.json();
        if (!res.ok || !data.order) {
          throw new Error(data.error || 'Failed to place COD order');
        }

        router.push(`/order-success?orderId=${data.order.id}`);
      } catch (err: any) {
        setFormError(err.message || 'Something went wrong while placing COD order.');
        setLoading(false);
      }
      return;
    }

    // --- CASE B: ONLINE PAYMENT VIA RAZORPAY ---
    try {
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: directProduct.id,
          paymentMethod: 'online'
        })
      });

      const createData = await createRes.json();
      if (!createRes.ok || !createData.order) {
        throw new Error(createData.error || 'Could not initialize payment gateway.');
      }

      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzpOptions = {
          key: createData.keyId,
          amount: createData.order.amount,
          currency: 'INR',
          name: 'HOPEKRAFT Toys',
          description: directProduct.name,
          image: directProduct.image,
          order_id: createData.order.id,
          prefill: {
            name: customerDetails.name,
            contact: customerDetails.phone,
            email: customerDetails.email
          },
          theme: {
            color: '#15803D'
          },
          handler: async function (response: any) {
            try {
              const confirmRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customer: customerDetails,
                  items: orderItems,
                  paymentMethod: 'online',
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature
                })
              });

              const confirmData = await confirmRes.json();
              if (!confirmRes.ok || !confirmData.order) {
                throw new Error(confirmData.error || 'Payment verification failed');
              }

              router.push(`/order-success?orderId=${confirmData.order.id}`);
            } catch (err: any) {
              setFormError(err.message || 'Payment verification failed');
              setLoading(false);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.open();
      } else {
        throw new Error('Razorpay SDK failed to load. Please refresh and try again.');
      }
    } catch (err: any) {
      setFormError(err.message || 'Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F1', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '16px 12px 32px', maxWidth: '480px', margin: '0 auto', width: '100%' }}>
        <form onSubmit={handlePlaceOrder}>
          {/* PRODUCT SUMMARY CARD */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1.5px solid #EAE3D6',
              padding: '10px 12px',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(45, 30, 20, 0.04)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#F5EBE1',
                flexShrink: 0
              }}
            >
              <img
                src={directProduct.image}
                alt={directProduct.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#8C4320',
                  letterSpacing: '0.4px',
                  display: 'block'
                }}
              >
                {directProduct.eyebrow || 'HOPEKRAFT COLLECTION'}
              </span>
              <h2
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  color: '#2B1B17',
                  margin: '1px 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {directProduct.name}
              </h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#8C4320' }}>
                  ₹{directProduct.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.74rem', textDecoration: 'line-through', color: '#9CA3AF' }}>
                  ₹{directProduct.oldPrice.toLocaleString('en-IN')}
                </span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    color: '#16A34A',
                    background: '#DCFCE7',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}
                >
                  Free Express Delivery
                </span>
              </div>
            </div>
          </div>

          {/* SINGLE-CARD DELIVERY & PAYMENT FORM */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1.5px solid #EAE3D6',
              padding: '12px 14px',
              boxShadow: '0 4px 14px rgba(45, 30, 20, 0.04)',
              marginBottom: '10px'
            }}
          >
            {/* Header Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px',
                borderBottom: '1px solid #F0ECE4',
                paddingBottom: '6px'
              }}
            >
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#2B1B17' }}>
                Express Doorstep Delivery
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: '#16A34A',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <Lock size={11} /> 100% Secure
              </span>
            </div>

            {formError && (
              <div
                style={{
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#991B1B',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}
              >
                ⚠️ {formError}
              </div>
            )}

            {/* Row 1: Full Name & Phone Number */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: '1px solid #D5CEBE',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#FAFAFA',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9876543210"
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: '1px solid #D5CEBE',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#FAFAFA',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="hopekraft26@gmail.com"
                style={{
                  width: '100%',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  border: '1px solid #D5CEBE',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#FAFAFA',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Row 2: Complete Address */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                Delivery Address (House/Flat, Street, Landmark) *
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Flat 302, Green Apartments, 5th Main"
                style={{
                  width: '100%',
                  padding: '7px 9px',
                  borderRadius: '6px',
                  border: '1px solid #D5CEBE',
                  fontSize: '0.82rem',
                  outline: 'none',
                  background: '#FAFAFA',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Row 3: City & Pincode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Bengaluru"
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: '1px solid #D5CEBE',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#FAFAFA',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                  Pincode (6-Digits) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pincode}
                  onChange={e => setPincode(e.target.value)}
                  placeholder="560038"
                  style={{
                    width: '100%',
                    padding: '7px 9px',
                    borderRadius: '6px',
                    border: '1px solid #D5CEBE',
                    fontSize: '0.82rem',
                    outline: 'none',
                    background: '#FAFAFA',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* PAYMENT METHOD SELECTOR */}
            <div style={{ borderTop: '1px solid #F0ECE4', paddingTop: '10px', marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#2B1B17', marginBottom: '6px' }}>
                Payment Method:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {/* Online Pay Option */}
                <div
                  onClick={() => setPaymentMethod('online')}
                  style={{
                    border: paymentMethod === 'online' ? '2px solid #16A34A' : '1px solid #D5CEBE',
                    background: paymentMethod === 'online' ? '#F0FDF4' : '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#166534' }}>
                      ⚡ Pay Online
                    </span>
                    <span style={{ fontSize: '0.58rem', fontWeight: 900, background: '#16A34A', color: '#FFFFFF', padding: '1px 4px', borderRadius: '3px' }}>
                      -₹100
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#15803D', marginTop: '2px' }}>
                    ₹{(directProduct.price - 100).toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#16A34A' }}>UPI / Card / NetBanking</span>
                </div>

                {/* COD Option */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    border: paymentMethod === 'cod' ? '2px solid #8C4320' : '1px solid #D5CEBE',
                    background: paymentMethod === 'cod' ? '#FDF8F3' : '#FFFFFF',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2B1B17' }}>
                    💵 Cash on Delivery
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#8C4320', marginTop: '2px' }}>
                    ₹{directProduct.price.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#6A5F56' }}>Pay cash at doorstep</span>
                </div>
              </div>
            </div>

            {/* EASY CAPTCHA CODE FOR COD */}
            {paymentMethod === 'cod' && (
              <div
                style={{
                  background: '#FFF8F2',
                  border: '1.5px solid #F5DCC8',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#8C4320' }}>
                    🛡️ Enter 4-Digit Security Code:
                  </span>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '0.68rem',
                      color: '#8C4320',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Change code"
                  >
                    <RotateCw size={11} /> Refresh Code
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #2D1A10 0%, #150B06 100%)',
                      color: '#FFDEB8',
                      letterSpacing: '0.35em',
                      fontSize: '1.2rem',
                      fontWeight: 900,
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontFamily: 'monospace',
                      userSelect: 'none',
                      border: '1px solid #8C4320'
                    }}
                  >
                    {captchaCode}
                  </div>

                  <input
                    ref={captchaInputRef}
                    type="text"
                    maxLength={4}
                    value={captchaInput}
                    onChange={e => setCaptchaInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter digits"
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #D5CEBE',
                      fontSize: '0.9rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      letterSpacing: '0.25em',
                      outline: 'none',
                      background: '#FFFFFF',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>
            )}

            {/* ORDER TOTAL & SUBMIT BUTTON */}
            <div style={{ background: '#F8F6F1', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: '#6A5F56', display: 'block' }}>Total Payable Amount:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: paymentMethod === 'online' ? '#15803D' : '#8C4320' }}>
                  ₹{effectiveTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px' }}>
                Free Shipping Included
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: 'none',
                background:
                  paymentMethod === 'online'
                    ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                    : 'linear-gradient(135deg, #8C4320 0%, #26140B 100%)',
                color: '#FFFFFF',
                fontSize: '0.92rem',
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow:
                  paymentMethod === 'online'
                    ? '0 4px 14px rgba(22, 163, 74, 0.35)'
                    : '0 4px 14px rgba(140, 67, 32, 0.35)',
                opacity: loading ? 0.75 : 1
              }}
            >
              {loading ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {paymentMethod === 'online'
                      ? 'Initializing Secure Gateway...'
                      : 'Confirming Order & Securing Delivery...'}
                  </span>
                </div>
              ) : paymentMethod === 'online' ? (
                <>
                  <Zap size={18} fill="#FFD700" color="#FFD700" />
                  <span>PAY ONLINE (SAVE ₹100) - ₹{effectiveTotal.toLocaleString('en-IN')} ➔</span>
                </>
              ) : (
                <>
                  <Package size={18} color="#FFAA00" />
                  <span>CONFIRM ORDER (COD) - ₹{effectiveTotal.toLocaleString('en-IN')} ➔</span>
                </>
              )}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: '0.66rem',
                color: '#776E65',
                marginTop: '8px'
              }}
            >
              <ShieldCheck size={13} color="#16A34A" />
              <span>Certified Child-Safe Beechwood • 7-Day Easy Replacement</span>
            </div>
          </div>
        </form>

        {/* WRONG CAPTCHA POPUP MODAL */}
        {showCaptchaWrongModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px'
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '350px',
                width: '100%',
                padding: '24px 20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                <AlertTriangle size={28} />
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#991B1B', margin: '0 0 6px' }}>
                Captcha Wrong!
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.45, margin: '0 0 18px' }}>
                Aapne galat security code enter kiya hai. Kripya screen par dikhaya gaya naya 4-digit code dekh kar sahi se enter karein.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowCaptchaWrongModal(false);
                  setTimeout(() => captchaInputRef.current?.focus(), 150);
                }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8C4320 0%, #26140B 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(140, 67, 32, 0.35)'
                }}
              >
                Theek Hai / Dobara Enter Karein ➔
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
