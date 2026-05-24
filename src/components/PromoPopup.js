'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PromoPopup({ isActive, generalPromos = [], limitRemaining = 0 }) {
    const [show, setShow] = useState(false);
    
    const hasGeneralPromo = generalPromos && generalPromos.length > 0;
    // Voucher Promo aktif HANYA jika status aktif DAN sisa kuota masih ada (> 0)
    const hasVoucherPromo = isActive === 'true' && limitRemaining > 0;

    useEffect(() => {
        if (hasGeneralPromo || hasVoucherPromo) {
            // "muncul terus ketika ada dan aktif" - tidak menggunakan sessionStorage agar selalu tampil di halaman utama
            const timer = setTimeout(() => {
                setShow(true);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            // "ketika tidak ada dan di nonaktif maka pop upnya ga muncul" - dan "limit habis pop up otomatis hilang"
            setShow(false);
        }
    }, [hasGeneralPromo, hasVoucherPromo]);

    const handleClose = () => {
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="promo-overlay" style={overlayStyle} onClick={handleClose}>
            <div className="promo-modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <button className="promo-close-btn" style={closeBtnStyle} onClick={handleClose} aria-label="Close promotion">&times;</button>
                <div style={{ padding: '2.5rem 2rem 2rem 2rem', maxHeight: '85vh', overflowY: 'auto' }}>
                    
                    {hasGeneralPromo && generalPromos.map((promo, idx) => (
                        <div key={promo.id} style={{ 
                            marginBottom: (hasVoucherPromo || idx < generalPromos.length - 1) ? '2rem' : '0', 
                            paddingBottom: (hasVoucherPromo || idx < generalPromos.length - 1) ? '2rem' : '0', 
                            borderBottom: (hasVoucherPromo || idx < generalPromos.length - 1) ? '1px solid rgba(255,255,255,0.1)' : 'none' 
                        }}>
                            <span style={{...tagStyle, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.3)'}}>
                                Promo Spesial
                            </span>
                            <h3 style={titleStyle}>{promo.title}</h3>
                            <p style={descStyle}>{promo.description}</p>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <span style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    <i className="fas fa-tag"></i> {promo.price_or_discount}
                                </span>
                                <span style={{ background: '#1e293b', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    <i className="fas fa-calendar-alt"></i> S/d {new Date(promo.end_date).toLocaleDateString('id-ID')}
                                </span>
                            </div>
                        </div>
                    ))}

                    {hasVoucherPromo && (
                        <div>
                            <span style={tagStyle}>Special Offer</span>
                            <h3 style={titleStyle}>VOUCHER GRATIS CUPANG 5.000an!</h3>
                            <p style={descStyle}>
                                Khusus untuk Anda yang memberikan rating <strong>Bintang 5</strong> di Google Maps kami.
                            </p>
                            <div style={{ fontSize: '0.9rem', color: '#f59e0b', marginBottom: '1.5rem', fontWeight: 'bold' }}>
                                <i className="fas fa-fire"></i> Sisa Kuota Hari Ini: {limitRemaining} Voucher
                            </div>
                            <Link 
                                href="/claim-voucher" 
                                style={ctaStyle}
                                onClick={handleClose}
                            >
                                <i className="fas fa-ticket-alt"></i> Klaim Voucher Sekarang
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(5px)',
    zIndex: 99999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
};

const modalStyle = {
    background: '#0d1521',
    border: '2px solid #D4AF37',
    borderRadius: '24px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
    position: 'relative',
    textAlign: 'center',
    overflow: 'hidden'
};

const closeBtnStyle = {
    position: 'absolute',
    top: '1rem',
    right: '1.5rem',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    fontSize: '2rem',
    cursor: 'pointer',
    zIndex: 10
};

const tagStyle = {
    display: 'inline-block',
    background: 'rgba(212, 175, 55, 0.1)',
    color: '#D4AF37',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '0.35rem 1rem',
    borderRadius: '50px',
    fontSize: '0.8rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '1.2rem',
};

const titleStyle = {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '1rem',
    lineHeight: '1.2'
};

const descStyle = {
    color: '#cbd5e1',
    fontSize: '1.05rem',
    marginBottom: '1rem',
    lineHeight: '1.5',
};

const ctaStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #D4AF37 0%, #AA8A2E 100%)',
    border: 'none',
    color: '#000',
    padding: '1rem',
    borderRadius: '12px',
    fontWeight: '700',
    fontSize: '1.1rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)',
};
