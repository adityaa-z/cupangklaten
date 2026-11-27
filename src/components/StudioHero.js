'use client';

import React, { useState, useEffect } from 'react';
import '@/app/homepage.css';

const DEFAULT_HERO_SLIDE = [
  {
    id: 'default',
    image_url: '/galeri-cupang-klaten.jpg',
    caption: 'Galeri Soliter & Prestasi · Klaten',
  },
];

export default function StudioHero() {
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDE);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadGallery() {
      try {
        const res = await fetch('/api/hero-gallery/');
        if (!res.ok) return;
        const data = await res.json();
        if (active && Array.isArray(data) && data.length > 0) {
          setSlides(data);
          setCurrentIdx(0);
        }
      } catch (err) {
        console.error('Hero gallery fetch error:', err);
      }
    }
    loadGallery();
    return () => { active = false; };
  }, []);

  // Auto-slide smoothly if admin uploaded more than 1 photo
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const activeSlide = slides[currentIdx] || DEFAULT_HERO_SLIDE[0];
  const hasMultiple = slides.length > 1;

  const goPrev = () => setCurrentIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  const goNext = () => setCurrentIdx((prev) => (prev + 1) % slides.length);

  return (
    <section aria-label="Profil Galeri cans.betta cupangklaten" className="ed-hero">
      {/* Subtle Architectural Betta Fin & Water Ripple Motion */}
      <div className="ed-hero-ambient" aria-hidden="true">
        <svg className="ed-aquatic-ripple-svg" viewBox="0 0 420 420" fill="none">
          <circle cx="140" cy="140" r="78" stroke="currentColor" strokeWidth="0.9" />
          <circle cx="140" cy="140" r="126" stroke="currentColor" strokeWidth="0.7" strokeDasharray="4 8" />
          <circle cx="140" cy="140" r="180" stroke="currentColor" strokeWidth="0.6" />
        </svg>

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
          {/* Gallery Photo Frame (Supports 1 or Multiple Admin Photos) */}
          <div className="ed-hero-frame-wrap">
            <div
              className="ed-hero-frame"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {slides.map((slide, idx) => (
                <img
                  key={slide.id || idx}
                  src={slide.image_url || '/galeri-cupang-klaten.jpg'}
                  alt={slide.caption || 'Galeri Soliter & Prestasi cans.betta cupangklaten'}
                  className={`ed-hero-photo ${hasMultiple ? 'ed-hero-slide' : ''} ${
                    idx === currentIdx ? 'is-active' : ''
                  }`}
                />
              ))}

              <div className="ed-hero-photo-scrim" />

              {hasMultiple && (
                <>
                  <button
                    type="button"
                    className="ed-hero-nav prev"
                    onClick={goPrev}
                    aria-label="Foto sebelumnya"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button
                    type="button"
                    className="ed-hero-nav next"
                    onClick={goNext}
                    aria-label="Foto berikutnya"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                </>
              )}

              <div className="ed-hero-caption">
                <span className="ed-hero-caption-left">
                  <i className="fas fa-trophy" style={{ fontSize: '10px' }} />
                  <span>{activeSlide.caption || 'Galeri Soliter & Prestasi · Klaten'}</span>
                </span>

                {hasMultiple && (
                  <div className="ed-hero-dots" aria-label="Indikator slide foto">
                    {slides.map((slide, idx) => (
                      <button
                        key={slide.id || idx}
                        type="button"
                        className={`ed-hero-dot-btn ${idx === currentIdx ? 'active' : ''}`}
                        onClick={() => setCurrentIdx(idx)}
                        aria-label={`Lihat foto ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}
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
