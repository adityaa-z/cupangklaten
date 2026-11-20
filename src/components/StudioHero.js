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
              cans.betta x Cupang Klaten — Koleksi Ikan <span>Kelas Kompetisi</span>
            </h1>

            <p className="ck-hero-desc">
              Berdiri sejak <strong>Desember 2022</strong>, <strong>cans.betta x cupangklaten</strong> menghadirkan ikan cupang hias pilihan
              <strong> Kelas Kompetisi</strong> dengan form proporsional, warna seimbang, sirip rapi, dan mental yang bagus. Setiap ikan dirawat
              secara khusus di soliter kaca berukuran besar dengan setting air berkualitas — kisaran harga mulai dari <strong>Rp 50.000</strong>.
            </p>

            {/* Key Breeder Highlights */}
            <div className="ck-hero-metrics">
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Berdiri Sejak</span>
                <strong className="ck-hero-metric-val">Des 2022</strong>
              </div>
              <div className="ck-hero-metric">
                <span className="ck-hero-metric-label">Kisaran Harga</span>
                <strong className="ck-hero-metric-val">Mulai Rp 50rb</strong>
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
