'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/homepage.css';

export default function AchievementStrip() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/achievements/');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (active) setItems(data || []);
      } catch (err) {
        console.error('AchievementStrip fetch error:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loading || items.length === 0) return;
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loading, items.length]);

  useEffect(() => {
    if (selected) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  function scrollByAmount(dir) {
    if (!scrollRef.current) return;
    const step = Math.max(280, scrollRef.current.clientWidth * 0.65);
    scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Prestasi Kontes cans.betta x cupangklaten"
      className="ed-strip-section"
    >
      <div className={`ed-strip-inner ed-reveal ${visible ? 'is-visible' : ''}`}>
        <div className="ed-strip-head">
          <div className="ed-strip-title-group">
            <span className="ed-strip-kicker">
              <i className="fas fa-trophy" style={{ fontSize: '9.5px' }} />
              <span>ARSIP JUARA · {String(items.length).padStart(2, '0')} PRESTASI</span>
            </span>
            <h2 className="ed-strip-heading">Prestasi Kontes &amp; Piala</h2>
          </div>

          <Link href="/prestasi" className="ed-strip-more">
            <span>Lihat Semua</span>
            <i className="fas fa-arrow-right" />
          </Link>
        </div>

        <div className="ed-track-wrap">
          {items.length > 2 && (
            <button
              type="button"
              className="ed-track-arrow left"
              onClick={() => scrollByAmount(-1)}
              aria-label="Geser kiri"
            >
              <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
            </button>
          )}

          <div ref={scrollRef} className="ed-scroll-track">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ed-ach-card"
                onClick={() => setSelected(item)}
              >
                <div className="ed-ach-split">
                  <div className="ed-ach-pane">
                    <img
                      src={item.fish_img || '/logo-cansbetta.jpg'}
                      alt={`Ikan Juara ${item.title}`}
                      loading="lazy"
                    />
                    <span className="ed-ach-pane-tag">Ikan</span>
                  </div>
                  <div className="ed-ach-pane">
                    <img
                      src={item.trophy_img || '/galeri-cupang-klaten.jpg'}
                      alt={`Piala ${item.title}`}
                      loading="lazy"
                    />
                    <span className="ed-ach-pane-tag">Piala</span>
                  </div>
                  <span className="ed-ach-rank">
                    <i className="fas fa-trophy" style={{ fontSize: '8.5px' }} />
                    <span>{item.rank_label}</span>
                  </span>
                </div>

                <div className="ed-ach-body">
                  <div className="ed-ach-title">{item.title}</div>
                  {(item.event_name || item.event_date) && (
                    <div className="ed-ach-meta">
                      {[item.event_name, item.event_date].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {items.length > 2 && (
            <button
              type="button"
              className="ed-track-arrow right"
              onClick={() => scrollByAmount(1)}
              aria-label="Geser kanan"
            >
              <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Museum Lightbox Detail Modal */}
      {selected && (
        <div className="ed-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="ed-modal-dialog wide" onClick={(e) => e.stopPropagation()}>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--ed-rule)', borderBottom: '1px solid var(--ed-rule)' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--ed-media-bg)', overflow: 'hidden' }}>
                  <img
                    src={selected.fish_img || '/logo-cansbetta.jpg'}
                    alt={`Ikan Juara ${selected.title}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <span className="ed-ach-pane-tag" style={{ bottom: '10px', left: '10px', fontSize: '9.5px' }}>
                    Foto Ikan Juara
                  </span>
                </div>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: 'var(--ed-media-bg)', overflow: 'hidden' }}>
                  <img
                    src={selected.trophy_img || '/galeri-cupang-klaten.jpg'}
                    alt={`Piala ${selected.title}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <span className="ed-ach-pane-tag" style={{ bottom: '10px', left: '10px', fontSize: '9.5px' }}>
                    Foto Piala
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="ed-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="ed-modal-content">
              <div className="ed-modal-kicker">
                <i className="fas fa-trophy" style={{ marginRight: '6px' }} />
                {selected.rank_label}
              </div>

              <h3 className="ed-modal-title">{selected.title}</h3>

              {(selected.event_name || selected.event_date) && (
                <div className="ed-mono" style={{ fontSize: '11.5px', color: 'var(--ed-ink-muted)', marginBottom: '12px' }}>
                  {[selected.event_name, selected.event_date].filter(Boolean).join(' · ')}
                </div>
              )}

              {selected.description && (
                <p style={{ margin: '0 0 16px', fontSize: '13.5px', lineHeight: 1.65, color: 'var(--ed-ink-2)' }}>
                  {selected.description}
                </p>
              )}

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta x cupangklaten, saya tertarik dengan jalur/line ikan juara: ${selected.title} (${selected.rank_label}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-wa-btn"
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '15px' }} />
                Tanya Line / Anakan via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
