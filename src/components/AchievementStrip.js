'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/game/soliter.css';

export default function AchievementStrip() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
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
    if (selected) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  function scrollByAmount(dir) {
    if (!scrollRef.current) return;
    const step = Math.max(260, scrollRef.current.clientWidth * 0.65);
    scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  if (loading || items.length === 0) {
    return null;
  }

  return (
    <section aria-label="Prestasi Kontes cans.betta x cupangklaten" className="ck-strip-section">
      <div className="ck-strip-inner">
        <div className="ck-strip-header">
          <div className="ck-strip-title">
            <i className="fas fa-trophy" style={{ fontSize: '11px', color: 'var(--ck-accent)' }} />
            <span>Prestasi Kontes & Piala</span>
          </div>
          <Link href="/prestasi" className="ck-strip-link">
            <span>Lihat Semua</span>
            <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
          </Link>
        </div>

        <div className="ck-strip-track-wrap">
          {items.length > 2 && (
            <button type="button" className="ck-strip-arrow left" onClick={() => scrollByAmount(-1)} aria-label="Geser kiri">
              <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
            </button>
          )}

          <div ref={scrollRef} className="ck-strip-scroll">
            {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ck-ach-card"
                  onClick={() => setSelected(item)}
                >
                  {/* Side-by-side: Foto Ikan (Kiri) + Foto Piala (Kanan) */}
                  <div className="ck-ach-split-media">
                    <div className="ck-ach-half">
                      <img
                        src={item.fish_img || '/logo-cansbetta.jpg'}
                        alt={`Ikan Juara ${item.title}`}
                        loading="lazy"
                      />
                      <span className="ck-ach-tag-mini">Ikan</span>
                    </div>
                    <div className="ck-ach-half">
                      <img
                        src={item.trophy_img || '/galeri-cupang-klaten.jpg'}
                        alt={`Piala ${item.title}`}
                        loading="lazy"
                      />
                      <span className="ck-ach-tag-mini">Piala</span>
                    </div>
                    <span className="ck-ach-rank-badge">
                      <i className="fas fa-trophy" style={{ fontSize: '9px' }} />
                      <span>{item.rank_label}</span>
                    </span>
                  </div>

                  <div style={{ padding: '9px 10px 10px' }}>
                    <div style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: 'var(--ck-text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '2px',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: 'var(--ck-text-muted)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {[item.event_name, item.event_date].filter(Boolean).join(' · ') || 'Prestasi Kontes Cupang'}
                    </div>
                  </div>
                </button>
              ))}
          </div>

          {items.length > 2 && (
            <button type="button" className="ck-strip-arrow right" onClick={() => scrollByAmount(1)} aria-label="Geser kanan">
              <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Achievement Detail Modal (Side-by-Side Ikan + Piala) */}
      {selected && (
        <div className="ck-modal-overlay" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '520px',
              background: 'var(--ck-modal-bg)',
              border: '1px solid var(--ck-border-strong)',
              borderRadius: '14px',
              overflow: 'hidden',
              color: 'var(--ck-text)',
              boxShadow: '0 28px 70px rgba(0,0,0,0.5)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: '#000000' }}>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: '#000000', overflow: 'hidden' }}>
                  <img
                    src={selected.fish_img || '/logo-cansbetta.jpg'}
                    alt={`Ikan Juara ${selected.title}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <span style={{
                    position: 'absolute', bottom: '8px', left: '8px',
                    background: 'rgba(9,10,13,0.82)', color: '#ffffff',
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                  }}>
                    Foto Ikan Juara
                  </span>
                </div>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: '#000000', overflow: 'hidden' }}>
                  <img
                    src={selected.trophy_img || '/galeri-cupang-klaten.jpg'}
                    alt={`Piala ${selected.title}`}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                  />
                  <span style={{
                    position: 'absolute', bottom: '8px', left: '8px',
                    background: 'rgba(9,10,13,0.82)', color: '#ffffff',
                    fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
                  }}>
                    Foto Piala
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(9,10,13,0.82)', color: '#ffffff', fontSize: '14px', cursor: 'pointer',
                }}
              >
                <i className="fas fa-times" />
              </button>
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--ck-surface-2)',
                border: '1px solid var(--ck-border-strong)',
                borderRadius: '6px',
                padding: '3px 9px',
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--ck-text)',
                marginBottom: '8px',
              }}>
                <i className="fas fa-trophy" style={{ fontSize: '10.5px' }} />
                <span>{selected.rank_label}</span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: 'var(--ck-text)' }}>
                {selected.title}
              </h3>

              {(selected.event_name || selected.event_date) && (
                <div style={{ fontSize: '12.5px', color: 'var(--ck-text-2)', marginBottom: '10px' }}>
                  <i className="fas fa-calendar-alt" style={{ marginRight: '6px', color: 'var(--ck-text-muted)' }} />
                  {[selected.event_name, selected.event_date].filter(Boolean).join(' · ')}
                </div>
              )}

              {selected.description && (
                <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.55, color: 'var(--ck-text-2)' }}>
                  {selected.description}
                </p>
              )}

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta x cupangklaten, saya tertarik dengan jalur/line ikan juara: ${selected.title} (${selected.rank_label}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '11px',
                  borderRadius: '9px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
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
