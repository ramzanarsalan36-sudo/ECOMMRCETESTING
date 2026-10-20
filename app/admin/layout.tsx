'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut, Store, Truck, CreditCard } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<string>('admin');

  useEffect(() => {
    // If on login page, don't check session redirect
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.replace('/admin/login');
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.authenticated) {
          setAuthorized(true);
          setAdminUser(data.user?.username || 'admin');
        } else {
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (e) {
      window.location.href = '/admin/login';
    }
  };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (authorized === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #0077C8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
          <p style={{ marginTop: '12px', fontSize: '0.88rem', color: '#6B7280', fontWeight: 600 }}>Verifying Admin Security Clearance...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout-root" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Top Admin Bar */}
      <header className="admin-top-nav">
        <div className="admin-brand-left">
          <Link href="/admin" className="admin-logo-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <img
              src="/assets/images/hopekraft_logo.png"
              alt="HOPEKRAFT"
              style={{ height: '24px', width: 'auto', objectFit: 'contain' }}
            />
            <span className="admin-shield-badge">Admin Ops</span>
          </Link>

          {/* Integration Status Badges */}
          <div className="admin-status-indicators">
            <span className="system-pill" style={{ background: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A' }} title="Firebase Realtime Database Synced">
              <span className="pulse-dot" style={{ background: '#F59E0B' }}></span>
              🔥 Firebase RTDB
            </span>
            <span className="system-pill green" title="Razorpay Webhook & Payment Gateway Online">
              <span className="pulse-dot"></span>
              <CreditCard size={11} /> Razorpay Live
            </span>
            <span className="system-pill indigo" title="Shiprocket API Dispatch Ready">
              <Truck size={11} /> Shiprocket Edge
            </span>
          </div>
        </div>

        <div className="admin-nav-actions">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-store-btn"
            title="Open customer storefront in new tab"
          >
            <Store size={13} /> Storefront ↗
          </Link>

          <span className="admin-user-pill">
            👤 <strong>{adminUser}</strong>
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-logout-btn"
            title="Secure log out"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Admin Body Content */}
      <main className="admin-content-wrap">
        {children}
      </main>
    </div>
  );
}

