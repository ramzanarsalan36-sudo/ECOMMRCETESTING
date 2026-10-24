'use client';

import React, { useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ShoppingCart,
  Truck,
  ExternalLink,
  LogOut
} from 'lucide-react';

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'orders';

  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart,
      view: 'orders'
    },
    {
      id: 'shiprocket',
      label: 'Shiprocket',
      icon: Truck,
      view: 'shiprocket'
    }
  ];

  const handleSelectView = (view: string) => {
    if (pathname === '/admin') {
      const params = new URLSearchParams(searchParams.toString());
      if (view === 'orders') {
        params.delete('view');
      } else {
        params.set('view', view);
      }
      const qs = params.toString();
      router.push(`/admin${qs ? `?${qs}` : ''}`);
    } else {
      router.push(view === 'orders' ? '/admin' : `/admin?view=${view}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    }
  };

  return (
    <aside
      className={`admin-hover-sidebar ${isHovered ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Hopekraft Admin Sidebar Navigation"
    >
      {/* BRAND / LOGO HEADER */}
      <div className="sidebar-brand-box">
        <div className="sidebar-logo-icon">
          <svg
            width="26"
            height="26"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 6L23 16L7 26V6Z"
              stroke="#A855F7"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M12 9L25 16L12 23V9Z"
              stroke="#60A5FA"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="3" fill="#22C55E" />
          </svg>
        </div>

        <div className="sidebar-brand-meta">
          <div className="sidebar-brand-title">
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>Hope</span>
            <span style={{ color: '#60A5FA', fontWeight: 800 }}>Kraft</span>
          </div>
          <span className="sidebar-sub-badge">ADMIN</span>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="sidebar-nav-list">
        {navItems.map(item => {
          const isActive = currentView === item.view || (item.view === 'orders' && !currentView);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelectView(item.view)}
              title={!isHovered ? item.label : undefined}
            >
              <div className="sidebar-item-icon">
                <Icon size={19} />
              </div>

              <div className="sidebar-item-label-wrap">
                <span className="sidebar-item-label">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="sidebar-footer">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-footer-btn"
          title={!isHovered ? 'Storefront' : undefined}
        >
          <div className="sidebar-item-icon">
            <ExternalLink size={17} />
          </div>
          <div className="sidebar-item-label-wrap">
            <span className="sidebar-item-label">Storefront ↗</span>
          </div>
        </a>

        <button
          type="button"
          onClick={handleLogout}
          className="sidebar-footer-btn logout"
          title={!isHovered ? 'Logout' : undefined}
        >
          <div className="sidebar-item-icon">
            <LogOut size={17} />
          </div>
          <div className="sidebar-item-label-wrap">
            <span className="sidebar-item-label">Logout</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
