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
    <div className="app-container storefront-shell home-desktop-shell">
      {/* Top Sticky Header with Official Logo */}
      <Header onSearch={setSearchQuery} />

      <main style={{ paddingBottom: '30px' }}>
        {/* 1. HERO SECTION: Full-Width Rich Desktop Hero & Pure Mobile Carousel */}
        <section className="hero-gradient-section" aria-label="HOPEKRAFT Featured Collection">
          <div className="hero-gradient-bg">
            <div className="hero-responsive-layout">
              {/* PC Desktop Intro Column (Hidden on Mobile) */}
              <div className="hero-desktop-content">
                <div className="hero-human-handwrite-tag">
                  ✨ Handcrafted with love for little hands &amp; big imaginations
                </div>
                <h1 className="hero-desktop-heading">
                  Simple, screen-free wooden toys your kids will truly love.
                </h1>
                <p className="hero-desktop-description">
                  In a world full of glowing screens and fragile plastic, HOPEKRAFT brings back the warmth of pure tactile childhood. Naturally solid European beechwood, silky-smooth rounded edges, and heirloom-quality toys made to be touched, stacked, and passed down.
                </p>

                {/* Handcrafted Workshop Highlights */}
                <div className="hero-human-checklist">
                  <div className="hero-human-check-item">
                    <span className="hero-check-bullet">🪵</span>
                    <span><strong>Pure European Beechwood:</strong> 100% natural, solid &amp; splinter-free</span>
                  </div>
                  <div className="hero-human-check-item">
                    <span className="hero-check-bullet">🎨</span>
                    <span><strong>Child-Safe Finishes:</strong> Non-toxic, BIS approved &amp; water-based colours</span>
                  </div>
                  <div className="hero-human-check-item">
                    <span className="hero-check-bullet">🇮🇳</span>
                    <span><strong>Loved Across India:</strong> Multi-language blocks with Free Doorstep COD</span>
                  </div>
                </div>

                <div className="hero-desktop-cta-row">
                  <Link href="#bestsellers" className="hero-desktop-primary-btn">
                    Explore Wooden Toys <ArrowRight size={15} />
                  </Link>
                  <a
                    href="https://wa.me/918554091926?text=Hi%20HOPEKRAFT%2C%20I%20have%20an%20order%20inquiry%20regarding%20your%20wooden%20toys."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hero-desktop-whatsapp-btn"
                    title="Order Inquiry on WhatsApp: 8554091926"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>Order Inquiry</span>
                  </a>
                  <Link href="#reviews" className="hero-desktop-secondary-btn">
                    ⭐ 5,000+ Parent Stories
                  </Link>
                </div>
              </div>

              {/* 1:1 Photo Carousel Container */}
              <div className="hero-carousel-wrapper">
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

                  {/* Floating Trust Pill (Desktop Only) */}
                  <div className="hero-desktop-floating-badge">
                    <span className="hero-floating-dot"></span>
                    <span>Montessori Certified • BIS Approved</span>
                  </div>

                  {/* Navigation Arrows */}
                  <button className="hero-carousel-arrow hero-carousel-arrow-left" onClick={prevSlide} aria-label="Previous slide">
                    <ChevronLeft size={22} />
                  </button>
                  <button className="hero-carousel-arrow hero-carousel-arrow-right" onClick={nextSlide} aria-label="Next slide">
                    <ChevronRight size={22} />
                  </button>

                  {/* Bottom Info Bar Overlay */}
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

                    <div className="hero-action-btns">
                      <a
                        href="https://wa.me/918554091926?text=Hi%20HOPEKRAFT%2C%20I%20have%20an%20order%20inquiry%20regarding%20your%20wooden%20toys."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-whatsapp-circle-btn"
                        title="Chat on WhatsApp: 8554091926 (Order Inquiry)"
                        aria-label="Order Inquiry on WhatsApp: 8554091926"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFFFFF">
                          <path fillRule="evenodd" clipRule="evenodd" d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.763.46 3.483 1.332 5.001L2 22l5.122-1.312a9.96 9.96 0 0 0 4.882 1.316h.004c5.523 0 10.003-4.48 10.003-10.004C22.011 6.48 17.528 2 12.004 2zm5.823 14.195c-.244.685-1.42 1.309-1.954 1.393-.524.082-1.208.118-3.489-.824-2.736-1.13-4.498-3.896-4.634-4.077-.137-.181-1.107-1.474-1.107-2.81 0-1.337.7-1.994.95-2.263.248-.27.544-.338.725-.338.181 0 .363.003.522.012.168.01.394-.064.617.47.23.551.783 1.91.852 2.05.069.14.116.304.023.49-.092.185-.138.3-.274.463-.137.164-.288.366-.412.492-.138.14-.282.292-.121.569.16.276.712 1.173 1.528 1.9 1.05.938 1.936 1.228 2.212 1.365.275.137.435.115.596-.07.161-.184.689-.803.873-1.079.184-.276.368-.23.619-.138.253.092 1.606.757 1.882.895.276.138.46.207.529.322.069.115.069.667-.175 1.352z"/>
                        </svg>
                      </a>

                      <Link href="#bestsellers" className="hero-shop-btn">
                        Shop Now <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. AUTO MOVING CONTINUOUS TRUST MARQUEE */}
        <div className="trust-marquee-container" aria-label="Authenticity and Trust Guarantees">
          <div className="trust-marquee-track">
            <div className="trust-marquee-group">
              <span>🌿 100% Solid European Beechwood</span>
              <span className="marquee-dot">•</span>
              <span>🛡️ Certified Non-Toxic &amp; BIS Approved</span>
              <span className="marquee-dot">•</span>
              <span>🚚 Free Express Shipping India-Wide</span>
              <span className="marquee-dot">•</span>
              <span>💵 Cash on Delivery (COD) Available</span>
              <span className="marquee-dot">•</span>
              <span>🔄 7-Day Hassle-Free Returns</span>
              <span className="marquee-dot">•</span>
              <span>⭐ 4.8/5 Rated by 5,000+ Indian Parents</span>
              <span className="marquee-dot">•</span>
            </div>
            <div className="trust-marquee-group" aria-hidden="true">
              <span>🌿 100% Solid European Beechwood</span>
              <span className="marquee-dot">•</span>
              <span>🛡️ Certified Non-Toxic &amp; BIS Approved</span>
              <span className="marquee-dot">•</span>
              <span>🚚 Free Express Shipping India-Wide</span>
              <span className="marquee-dot">•</span>
              <span>💵 Cash on Delivery (COD) Available</span>
              <span className="marquee-dot">•</span>
              <span>🔄 7-Day Hassle-Free Returns</span>
              <span className="marquee-dot">•</span>
              <span>⭐ 4.8/5 Rated by 5,000+ Indian Parents</span>
              <span className="marquee-dot">•</span>
            </div>
          </div>
        </div>

        {/* 3. BEST SELLERS / 8 HANDCRAFTED WOODEN PRODUCTS */}
        <section id="bestsellers" className="bestsellers-section-wrap" aria-label="All Wooden Essentials">
          <div className="bestsellers-header-split">
            <div>
              <h2 className="bestsellers-title">Best Sellers</h2>
              <p className="bestsellers-sub">Loved by kids. Trusted for learning &amp; play.</p>
            </div>

            <span style={{ fontSize: '0.74rem', color: '#8D7B71', fontWeight: 500 }}>
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

        {/* 4. PROMO BANNER (CREATIVE PLAY & DIY) */}
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

        {/* 5. WHY CHOOSE HOPEKRAFT? */}
        <section id="why-hopekraft" className="why-choose-section-wrap" aria-label="Why Choose HOPEKRAFT">
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

        {/* 6. PARENT LOVE & VERIFIED SOCIAL PROOF */}
        <section id="reviews" className="parent-reviews-section" style={{ padding: '0 14px', marginTop: '22px' }}>
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#A06E47', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              LOVED BY 5,000+ FAMILIES
            </span>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2B1B17', margin: '3px 0 0' }}>
              What Indian Parents Are Saying
            </h2>
          </div>

          <div className="reviews-grid-responsive">
            {parentReviews.map((r, i) => (
              <div key={i} className="review-card-item">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#2B1B17' }}>{r.name}</div>
                  <span style={{ fontSize: '0.7rem', color: '#887B70', fontWeight: 400 }}>{r.city}</span>
                </div>

                <div style={{ display: 'flex', gap: '2px', color: '#FFAA00', marginBottom: '8px' }}>
                  {[...Array(r.rating)].map((_, idx) => (
                    <Star key={idx} size={12} fill="#FFAA00" color="#FFAA00" />
                  ))}
                </div>

                <p style={{ fontSize: '0.76rem', color: '#554A40', lineHeight: '1.5', margin: '0 0 8px', fontWeight: 400 }}>
                  &ldquo;{r.quote}&rdquo;
                </p>

                <div style={{ fontSize: '0.68rem', color: '#2E7D32', fontWeight: 500 }}>
                  ✓ Purchased {r.toy}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. 100% RISK-FREE SHOPPING PROMISE */}
        <section id="guarantee" className="risk-free-section" style={{ padding: '0 14px', marginTop: '22px' }}>
          <div className="guarantee-box-wrap">
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🛡️</div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 600, color: '#2B1B17', margin: '0 0 6px' }}>
              HOPEKRAFT Peace of Mind Guarantee
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#6A5F56', margin: '0 auto 12px', maxWidth: '440px', lineHeight: '1.5', fontWeight: 400 }}>
              Inspect your toys at your doorstep with Cash on Delivery. If you are not 100% satisfied, enjoy our instant 7-day doorstep replacement guarantee.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#E8F5E9', color: '#1B5E20', fontSize: '0.72rem', fontWeight: 600, padding: '5px 14px', borderRadius: '20px' }}>
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
