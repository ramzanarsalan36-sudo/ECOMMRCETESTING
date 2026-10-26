'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';
import { Lock, Zap, Package, ShieldCheck, ArrowRight, Loader2, MessageCircle, CheckCircle2, X } from 'lucide-react';

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

  // [WHATSAPP_INTEGRATION] 4-Digit COD OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  // ₹100 Instant Discount for Online Payment
  const discountAmount = paymentMethod === 'online' ? 100 : 0;
  const effectiveTotal = Math.max(0, directProduct.price - discountAmount);

  // [WHATSAPP_INTEGRATION] Step 1: Send 4-digit OTP via WhatsApp
  const initiateCodOtp = async (cleanPhone: string) => {
    setLoading(true);
    setOtpError(null);
    setOtpSuccessMsg(null);
    setOtpValue('');

    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send WhatsApp verification OTP.');
      }

      setVerificationToken(data.verificationToken);
      setOtpSuccessMsg(data.message || '4-digit verification code sent to your WhatsApp!');
      if (data.devCode) {
        setDevOtpHint(data.devCode);
      }
      setShowOtpModal(true);
      setResendCountdown(30);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send WhatsApp OTP.');
    } finally {
      setLoading(false);
    }
  };

  // [WHATSAPP_INTEGRATION] Step 2: Verify 4-digit OTP and place COD order
  const handleVerifyOtpAndPlaceCodOrder = async () => {
    if (!otpValue || otpValue.trim().length !== 4) {
      setOtpError('Please enter the 4-digit code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    const cleanPhone = phone.replace(/\D/g, '');

    try {
      const verifyRes = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          otp: otpValue.trim(),
          verificationToken
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.verified) {
        throw new Error(verifyData.error || 'Incorrect OTP code. Please check your WhatsApp.');
      }

      // Verified! Now create order in database
      await executeCreateCodOrder(verifyData.codToken);
    } catch (err: any) {
      setOtpError(err.message || 'Verification failed. Please try again.');
      setOtpLoading(false);
    }
  };

  // Execute creating the COD order once verified
  const executeCreateCodOrder = async (codToken?: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
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

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerDetails,
          items: orderItems,
          paymentMethod: 'cod',
          codToken
        })
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        throw new Error(data.error || 'Failed to place COD order');
      }

      setShowOtpModal(false);
      router.push(`/order-success?orderId=${data.order.id}`);
    } catch (err: any) {
      setOtpError(err.message || 'Something went wrong while placing COD order.');
      setOtpLoading(false);
    }
  };

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

    // --- CASE A: CASH ON DELIVERY WITH WHATSAPP 4-DIGIT OTP ---
    if (paymentMethod === 'cod') {
      await initiateCodOtp(cleanPhone);
      return;
    }

    // --- CASE B: ONLINE PAYMENT VIA RAZORPAY ---
    try {
      // 1. Create secure order on server (price verified server-side)
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

      // Check if Razorpay SDK loaded
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
            // 2. Razorpay payment succeeded, send cryptographic proof to server
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
                throw new Error(confirmData.error || 'Payment was received but order verification failed.');
              }

              router.push(`/order-success?orderId=${confirmData.order.id}`);
            } catch (confirmErr: any) {
              setFormError(confirmErr.message || 'Error verifying payment with server.');
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
        rzp.on('payment.failed', function (failedResp: any) {
          setFormError(failedResp.error?.description || 'Payment was unsuccessful. Please try again.');
          setLoading(false);
        });
        rzp.open();
      } else {
        // Fallback if Razorpay SDK script failed to load in browser
        throw new Error('Razorpay SDK is still loading. Please refresh and try again.');
      }
    } catch (onlineErr: any) {
      setFormError(onlineErr.message || 'Payment initialization error.');
      setLoading(false);
    }
  };

  return (
    <div className="app-container storefront-shell checkout-shell">
      {/* Top Header with Back Button to Cart or Product */}
      <Header hideSearch backHref="/cart" />

      <main style={{ maxWidth: '480px', margin: '0 auto', padding: '10px 12px 30px' }}>
        <form onSubmit={handlePlaceOrder}>
          {/* PRODUCT MINI STRIP (COMPACT FIT) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #EAE3D6',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <img
              src={directProduct.image}
              alt={directProduct.name}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '6px',
                objectFit: 'cover',
                border: '1px solid #EAE3D6'
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: '#2B1B17',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {directProduct.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#8C4320' }}>
                  ₹{directProduct.price.toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize: '0.66rem', color: '#887B70', textDecoration: 'line-through' }}>
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

          {/* SINGLE-CARD DELIVERY & PAYMENT FORM (PERFECT MOBILE FIT) */}
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
                  placeholder="10-digit number"
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

            {/* Email Address (for tracking & invoice updates) */}
            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>
                Email Address (Order Tracking &amp; Invoice)
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

            {/* PAYMENT METHOD SELECTOR (COMPACT 2-PILL CHOICE) */}
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
                  <MessageCircle size={18} color="#25D366" />
                  <span>VERIFY ON WHATSAPP & ORDER (COD) ➔</span>
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

        {/* [WHATSAPP_INTEGRATION] 4-Digit COD OTP Verification Modal */}
        {showOtpModal && (
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
                maxWidth: '380px',
                width: '100%',
                padding: '24px 20px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                textAlign: 'center'
              }}
            >
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  background: '#F1F5F9',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748B'
                }}
              >
                <X size={16} />
              </button>

              {/* WhatsApp Icon Header */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px'
                }}
              >
                <MessageCircle size={28} />
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                WhatsApp COD Verification
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4, marginBottom: '16px' }}>
                We sent a 4-digit verification code via WhatsApp to <strong style={{ color: '#0F172A' }}>+91 {phone.replace(/\D/g, '')}</strong>.
              </p>

              {otpError && (
                <div
                  style={{
                    background: '#FEE2E2',
                    border: '1px solid #FCA5A5',
                    color: '#991B1B',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    marginBottom: '12px'
                  }}
                >
                  ⚠️ {otpError}
                </div>
              )}

              {/* 4-Digit Input */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  maxLength={4}
                  autoFocus
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  style={{
                    width: '180px',
                    height: '52px',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: '0.45em',
                    borderRadius: '10px',
                    border: '2px solid #25D366',
                    outline: 'none',
                    background: '#F0FDF4',
                    color: '#0F172A',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)'
                  }}
                />
              </div>

              {devOtpHint && (
                <div
                  style={{
                    display: 'inline-block',
                    background: '#FEF3C7',
                    border: '1px dashed #F59E0B',
                    color: '#92400E',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    marginBottom: '12px'
                  }}
                >
                  ⚡ Test Code: <strong>{devOtpHint}</strong>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerifyOtpAndPlaceCodOrder}
                disabled={otpLoading || otpValue.length !== 4}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#FFFFFF',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: otpLoading || otpValue.length !== 4 ? 'not-allowed' : 'pointer',
                  opacity: otpLoading || otpValue.length !== 4 ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)'
                }}
              >
                {otpLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Verify & Confirm Order ➔</span>
                  </>
                )}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem' }}>
                {resendCountdown > 0 ? (
                  <span style={{ color: '#94A3B8' }}>Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => initiateCodOtp(phone.replace(/\D/g, ''))}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#16A34A',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Resend WhatsApp Code
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Edit Mobile Number
                </button>
              </div>
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
