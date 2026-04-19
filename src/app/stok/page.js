'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import FAB from '@/components/FAB';
import { supabase } from '@/lib/supabase';

const StokContent = () => {
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentCategory, setCurrentCategory] = useState('all');
    //d
    useEffect(() => {
        async function fetchAllProducts() {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAllProducts();
    }, []);

    useEffect(() => {
        const categoryParam = searchParams.get('category') || 'all';
        setCurrentCategory(categoryParam);
    }, [searchParams]);

    useEffect(() => {
        let filtered = products;

        // Filter by Category
        if (currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category?.toLowerCase() === currentCategory.toLowerCase());
        }

        // Filter by Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.code && p.code.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.variant && p.variant.toLowerCase().includes(term))
            );
        }

        // Sort: Ready first, Sold Out last
        filtered = [...filtered].sort((a, b) => {
            let aSold = (!a.is_available || a.stock <= 0) ? 1 : 0;
            let bSold = (!b.is_available || b.stock <= 0) ? 1 : 0;
            return aSold - bSold;
        });

        setFilteredProducts(filtered);
    }, [products, currentCategory, searchTerm]);

    return (
        <>
            <Navbar />
            
            {/* Page Header */}
            <div style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #ffffff 100%)', padding: '3rem 2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Stok Ikan <span style={{ background: 'linear-gradient(to right, var(--primary-dark), var(--primary-cyan))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Ready</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Pilih ikan favoritmu dari berbagai kategori dan amankan sebelum terjual!</p>
                
                <div className="search-bar" style={{ maxWidth: '500px', margin: '2rem auto 0', display: 'block' }}>
                    <i className="fas fa-search"></i>
                    <input 
                        type="text" 
                        placeholder="Cari jenis ikan..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%' }}
                    />
                </div>
            </div>

            {/* Products Section */}
            <section className="products-section" style={{ marginTop: '2rem' }}>
                <div className="section-header">
                    <div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                            {currentCategory === 'all' ? 'Semua Koleksi' : `Koleksi ${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)}`}
                        </h2>
                    </div>
                    <div className="filter-tabs">
                        {['all', 'plakat', 'halfmoon', 'hmpk', 'crowntail', 'giant', 'kebutuhan ikan'].map(cat => (
                            <button 
                                key={cat}
                                className={`filter-btn ${currentCategory === cat ? 'active' : ''}`}
                                onClick={() => setCurrentCategory(cat)}
                            >
                                {cat === 'all' ? 'Semua' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="product-grid">
                    {loading ? (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>Memuat stok...</p>
                    ) : filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-muted)' }}>Ikan tidak ditemukan.</p>
                    )}
                </div>
            </section>

            <Footer />
            <FAB />
        </>
    );
};

export default function StokPage() {
    return (
        <Suspense fallback={<div>Loading page...</div>}>
            <StokContent />
        </Suspense>
    );
}
