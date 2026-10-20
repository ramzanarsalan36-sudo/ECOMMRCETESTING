import React from 'react';
import ProductDetailView from '@/components/ProductDetailView';
import { Metadata } from 'next';
import { HOPEKRAFT_PRODUCTS } from '@/lib/products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = HOPEKRAFT_PRODUCTS[id] || HOPEKRAFT_PRODUCTS.easel;

  return {
    title: `${product.name} - HOPEKRAFT Wooden Toys`,
    description: product.tagline,
    openGraph: {
      title: product.name,
      description: product.tagline,
      images: [product.image]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  return <ProductDetailView productId={id} />;
}
