'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FAB from '@/components/FAB';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [fishProducts, setFishProducts] = useState([]);
  const [suppliesProducts, setSuppliesProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for sliders
  const fishSliderRef = React.useRef(null);
  const suppliesSliderRef = React.useRef(null);

  // Scroll states
  const [scrollFish, setScrollFish] = useState({ left: false, right: true });
  const [scrollSupp, setScrollSupp] = useState({ left: false, right: true });



  useEffect(() => {
    async function fetchReviews() {
      if (!supabase) return;
      const { data } = await supabase.from('reviews').select('*').order('id', { ascending: false });
      if (data) setReviews(data);
    }
    fetchReviews();
  }, []);

  useEffect(() => {
    async function fetchFeatured() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Separate products - include sold out but exclude archived
        const filtered = (data || []).filter(p => !p.is_archived);
        
        // Debug log (Hanya muncul di konsol browser - tekan F12)
        if (process.env.NODE_ENV !== 'production') {
          console.log('Total Produk di DB:', data?.length);
          console.log('Total Produk Aktif (Bukan Arsip):', filtered.length);
        }
        
        const supplies = filtered.filter(p => {
          const category = (p.category || '').toString().toLowerCase().trim();
          // Debugging log khusus untuk kategori (bisa dilihat di Inspect > Console)
          if (process.env.NODE_ENV !== 'production' && category !== '') {
             console.log(`Checking Product: ${p.code}, Category: "${category}"`);
          }
          return category === 'kebutuhan ikan' || category === 'kebutuhan' || category.includes('perlengkapan');
        });
        
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
    
    const onFishScroll = () => handleScroll(fishSliderRef, setScrollFish);
    const onSuppScroll = () => handleScroll(suppliesSliderRef, setScrollSupp);

    if (fSlider) fSlider.addEventListener('scroll', onFishScroll);
    if (sSlider) sSlider.addEventListener('scroll', onSuppScroll);
    
    // Initial checks
    setTimeout(() => {
      onFishScroll();
      onSuppScroll();
    }, 500);

    return () => {
      if (fSlider) fSlider.removeEventListener('scroll', onFishScroll);
      if (sSlider) sSlider.removeEventListener('scroll', onSuppScroll);
    };
  }, [loading, fishProducts, suppliesProducts]);

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
              
              <div className="reviews-grid">
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
          </div>
      </section>

      <Footer />
      <FAB />
    </>
  );
}
