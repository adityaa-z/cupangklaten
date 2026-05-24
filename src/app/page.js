'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FAB from '@/components/FAB';
import PromoPopup from '@/components/PromoPopup';
import { getPromoSettings } from '@/app/actions/promo';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [fishProducts, setFishProducts] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [suppliesProducts, setSuppliesProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoActive, setPromoActive] = useState('false');

  // User Review States
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [submitError, setSubmitError] = useState('');

  

  // Refs for sliders
  const fishSliderRef = React.useRef(null);
  const suppliesSliderRef = React.useRef(null);
  const reviewsSliderRef = React.useRef(null);
  const auctionsSliderRef = React.useRef(null);

  // Scroll states
  const [scrollFish, setScrollFish] = useState({ left: false, right: true });
  const [scrollSupp, setScrollSupp] = useState({ left: false, right: true });
  const [scrollReviews, setScrollReviews] = useState({ left: false, right: true });
  const [scrollAuctions, setScrollAuctions] = useState({ left: false, right: true });



  useEffect(() => {
    // Check Date Eligibility (May 24/25 - May 30) for 2025 or 2026 (active testing year)
    const now = new Date();
    const isPromoDateActive = (
      (now >= new Date('2025-05-24T00:00:00') && now <= new Date('2025-05-30T23:59:59')) ||
      (now >= new Date('2026-05-24T00:00:00') && now <= new Date('2026-05-30T23:59:59'))
    );

    if (isPromoDateActive) {
      const lastSeen = localStorage.getItem('promo_popup_seen');
      const todayStr = now.toDateString();
      if (lastSeen !== todayStr) {
        const timer = setTimeout(() => {
          setShowPromoPopup(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleClosePromo = () => {
    setShowPromoPopup(false);
    const todayStr = new Date().toDateString();
    localStorage.setItem('promo_popup_seen', todayStr);
  };

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
    if (session) {
      async function checkMyReview() {
        try {
          const res = await fetch('/api/reviews/my-review/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.hasReview) {
              setHasSubmitted(true);
            }
          }
        } catch (err) {
          console.error('Error checking my review:', err);
        }
      }
      checkMyReview();
    } else {
      setHasSubmitted(false);
    }
  }, [session]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: userRating, content: userComment })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengirimkan ulasan');
      }

      setHasSubmitted(true);
      setShowReviewModal(false);
      setUserComment('');
      setUserRating(5);
      
      alert('Ulasan Anda berhasil dikirim dan menunggu persetujuan admin!');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
        async function fetchAuctions() {
      try {
        const res = await fetch('/api/auctions/');
        if (res.ok) {
          const data = await res.json();
          // Filter only active auctions
          setAuctions(data.filter(a => a.status === 'active'));
        }
      } catch (err) {
        console.error('Error fetching auctions:', err);
      }
    }
    fetchAuctions();

    async function fetchPromoSettings() {
      try {
        const settings = await getPromoSettings();
        setPromoActive(settings.PROMO_ACTIVE);
      } catch (err) {
        console.error('Error fetching promo settings', err);
      }
    }
    fetchPromoSettings();

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
    const onAuctionsScroll = () => handleScroll(auctionsSliderRef, setScrollAuctions);

    if (fSlider) fSlider.addEventListener('scroll', onFishScroll);
    if (sSlider) sSlider.addEventListener('scroll', onSuppScroll);
    if (rSlider) rSlider.addEventListener('scroll', onReviewsScroll);
    const aSlider = auctionsSliderRef.current;
    if (aSlider) aSlider.addEventListener('scroll', onAuctionsScroll);
    
    // Initial checks
    setTimeout(() => {
      onFishScroll();
      onSuppScroll();
      onReviewsScroll();
      onAuctionsScroll();
    }, 500);

    return () => {
      if (fSlider) fSlider.removeEventListener('scroll', onFishScroll);
      if (sSlider) sSlider.removeEventListener('scroll', onSuppScroll);
      if (rSlider) rSlider.removeEventListener('scroll', onReviewsScroll);
      if (aSlider) aSlider.removeEventListener('scroll', onAuctionsScroll);
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



  return (
    <>
      <Navbar />
      <PromoPopup isActive={promoActive} />
      
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

      {/* Lelang Ikan Section */}
      <section className="products-section" id="lelang-home" style={{ paddingBottom: '4rem', paddingTop: '4rem' }}>
        <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Lelang <span style={{ background: 'linear-gradient(to right, #facc15, #ca8a04)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ikan Pilihan</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Menangkan ikan cupang kontes dengan penawaran terbaik</p>
          <div style={{ width: '60px', height: '4px', background: '#facc15', borderRadius: '10px', marginTop: '1rem' }}></div>
        </div>

        <div className="slider-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button className="slider-nav-btn prev" onClick={() => scroll(auctionsSliderRef, 'left')} disabled={!scrollAuctions.left} aria-label="Previous auction">
            <i className="fas fa-chevron-left"></i>
          </button>
          
          <div className="product-slider" ref={auctionsSliderRef}>
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="skeleton-card"><div className="skeleton-img skeleton"></div><div className="skeleton-text skeleton"></div></div>)
            ) : auctions.length > 0 ? (
              auctions.map(auction => (
                <div key={auction.id} style={{ 
                    minWidth: '280px', maxWidth: '300px', background: '#1e293b', borderRadius: '20px', 
                    overflow: 'hidden', border: '1px solid #334155', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}>
                    <div style={{ position: 'relative', width: '100%', height: '220px', background: '#0f172a' }}>
                        <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1, boxShadow: '0 2px 10px rgba(239, 68, 68, 0.5)' }}>
                            <i className="fas fa-circle" style={{ fontSize: '0.5rem', verticalAlign: 'middle', marginRight: '4px', animation: 'pulse 1.5s infinite' }}></i> Live Bidding
                        </span>
                        {auction.is_video ? (
                            <video src={auction.image_url} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <img src={auction.image_url || '/logo.png'} alt={auction.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '700', lineHeight: 1.3 }}>{auction.title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '0.8rem', background: '#0f172a', borderRadius: '12px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Open Bid</div>
                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '1rem' }}>Rp {auction.start_price.toLocaleString('id-ID')}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Kelipatan</div>
                                <div style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>Rp {auction.min_bid_increment.toLocaleString('id-ID')}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (!session) {
                                    router.push('/login');
                                } else {
                                    router.push('/lelang/' + auction.id);
                                }
                            }}
                            style={{ 
                                width: '100%', padding: '0.8rem', marginTop: 'auto', background: 'linear-gradient(135deg, #facc15, #ca8a04)', 
                                color: '#000', border: 'none', borderRadius: '50px', fontWeight: '700', cursor: 'pointer',
                                transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)'
                            }}
                            onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                        >
                            Ikut Lelang
                        </button>
                    </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', width: '100%', padding: '3rem', color: 'var(--text-muted)' }}>
                <i className="fas fa-gavel" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                <p style={{ fontSize: '1.2rem' }}>Belum ada ikan yang di lelang.</p>
              </div>
            )}
          </div>
          <button className="slider-nav-btn next" onClick={() => scroll(auctionsSliderRef, 'right')} disabled={!scrollAuctions.right} aria-label="Next auction">
            <i className="fas fa-chevron-right"></i>
          </button>
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

              {/* Tulis Ulasan / Rating Section */}
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  {status === 'loading' ? (
                      <div style={{ color: 'var(--text-muted)' }}>Memuat status...</div>
                  ) : session ? (
                      hasSubmitted ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.95rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <i className="fas fa-check-circle"></i> Anda telah mengirimkan ulasan untuk website ini. Terima kasih!
                          </div>
                      ) : (
                          <button 
                              onClick={() => {
                                  setUserRating(5);
                                  setUserComment('');
                                  setSubmitError('');
                                  setShowReviewModal(true);
                              }} 
                              className="filter-btn active"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2.2rem', fontSize: '1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', background: 'var(--primary-cyan)', boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)', transition: 'var(--transition-smooth)' }}
                          >
                              <i className="fas fa-pen-nib"></i> Tulis Ulasan Anda
                          </button>
                      )
                  ) : (
                      <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Sudah membeli ikan di Cupang Klaten? Yuk login untuk memberikan rating!</p>
                          <Link 
                              href="/login" 
                              className="filter-btn active" 
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 2.2rem', fontSize: '1rem', borderRadius: '50px', border: 'none', cursor: 'pointer', fontWeight: 'bold', color: 'white', background: 'var(--primary-cyan)', boxShadow: '0 8px 20px rgba(0, 188, 212, 0.3)' }}
                          >
                              <i className="fas fa-sign-in-alt"></i> Login untuk Mengisi Rating
                          </Link>
                      </div>
                  )}
              </div>
          </div>

          {/* Modal Kirim Ulasan */}
          {showReviewModal && (
              <div className="review-submit-modal-overlay" style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 9999,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
              }}>
                  <div className="review-submit-modal-content" style={{
                      background: 'var(--bg-white)',
                      padding: '2.5rem 2rem',
                      borderRadius: '24px',
                      maxWidth: '500px',
                      width: '100%',
                      boxShadow: 'var(--card-shadow)',
                      border: '1px solid var(--border-color)',
                      position: 'relative',
                      textAlign: 'left'
                  }}>
                      <button 
                          onClick={() => setShowReviewModal(false)}
                          style={{
                              position: 'absolute',
                              top: '1.5rem',
                              right: '1.5rem',
                              background: 'none',
                              border: 'none',
                              fontSize: '1.5rem',
                              color: 'var(--text-muted)',
                              cursor: 'pointer'
                          }}
                          aria-label="Tutup"
                      >
                          &times;
                      </button>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Berikan Ulasan Anda</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Bagikan pengalaman Anda membeli ikan cupang di Cupang Klaten.</p>
                      
                      <form onSubmit={handleReviewSubmit}>
                          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                              <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Rating Bintang</label>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', fontSize: '2.2rem' }}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                      <i 
                                          key={star} 
                                          className={`${userRating >= star ? 'fas' : 'far'} fa-star`}
                                          onClick={() => setUserRating(star)}
                                          style={{ color: '#facc15', cursor: 'pointer', transition: 'transform 0.1s ease' }}
                                      ></i>
                                  ))}
                              </div>
                          </div>
                          
                          <div style={{ marginBottom: '1.5rem' }}>
                              <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>Ulasan Anda</label>
                              <textarea 
                                  required
                                  value={userComment}
                                  onChange={(e) => setUserComment(e.target.value)}
                                  placeholder="Tulis komentar ulasan Anda disini (min. 5 karakter)..."
                                  style={{
                                      width: '100%',
                                      padding: '1rem',
                                      borderRadius: '12px',
                                      border: '1px solid var(--border-color)',
                                      minHeight: '120px',
                                      background: 'var(--bg-light)',
                                      color: 'var(--text-dark)',
                                      fontSize: '0.95rem',
                                      resize: 'vertical',
                                      outline: 'none',
                                      transition: 'border-color 0.2s'
                                  }}
                              ></textarea>
                          </div>
                          
                          {submitError && (
                              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <i className="fas fa-exclamation-circle"></i> {submitError}
                              </div>
                          )}
                          
                          <button 
                              type="submit" 
                              disabled={submittingReview}
                              style={{
                                  width: '100%',
                                  padding: '1rem',
                                  background: 'var(--primary-cyan)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '12px',
                                  fontWeight: '700',
                                  fontSize: '1.05rem',
                                  cursor: 'pointer',
                                  transition: 'var(--transition-smooth)',
                                  boxShadow: '0 4px 12px rgba(0, 188, 212, 0.2)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '0.5rem'
                              }}
                          >
                              {submittingReview ? (
                                  <>
                                      <i className="fas fa-spinner fa-spin"></i> Mengirim...
                                  </>
                              ) : 'Kirim Ulasan'}
                          </button>
                      </form>
                  </div>
              </div>
          )}
      </section>

      

      <Footer />
      <FAB />
    </>
  );
}
