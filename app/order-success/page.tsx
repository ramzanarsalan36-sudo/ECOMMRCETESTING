'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Order } from '@/lib/db';
import {
  Truck,
  Printer,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Package
} from 'lucide-react';
import { printPackagingSlip } from '@/lib/packagingSlip';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.order) {
          setOrder(data.order);
        }
      })
      .catch(err => console.error('Failed to load order', err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const displayOrder: Order = order || {
    id: orderId || 'HK-89421',
    orderNumber: `#${orderId || 'HK-89421'}`,
    customer: {
      name: 'Customer',
      phone: '+91 98765 43210',
      address: 'Delivery Address',
      city: 'Bengaluru',
      pincode: '560038',
      state: 'Karnataka'
    },
    items: [
      {
        id: 'easel',
        name: 'HOPEKRAFT Wooden Kids Easel',
        price: 1999,
        qty: 1,
        image: '/assets/images/easel_full.jpg'
      }
    ],
    subtotal: 1999,
    discount: 0,
    shipping: 0,
    total: 1999,
    paymentMethod: 'cod' as const,
    paymentStatus: 'pending' as const,
    orderStatus: 'Confirmed' as const,
    shippingStatus: 'manifested' as const,
    courierName: 'Shiprocket Express',
    awbCode: '78492019402',
    trackingUrl: 'https://shiprocket.co/tracking/78492019402',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(displayOrder.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const trackingLink =
    displayOrder.trackingUrl ||
    (displayOrder.awbCode
      ? `https://shiprocket.co/tracking/${displayOrder.awbCode}`
      : `https://shiprocket.co/tracking/${displayOrder.id}`);

  return (
    <>
      <Header hideSearch backHref="/" />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes successPop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes strokeDraw {
          0% { stroke-dashoffset: 50; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.45); }
          70% { box-shadow: 0 0 0 18px rgba(22, 163, 74, 0); }
          100% { box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        .anim-success-badge {
          animation: successPop 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, ringPulse 1.8s infinite 0.6s ease-out;
        }
        .anim-check-stroke {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: strokeDraw 0.5s ease-out 0.3s forwards;
        }
      `
        }}
      />

      <main
        className="page-container"
        style={{
          maxWidth: '460px',
          margin: '0 auto',
          padding: '16px 14px 40px',
          textAlign: 'center'
        }}
      >
        {/* CELEBRATORY ANIMATED BADGE */}
        <div style={{ margin: '10px auto 14px' }}>
          <div
            className="anim-success-badge"
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)'
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                className="anim-check-stroke"
                d="M5 13L9.5 17.5L19 7"
                stroke="#FFFFFF"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h1
          style={{
            fontSize: '1.45rem',
            fontWeight: 900,
            color: 'var(--color-text-main)',
            marginBottom: '4px'
          }}
        >
          Order Confirmed! 🎉
        </h1>
        <p style={{ fontSize: '0.82rem', color: '#6A5F56', margin: '0 0 12px' }}>
          Thank you, <strong>{displayOrder.customer.name}</strong>! Your order has been placed.
        </p>

        {/* ORDER TRACKING ID CARD */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #EAE3D6',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '14px',
            boxShadow: '0 4px 14px rgba(45, 30, 20, 0.05)',
            textAlign: 'left'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
              borderBottom: '1px solid #F0ECE4',
              paddingBottom: '8px'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#8C4320',
                  letterSpacing: '0.5px'
                }}
              >
                Track Your Order
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <strong style={{ fontSize: '1rem', color: '#2B1B17', fontFamily: 'monospace' }}>
                  {displayOrder.orderNumber}
                </strong>
                <button
                  type="button"
                  onClick={copyOrderId}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: copied ? '#16A34A' : '#64748B',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '0.72rem',
                    padding: '2px 4px'
                  }}
                  title="Copy Tracking ID"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#166534',
                background: '#DCFCE7',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #BBF7D0'
              }}
            >
              Confirmed
            </span>
          </div>

          {/* Direct Track Button */}
          <a
            href={trackingLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              width: '100%',
              minHeight: '42px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#2B1B17',
              color: '#FFFFFF',
              fontSize: '0.84rem',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxSizing: 'border-box',
              marginBottom: '10px',
              boxShadow: '0 2px 8px rgba(43, 27, 23, 0.25)'
            }}
          >
            <Truck size={16} />
            <span>Track Your Order Now ➔</span>
          </a>

          <div style={{ fontSize: '0.74rem', color: '#6A5F56', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>
              🚚 <strong>Courier:</strong> {displayOrder.courierName || 'Shiprocket Air Express'}
            </div>
            {displayOrder.awbCode && (
              <div>
                📦 <strong>AWB Number:</strong> {displayOrder.awbCode}
              </div>
            )}
            <div>
              📍 <strong>Delivering to:</strong> {displayOrder.customer.city} ({displayOrder.customer.pincode})
            </div>
            <div>
              ⏱️ <strong>Estimated Arrival:</strong> 2-3 Business Days
            </div>
          </div>
        </div>

        {/* ORDER RECEIPT SUMMARY (COMPACT MOBILE FIT) */}
        <div
          style={{
            background: '#FAF7F0',
            border: '1px solid #EAE3D6',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '14px',
            textAlign: 'left',
            fontSize: '0.78rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 800,
              color: '#2B1B17',
              marginBottom: '8px',
              borderBottom: '1px solid #E5DFD4',
              paddingBottom: '6px'
            }}
          >
            <span>Item Details</span>
            <span>Qty × Price</span>
          </div>

          {displayOrder.items.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4px',
                color: '#475569'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                {item.name}
              </span>
              <span style={{ fontWeight: 700, color: '#2B1B17' }}>
                ₹{(item.price * item.qty).toLocaleString('en-IN')}
              </span>
            </div>
          ))}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px dashed #D5CEBE',
              paddingTop: '6px',
              marginTop: '6px',
              fontSize: '0.86rem',
              fontWeight: 800,
              color: '#2B1B17'
            }}
          >
            <span>Total Amount Paid / Due:</span>
            <span style={{ color: '#8C4320' }}>₹{displayOrder.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              flex: 1,
              background: 'var(--color-primary)',
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={14} /> Back to Store
          </Link>

          <button
            type="button"
            onClick={() => printPackagingSlip(displayOrder)}
            style={{
              flex: 1,
              background: '#FFFFFF',
              border: '1px solid #D5CEBE',
              color: '#2B1B17',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Printer size={14} /> Print Receipt
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
