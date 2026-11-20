'use client';

import React from 'react';
import Link from 'next/link';
import '@/app/game/soliter.css';

export default function StudioHero() {
  return (
    <section aria-label="Profil Galeri Cupang Klaten" className="ck-hero-section">
      <div className="ck-hero-inner">
        <div className="ck-hero-grid">
          {/* Photo Frame (Appears first on mobile, right side on desktop) */}
          <div className="ck-hero-media">
            <div className="ck-hero-photo-frame">
              <img
                src="/galeri-cupang-klaten.jpg"
                alt="Rak soliter dan deretan piala kontes Cupang Klaten"
                className="ck-hero-img"
              />
              <div className="ck-hero-img-vignette" />
              <div className="ck-hero-img-caption">
                <i className="fas fa-trophy" style={{ color: '#d9a441', fontSize: '11px' }} />
                <span>Galeri Soliter & Prestasi Kontes · Klaten</span>
              </div>
            </div>
          </div>

          {/* Brand Editorial Copy */}
          <div className="ck-hero-copy">
            <div className="ck-hero-eyebrow">
              <span>EST. DESEMBER 2022</span>
              <span className="ck-hero-dot" />
              <span>KLATEN, JAWA TENGAH</span>
            </div>

            <h1 className="ck-hero-title">
              Cupang Klaten — Koleksi Ikan <span>Spek Kontes</span> & Form Rapi
            </h1>

            <p className="ck-hero-desc">
              Berdiri sejak <strong>Desember 2022</strong>, Cupang Klaten menghadirkan ikan cupang hias pilihan
              dengan form simetris, warna tegas, sirip rapi, dan mental kuat. Setiap ikan dirawat terpisah di
              soliter kaca dengan air ketapang terjaga — harga mulai dari <strong>Rp 35.000</strong> hingga grade kontes.
            </p>

            {/* Key Breeder Highlights */}
            <div className="ck-hero-metrics">
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Berdiri Sejak</span>
                <strong className="ck-hero-metric-val">Des 2022</strong>
              </div>
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Kisaran Harga</span>
                <strong className="ck-hero-metric-val" style={{ color: '#d9a441' }}>Mulai Rp 35rb</strong>
              </div>
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Kualitas</span>
                <strong className="ck-hero-metric-val">Spek Kontes</strong>
              </div>
            </div>

            {/* Clean Action Links (Non-Transaksi) */}
            <div className="ck-hero-actions">
              <Link href="/stok" className="ck-hero-btn-gold">
                <i className="fas fa-fish" />
                <span>Cek Stok & Harga</span>
              </Link>
              <a
                href="https://wa.me/628992020444?text=Halo%20Cupang%20Klaten,%20saya%20ingin%20tanya%20stok%20dan%20kisaran%20harga%20ikan"
                target="_blank"
                rel="noopener noreferrer"
                className="ck-hero-btn-ghost"
              >
                <i className="fab fa-whatsapp" style={{ color: '#34c77b' }} />
                <span>Tanya via WA</span>
              </a>
              <a href="#soliter-virtual" className="ck-hero-btn-ghost">
                <i className="fas fa-gamepad" style={{ color: '#d9a441' }} />
                <span>Soliter Virtual</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
