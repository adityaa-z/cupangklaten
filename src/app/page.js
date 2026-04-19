'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FAB from '@/components/FAB';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Logic: Strictly 6 items total, prioritized by pinned and diverse categories
        const readyProducts = data.filter(p => (p.is_available && p.stock > 0) && !p.is_archived);
        const categories = ['Plakat', 'Halfmoon', 'HMPK', 'Crowntail', 'Giant', 'Kebutuhan Ikan'];
        
        let selected = [];
        
        // 1. First, take all pinned products (limit to 6)
        const pinned = readyProducts.filter(p => p.is_pinned).slice(0, 6);
        selected = [...pinned];

        // 2. If less than 6, try to fill with 1 from each category that isn't already selected
        if (selected.length < 6) {
            categories.forEach(cat => {
                if (selected.length >= 6) return;
                const item = readyProducts.find(p => 
                    p.category.toLowerCase() === cat.toLowerCase() && 
                    !selected.find(s => s.id === p.id)
                );
                if (item) selected.push(item);
            });
        }

        // 3. If still less than 6, fill with newest available
        if (selected.length < 6) {
            const remaining = readyProducts
                .filter(p => !selected.find(s => s.id === p.id))
                .slice(0, 6 - selected.length);
            selected = [...selected, ...remaining];
        }

        setFeaturedProducts(selected.slice(0, 6));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Koleksi <span>Cupang Terbaik</span> dari Klaten untuk Anda</h1>
            <p>Temukan ikan cupang hias berkualitas tinggi dengan genetik stabil, warna tajam, dan perawatan
              profesional langsung dari pembudidaya Klaten.</p>
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

      {/* Best Collection Section (Max 6) */}
      <section className="products-section" id="products">
        <div className="section-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Koleksi <span style={{ background: 'linear-gradient(to right, var(--primary-dark), var(--primary-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Terbaik</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Pilihan unggulan dari pembudidaya Klaten (Max 6 Ikan).</p>
          <div style={{ width: '60px', height: '4px', background: 'var(--primary-cyan)', borderRadius: '10px', marginTop: '1rem' }}></div>
        </div>

        <div className="product-grid">
          {loading ? (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Memuat koleksi...</p>
          ) : featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Belum ada stok tersedia.</p>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/stok" className="nav-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px', background: 'var(--primary-cyan)', color: 'white', fontWeight: '600', boxShadow: '0 10px 15px -3px rgba(0, 188, 212, 0.3)' }}>
            Lihat Semua Stok Ready 
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

      <Footer />
      <FAB />
    </>
  );
}
