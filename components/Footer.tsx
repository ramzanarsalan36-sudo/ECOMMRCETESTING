import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="storefront-footer" style={{ background: '#FAF7F2', borderTop: '1px solid #EFEAE1', color: '#2D1E18', padding: '28px 20px 80px 20px', marginTop: '20px' }}>
      <div className="footer-content-wrap" style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
        {/* LOGO */}
        <div style={{ marginBottom: '14px' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img
              src="/assets/images/hopekraft_logo.png"
              alt="Hopekraft - Wooden Educational Products"
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <p style={{ fontSize: '0.76rem', color: '#7A6E67', margin: '6px 0 0 0', fontWeight: 400 }}>
            Handcrafted wooden toys for curious minds &amp; natural living spaces.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.76rem', color: '#5D4037', flexWrap: 'wrap', justifyContent: 'center', margin: '14px 0' }}>
          <Link href="/#bestsellers" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 500 }}>Best Sellers</Link>
          <span>•</span>
          <Link href="/#why-hopekraft" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 500 }}>Why Hopekraft</Link>
          <span>•</span>
          <Link href="/#reviews" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 500 }}>Parent Reviews</Link>
          <span>•</span>
          <Link href="/cart" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 500 }}>Shopping Cart</Link>
          <span>•</span>
          <Link href="/checkout" style={{ color: '#8C4320', textDecoration: 'none', fontWeight: 600 }}>Checkout</Link>
          <span>•</span>
          <Link href="/admin" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 500 }}>Admin Portal</Link>
        </div>

        {/* CONTACT INFO */}
        <div style={{ fontSize: '0.74rem', color: '#6D4C41', margin: '12px 0', lineHeight: 1.6, fontWeight: 400 }}>
          <p style={{ margin: '2px 0' }}>✉ hopekraft26@gmail.com · 📞 +91 98765 43210</p>
          <p style={{ margin: '2px 0', fontSize: '0.7rem', color: '#8D7B71' }}>100% Child-Safe Solid European Beechwood • BIS Approved • Non-Toxic Finishes</p>
        </div>

        {/* COPYRIGHT */}
        <div style={{ borderTop: '1px solid #EFEAE1', marginTop: '16px', paddingTop: '14px', fontSize: '0.68rem', color: '#9E8E85', fontWeight: 400 }}>
          <p style={{ margin: 0 }}>© 2026 HOPEKRAFT® • Play Today, Grow Tomorrow</p>
        </div>
      </div>
    </footer>
  );
}
