import React from 'react';
import Link from 'next/link';
import '@/app/homepage.css';

const Footer = () => {
  return (
    <footer className="ed-footer">
      {/* Subtle Aquatic Ripple Line */}
      <div className="ed-wave-rule" aria-hidden="true">
        <svg viewBox="0 0 1200 14" preserveAspectRatio="none" fill="none">
          <path
            d="M0 7 Q75 1, 150 7 T300 7 T450 7 T600 7 T750 7 T900 7 T1050 7 T1200 7"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="ed-footer-inner">
        <div className="ed-footer-grid">
          {/* Brand Identity */}
          <div>
            <Link href="/" className="ed-brand-link">
              <img
                src="/logo-cansbetta.jpg"
                alt="cans.betta x cupangklaten"
                className="ed-brand-avatar"
                style={{ width: '40px', height: '40px' }}
              />
              <span className="ed-brand-wordmark">
                <span className="ed-brand-name" style={{ fontSize: '1.35rem' }}>
                  cans.betta <span className="ed-brand-cross">x</span> cupangklaten
                </span>
              </span>
            </Link>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 className="ed-footer-heading">Kontak &amp; Lokasi</h4>
            <div className="ed-footer-list">
              <a
                href="https://wa.me/628992020444"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fab fa-whatsapp" style={{ color: '#22c55e' }} />
                <span>08992020444</span>
              </a>
              <a
                href="https://maps.app.goo.gl/TscpLknP1zpLHmod7"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fas fa-map-marker-alt" style={{ color: '#ef4444' }} />
                <span>Cupang Klaten - Ikan Cupang Depo</span>
              </a>
            </div>
          </div>

          {/* Sosial Media (Handle & Logo Saja) */}
          <div>
            <h4 className="ed-footer-heading">Sosial Media</h4>
            <div className="ed-footer-list">
              <a
                href="https://www.instagram.com/cans.betta"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fab fa-instagram" />
                <span>@cans.betta</span>
              </a>
              <a
                href="https://www.instagram.com/cupangklaten"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fab fa-instagram" />
                <span>@cupangklaten</span>
              </a>
              <a
                href="https://www.tiktok.com/@cans.betta"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fab fa-tiktok" />
                <span>@cans.betta</span>
              </a>
              <a
                href="https://www.tiktok.com/@cupangklaten"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-footer-link"
              >
                <i className="fab fa-tiktok" />
                <span>@cupangklaten</span>
              </a>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="ed-footer-heading">Navigasi</h4>
            <div className="ed-footer-list">
              <Link href="/prestasi" className="ed-footer-link">
                <i className="fas fa-trophy" />
                <span>Prestasi Kontes</span>
              </Link>
              <Link href="/stok" className="ed-footer-link">
                <i className="fas fa-fish" />
                <span>Informasi Stok &amp; Harga</span>
              </Link>
              <Link href="/game" className="ed-footer-link">
                <i className="fas fa-gamepad" />
                <span>Mini-Game Arena</span>
              </Link>
              <Link href="/tips-perawatan" className="ed-footer-link">
                <i className="fas fa-book-open" />
                <span>Tips &amp; Edukasi</span>
              </Link>
              <Link href="/faq" className="ed-footer-link">
                <i className="fas fa-question-circle" />
                <span>FAQ</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="ed-footer-bottom">
          <span>&copy; {new Date().getFullYear()} cans.betta x cupangklaten — All Rights Reserved.</span>
          <span>EST. DESEMBER 2022 · KLATEN, JAWA TENGAH</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
