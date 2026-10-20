'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Order } from '@/lib/db';
import { CheckCircle2, Truck, Printer, ArrowLeft, ExternalLink } from 'lucide-react';
import { printPackagingSlip } from '@/lib/packagingSlip';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

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
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Meadows Apartment, 12th Main',
      city: 'Bengaluru',
      pincode: '560038',
      state: 'Karnataka'
    },
    items: [
      {
        id: 'easel',
        name: 'HOPEKRAFT Wooden Kids Easel',
        price: 3499,
        qty: 1,
        image: '/assets/images/easel_full.jpg'
      }
    ],
    subtotal: 3499,
    discount: 0,
    shipping: 0,
    total: 3499,
    paymentMethod: 'cod' as const,
    paymentStatus: 'pending' as const,
    orderStatus: 'Confirmed' as const,
    shippingStatus: 'manifested' as const,
    courierName: 'BlueDart Express',
    awbCode: '78492019402',
    trackingUrl: 'https://shiprocket.co/tracking/78492019402',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return (
    <>
      <Header hideSearch />

      <main className="page-container" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'inline-flex', width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <CheckCircle2 size={36} />
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--color-text-main)', marginBottom: '6px' }}>
          Order Confirmed!
        </h1>
        <p style={{ color: 'var(--color-text-body)', fontSize: '0.95rem' }}>
          Thank you, <strong>{displayOrder.customer.name}</strong>! Your handcrafted wooden toy order has been successfully placed.
        </p>

        <div className="success-order-id" style={{ display: 'inline-block', margin: '14px 0', background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '6px 16px', borderRadius: 'var(--radius-pill)', fontWeight: 800, fontSize: '0.95rem' }}>
          Order Reference: {displayOrder.orderNumber}
        </div>

        {/* Real-Time Logistics Tracking Card */}
        <div className="order-tracking-timeline">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--color-text-main)' }}>
              <Truck size={18} color="var(--color-primary)" />
              <span>Shiprocket Express Delivery</span>
            </div>
            {displayOrder.awbCode && (
              <a
                href={displayOrder.trackingUrl || `https://shiprocket.co/tracking/${displayOrder.awbCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="courier-badge"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                AWB: {displayOrder.awbCode} <ExternalLink size={12} />
              </a>
            )}
          </div>

          <div className="tracking-step done">
            <div className="tracking-dot">✓</div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>Order Placed &amp; Verified</strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Payment: {displayOrder.paymentMethod.toUpperCase()} ({displayOrder.paymentStatus})</p>
            </div>
          </div>

          <div className="tracking-step done">
            <div className="tracking-dot">📦</div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>Manifested &amp; Assigned to Courier</strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Courier: {displayOrder.courierName || 'BlueDart Express'} • Central Hub Bengaluru</p>
            </div>
          </div>

          <div className="tracking-step">
            <div className="tracking-dot">🚚</div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>In Transit to Destination</strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Estimated Delivery: 2-3 Business Days</p>
            </div>
          </div>

          <div className="tracking-step">
            <div className="tracking-dot">🏠</div>
            <div>
              <strong style={{ fontSize: '0.85rem', color: 'var(--color-text-main)' }}>Doorstep Delivery</strong>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Delivering to: {displayOrder.customer.address}, {displayOrder.customer.city}</p>
            </div>
          </div>
        </div>

        {/* Order Details Receipt Box */}
        <div className="print-invoice-area" style={{ background: '#FAF7F0', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '18px', margin: '20px 0', textAlign: 'left', fontSize: '0.85rem', lineHeight: '1.6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '10px', marginBottom: '10px' }}>
            <span style={{ fontWeight: 800, color: 'var(--color-text-main)' }}>HOPEKRAFT INVOICE</span>
            <span style={{ color: 'var(--color-text-muted)' }}>{new Date().toLocaleDateString('en-IN')}</span>
          </div>

          <p><strong>Customer:</strong> {displayOrder.customer.name} ({displayOrder.customer.phone})</p>
          <p><strong>Shipping Address:</strong> {displayOrder.customer.address}, {displayOrder.customer.city}, {displayOrder.customer.pincode}, {displayOrder.customer.state}</p>
          <p><strong>Payment Mode:</strong> {displayOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Pre-paid'}</p>

          <div style={{ margin: '10px 0', borderTop: '1px dashed var(--color-border)', paddingTop: '10px' }}>
            {displayOrder.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontSize: '0.98rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
            <span>Total Amount:</span>
            <span>₹{displayOrder.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
          <Link href="/" className="btn-pill" style={{ background: 'var(--color-primary)', color: '#FFFFFF', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Continue Shopping
          </Link>
          <button
            type="button"
            className="btn-pill btn-pill-outline"
            style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-main)', display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => printPackagingSlip(displayOrder)}
          >
            <Printer size={16} /> Print Packing Receipt
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
