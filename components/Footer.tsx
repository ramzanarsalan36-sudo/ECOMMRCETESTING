import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="storefront-footer" style={{ background: '#FAF7F2', borderTop: '1px solid #EFEAE1', color: '#2D1E18', padding: '24px 16px 80px 16px', marginTop: '16px' }}>
      <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
        {/* LOGO */}
        <div style={{ marginBottom: '14px' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <img
              src="/assets/images/hopekraft_logo.png"
              alt="Hopekraft - Wooden Educational Products"
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
            />
          </Link>
          <p style={{ fontSize: '0.72rem', color: '#7A6E67', margin: '6px 0 0 0' }}>
            Handcrafted wooden toys for curious minds &amp; natural living spaces.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: '#5D4037', flexWrap: 'wrap', justifyContent: 'center', margin: '14px 0' }}>
          <Link href="/#bestsellers" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 600 }}>Best Sellers</Link>
          <span>•</span>
          <Link href="/#categories" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 600 }}>Categories</Link>
          <span>•</span>
          <Link href="/cart" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 600 }}>Cart</Link>
          <span>•</span>
          <Link href="/admin" style={{ color: '#5D4037', textDecoration: 'none', fontWeight: 600 }}>Admin Ops</Link>
        </div>

        {/* CONTACT INFO */}
        <div style={{ fontSize: '0.74rem', color: '#6D4C41', margin: '10px 0', lineHeight: 1.6 }}>
          <p style={{ margin: '2px 0' }}>✉ support@hopekraft.in · 📞 +91 98765 43210</p>
          <p style={{ margin: '2px 0', fontSize: '0.68rem', color: '#8D7B71' }}>100% Child-Safe Solid Beechwood • Non-Toxic Paints</p>
        </div>

        {/* COPYRIGHT */}
        <div style={{ borderTop: '1px solid #EFEAE1', marginTop: '16px', paddingTop: '12px', fontSize: '0.66rem', color: '#9E8E85' }}>
          <p style={{ margin: 0 }}>© 2026 HOPEKRAFT® • Play Today, Grow Tomorrow</p>
        </div>
      </div>
    </footer>
  );
}
