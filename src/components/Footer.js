import React from 'react';
import Link from 'next/link';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-brand">
                    <Link href="/" className="logo">
                        <img src="/logo.png" alt="cupangklaten.id"
                            style={{ filter: 'grayscale(100%) brightness(200%)', height: '40px' }} />
                        <span className="logo-text"
                            style={{ filter: 'grayscale(100%) brightness(200%)', color: '#94a3b8', marginTop: '1rem' }}>CUPANGKLATEN.ID</span>
                    </Link>
                    <p style={{ color: '#94a3b8', marginTop: '1rem' }}>Dedikasi kami adalah menghadirkan keindahan ikan cupang
                        Klaten ke seluruh penjuru Asia dengan kualitas premium.</p>
                </div>
                <div className="footer-links">
                    <h4>Bantuan</h4>
                    <ul>
                        <li><a href="https://wa.me/6285700846152?text=Halo%20Admin%20Cupang%20Klaten%2C%20saya%20ingin%20mengonfirmasi%20pembayaran%20atas%20pesanan%20saya%20di%20Shopee.%20Nomor%20pesanan%2Fresi%20saya%20adalah%3A%20"
                                target="_blank" rel="noopener noreferrer">Konfirmasi Pembayaran</a></li>
                        <li><Link href="/cara-order">Cara Order</Link></li>
                        <li><Link href="/faq">FAQ</Link></li>
                    </ul>
                </div>
                <div className="footer-links">
                    <h4>Kontak</h4>
                    <a href="https://maps.app.goo.gl/L3un2gn9ieBxzgJf7" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'block', marginBottom: '0.8rem', transition: 'color 0.3s' }}>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: '0.5rem', width: '15px', textAlign: 'center' }}></i>
                        Klaten, Jawa Tengah, Indonesia
                    </a>
                    <a href="https://wa.me/6285700846152" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'block', marginBottom: '0.8rem', transition: 'color 0.3s' }}>
                        <i className="fab fa-whatsapp" style={{ marginRight: '0.5rem', width: '15px', textAlign: 'center' }}></i>
                        +62 857-0084-6152
                    </a>
                    <a href="https://www.instagram.com/cupangklaten.id?igsh=b284dWl3eGdxdTA5" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'block', marginBottom: '0.8rem', transition: 'color 0.3s' }}>
                        <i className="fab fa-instagram" style={{ marginRight: '0.5rem', width: '15px', textAlign: 'center' }}></i>
                        @cupangklaten.id
                    </a>
                    <a href="https://www.tiktok.com/@cupangklaten.id" target="_blank" rel="noopener noreferrer"
                        style={{ color: '#94a3b8', fontSize: '0.9rem', textDecoration: 'none', display: 'block', marginTop: '0.8rem', transition: 'color 0.3s' }}>
                        <i className="fab fa-tiktok" style={{ marginRight: '0.5rem', width: '15px', textAlign: 'center' }}></i>
                        @cupangklaten.id
                    </a>
                </div>
            </div>
            <div className="copyright">
                &copy; {new Date().getFullYear()} CupangKlaten.id - All Rights Reserved.
            </div>
        </footer>
    );
};

export default Footer;
