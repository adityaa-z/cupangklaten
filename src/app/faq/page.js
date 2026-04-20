'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import { supabase } from '@/lib/supabase';

export default function FAQPage() {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFaqs() {
            if (!supabase) return;
            try {
                const { data, error } = await supabase
                    .from('faqs')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setFaqs(data || []);
            } catch (err) {
                console.error('Error fetching FAQs:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchFaqs();
    }, []);

    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center', fontWeight: '800' }}>
                    FAQ <span style={{ color: 'var(--primary-cyan)' }}>(Pertanyaan Umum)</span>
                </h1>
                
                <div className="faq-container">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Memuat FAQ...</p>
                    ) : faqs.length > 0 ? (
                        faqs.map(faq => (
                            <div key={faq.id} className="faq-item" style={{ 
                                background: 'var(--bg-white)', 
                                borderRadius: '12px', 
                                marginBottom: '1rem', 
                                padding: '1.5rem', 
                                borderLeft: '4px solid var(--primary-cyan)', 
                                boxShadow: 'var(--card-shadow)' 
                            }}>
                                <div className="faq-q" style={{ fontWeight: '700', color: 'var(--primary-dark)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                    {faq.question}
                                </div>
                                <div className="faq-a" style={{ color: 'var(--text-dark)', lineHeight: '1.6' }}>
                                    {faq.answer}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada pertanyaan umum saat ini.</p>
                    )}
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
