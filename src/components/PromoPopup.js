'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PromoPopup({ isActive }) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isActive === 'true') {
            const hasSeen = sessionStorage.getItem('promo_popup_seen');
            if (!hasSeen) {
                const timer = setTimeout(() => {
                    setShow(true);
                }, 1500); // Tampil setelah 1.5 detik
                return () => clearTimeout(timer);
            }
        }
    }, [isActive]);

    const handleClose = () => {
        setShow(false);
        sessionStorage.setItem('promo_popup_seen', 'true');
    };

    if (!show) return null;

    return (
        <div className="promo-overlay" style={overlayStyle} onClick={handleClose}>
            <div className="promo-modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <button className="promo-close-btn" style={closeBtnStyle} onClick={handleClose} aria-label="Close promotion">&times;</button>
                <div style={{ padding: '2rem' }}>
                    <span style={tagStyle}>Special Offer</span>
                    <h3 style={titleStyle}>VOUCHER GRATIS CUPANG 5.000an!</h3>
                    <p style={descStyle}>
                        Khusus untuk Anda yang memberikan rating <strong>Bintang 5</strong> di Google Maps kami.
                    </p>
                    <Link 
                        href="/claim-voucher" 
                        style={ctaStyle}
                        onClick={handleClose}
                    >
                        <i className="fas fa-ticket-alt"></i> Klaim Voucher Sekarang
                    </Link>
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
    marginBottom: '2rem',
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
