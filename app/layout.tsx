import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/components/CartProvider';
import ToastNotice from '@/components/ToastNotice';
import RazorpayScript from '@/components/RazorpayScript';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#FBF9F4'
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'HOPEKRAFT - Play Today, Grow Tomorrow | Wooden Toys & Learning Essentials',
  description: 'Beautifully crafted wooden toys for curious minds and creative hearts. Double-sided easels, alphabet blocks, stacking toys and more. 100% child-safe solid beechwood.',
  keywords: 'wooden toys, kids easel, alphabet blocks, montessori toys, wooden stacking rings, wooden train set, hopekraft',
  openGraph: {
    title: 'HOPEKRAFT - Wooden Toys & Learning Essentials',
    description: 'Little hands. Big imagination. Handcrafted wooden toys designed for screen-free creative play.',
    images: ['/assets/images/hero_banner_desktop.jpg'],
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fredoka:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CartProvider>
          {children}
          <ToastNotice />
          <RazorpayScript />
        </CartProvider>
      </body>
    </html>
  );
}
