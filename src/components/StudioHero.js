'use client';

import React from 'react';
import '@/app/game/soliter.css';

export default function StudioHero() {
  return (
    <section aria-label="Profil Galeri cans.betta cupangklaten" className="ck-hero-section">
      <div className="ck-hero-inner">
        <div className="ck-hero-grid">
          {/* Photo Frame */}
          <div className="ck-hero-media">
            <div className="ck-hero-photo-frame">
              <img
                src="/galeri-cupang-klaten.jpg"
                alt="Rak soliter dan deretan piala kontes cans.betta cupangklaten"
                className="ck-hero-img"
              />
              <div className="ck-hero-img-vignette" />
              <div className="ck-hero-img-caption">
                <i className="fas fa-trophy" style={{ color: '#ffffff', fontSize: '11px' }} />
                <span>Galeri Soliter & Prestasi · Klaten</span>
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
              Cupang Klaten — Koleksi Ikan <span>Kelas Kompetisi</span> & Form Rapi
            </h1>

            <p className="ck-hero-desc">
              Berdiri sejak <strong>Desember 2022</strong>, <strong>cans.betta cupangklaten</strong> menghadirkan ikan cupang hias pilihan
              <strong> Kelas Kompetisi</strong> dengan form simetris, warna tegas, sirip rapi, dan mental kuat. Setiap ikan dirawat terpisah di
              soliter kaca dengan air ketapang terjaga — kisaran harga mulai dari <strong>Rp 35.000</strong>.
            </p>

            {/* Key Breeder Highlights */}
            <div className="ck-hero-metrics">
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Berdiri Sejak</span>
                <strong className="ck-hero-metric-val">Des 2022</strong>
              </div>
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Kisaran Harga</span>
                <strong className="ck-hero-metric-val">Mulai Rp 35rb</strong>
              </div>
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Kualitas</span>
                <strong className="ck-hero-metric-val">Kelas Kompetisi</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
