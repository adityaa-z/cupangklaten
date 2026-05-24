'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FAB from '@/components/FAB';
import { useSession } from 'next-auth/react';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { data: session } = useSession();
  const [fishProducts, setFishProducts] = useState([]);
  const [suppliesProducts, setSuppliesProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for sliders
  const fishSliderRef = React.useRef(null);
  const suppliesSliderRef = React.useRef(null);
  const reviewsSliderRef = React.useRef(null);

  // Scroll states
  const [scrollFish, setScrollFish] = useState({ left: false, right: true });
  const [scrollSupp, setScrollSupp] = useState({ left: false, right: true });
  const [scrollReviews, setScrollReviews] = useState({ left: false, right: true });

  // Review form state
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '' });
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');



  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch('/api/reviews/');
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch('/api/products/');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();

        // Separate products - include everything
        const filtered = (data || []);
        
        // 1. Ambil Perlengkapan (Kebutuhan Ikan)
        const supplies = filtered.filter(p => {
          const cat = (p.category || '').toString().toLowerCase().trim();
          return cat.includes('kebutuhan') || 
                 cat.includes('pakan') || 
                 cat.includes('obat') || 
                 cat.includes('alat') || 
                 cat.includes('aksesoris') ||
                 cat.includes('perlengkapan');
        });
        
        // 2. Sisanya adalah Ikan
        const fish = filtered.filter(p => !supplies.some(s => s.id === p.id));

        // Prioritize pinned products for the featured sliders
        const sortedFish = [...fish].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
        const sortedSupplies = [...supplies].sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));

        setFishProducts(sortedFish.slice(0, 50)); 
        setSuppliesProducts(sortedSupplies.slice(0, 50));


      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  const handleScroll = (ref, setScrollState) => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setScrollState({
        left: scrollLeft > 10,
        right: scrollLeft < scrollWidth - clientWidth - 10
      });
    }
  };

  useEffect(() => {
    const fSlider = fishSliderRef.current;
    const sSlider = suppliesSliderRef.current;
    const rSlider = reviewsSliderRef.current;
    
    const onFishScroll = () => handleScroll(fishSliderRef, setScrollFish);
    const onSuppScroll = () => handleScroll(suppliesSliderRef, setScrollSupp);
    const onReviewsScroll = () => handleScroll(reviewsSliderRef, setScrollReviews);

    if (fSlider) fSlider.addEventListener('scroll', onFishScroll);
    if (sSlider) sSlider.addEventListener('scroll', onSuppScroll);
    if (rSlider) rSlider.addEventListener('scroll', onReviewsScroll);
    
    // Initial checks
    setTimeout(() => {
      onFishScroll();
      onSuppScroll();
      onReviewsScroll();
    }, 500);

    return () => {
      if (fSlider) fSlider.removeEventListener('scroll', onFishScroll);
      if (sSlider) sSlider.removeEventListener('scroll', onSuppScroll);
      if (rSlider) rSlider.removeEventListener('scroll', onReviewsScroll);
    };
  }, [loading, fishProducts, suppliesProducts, reviews]);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.8;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };



  const submitReview = async (e) => {
    e.preventDefault();
    if (!session) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewForm.rating, content: reviewForm.content })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewSubmitted(true);
      } else {
        setReviewError(data.error || 'Terjadi kesalahan.');
      }
    } catch {
      setReviewError('Gagal mengirim ulasan. Coba lagi.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Pusat Ikan <span>Cupang Klaten</span> Terbaik & Bergaransi</h1>
            <p>Beli Ikan Cupang Klaten berkualitas tinggi langsung dari pembudidaya. Koleksi genetik stabil, warna tajam, dan pengiriman aman ke seluruh Indonesia.</p>
            <div className="hero-btns" style={{ display: 'flex', gap: '1rem' }}>
              <Link href="#products" className="filter-btn active" style={{ textDecoration: 'none' }}>
                Lihat Koleksi
              </Link>
              <a href="https://wa.me/6285700846152?text=Halo%20Cupang%20Klaten,%20saya%20ingin%20konsultasi"
                className="filter-btn" style={{ textDecoration: 'none' }}>
                Konsultasi Gratis
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/hero.png" alt="Betta Fish Hero" />
          </div>
        </div>
      </section>

      {/* Fish Collection Section */}
      <section className="products-section" id="products" style={{ paddingBottom: '2rem' }}>
        <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Koleksi <span style={{ background: 'linear-gradient(to right, var(--primary-dark), var(--primary-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ikan Pilihan</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Ikan Cupang hias kualitas kontes & genetik mantap</p>
          <div style={{ width: '60px', height: '4px', background: 'var(--primary-cyan)', borderRadius: '10px', marginTop: '1rem' }}></div>
        </div>


        <div className="slider-container">
          <button className="slider-nav-btn prev" onClick={() => scroll(fishSliderRef, 'left')} disabled={!scrollFish.left} aria-label="Previous fish">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="product-slider" ref={fishSliderRef}>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton-card"><div className="skeleton-img skeleton"></div><div className="skeleton-text skeleton"></div><div className="skeleton-price skeleton"></div><div className="skeleton-btn skeleton"></div></div>)
            ) : fishProducts.length > 0 ? (
              fishProducts.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>Stok ikan sedang disiapkan.</p>
            )}
          </div>
          <button className="slider-nav-btn next" onClick={() => scroll(fishSliderRef, 'right')} disabled={!scrollFish.right} aria-label="Next fish">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <div className="swipe-hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-dark)', fontSize: '0.9rem', fontWeight: '600', opacity: '0.8' }}>
            <i className="fas fa-arrows-alt-h"></i>
            <span>Geser untuk lihat ikan lainnya</span>
          </div>
        </div>
      </section>


      {/* Supplies Collection Section */}
      <section className="products-section" style={{ background: 'var(--bg-white)', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Kebutuhan <span style={{ background: 'linear-gradient(to right, #ff7043, #f4511e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ikan & Aksesoris</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Pakan, obat, dan perlengkapan ikan cupang terbaik</p>
          <div style={{ width: '60px', height: '4px', background: '#ff7043', borderRadius: '10px', marginTop: '1rem' }}></div>
        </div>


        <div className="slider-container">
          <button className="slider-nav-btn prev" onClick={() => scroll(suppliesSliderRef, 'left')} disabled={!scrollSupp.left} aria-label="Previous supplies">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="product-slider" ref={suppliesSliderRef}>
            {loading ? (
              [...Array(4)].map((_, i) => <div key={i} className="skeleton-card"><div className="skeleton-img skeleton"></div><div className="skeleton-text skeleton"></div><div className="skeleton-price skeleton"></div><div className="skeleton-btn skeleton"></div></div>)
            ) : suppliesProducts.length > 0 ? (
              suppliesProducts.map(product => <ProductCard key={product.id} product={product} />)
            ) : (
              <p style={{ textAlign: 'center', width: '100%', padding: '2rem' }}>Stok perlengkapan sedang disiapkan.</p>
            )}
          </div>
          <button className="slider-nav-btn next" onClick={() => scroll(suppliesSliderRef, 'right')} disabled={!scrollSupp.right} aria-label="Next supplies">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <div className="swipe-hint" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f4511e', fontSize: '0.9rem', fontWeight: '600', opacity: '0.8' }}>
            <i className="fas fa-arrows-alt-h"></i>
            <span>Geser untuk lihat perlengkapan lainnya</span>
          </div>
        </div>


        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/stok" className="nav-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px', background: 'var(--primary-cyan)', color: 'white', fontWeight: '600', boxShadow: '0 10px 15px -3px rgba(0, 188, 212, 0.3)' }}>
            Lihat Semua Produk
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </section>


      {/* Education Section */}
      <section className="blog-section">
        <div className="section-header" style={{ maxWidth: '1200px', margin: '0 auto 3rem' }}>
          <h2 style={{ fontSize: '2rem' }}>Tips & Edukasi</h2>
        </div>
        <div className="blog-grid">
          <div className="blog-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '20px' }}>
            <img src="/pk-001.png" alt="Tips Perawatan" />
            <div>
              <h3>Tips Perawatan Ikan</h3>
              <p>Cara menjaga kualitas air dan pakan terbaik untuk warna ikan cupang.</p>
              <Link href="/tips-perawatan" style={{ color: 'var(--primary-dark)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
          <div className="blog-card" style={{ background: 'var(--bg-light)', padding: '1.5rem', borderRadius: '20px' }}>
            <img src="/gt-005.png" alt="Perbedaan Jantan & Betina" />
            <div>
              <h3>Jantan vs Betina</h3>
              <p>Cara mudah membedakan jenis kelamin ikan cupang untuk pemula.</p>
              <Link href="/jantan-vs-betina" style={{ color: 'var(--primary-dark)', fontWeight: '600', textDecoration: 'none', fontSize: '0.9rem' }}>
                Baca Selengkapnya →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section" id="reviews">
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <h2 className="section-title">Kata Pelanggan cupangklaten.id</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ulasan asli dari Google Maps</p>
              
              <div className="slider-container">
                <button className="slider-nav-btn prev" onClick={() => scroll(reviewsSliderRef, 'left')} disabled={!scrollReviews.left} aria-label="Previous review">
                    <i className="fas fa-chevron-left"></i>
                </button>
                <div className="reviews-grid" ref={reviewsSliderRef}>
                    {reviews.length > 0 ? reviews.map(r => (
                        <div key={r.id} className="review-card">
                            <i className="fab fa-google google-icon"></i>
                            <div className="review-header">
                                <div className="review-avatar">
                                    {r.img ? (
                                        <img src={r.img} alt={r.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        r.avatar_char || r.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="review-info">
                                    <h4>{r.name}</h4>
                                </div>
                            </div>
                            <div className="review-stars">
                                {[...Array(r.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                                <span className="verify-badge-container">
                                    <i className="fas fa-check-circle verify-badge"></i>
                                    <span className="tooltip">berhasil terverifikasi bahwa sumber asli dari Google</span>
                                </span>
                            </div>
                            <p className="review-content">{r.content}</p>
                        </div>
                    )) : (
                        <div style={{ width: '100%', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            <p>Belum ada ulasan. Tambahkan ulasan pertama Anda di Admin Panel!</p>
                        </div>
                    )}
                </div>
                <button className="slider-nav-btn next" onClick={() => scroll(reviewsSliderRef, 'right')} disabled={!scrollReviews.right} aria-label="Next review">
                    <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              {/* Review Submit Form */}
              <div style={{ marginTop: '4rem', maxWidth: '600px', margin: '4rem auto 0' }}>
                <div style={{
                  background: 'var(--bg-white)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                      ✍️ Bagikan Pengalaman Anda
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      Ceritakan pengalaman berbelanja di Cupang Klaten
                    </p>
                  </div>

                  {!session ? (
                    <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--bg-light)', borderRadius: '16px' }}>
                      <i className="fas fa-lock" style={{ fontSize: '2rem', color: 'var(--primary-cyan)', marginBottom: '1rem', display: 'block' }}></i>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }}>Login terlebih dahulu untuk memberikan ulasan</p>
                      <Link href="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.8rem 2rem', borderRadius: '50px',
                        background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-cyan))',
                        color: 'white', fontWeight: '700', textDecoration: 'none',
                        boxShadow: '0 8px 20px rgba(0,188,212,0.3)'
                      }}>
                        <i className="fas fa-sign-in-alt"></i> Login Sekarang
                      </Link>
                    </div>
                  ) : reviewSubmitted ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                      <h4 style={{ color: 'var(--text-dark)', marginBottom: '0.5rem', fontWeight: '700' }}>Terima Kasih!</h4>
                      <p style={{ color: 'var(--text-muted)' }}>Ulasan Anda sedang menunggu persetujuan admin dan akan segera ditampilkan.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitReview}>
                      {reviewError && (
                        <div style={{
                          background: '#fef2f2', border: '1px solid #fecaca',
                          borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem',
                          color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                          <i className="fas fa-exclamation-circle"></i> {reviewError}
                        </div>
                      )}

                      {/* Star Rating */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.8rem', fontSize: '0.95rem' }}>
                          Rating Anda
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              id={`star-${star}`}
                              onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                              onMouseEnter={() => setReviewHoverRating(star)}
                              onMouseLeave={() => setReviewHoverRating(0)}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: '2.2rem', padding: '0.2rem',
                                color: star <= (reviewHoverRating || reviewForm.rating) ? '#facc15' : 'var(--border-color)',
                                transition: 'transform 0.1s, color 0.2s',
                                transform: star <= (reviewHoverRating || reviewForm.rating) ? 'scale(1.2)' : 'scale(1)'
                              }}
                              aria-label={`${star} bintang`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                          {['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewForm.rating]} ({reviewForm.rating}/5)
                        </p>
                      </div>

                      {/* Comment */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <label htmlFor="review-content" style={{ display: 'block', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '0.6rem', fontSize: '0.95rem' }}>
                          Komentar
                        </label>
                        <textarea
                          id="review-content"
                          value={reviewForm.content}
                          onChange={(e) => setReviewForm(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Ceritakan pengalaman Anda... (min. 10 karakter)"
                          required
                          minLength={10}
                          rows={4}
                          style={{
                            width: '100%', padding: '1rem', borderRadius: '14px',
                            border: '2px solid var(--border-color)',
                            background: 'var(--bg-light)',
                            color: 'var(--text-dark)',
                            fontSize: '0.95rem', resize: 'vertical', outline: 'none',
                            transition: 'border-color 0.2s',
                            fontFamily: 'inherit'
                          }}
                          onFocus={(e) => e.target.style.borderColor = 'var(--primary-cyan)'}
                          onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                        />
                      </div>

                      <button
                        id="submit-review-btn"
                        type="submit"
                        disabled={reviewSubmitting}
                        style={{
                          width: '100%', padding: '1rem',
                          background: reviewSubmitting
                            ? 'var(--border-color)'
                            : 'linear-gradient(135deg, var(--primary-dark), var(--primary-cyan))',
                          color: 'white', border: 'none', borderRadius: '14px',
                          fontWeight: '800', fontSize: '1rem', cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                          boxShadow: reviewSubmitting ? 'none' : '0 8px 20px rgba(0,188,212,0.3)',
                          transition: 'all 0.3s'
                        }}
                      >
                        {reviewSubmitting ? (
                          <><i className="fas fa-spinner fa-spin"></i> Mengirim...</>
                        ) : (
                          <><i className="fas fa-paper-plane"></i> Kirim Ulasan</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
          </div>
      </section>

      <Footer />
      <FAB />
    </>
  );
}
