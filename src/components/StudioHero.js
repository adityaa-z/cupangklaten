'use client';

import React from 'react';
import '@/app/homepage.css';

export default function StudioHero() {
  return (
    <section aria-label="Profil Galeri cans.betta cupangklaten" className="ed-hero">
      {/* Subtle Architectural Betta Fin & Water Ripple Motion */}
      <div className="ed-hero-ambient" aria-hidden="true">
        {/* Top-left delicate concentric water ripple */}
        <svg className="ed-aquatic-ripple-svg" viewBox="0 0 420 420" fill="none">
          <circle cx="140" cy="140" r="78" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="140" cy="140" r="126" stroke="currentColor" strokeWidth="0.7" strokeDasharray="4 8" />
          <circle cx="140" cy="140" r="180" stroke="currentColor" strokeWidth="0.6" />
        </svg>

        {/* Bottom-right flowing Halfmoon Betta fin line silhouette */}
        <svg className="ed-aquatic-svg" viewBox="0 0 640 420" fill="none">
          <path
            d="M110 230 C185 182, 278 168, 362 192 C416 105, 518 68, 596 104 C558 158, 558 214, 608 260 C532 322, 434 338, 368 272 C292 294, 198 282, 110 230 Z"
            stroke="currentColor"
            strokeWidth="1.15"
          />
          <path
            d="M204 226 C296 205, 424 176, 568 122"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M214 234 C312 226, 436 226, 586 244"
            stroke="currentColor"
            strokeWidth="0.8"
          />
          <path
            d="M224 244 C316 254, 426 274, 534 294"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="3 6"
          />
          <path
            d="M32 332 Q180 296, 330 332 T628 332"
            stroke="currentColor"
            strokeWidth="0.75"
          />
          <path
            d="M68 360 Q216 328, 364 360 T640 360"
            stroke="currentColor"
            strokeWidth="0.6"
            strokeDasharray="5 8"
          />
        </svg>
      </div>

      <div className="ed-hero-inner">
        <div className="ed-hero-grid">
          {/* Gallery Photo Frame */}
          <div className="ed-hero-frame-wrap">
            <div className="ed-hero-frame">
              <img
                src="/galeri-cupang-klaten.jpg"
                alt="Rak soliter dan deretan piala kontes cans.betta cupangklaten"
                className="ed-hero-photo"
              />
              <div className="ed-hero-photo-scrim" />
              <div className="ed-hero-caption">
                <span className="ed-hero-caption-left">
                  <i className="fas fa-trophy" style={{ fontSize: '10px' }} />
                  <span>Galeri Soliter &amp; Prestasi · Klaten</span>
                </span>
                <span>01 / GALERI</span>
              </div>
            </div>
          </div>

          {/* Editorial Brand Copy */}
          <div className="ed-hero-copy">
            <div className="ed-eyebrow">
              <span className="ed-eyebrow-pulse" aria-hidden="true" />
              <span>EST. DESEMBER 2022</span>
              <span className="ed-eyebrow-sep" aria-hidden="true" />
              <span>KLATEN, JAWA TENGAH</span>
            </div>

            <h1 className="ed-hero-title">
              cans.betta x Cupang Klaten — Koleksi Ikan <em>Kelas Kompetisi</em>
            </h1>

            <p className="ed-hero-desc">
              Berdiri sejak <strong>Desember 2022</strong>, <strong>cans.betta x cupangklaten</strong> menghadirkan ikan cupang hias pilihan
              <strong> Kelas Kompetisi</strong> dengan form proporsional, warna seimbang, sirip rapi, dan mental yang bagus. Setiap ikan dirawat
              secara khusus di soliter kaca berukuran besar dengan setting air berkualitas.
            </p>

            {/* Hairline Editorial Ledger */}
            <div className="ed-ledger">
              <div className="ed-ledger-cell">
                <span className="ed-ledger-label">Berdiri Sejak</span>
                <strong className="ed-ledger-val">Des 2022</strong>
              </div>
              <div className="ed-ledger-cell">
                <span className="ed-ledger-label">Kualitas</span>
                <strong className="ed-ledger-val">Kelas Kompetisi</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
