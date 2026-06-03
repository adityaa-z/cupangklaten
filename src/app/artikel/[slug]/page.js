import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import { query } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    try {
        const rows = await query('SELECT * FROM articles WHERE slug = ? LIMIT 1', [slug]);
        const article = rows[0];

        if (!article) {
            return {
                title: 'Artikel Tidak Ditemukan - Cupang Klaten',
                description: 'Artikel tidak ditemukan di website Cupang Klaten.'
            };
        }

        return {
            title: `${article.meta_title || article.title} - Cupang Klaten`,
            description: article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 155),
            openGraph: {
                title: article.title,
                description: article.meta_description || article.content.replace(/<[^>]*>/g, '').substring(0, 155),
                images: article.thumbnail ? [{ url: article.thumbnail }] : []
            }
        };
    } catch (e) {
        return {
            title: 'Blog - Cupang Klaten'
        };
    }
}

export default async function BlogDetailPage({ params }) {
    const { slug } = await params;
    
    let article;
    try {
        const rows = await query('SELECT * FROM articles WHERE slug = ? LIMIT 1', [slug]);
        article = rows[0];
    } catch (err) {
        console.error('Error fetching blog detail:', err);
    }

    if (!article) {
        notFound();
    }

    return (
        <>
            <Navbar />
            <div className="finance-body" style={{ minHeight: '80vh', padding: '3rem 1rem' }}>
                <div className="finance-container" style={{ maxWidth: '800px' }}>
                    
                    {/* Back Button */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Link href="/artikel" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.6rem',
                            textDecoration: 'none',
                            padding: '0.6rem 1.2rem',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            color: 'var(--text-dark)',
                            backgroundColor: 'var(--bg-white)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '30px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease'
                        }}>
                            <i className="fas fa-arrow-left" style={{ color: '#00d2ff' }}></i> Kembali ke Artikel
                        </Link>
                    </div>

                    {/* Article Container */}
                    <article style={{
                        background: 'var(--bg-white)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '2.5rem 2rem',
                        boxShadow: 'var(--card-shadow)',
                        overflow: 'hidden'
                    }}>
                        {/* Header Details */}
                        <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                            {article.category && (
                                <span style={{ 
                                    background: 'linear-gradient(135deg, #00d2ff 0%, #007bff 100%)', 
                                    color: 'white', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 'bold', 
                                    padding: '0.4rem 1rem', 
                                    borderRadius: '30px',
                                    display: 'inline-block',
                                    marginBottom: '1rem',
                                    boxShadow: '0 4px 10px rgba(0,210,255,0.2)'
                                }}>
                                    {article.category}
                                </span>
                            )}
                            
                            <h1 style={{ 
                                fontSize: '2.2rem', 
                                fontWeight: '800', 
                                color: 'var(--text-dark)', 
                                lineHeight: '1.3',
                                marginBottom: '1rem'
                            }}>
                                {article.title}
                            </h1>

                            <div style={{ display: 'flex', gap: '1.5rem', color: '#94a3b8', fontSize: '0.88rem', flexWrap: 'wrap' }}>
                                <span><i className="fas fa-calendar-alt" style={{ color: '#00d2ff', marginRight: '0.4rem' }}></i> {new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                <span><i className="fas fa-user" style={{ color: '#00d2ff', marginRight: '0.4rem' }}></i> Admin Cupang Klaten</span>
                            </div>
                        </header>

                        {/* Article Thumbnail */}
                        {article.thumbnail && (
                            <div style={{ width: '100%', maxHeight: '450px', overflow: 'hidden', borderRadius: '16px', marginBottom: '2.5rem', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                <img src={article.thumbnail} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        )}

                        {/* Article Content Render */}
                        <div 
                            className="blog-rich-content"
                            style={{
                                color: 'var(--text-dark)',
                                fontSize: '1.1rem',
                                lineHeight: '1.8',
                                letterSpacing: '0.2px',
                                whiteSpace: 'pre-wrap'
                            }}
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </article>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
