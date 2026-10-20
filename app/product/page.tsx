'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductDetailView from '@/components/ProductDetailView';

function ProductContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || 'easel';

  return <ProductDetailView productId={id} />;
}

export default function ProductQueryPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Loading product...</div>}>
      <ProductContent />
    </Suspense>
  );
}
