'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, User } from 'lucide-react';
import { useCart } from './CartProvider';

export default function BottomNav() {
  const pathname = usePathname();
  const { wishlist } = useCart();
  const wishlistCount = Object.values(wishlist).filter(Boolean).length;

  const isHome = pathname === '/';
  const isShop = pathname === '/#bestsellers' || pathname.startsWith('/product');
  const isCart = pathname === '/cart';

  return (
    <nav className="storefront-bottom-nav" aria-label="Mobile Navigation">
      <Link href="/" className={`bottom-nav-item ${isHome ? 'active' : ''}`}>
        <Home size={19} strokeWidth={isHome ? 2.5 : 1.8} />
        <span>Home</span>
      </Link>

      <Link href="/#bestsellers" className={`bottom-nav-item ${isShop ? 'active' : ''}`}>
        <ShoppingBag size={19} strokeWidth={isShop ? 2.5 : 1.8} />
        <span>Shop</span>
      </Link>

      <Link href="/#bestsellers" className="bottom-nav-item">
        <Heart size={19} strokeWidth={1.8} />
        <span>Favorites</span>
      </Link>

      <Link href="/admin" className="bottom-nav-item">
        <User size={19} strokeWidth={1.8} />
        <span>Account</span>
      </Link>
    </nav>
  );
}
