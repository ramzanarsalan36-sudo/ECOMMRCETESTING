'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { HOPEKRAFT_PRODUCTS, Product } from '@/lib/products';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Star, 
  Zap, 
  Lock, 
  Package, 
  Sparkles, 
  ThumbsUp, 
  CheckCircle2, 
  HelpCircle
} from 'lucide-react';

interface ProductDetailViewProps {
  productId?: string;
}

export default function ProductDetailView({ productId = 'easel' }: ProductDetailViewProps) {
  const router = useRouter();
  const product: Product = HOPEKRAFT_PRODUCTS[productId] || HOPEKRAFT_PRODUCTS.easel;

  const galleryImages = product.thumbnails && product.thumbnails.length > 0
    ? product.thumbnails
    : [{ src: product.image, label: product.name }];

  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  // Handle Buy Now -> Navigate to Dedicated Professional Checkout Page with Selected Payment Mode
  const handleBuyNow = (mode: 'cod' | 'online' = 'cod') => {
    router.push(`/checkout?productId=${encodeURIComponent(product.id)}&payment=${mode}`);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(prev => (prev === index ? null : index));
  };

  // Scroll to slide
  const scrollToSlide = (index: number) => {
    if (!carouselRef.current) return;
    const width = carouselRef.current.clientWidth;
    carouselRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setActiveSlideIndex(index);
  };

  const handlePrevSlide = () => {
    const nextIdx = activeSlideIndex === 0 ? galleryImages.length - 1 : activeSlideIndex - 1;
    scrollToSlide(nextIdx);
  };

  const handleNextSlide = () => {
    const nextIdx = (activeSlideIndex + 1) % galleryImages.length;
    scrollToSlide(nextIdx);
  };

  // Sync active slide index on scroll
  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, clientWidth } = carouselRef.current;
    if (clientWidth === 0) return;
    const newIdx = Math.round(scrollLeft / clientWidth);
    if (newIdx !== activeSlideIndex && newIdx >= 0 && newIdx < galleryImages.length) {
      setActiveSlideIndex(newIdx);
    }
  };

  // Mouse Drag Support (Mac style inertia)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftStart.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.cursor = 'grabbing';
    carouselRef.current.style.scrollBehavior = 'auto';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    carouselRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    if (!isDragging.current || !carouselRef.current) return;
    isDragging.current = false;
    carouselRef.current.style.cursor = 'grab';
    carouselRef.current.style.scrollBehavior = 'smooth';
    // Snap to nearest slide
    const { scrollLeft, clientWidth } = carouselRef.current;
    const targetIndex = Math.round(scrollLeft / clientWidth);
    scrollToSlide(Math.max(0, Math.min(galleryImages.length - 1, targetIndex)));
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;
    setReviewSubmitted(true);
    setTimeout(() => {
      setShowReviewModal(false);
      setReviewSubmitted(false);
      setNewReview({ name: '', rating: 5, comment: '' });
    }, 2000);
  };

  // Companion products
  const companionProducts = Object.values(HOPEKRAFT_PRODUCTS)
    .filter(p => p.id !== product.id)
    .slice(0, 3);

  // Verified reviews list
  const reviews = [
    {
      id: 1,
      author: 'Dr. Ananya Sen',
      location: 'Bengaluru, KA',
      badge: 'Verified Buyer',
      date: '2 days ago',
      rating: 5,
      title: 'Outstanding craftsmanship & 100% child safe',
      content: 'The wood is silky smooth with zero splinters or rough patches. My 2-year-old Kabir spends hours stacking and recognizing letters every morning. Much safer and more engaging than plastic toys.',
      helpful: 42
    },
    {
      id: 2,
      author: 'Vikram Malhotra',
      location: 'Mumbai, MH',
      badge: 'Verified Buyer',
      date: '1 week ago',
      rating: 5,
      title: 'Super fast COD delivery & premium finish',
      content: 'Ordered with Cash on Delivery and received it in 2 days. The cotton storage bag is super convenient and keeps the room tidy. The finish feels like imported European Montessori toys.',
      helpful: 29
    },
    {
      id: 3,
      author: 'Meera Kulkarni',
      location: 'Pune, MH',
      badge: 'Montessori Educator',
      date: '2 weeks ago',
      rating: 5,
      title: 'Bought 3 sets for our preschool classroom',
      content: 'As an early-childhood educator, I can vouch for the weight, size, and tactile grain. The kids naturally gravitate towards it during free play hours. Sturdy enough to survive toddler drops.',
      helpful: 35
    },
    {
      id: 4,
      author: 'Rohan & Deepa Nair',
      location: 'Delhi NCR',
      badge: 'Verified Buyer',
      date: '3 weeks ago',
      rating: 5,
      title: 'Smells like clean natural wood, zero chemical fumes',
      content: 'We are very conscious about non-toxic paints. The vegetable dye lacquer gives peace of mind. Beautiful earthy look that looks great in our nursery too.',
      helpful: 18
    }
  ];

  const faqs = [
    {
      q: 'Are the materials 100% non-toxic and child-safe?',
      a: 'Yes, absolutely. Every HOPEKRAFT toy is handcrafted from grade-A European beechwood and finished with certified water-based organic vegetable sealants. It complies strictly with EN-71, ASTM F963, and BIS standards.'
    },
    {
      q: 'How fast is delivery and can I pay Cash on Delivery (COD)?',
      a: 'We ship orders within 24 hours. Express air courier takes 2 to 3 days to your doorstep across all Indian pincodes. Cash on Delivery (COD) is available with no hidden charges — you inspect and pay at your doorstep!'
    },
    {
      q: 'What is your 7-Day Replacement Guarantee?',
      a: 'If your package arrives with any defect or damage during transit, our team provides an instant hassle-free replacement or refund within 7 days. Simply message us on WhatsApp or call our support.'
    },
    {
      q: 'What age group is this best suited for?',
      a: 'This product is ergonomically designed for children aged 18 months to 6 years, promoting fine motor skills, spatial balance, and screen-free creative independence.'
    }
  ];

  return (
    <div className="app-container storefront-shell" style={{ maxWidth: '640px', margin: '0 auto', background: '#FAF7F2', minHeight: '100vh', paddingBottom: '160px', position: 'relative' }}>
      {/* 1. TOP HEADER WITH INTEGRATED LEFT BACK BUTTON */}
      <Header hideSearch backHref="/" />

      {/* FAST SPLASH ANIMATIONS & CHUNKY BROWN BUTTON STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fastSplashSweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
          }
          35% {
            transform: translateX(250%) skewX(-25deg);
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
          }
        }

        @keyframes subtlePulseWarm {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(38, 20, 11, 0.35);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 20px rgba(140, 67, 32, 0.5);
            transform: scale(1.015);
          }
        }

        @keyframes subtlePulseGreen {
          0%, 100% {
            box-shadow: 0 4px 14px rgba(21, 128, 61, 0.4);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 6px 22px rgba(22, 163, 74, 0.65);
            transform: scale(1.018);
          }
        }

        .hk-brown-btn {
          background: linear-gradient(135deg, #8C4320 0%, #26140B 100%) !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          position: relative;
          overflow: hidden;
          animation: subtlePulseWarm 2s infinite ease-in-out;
        }

        .hk-brown-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.42) 50%, rgba(255,255,255,0) 100%);
          animation: fastSplashSweep 1.6s infinite ease-in-out;
          pointer-events: none;
        }

        .hk-green-btn {
          background: linear-gradient(135deg, #15803D 0%, #0F5128 100%) !important;
          color: #FFFFFF !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          position: relative;
          overflow: hidden;
          animation: subtlePulseGreen 2.2s infinite ease-in-out;
        }

        .hk-green-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 45%;
          height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%);
          animation: fastSplashSweep 1.8s infinite ease-in-out;
          pointer-events: none;
        }

        .mac-carousel-track::-webkit-scrollbar {
          display: none;
        }
      `}} />

      <main className="pdp-main-content" style={{ padding: '8px 12px 30px' }}>
        
        {/* 2. SWIPEABLE MEDIA GALLERY IN ELEGANT FRAME (NO OVERLAID TEXT/BADGES ON PHOTO) */}
        <section 
          className="pdp-framed-gallery"
          style={{ 
            background: '#FFFFFF', 
            borderRadius: '16px', 
            overflow: 'hidden', 
            border: '1.5px solid #E8E2D6', 
            boxShadow: '0 4px 20px rgba(45, 30, 20, 0.05)', 
            padding: '12px',
            position: 'relative'
          }}
        >
          {/* Main Swipeable Image Track (Clean, pristine, no text labels over photo) */}
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              background: '#F8F6F0',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)'
            }}
          >
            {/* Horizontal Touch & Drag Scroll Container */}
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className="mac-carousel-track"
              style={{
                display: 'flex',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch',
                scrollBehavior: 'smooth',
                cursor: 'grab',
                userSelect: 'none',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {galleryImages.map((thumb, idx) => (
                <div
                  key={idx}
                  style={{
                    minWidth: '100%',
                    width: '100%',
                    scrollSnapAlign: 'start',
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#F9F7F2',
                    position: 'relative'
                  }}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.label || `${product.name} Photo ${idx + 1}`}
                    draggable={false}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Mac-style Floating Navigation Chevrons */}
            <button
              type="button"
              onClick={handlePrevSlide}
              aria-label="Previous photo"
              style={{
                position: 'absolute',
                top: '50%',
                left: '8px',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronLeft size={18} color="#2B1B17" />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              aria-label="Next photo"
              style={{
                position: 'absolute',
                top: '50%',
                right: '8px',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.15s ease'
              }}
            >
              <ChevronRight size={18} color="#2B1B17" />
            </button>

            {/* Mac-style Expanding Pill Indicator */}
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', alignItems: 'center', pointerEvents: 'none' }}>
              {galleryImages.map((_, i) => (
                <span
                  key={i}
                  style={{
                    height: '5px',
                    borderRadius: '3px',
                    width: activeSlideIndex === i ? '18px' : '6px',
                    background: activeSlideIndex === i ? '#8C4320' : 'rgba(0, 0, 0, 0.28)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Clickable Framed Thumbnails with Smooth Slide Sync */}
          {galleryImages.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${galleryImages.length}, 1fr)`, gap: '8px', marginTop: '10px' }}>
              {galleryImages.map((thumb, idx) => {
                const isActive = activeSlideIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => scrollToSlide(idx)}
                    style={{
                      padding: 0,
                      background: '#F8F6F0',
                      border: isActive ? '2px solid #8C4320' : '1px solid #E5E0D8',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      aspectRatio: '1 / 1',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isActive ? '0 0 0 2px rgba(140, 67, 32, 0.25)' : 'none',
                      transform: isActive ? 'scale(1.02)' : 'scale(1)',
                      transition: 'all 0.2s ease'
                    }}
                    title={thumb.label}
                  >
                    <img 
                      src={thumb.src} 
                      alt={thumb.label} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 3. REFINED PRODUCT INFO & BUY BLOCK (FIXED OVERFLOW ISSUE) */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #EBE4D8', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
          {/* Eyebrow & Brand Verification */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8D7B68', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {product.eyebrow || 'HOPEKRAFT MONTESSORI'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#E8F5E9', color: '#1B5E20', fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
              HOPEKRAFT Assured <Check size={12} strokeWidth={3} />
            </span>
          </div>

          {/* Product Title */}
          <h1 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#2B1B17', margin: '2px 0 6px', lineHeight: '1.3' }}>
            {product.name}
          </h1>

          {/* Star Rating Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: '#2E7D32', color: '#FFFFFF', fontSize: '0.72rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
              <span>4.8</span>
              <Star size={11} fill="#FFFFFF" color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '0.74rem', color: '#6A5F56', fontWeight: 600 }}>
              842 Ratings &amp; 194 Reviews
            </span>
            <span style={{ fontSize: '0.72rem', color: '#2E7D32', fontWeight: 700, marginLeft: 'auto' }}>
              ✓ In Stock
            </span>
          </div>

          {/* Compact Price Card */}
          <div style={{ background: '#FAF8F5', borderRadius: '10px', padding: '10px 12px', border: '1px solid #EAE3D6', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.42rem', fontWeight: 900, color: '#1E1611' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.88rem', color: '#8C827A', textDecoration: 'line-through', fontWeight: 500 }}>
                ₹{product.oldPrice.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#2E7D32', fontWeight: 800, background: '#E8F5E9', padding: '2px 6px', borderRadius: '4px' }}>
                {product.discount}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6A5F56', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Inclusive of all taxes</span>
              <span>•</span>
              <span style={{ color: '#2E7D32', fontWeight: 700 }}>🟢 Ready to Dispatch Today</span>
            </div>
          </div>

          {/* Feature Chips (Clean 2-Column with 100% boundary constraint, NO overflow) */}
          {product.features && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', width: '100%', boxSizing: 'border-box' }}>
              {product.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FBF9F6',
                    border: '1px solid #EFEAE1',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    color: '#3E2E20',
                    fontWeight: 600,
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '0.92rem', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* DUAL ACTION BUTTONS: PAY ONLINE (₹100 OFF) & CASH ON DELIVERY */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
            {/* Primary Action: Pay Online with Instant ₹100 Off */}
            <button
              type="button"
              onClick={() => handleBuyNow('online')}
              id="pdp-buy-online-trigger"
              className="hk-green-btn"
              style={{
                width: '100%',
                minHeight: '52px',
                padding: '12px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <Zap size={22} fill="#FFD700" color="#FFD700" />
                <div>
                  <div style={{ fontSize: '0.94rem', fontWeight: 900, letterSpacing: '0.3px', lineHeight: 1.1 }}>
                    PAY ONLINE (₹100 OFF)
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#DCFCE7', fontWeight: 600 }}>
                    Instant UPI, GPay, PhonePe &amp; Cards
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.08rem', fontWeight: 900, color: '#FFFFFF', lineHeight: 1.1 }}>
                  ₹{(product.price - 100).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: '0.66rem', color: '#A7F3D0', textDecoration: 'line-through' }}>
                  ₹{product.price.toLocaleString('en-IN')}
                </div>
              </div>
            </button>

            {/* Secondary Action: Cash on Delivery */}
            <button
              type="button"
              onClick={() => handleBuyNow('cod')}
              id="pdp-buy-cod-trigger"
              className="hk-brown-btn"
              style={{
                width: '100%',
                minHeight: '48px',
                padding: '12px 18px',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                <Package size={20} color="#FFAA00" />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.3px', lineHeight: 1.1 }}>
                    CASH ON DELIVERY (COD)
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#D7CCC8', fontWeight: 500 }}>
                    Inspect package &amp; pay at doorstep
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '1.02rem', fontWeight: 900, color: '#FFFFFF' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </div>
            </button>
          </div>

          {/* Compact Trust Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '14px', textAlign: 'center', fontSize: '0.68rem', color: '#554A40' }}>
            <div style={{ padding: '8px 4px', background: '#FAF7F2', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <Truck size={16} color="#8C4320" style={{ margin: '0 auto 3px' }} />
              <div style={{ fontWeight: 700 }}>Free Delivery</div>
              <div style={{ fontSize: '0.62rem', color: '#887B70' }}>2-3 Days Fast</div>
            </div>
            <div style={{ padding: '8px 4px', background: '#FAF7F2', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <Package size={16} color="#2E7D32" style={{ margin: '0 auto 3px' }} />
              <div style={{ fontWeight: 700 }}>Cash on Delivery</div>
              <div style={{ fontSize: '0.62rem', color: '#887B70' }}>Pay at Doorstep</div>
            </div>
            <div style={{ padding: '8px 4px', background: '#FAF7F2', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <RefreshCw size={16} color="#1565C0" style={{ margin: '0 auto 3px' }} />
              <div style={{ fontWeight: 700 }}>7 Days Returns</div>
              <div style={{ fontSize: '0.62rem', color: '#887B70' }}>Hassle-Free</div>
            </div>
          </div>
        </section>

        {/* 4. MONTESSORI DEVELOPMENTAL MILESTONES */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #EBE4D8', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ background: '#FFF3E0', color: '#8C4320', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
              🧠
            </span>
            <div>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2B1B17', margin: 0 }}>
                Montessori Developmental Milestones
              </h2>
              <span style={{ fontSize: '0.7rem', color: '#887B70' }}>
                Designed for Ages 18 Months – 6 Years
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#554A40', lineHeight: '1.5', margin: '6px 0 12px' }}>
            {product.description || 'Montessori-inspired wooden essentials meticulously crafted for tactile exploration, spatial reasoning, and creative motor development.'}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <div style={{ background: '#FAF8F5', padding: '10px', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>🖐️</div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B1B17', margin: '0 0 2px' }}>Fine Motor &amp; Pincer Grip</h3>
              <p style={{ fontSize: '0.7rem', color: '#6A5F56', margin: 0, lineHeight: '1.35' }}>
                Chunky ergonomic dimensions strengthen toddler finger grasp and wrist dexterity.
              </p>
            </div>

            <div style={{ background: '#FAF8F5', padding: '10px', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>🔤</div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B1B17', margin: '0 0 2px' }}>Early Phonics &amp; Math</h3>
              <p style={{ fontSize: '0.7rem', color: '#6A5F56', margin: 0, lineHeight: '1.35' }}>
                Tactile engraving encourages letter matching, word building, and foundational counting.
              </p>
            </div>

            <div style={{ background: '#FAF8F5', padding: '10px', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>📐</div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B1B17', margin: '0 0 2px' }}>Spatial Balance &amp; Physics</h3>
              <p style={{ fontSize: '0.7rem', color: '#6A5F56', margin: 0, lineHeight: '1.35' }}>
                Open-ended stacking challenges teach gravity, balance, patience, and problem solving.
              </p>
            </div>

            <div style={{ background: '#FAF8F5', padding: '10px', borderRadius: '8px', border: '1px solid #EFEAE1' }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '2px' }}>🌿</div>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B1B17', margin: '0 0 2px' }}>100% Screen-Free Play</h3>
              <p style={{ fontSize: '0.7rem', color: '#6A5F56', margin: 0, lineHeight: '1.35' }}>
                Natural timber aroma and grain connect little learners to nature away from digital screens.
              </p>
            </div>
          </div>
        </section>

        {/* 5. WHAT'S IN THE BOX & SPECIFICATIONS */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #EBE4D8', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2B1B17', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Package size={17} color="#2E7D32" /> What&apos;s Included In The Box
          </h2>

          <div style={{ background: '#F8FBF8', border: '1px solid #D8EAD9', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: '#3A4B3C', lineHeight: '1.6' }}>
              <li><strong>Complete Handcrafted Wooden Set:</strong> Ready for immediate play out of the box with zero complex assembly.</li>
              <li><strong>Breathable Cotton Drawstring Bag:</strong> Natural unbleached canvas for easy tidy-up and travel portability.</li>
              <li><strong>Parent Phonics &amp; Milestone Activity Guide:</strong> 12 creative games for parent-child bonding.</li>
              <li><strong>HOPEKRAFT Seal of Authenticity:</strong> Certified 100% genuine kiln-dried beechwood.</li>
            </ul>
          </div>

          <h3 style={{ fontSize: '0.84rem', fontWeight: 800, color: '#382314', margin: '10px 0 6px' }}>
            Technical Specifications
          </h3>
          <div style={{ fontSize: '0.74rem', color: '#554A40', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0ECE4' }}>
              <span style={{ color: '#887B70' }}>Material:</span>
              <span style={{ fontWeight: 600 }}>Grade-A European Solid Beechwood</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0ECE4' }}>
              <span style={{ color: '#887B70' }}>Finish &amp; Paint:</span>
              <span style={{ fontWeight: 600 }}>Zero VOC, Water-Based Vegetable Lacquer</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0ECE4' }}>
              <span style={{ color: '#887B70' }}>Edge Safety:</span>
              <span style={{ fontWeight: 600 }}>Precision Hand-Beveled (No Splinters)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #F0ECE4' }}>
              <span style={{ color: '#887B70' }}>Certifications:</span>
              <span style={{ fontWeight: 600, color: '#2E7D32' }}>BIS Certified • EN-71 Safe</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#887B70' }}>Recommended Age:</span>
              <span style={{ fontWeight: 600 }}>18 Months – 6 Years</span>
            </div>
          </div>
        </section>

        {/* 6. VERIFIED PARENT REVIEWS & RATINGS */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #EBE4D8', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2B1B17', margin: 0 }}>
                Verified Parent Reviews
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#887B70' }}>
                Real feedback from 840+ Indian parents
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              style={{
                background: '#FAF7F2',
                border: '1px solid #D5CEBE',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#382314',
                cursor: 'pointer'
              }}
            >
              ✍️ Write Review
            </button>
          </div>

          {/* Rating Score Breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: '#FAF8F5', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', border: '1px solid #EFEAE1' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#2B1B17', lineHeight: '1' }}>4.8</div>
              <div style={{ display: 'flex', gap: '2px', color: '#FFAA00', margin: '4px 0 2px' }}>
                <Star size={13} fill="#FFAA00" color="#FFAA00" />
                <Star size={13} fill="#FFAA00" color="#FFAA00" />
                <Star size={13} fill="#FFAA00" color="#FFAA00" />
                <Star size={13} fill="#FFAA00" color="#FFAA00" />
                <Star size={13} fill="#FFAA00" color="#FFAA00" />
              </div>
              <span style={{ fontSize: '0.66rem', color: '#887B70', whiteSpace: 'nowrap' }}>842 Ratings</span>
            </div>

            {/* Distribution Bars */}
            <div style={{ flex: 1, fontSize: '0.68rem', color: '#6A5F56' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '18px' }}>5★</span>
                <div style={{ flex: 1, height: '6px', background: '#EAE5DB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '84%', height: '100%', background: '#2E7D32' }} />
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>84%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '18px' }}>4★</span>
                <div style={{ flex: 1, height: '6px', background: '#EAE5DB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '12%', height: '100%', background: '#558B2F' }} />
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>12%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ width: '18px' }}>3★</span>
                <div style={{ flex: 1, height: '6px', background: '#EAE5DB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '3%', height: '100%', background: '#F9A825' }} />
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>3%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '18px' }}>1-2★</span>
                <div style={{ flex: 1, height: '6px', background: '#EAE5DB', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '1%', height: '100%', background: '#E53935' }} />
                </div>
                <span style={{ width: '24px', textAlign: 'right' }}>1%</span>
              </div>
            </div>
          </div>

          {/* Individual Reviews Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: '#FAF9F6', borderRadius: '8px', padding: '10px 12px', border: '1px solid #EFEAE1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E0D5C5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 800, color: '#4A3B32' }}>
                      {r.author[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2B1B17' }}>{r.author}</div>
                      <div style={{ fontSize: '0.64rem', color: '#887B70' }}>{r.location}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.66rem', color: '#2E7D32', fontWeight: 700, background: '#E8F5E9', padding: '2px 6px', borderRadius: '4px' }}>
                    ✓ {r.badge}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: '4px 0 3px' }}>
                  <div style={{ display: 'flex', gap: '1px', color: '#FFAA00' }}>
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} size={11} fill="#FFAA00" color="#FFAA00" />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2B1B17', marginLeft: '4px' }}>{r.title}</span>
                </div>

                <p style={{ fontSize: '0.73rem', color: '#554A40', lineHeight: '1.4', margin: '3px 0 6px' }}>
                  &ldquo;{r.content}&rdquo;
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.66rem', color: '#887B70' }}>
                  <span>Posted {r.date}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ThumbsUp size={11} /> {r.helpful} parents found this helpful
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. FREQUENTLY ASKED QUESTIONS */}
        <section style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #EBE4D8', padding: '16px', marginTop: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <h2 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#2B1B17', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={17} color="#8C4320" /> Frequently Asked Questions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} style={{ border: '1px solid #EFEAE1', borderRadius: '8px', overflow: 'hidden' }}>
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isOpen ? '#FAF8F5' : '#FFFFFF',
                      border: 'none',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      color: '#2B1B17',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={15} color="#887B70" /> : <ChevronDown size={15} color="#887B70" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '8px 12px 10px', fontSize: '0.73rem', color: '#554A40', lineHeight: '1.45', background: '#FAF8F5', borderTop: '1px solid #EFEAE1' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 8. YOU MAY ALSO LIKE */}
        <section style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#2B1B17', margin: 0 }}>
              You May Also Like
            </h2>
            <Link href="/" style={{ fontSize: '0.74rem', color: '#8C4320', fontWeight: 700, textDecoration: 'none' }}>
              View All ➔
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {companionProducts.map((p) => (
              <Link 
                key={p.id} 
                href={`/product/${p.id}`} 
                style={{ 
                  background: '#FFFFFF', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  border: '1px solid #EBE4D8', 
                  textDecoration: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '6px'
                }}
              >
                <div style={{ aspectRatio: '1/1', borderRadius: '6px', overflow: 'hidden', background: '#F8F6F0', marginBottom: '6px' }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2B1B17', lineHeight: '1.2', height: '2.4em', overflow: 'hidden' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E1611', marginTop: '4px' }}>
                  ₹{p.price.toLocaleString('en-IN')}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* 9. THICK BROWN STICKY BUY NOW ACTION BAR (WITH FAST SPLASH ANIMATION & ZERO OVERLAP) */}
      {/* 5. PROFESSIONAL DUAL-BUTTON MOBILE STICKY ACTION BAR */}
      <div 
        id="pdp-sticky-bar"
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '640px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1.5px solid #EAE3D6',
          boxShadow: '0 -6px 25px rgba(0, 0, 0, 0.12)',
          padding: '8px 10px',
          display: 'flex',
          gap: '8px',
          alignItems: 'stretch',
          zIndex: 1000,
          boxSizing: 'border-box'
        }}
      >
        {/* Left Action: Cash on Delivery (COD) */}
        <button
          type="button"
          onClick={() => handleBuyNow('cod')}
          id="sticky-cod-btn"
          className="hk-brown-btn"
          style={{
            flex: 1,
            minHeight: '48px',
            padding: '6px 8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '1px'
          }}
        >
          <div style={{ fontSize: '0.64rem', fontWeight: 800, letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span>💵</span> COD
          </div>
          <div style={{ fontSize: '0.94rem', fontWeight: 900, lineHeight: 1.1 }}>
            ₹{product.price.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.56rem', opacity: 0.8, fontWeight: 500 }}>
            Pay at Doorstep
          </div>
        </button>

        {/* Right Action: Pay Online (Instant ₹100 OFF) */}
        <button
          type="button"
          onClick={() => handleBuyNow('online')}
          id="sticky-online-btn"
          className="hk-green-btn"
          style={{
            flex: 1.28,
            minHeight: '48px',
            padding: '6px 8px',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            gap: '1px'
          }}
        >
          {/* Floating Pill Badge */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: '#FFD700',
            color: '#1A330E',
            fontSize: '0.54rem',
            fontWeight: 900,
            padding: '1px 6px',
            borderRadius: '0 0 0 6px',
            letterSpacing: '0.3px'
          }}>
            ⚡ ₹100 OFF
          </div>

          <div style={{ fontSize: '0.64rem', fontWeight: 800, color: '#DCFCE7', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Zap size={11} fill="#FFD700" color="#FFD700" />
            <span>PAY ONLINE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', lineHeight: 1.1 }}>
            <span style={{ fontSize: '1rem', fontWeight: 900, color: '#FFFFFF' }}>
              ₹{(product.price - 100).toLocaleString('en-IN')}
            </span>
            <span style={{ fontSize: '0.64rem', color: '#A7F3D0', textDecoration: 'line-through' }}>
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ fontSize: '0.56rem', color: '#BBF7D0', fontWeight: 700 }}>
            Instant Discount
          </div>
        </button>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '14px', maxWidth: '420px', width: '100%', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            {reviewSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CheckCircle2 size={44} color="#2E7D32" style={{ margin: '0 auto 10px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1B5E20' }}>Thank You!</h3>
                <p style={{ fontSize: '0.82rem', color: '#554A40' }}>Your review has been verified and posted.</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#2B1B17', margin: '0 0 12px' }}>
                  Write a Parent Review
                </h3>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '4px' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    placeholder="e.g. Shalini Sharma"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D5CEBE', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '4px' }}>
                    Rating (1 to 5 Stars)
                  </label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D5CEBE', fontSize: '0.85rem', boxSizing: 'border-box' }}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Exceptional)</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars (Great)</option>
                    <option value={3}>⭐⭐⭐ 3 Stars (Good)</option>
                    <option value={2}>⭐⭐ 2 Stars (Average)</option>
                    <option value={1}>⭐ 1 Star (Needs Improvement)</option>
                  </select>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#382314', marginBottom: '4px' }}>
                    Review Feedback
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Tell other parents about the wood quality, durability and how your child plays with it..."
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D5CEBE', fontSize: '0.85rem', boxSizing: 'border-box', resize: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #D5CEBE', background: '#F0ECE4', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#8C4320', color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER WITH PROPER BOTTOM SPACING SO STICKY BAR NEVER OVERLAPS */}
      <div style={{ marginBottom: '20px' }}>
        <Footer />
      </div>
    </div>
  );
}
