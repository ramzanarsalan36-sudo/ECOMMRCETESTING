'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PRODUCT_LIST } from '@/lib/products';
import { Star, ShieldCheck, Truck, RefreshCw, CheckCircle2, Heart, Award, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero carousel product images (professional full-width banners)
  const heroSlides = [
    {
      image: '/assets/images/hero_slide_1.jpg',
      alt: 'Hopekraft Wooden Educational Products Box - Less Screen Time More Play Time More Learning',
    },
    {
      image: '/assets/images/hero_slide_2.jpg',
      alt: 'Happy Kids Playing with Hopekraft Wooden Alphabet Blocks - Play Learn Grow',
    },
    {
      image: '/assets/images/hero_slide_3.jpg',
      alt: 'Hopekraft Alphabet Blocks Box - Hindi Urdu Marathi Arabic Multi-Language Learning',
    },
    {
      image: '/assets/images/hero_slide_4.jpg',
      alt: 'Smiling Child with Hopekraft ABC Wooden Blocks - Educational Montessori Toys',
    },
    {
      image: '/assets/images/hero_slide_5.jpg',
      alt: 'Hopekraft Hindi Devanagari Alphabet Wooden Blocks Complete Set with Barakhadi',
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, [heroSlides.length]);

  const filteredProducts = PRODUCT_LIST.filter(product => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(q) ||
      product.tagline.toLowerCase().includes(q) ||
      product.subtitle.toLowerCase().includes(q)
    );
  });

  // Testimonials
  const parentReviews = [
    {
      name: 'Dr. Ananya Sen',
      city: 'Bengaluru',
      quote: 'The craftsmanship is unmatched. Real beechwood, zero sharp edges, and keeps my toddler engaged for hours without a screen.',
      rating: 5,
      toy: 'Wooden Alphabet Blocks'
    },
    {
      name: 'Vikram & Priya Malhotra',
      city: 'Mumbai',
      quote: 'Received COD delivery in 2 days. The easel and blocks are heirloom quality. Looks gorgeous in our living room!',
      rating: 5,
      toy: 'Double-Sided Kids Easel'
    },
    {
      name: 'Meera Kulkarni',
      city: 'Pune',
      quote: 'As a certified Montessori teacher, I wholeheartedly endorse HOPEKRAFT. Ergonomically ideal for early hand-eye coordination.',
      rating: 5,
      toy: 'Stacking Ring Tower'
    }
  ];

  return (
    <div className="app-container storefront-shell">
      {/* Top Sticky Header with Official Logo */}
      <Header onSearch={setSearchQuery} />

      <main style={{ paddingBottom: '30px' }}>
        {/* 1. HERO SECTION: Gradient BG with Real Product Image Carousel */}
        <section className="hero-gradient-section" aria-label="HOPEKRAFT Handcrafted Wooden Collection">
          <div className="hero-gradient-bg">
            {/* Product Image Carousel */}
            <div className="hero-carousel-container">
              <div
                className="hero-carousel-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {heroSlides.map((slide, index) => (
                  <div className="hero-carousel-slide" key={index}>
                    <img
                      src={slide.image}
                      alt={slide.alt}
                      className="hero-carousel-img"
                      loading={index === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              <button className="hero-carousel-arrow hero-carousel-arrow-left" onClick={prevSlide} aria-label="Previous slide">
                <ChevronLeft size={20} />
              </button>
              <button className="hero-carousel-arrow hero-carousel-arrow-right" onClick={nextSlide} aria-label="Next slide">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Info Bar */}
            <div className="hero-bottom-bar">
              <div className="hero-bottom-text">
                <span className="hero-brand-tag">HOPEKRAFT</span>
                <span className="hero-tagline">Play • Learn • Grow</span>
              </div>

              {/* Dots Navigation */}
              <div className="hero-carousel-dots">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`hero-dot ${index === currentSlide ? 'hero-dot-active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <Link href="#bestsellers" className="hero-shop-btn">
                Shop Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* 2. MOVING INFINITE TRUST MARQUEE */}
        <div style={{ background: '#FAF7F0', borderTop: '1px solid #EFEAE1', borderBottom: '1px solid #EFEAE1', padding: '8px 0', overflow: 'hidden', whiteSpace: 'nowrap', marginBottom: '16px' }}>
          <div style={{ display: 'inline-flex', gap: '20px', animation: 'marquee 25s linear infinite', fontSize: '0.74rem', fontWeight: 700, color: '#4A3B32' }}>
            <span>🌿 100% Solid European Beechwood</span>
            <span>•</span>
            <span>🛡️ Certified Non-Toxic &amp; BIS Approved</span>
            <span>•</span>
            <span>🚚 Free Express Shipping India-Wide</span>
            <span>•</span>
            <span>💵 Cash on Delivery (COD) Available</span>
            <span>•</span>
            <span>🔄 7-Day Hassle-Free Returns</span>
            <span>•</span>
            <span>⭐ 4.8/5 Rated by 5,000+ Indian Parents</span>
            <span>•</span>
            <span>🌿 100% Solid European Beechwood</span>
            <span>•</span>
            <span>🛡️ Certified Non-Toxic &amp; BIS Approved</span>
            <span>•</span>
            <span>🚚 Free Express Shipping India-Wide</span>
            <span>•</span>
            <span>💵 Cash on Delivery (COD) Available</span>
          </div>
        </div>

        {/* 2. BEST SELLERS / 8 HANDCRAFTED WOODEN PRODUCTS */}
        <section id="bestsellers" className="bestsellers-section-wrap" aria-label="All Wooden Essentials">
          <div className="bestsellers-header-split">
            <div>
              <h2 className="bestsellers-title">Best Sellers</h2>
              <p className="bestsellers-sub">Loved by kids. Trusted for learning &amp; play.</p>
            </div>

            <span style={{ fontSize: '0.74rem', color: '#8D7B71', fontWeight: 700 }}>
              {filteredProducts.length} items
            </span>
          </div>

          <div className="bestsellers-grid-2">
            {filteredProducts.map(product => {
              return (
                <article key={product.id} className="bestseller-product-card">
                  <Link href={`/product/${product.id}`} className="bestseller-card-img-wrap" style={{ display: 'block' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="bestseller-card-img"
                    />
                  </Link>

                  <div className="bestseller-card-info">
                    <span className="bestseller-brand-label">HOPEKRAFT</span>
                    <Link href={`/product/${product.id}`} className="bestseller-item-title">
                      {product.name}
                    </Link>
                    <div className="bestseller-item-price">₹{product.price.toLocaleString('en-IN')}</div>
                    
                    {/* Buy Now Navigates Directly to Product Detail */}
                    <Link href={`/product/${product.id}`} className="bestseller-buy-btn">
                      Buy Now
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. PROMO BANNER (CREATIVE PLAY & DIY) */}
        <section className="mockup-promo-card-wrap" aria-label="Promotional Spotlight">
          <div className="mockup-promo-card-gradient">
            <div>
              <div className="promo-tag-white">
                <span>🔆</span> Creative Play &amp; DIY
              </div>

              <h3 className="promo-title-white">
                Wooden Blocks &amp;<br />Puzzles
              </h3>

              <p className="promo-sub-white">
                Build, stack, imagine &amp; explore hands-on learning
              </p>

              <Link href="/product/blocks" className="promo-explore-btn">
                Explore Now →
              </Link>
            </div>

            <div className="promo-img-col">
              <img
                src="/assets/images/promo_blocks.png"
                alt="Wooden Alphabet Blocks spilling from canvas bag"
              />
            </div>
          </div>
        </section>

        {/* 6. WHY CHOOSE HOPEKRAFT? */}
        <section className="why-choose-section-wrap" aria-label="Why Choose HOPEKRAFT">
          <h2 className="section-ornament-title">
            <span style={{ color: '#C29A78' }}>⊰</span> Why Choose HOPEKRAFT? <span style={{ color: '#C29A78' }}>⊱</span>
          </h2>

          <div className="why-choose-grid-4">
            <div className="why-choose-card">
              <span className="why-choose-icon">🌿</span>
              <span className="why-choose-label">Supports Early Learning</span>
            </div>

            <div className="why-choose-card">
              <span className="why-choose-icon">🧠</span>
              <span className="why-choose-label">Builds Creativity</span>
            </div>

            <div className="why-choose-card">
              <span className="why-choose-icon">🤍</span>
              <span className="why-choose-label">Safe &amp; Natural</span>
            </div>

            <div className="why-choose-card">
              <span className="why-choose-icon">⭐</span>
              <span className="why-choose-label">Made for Little Learners</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '14px', color: '#C8B29E', fontSize: '0.8rem', letterSpacing: '4px' }}>
            🍃 〰️ 〰️ 🌿 〰️ 〰️ 🍃
          </div>
        </section>

        {/* 7. NEW SECTION: PARENT LOVE & VERIFIED SOCIAL PROOF */}
        <section style={{ padding: '0 12px', marginTop: '22px' }}>
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#C29A78', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              LOVED BY 5,000+ FAMILIES
            </span>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#2B1B17', margin: '2px 0 0' }}>
              What Indian Parents Are Saying
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parentReviews.map((r, i) => (
              <div key={i} style={{ background: '#FFFFFF', borderRadius: '10px', padding: '12px 14px', border: '1px solid #EBE4D8', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#2B1B17' }}>{r.name}</div>
                  <span style={{ fontSize: '0.68rem', color: '#887B70' }}>{r.city}</span>
                </div>

                <div style={{ display: 'flex', gap: '2px', color: '#FFAA00', marginBottom: '6px' }}>
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} size={11} fill="#FFAA00" color="#FFAA00" />
                  ))}
                </div>

                <p style={{ fontSize: '0.74rem', color: '#554A40', lineHeight: '1.4', margin: '0 0 6px' }}>
                  &ldquo;{r.quote}&rdquo;
                </p>

                <div style={{ fontSize: '0.66rem', color: '#2E7D32', fontWeight: 700 }}>
                  ✓ Purchased {r.toy}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. NEW SECTION: 100% RISK-FREE SHOPPING PROMISE */}
        <section style={{ padding: '0 12px', marginTop: '20px' }}>
          <div style={{ background: '#FAF8F4', borderRadius: '12px', border: '1px dashed #D6C8B8', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🛡️</div>
            <h3 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2B1B17', margin: '0 0 4px' }}>
              HOPEKRAFT Peace of Mind Guarantee
            </h3>
            <p style={{ fontSize: '0.72rem', color: '#6A5F56', margin: '0 auto 10px', maxWidth: '360px', lineHeight: '1.4' }}>
              Inspect your toys at your doorstep with Cash on Delivery. If you are not 100% satisfied, enjoy our instant 7-day doorstep replacement guarantee.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E8F5E9', color: '#1B5E20', fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: '20px' }}>
              ✓ 100% Zero-Risk Purchase
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
