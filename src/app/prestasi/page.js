'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import '@/app/game/soliter.css';

export default function PrestasiPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/achievements/');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (active) setItems(data || []);
      } catch (err) {
        console.error('Error fetching achievements:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchAchievements();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (selected) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const filtered = items.filter((item) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.rank_label || '').toLowerCase().includes(q) ||
      (item.event_name || '').toLowerCase().includes(q) ||
      (item.event_date || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ck-bg)', color: 'var(--ck-text)' }}>
      <Navbar />

      {/* Header */}
      <section style={{ background: 'var(--ck-hero-bg)', borderBottom: '1px solid var(--ck-border)', padding: '36px 16px', textAlign: 'center' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ck-text-muted)', marginBottom: '6px' }}>
            GALERI PRESTASI · CANS.BETTA X CUPANGKLATEN
          </div>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.3rem)', fontWeight: 800, margin: '0 0 8px', color: 'var(--ck-text)' }}>
            Prestasi Kontes & Piala
          </h1>
          <p style={{ margin: '0 auto 20px', fontSize: '13.5px', color: 'var(--ck-text-2)', lineHeight: 1.6 }}>
            Dokumentasi ikan cupang Kelas Kompetisi yang meraih juara di ajang kontes, lengkap dengan foto pialanya.
          </p>

          <div className="search-bar" style={{ maxWidth: '460px', margin: '0 auto', display: 'block' }}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Cari jenis ikan, juara, atau nama kontes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* Grid Galeri Prestasi */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 16px 56px' }}>
        {loading ? (
          <div className="ck-ach-page-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: '240px', borderRadius: '12px', background: 'var(--ck-surface-2)', border: '1px solid var(--ck-border)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--ck-surface)',
            border: '1px solid var(--ck-border)',
            borderRadius: '14px',
            color: 'var(--ck-text-2)',
          }}>
            <i className="fas fa-trophy" style={{ fontSize: '36px', color: 'var(--ck-text-muted)', marginBottom: '12px', display: 'block' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ck-text)', marginBottom: searchTerm ? '4px' : 0 }}>
              {searchTerm ? 'Prestasi tidak ditemukan' : 'Data belum di upload admin'}
            </div>
            {searchTerm && (
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--ck-text-muted)' }}>
                Coba kata kunci lain.
              </p>
            )}
          </div>
        ) : (
          <div className="ck-ach-page-grid">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ck-ach-page-card"
                onClick={() => setSelected(item)}
              >
                <div className="ck-ach-split-media" style={{ height: '190px' }}>
                  <div className="ck-ach-half">
                    <img src={item.fish_img || '/logo-cansbetta.jpg'} alt={`Ikan Juara ${item.title}`} loading="lazy" />
                    <span className="ck-ach-tag-mini">Foto Ikan</span>
                  </div>
                  <div className="ck-ach-half">
                    <img src={item.trophy_img || '/galeri-cupang-klaten.jpg'} alt={`Piala ${item.title}`} loading="lazy" />
                    <span className="ck-ach-tag-mini">Foto Piala</span>
                  </div>
                  <span className="ck-ach-rank-badge">
                    <i className="fas fa-trophy" style={{ fontSize: '9.5px' }} />
                    <span>{item.rank_label}</span>
                  </span>
                </div>

                <div style={{ padding: '12px 14px 14px', textAlign: 'left' }}>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--ck-text)', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ck-text-muted)', marginBottom: item.description ? '6px' : 0 }}>
                    {[item.event_name, item.event_date].filter(Boolean).join(' · ') || 'Prestasi Kontes Cupang'}
                  </div>
                  {item.description && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--ck-text-2)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Detail Lightbox Modal */}
      {selected && (
        <div className="ck-modal-overlay" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '540px',
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
                  <img src={selected.fish_img || '/logo-cansbetta.jpg'} alt={`Ikan Juara ${selected.title}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(9,10,13,0.82)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                    Foto Ikan Juara
                  </span>
                </div>
                <div style={{ position: 'relative', aspectRatio: '4 / 5', background: '#000000', overflow: 'hidden' }}>
                  <img src={selected.trophy_img || '/galeri-cupang-klaten.jpg'} alt={`Piala ${selected.title}`} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(9,10,13,0.82)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
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

            <div style={{ padding: '16px 18px 18px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'var(--ck-surface-2)', border: '1px solid var(--ck-border-strong)',
                borderRadius: '6px', padding: '3px 9px', fontSize: '11px', fontWeight: 700, marginBottom: '8px',
              }}>
                <i className="fas fa-trophy" style={{ fontSize: '10.5px' }} />
                <span>{selected.rank_label}</span>
              </div>
              <h2 style={{ margin: '0 0 6px', fontSize: '19px', fontWeight: 800 }}>{selected.title}</h2>
              {(selected.event_name || selected.event_date) && (
                <div style={{ fontSize: '12.5px', color: 'var(--ck-text-2)', marginBottom: '10px' }}>
                  <i className="fas fa-calendar-alt" style={{ marginRight: '6px', color: 'var(--ck-text-muted)' }} />
                  {[selected.event_name, selected.event_date].filter(Boolean).join(' · ')}
                </div>
              )}
              {selected.description && (
                <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.6, color: 'var(--ck-text-2)' }}>
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
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '11px', borderRadius: '9px', background: '#16a34a',
                  color: '#ffffff', fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '15px' }} />
                Tanya Line / Anakan via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
