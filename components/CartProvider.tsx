'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HOPEKRAFT_PRODUCTS, Product } from '@/lib/products';

export interface CartItem {
  id: string;
  qty: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  totalCount: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  total: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [couponCode, setCouponCode] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('hopekraft_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        // Default seed item: 1 easel
        setCart([{ id: 'easel', qty: 1 }]);
      }

      const savedWishlist = localStorage.getItem('hopekraft_wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error('Error loading cart state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('hopekraft_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart, isLoaded]);

  // Save wishlist
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('hopekraft_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist, isLoaded]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3200);
  };

  const addToCart = (productId: string, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item =>
          item.id === productId ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { id: productId, qty }];
    });
    const product = HOPEKRAFT_PRODUCTS[productId];
    showToast(`Added ${product ? product.name : 'Item'} to Cart 🛒`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removed from cart');
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item => (item.id === productId ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setDiscountPercent(0);
    try {
      localStorage.removeItem('hopekraft_cart');
    } catch (e) {}
  };

  const toggleWishlist = (productId: string): boolean => {
    let liked = false;
    setWishlist(prev => {
      if (prev.includes(productId)) {
        liked = false;
        showToast('Removed from Wishlist');
        return prev.filter(id => id !== productId);
      } else {
        liked = true;
        showToast('Saved to Wishlist ❤️');
        return [...prev, productId];
      }
    });
    return liked;
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'HOPE10' || clean === 'KIDS10' || clean === 'WELCOME10') {
      setCouponCode(clean);
      setDiscountPercent(10);
      showToast(`Coupon ${clean} applied! 10% Discount 🎉`);
      return true;
    }
    showToast('⚠️ Invalid coupon code. Try HOPE10');
    return false;
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPercent(0);
  };

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const subtotal = cart.reduce((sum, item) => {
    const prod = HOPEKRAFT_PRODUCTS[item.id];
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);

  const discount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal - discount);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        totalCount,
        subtotal,
        discount,
        couponCode,
        applyCoupon,
        removeCoupon,
        total,
        wishlist,
        toggleWishlist,
        isInWishlist,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
