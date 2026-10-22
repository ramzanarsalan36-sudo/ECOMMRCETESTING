'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, X, ShieldCheck, Menu, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

interface HeaderProps {
  onSearch?: (query: string) => void;
  hideSearch?: boolean;
  backHref?: string;
}

export default function Header({ onSearch, hideSearch = false, backHref }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount } = useCart();

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

  return (
    <>
      <header className="app-header">
        <div className="header-inner-wrap">
          <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                <ArrowLeft size={18} strokeWidth={2} />
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

          {/* Desktop Navigation Links (Only on full catalog pages, hidden on mobile & checkout) */}
          {!hideSearch && !backHref && (
            <nav className="header-desktop-nav" aria-label="Desktop Navigation">
              <Link href="/" className="header-nav-link">Home</Link>
              <Link href="/#bestsellers" className="header-nav-link">Best Sellers</Link>
              <Link href="/#why-hopekraft" className="header-nav-link">Why Hopekraft</Link>
              <Link href="/#reviews" className="header-nav-link">Reviews</Link>
              <Link href="/#guarantee" className="header-nav-link">Guarantee</Link>
            </nav>
          )}

          <div className="header-actions">
            {/* Desktop Search Field */}
            {!hideSearch && (
              <div className="header-desktop-search">
                <Search size={15} color="#857469" />
                <input
                  type="text"
                  placeholder="Search toys (blocks, easel, rings...)"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="header-desktop-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="header-desktop-search-clear"
                    aria-label="Clear search"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Search Toggle Icon */}
            {!hideSearch && (
              <button
                type="button"
                className="icon-btn header-mobile-search-btn"
                onClick={() => setSearchOpen(prev => !prev)}
                aria-label="Toggle search"
                title="Search toys"
              >
                <Search size={18} color="#1E1B18" />
              </button>
            )}

            {/* Cart Icon with Counter */}
            <Link
              href="/cart"
              className="icon-btn header-cart-btn"
              aria-label="Shopping Cart"
              title="View Cart"
            >
              <ShoppingBag size={19} color="#1E1B18" strokeWidth={1.8} />
              {totalCount > 0 && (
                <span className="header-cart-badge">{totalCount}</span>
              )}
            </Link>

            {/* Desktop Express Checkout CTA */}
            {!hideSearch && !backHref && (
              <Link href="/checkout" className="header-desktop-checkout-btn">
                Checkout
              </Link>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              className="icon-btn header-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X size={20} color="#1E1B18" /> : <Menu size={20} color="#1E1B18" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div
          className="header-mobile-drawer"
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
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem', fontWeight: 500 }}>
            <Link href="/" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              🏠 Home
            </Link>
            <Link href="/#bestsellers" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              ✨ Best Sellers
            </Link>
            <Link href="/#why-hopekraft" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              🌿 Why Hopekraft
            </Link>
            <Link href="/#reviews" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              ⭐ Parent Reviews
            </Link>
            <Link href="/cart" onClick={() => setMobileMenuOpen(false)} style={{ color: '#1E1B18', textDecoration: 'none' }}>
              🛒 Cart ({totalCount})
            </Link>
            <Link href="/checkout" onClick={() => setMobileMenuOpen(false)} style={{ color: '#8C4320', textDecoration: 'none', fontWeight: 600 }}>
              ⚡ Express Checkout
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} style={{ color: '#0077C8', textDecoration: 'none', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
              🔒 Admin Ops Portal
            </Link>
          </nav>
        </div>
      )}

      {/* Mobile Inline Search Bar */}
      {!hideSearch && searchOpen && (
        <div className="inline-search-bar active header-mobile-search-bar">
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
