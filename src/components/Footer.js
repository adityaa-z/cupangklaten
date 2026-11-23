import React from 'react';
import Link from 'next/link';
import '@/app/game/soliter.css';

const Footer = () => {
    return (
        <footer className="ck-footer-section">
            <div className="ck-footer-inner">
                <div className="ck-footer-grid">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                            <img
                                src="/logo-cansbetta.jpg"
                                alt="cans.betta x cupangklaten"
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--ck-border-strong)' }}
                            />
                            <span
                                className="ck-brand-gradient"
                                style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.3px' }}
                            >
                                cans.betta x cupangklaten
                            </span>
                        </Link>
                    </div>

                    {/* WhatsApp & Lokasi Google Maps */}
                    <div>
                        <h4 className="ck-footer-heading">Kontak & Lokasi</h4>
                        <div className="ck-footer-list">
                            <a
                                href="https://wa.me/628992020444"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fab fa-whatsapp" style={{ color: '#22c55e' }} />
                                <span>08992020444</span>
                            </a>
                            <a
                                href="https://maps.app.goo.gl/TscpLknP1zpLHmod7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fas fa-map-marker-alt" style={{ color: '#ef4444' }} />
                                <span>Cupang Klaten - Ikan Cupang Depo</span>
                            </a>
                        </div>
                    </div>

                    {/* Instagram & TikTok */}
                    <div>
                        <h4 className="ck-footer-heading">Sosial Media</h4>
                        <div className="ck-footer-list">
                            <a
                                href="https://www.instagram.com/cans.betta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fab fa-instagram" />
                                <span>@cans.betta</span>
                            </a>
                            <a
                                href="https://www.instagram.com/cupangklaten"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fab fa-instagram" />
                                <span>@cupangklaten</span>
                            </a>
                            <a
                                href="https://www.tiktok.com/@cans.betta"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fab fa-tiktok" />
                                <span>@cans.betta</span>
                            </a>
                            <a
                                href="https://www.tiktok.com/@cupangklaten"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ck-footer-link"
                            >
                                <i className="fab fa-tiktok" />
                                <span>@cupangklaten</span>
                            </a>
                        </div>
                    </div>

                    {/* Menu Cepat */}
                    <div>
                        <h4 className="ck-footer-heading">Navigasi</h4>
                        <div className="ck-footer-list">
                            <Link href="/prestasi" className="ck-footer-link">
                                <i className="fas fa-trophy" />
                                <span>Prestasi Kontes</span>
                            </Link>
                            <Link href="/stok" className="ck-footer-link">
                                <i className="fas fa-fish" />
                                <span>Informasi Stok & Harga</span>
                            </Link>
                            <Link href="/game" className="ck-footer-link">
                                <i className="fas fa-gamepad" />
                                <span>Soliter Virtual</span>
                            </Link>
                            <Link href="/tips-perawatan" className="ck-footer-link">
                                <i className="fas fa-book-open" />
                                <span>Tips & Edukasi</span>
                            </Link>
                            <Link href="/faq" className="ck-footer-link">
                                <i className="fas fa-question-circle" />
                                <span>FAQ</span>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="ck-footer-bottom">
                    <span>&copy; {new Date().getFullYear()} cans.betta x cupangklaten — All Rights Reserved.</span>
                    <span>Est. Desember 2022 · Klaten, Jawa Tengah</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
