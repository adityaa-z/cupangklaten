'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export const dynamic = 'force-dynamic';

export default function BlogListingPage() {
    const [articles, setArticles] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const res = await fetch('/api/blog/');
                if (res.ok) {
                    const data = await res.json();
                    setArticles(data || []);
                }
            } catch (err) {
                console.error('Error fetching blog articles:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    // Get unique categories list
    const categories = ['Semua', ...new Set(articles.map(art => art.category).filter(Boolean))];

    // Filter and search
    const filteredArticles = articles.filter(art => {
        const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              art.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Semua' || art.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Helper: strip HTML tags for card excerpt
    const getExcerpt = (htmlString) => {
        if (!htmlString) return '';
        const stripped = htmlString.replace(/<[^>]*>/g, '');
        return stripped.length > 120 ? stripped.substring(0, 117) + '...' : stripped;
    };

    return (
        <>
            <Navbar />
            <div className="finance-body" style={{ minHeight: '80vh', padding: '3rem 1rem' }}>
                <div className="finance-container">
                    
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 className="finance-title" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, #00d2ff 0%, #D4AF37 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            BLOG CUPANG KLATEN
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600' }}>
                            Tips, Edukasi, & Kabar Terbaru Dunia Cupang Hias
                        </p>
                    </div>

                    {/* Filter & Search Bar */}
                    <div style={{ 
                        background: 'var(--bg-white)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '20px', 
                        padding: '1.5rem', 
                        marginBottom: '2.5rem',
                        boxShadow: 'var(--card-shadow)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
                                <input 
                                    type="text" 
                                    placeholder="Cari judul atau isi artikel..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="form-control"
                                    style={{ paddingLeft: '2.5rem' }}
                                />
                                <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}></i>
                            </div>
                        </div>

                        {/* Category Badges */}
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    style={{
                                        background: selectedCategory === cat ? 'linear-gradient(135deg, #00d2ff 0%, #007bff 100%)' : 'rgba(255, 255, 255, 0.03)',
                                        border: `1px solid ${selectedCategory === cat ? '#00d2ff' : 'var(--border-color)'}`,
                                        color: selectedCategory === cat ? 'white' : 'var(--text-dark)',
                                        padding: '0.5rem 1.2rem',
                                        borderRadius: '30px',
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: selectedCategory === cat ? '0 4px 10px rgba(0, 210, 255, 0.2)' : 'none'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Articles Grid */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                            <div className="spinner-mini" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
                            <p style={{ color: '#94a3b8' }}>Memuat artikel...</p>
                        </div>
                    ) : filteredArticles.length > 0 ? (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
                            gap: '2rem' 
                        }}>
                            {filteredArticles.map(art => (
                                <article 
                                    key={art.id} 
                                    className="finance-card" 
                                    style={{ 
                                        padding: 0, 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        height: '100%',
                                        overflow: 'hidden',
                                        borderRadius: '20px'
                                    }}
                                >
                                    {/* Thumbnail */}
                                    <div style={{ width: '100%', height: '200px', position: 'relative', overflow: 'hidden', background: '#0f172a' }}>
                                        {art.thumbnail ? (
                                            <img 
                                                src={art.thumbnail} 
                                                alt={art.title} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} 
                                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                                            />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                                                <i className="fas fa-image" style={{ fontSize: '3rem' }}></i>
                                            </div>
                                        )}
                                        {art.category && (
                                            <span style={{ 
                                                position: 'absolute', 
                                                top: '1rem', 
                                                left: '1rem', 
                                                background: 'linear-gradient(135deg, #00d2ff 0%, #007bff 100%)', 
                                                color: 'white', 
                                                fontSize: '0.75rem', 
                                                fontWeight: 'bold', 
                                                padding: '0.3rem 0.8rem', 
                                                borderRadius: '30px',
                                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                            }}>
                                                {art.category}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info Block */}
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                                            <i className="fas fa-calendar-alt"></i> {new Date(art.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                        
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.8rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>
                                            {art.title}
                                        </h3>
                                        
                                        <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                                            {getExcerpt(art.content)}
                                        </p>

                                        <Link 
                                            href={`/blog/${art.slug}`} 
                                            className="btn-submit" 
                                            style={{ 
                                                textDecoration: 'none', 
                                                padding: '0.6rem', 
                                                fontSize: '0.85rem',
                                                borderRadius: '10px',
                                                background: 'linear-gradient(135deg, #00d2ff 0%, #007bff 100%)',
                                                boxShadow: 'none',
                                                textAlign: 'center'
                                            }}
                                        >
                                            Baca Selengkapnya <i className="fas fa-arrow-right" style={{ fontSize: '0.75rem', marginLeft: '0.2rem' }}></i>
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748b' }}>
                            <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block', color: '#334155' }}></i>
                            <h3>Tidak ada artikel yang cocok dengan pencarian Anda.</h3>
                            <p style={{ marginTop: '0.5rem' }}>Coba cari kata kunci lain atau pilih kategori yang berbeda.</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
