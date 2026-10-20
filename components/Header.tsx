'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, ShieldCheck, Menu, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
  backHref?: string;
}

export default function Header({ onSearch, hideSearch = false, backHref }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (onSearch) {
      onSearch(q);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) onSearch('');
    setSearchOpen(false);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {backHref && (
            <Link
              href={backHref}
              className="header-back-arrow-btn"
              aria-label="Back to catalog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: '#F0ECE4',
                border: '1px solid #DFD8CD',
                color: '#2B1B17',
                textDecoration: 'none',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>
          )}

          <Link href="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/assets/images/hopekraft_logo.png"
              alt="Hopekraft - Wooden Educational Products"
              className="header-logo-img"
              style={{ height: '36px', width: 'auto', objectFit: 'contain', display: 'block' }}
            />
          </Link>
        </div>

        <div className="header-actions">
          {!hideSearch && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => setSearchOpen(prev => !prev)}
              aria-label="Toggle search"
              title="Search toys"
            >
              <Search size={19} color="#1E1B18" />
            </button>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X size={22} color="#1E1B18" /> : <Menu size={22} color="#1E1B18" />}
          </button>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '56px',
            left: 0,
            right: 0,
            background: '#FFFFFF',
            borderBottom: '2px solid #F5EFEB',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            zIndex: 99,
            padding: '16px 20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.95rem', fontWeight: 600 }}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              🏠 Home
            </Link>
            <Link href="/#bestsellers" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              ✨ Best Sellers
            </Link>
            <Link href="/#categories" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              🧸 Shop All Toys
            </Link>
            <Link href="/checkout" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8C4320', textDecoration: 'none' }}>
              ⚡ Express Checkout
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0077C8', textDecoration: 'none', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
              🔒 Admin Ops Portal
            </Link>
          </nav>
        </div>
      )}


      {/* Inline Search Bar */}
      {!hideSearch && searchOpen && (
        <div className="inline-search-bar active">
          <div className="inline-search-input-wrap">
            <input
              type="text"
              className="inline-search-input"
              placeholder="Search easel, blocks, rings, train..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <button
              type="button"
              className="inline-search-clear"
              onClick={handleClear}
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
