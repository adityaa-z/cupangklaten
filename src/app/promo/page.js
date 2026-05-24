import React from 'react';
import { getActiveGeneralPromos } from '@/app/actions/promo';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Promo Spesial | Cupang Klaten',
    description: 'Daftar promo ikan cupang kontes terbaru di Cupang Klaten.'
};

export default async function PromoPage() {
    const promos = await getActiveGeneralPromos();

    return (
        <main className="min-h-screen bg-[var(--bg-light)]">
            <Navbar />
            
            <div style={{ paddingTop: '100px', paddingBottom: '4rem', minHeight: '80vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '1rem' }}>
                            Promo <span style={{ color: '#D4AF37' }}>Spesial</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                            Temukan berbagai penawaran eksklusif dan diskon menarik untuk ikan cupang pilihan Anda.
                        </p>
                    </div>

                    {promos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-white)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                            <i className="fas fa-box-open" style={{ fontSize: '4rem', color: 'var(--text-muted)', opacity: 0.5, marginBottom: '1.5rem' }}></i>
                            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Belum Ada Promo</h3>
                            <p style={{ color: 'var(--text-muted)' }}>Saat ini sedang tidak ada promo yang berlangsung. Pantau terus halaman ini!</p>
                            <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', padding: '0.8rem 2rem', background: 'var(--primary-cyan)', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: '600' }}>
                                Kembali ke Beranda
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                            {promos.map(promo => (
                                <div key={promo.id} style={{ 
                                    background: 'linear-gradient(145deg, #111827 0%, #1f2937 100%)', 
                                    borderRadius: '24px', 
                                    overflow: 'hidden',
                                    border: '1px solid #374151',
                                    boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    position: 'relative'
                                }}>
                                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)', borderRadius: '50%' }}></div>
                                    
                                    <div style={{ padding: '2rem', flex: 1 }}>
                                        <span style={{ 
                                            display: 'inline-block', 
                                            padding: '0.3rem 0.8rem', 
                                            background: 'rgba(212,175,55,0.1)', 
                                            color: '#D4AF37', 
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            marginBottom: '1rem',
                                            border: '1px solid rgba(212,175,55,0.2)'
                                        }}>
                                            {promo.target_category}
                                        </span>
                                        
                                        <h3 style={{ fontSize: '1.4rem', color: 'white', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.3' }}>
                                            {promo.title}
                                        </h3>
                                        
                                        <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                                            {promo.description}
                                        </p>
                                        
                                        <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px dashed #4b5563', marginBottom: '1rem' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.3rem' }}>Diskon / Harga Spesial:</div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>
                                                {promo.price_or_discount}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #374151' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                            Berlaku hingga:<br/>
                                            <strong style={{ color: '#D4AF37' }}>
                                                {new Date(promo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </strong>
                                        </div>
                                        <a href="https://wa.me/6285700846152" target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', boxShadow: '0 4px 10px rgba(37,211,102,0.3)' }}>
                                            <i className="fab fa-whatsapp"></i>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </main>
    );
}
