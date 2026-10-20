'use client';

import React from 'react';
import { useCart } from './CartProvider';

export default function ToastNotice() {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  return (
    <div className="toast-notice active" role="alert">
      {toastMessage}
    </div>
  );
}
