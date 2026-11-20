'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/game/soliter.css';

function formatShortRupiah(num) {
  const n = Number(num) || 0;
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1).replace(/\.0$/, '')}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${n}`;
}

function formatFullRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Number(num) || 0);
}

export default function ProductStrip() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [imgIdx, setImgIdx] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/products/');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!active) return;

        const sorted = [...(data || [])].sort((a, b) => {
          const aReady = a.is_available && a.stock > 0 ? 1 : 0;
          const bReady = b.is_available && b.stock > 0 ? 1 : 0;
          if (bReady !== aReady) return bReady - aReady;
          return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
        });
        setProducts(sorted.slice(0, 24));
      } catch (err) {
        console.error('ProductStrip fetch error:', err);
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
    const step = Math.max(240, scrollRef.current.clientWidth * 0.65);
    scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  function getTitle(p) {
    const isKebutuhan = p.category?.toLowerCase() === 'kebutuhan ikan';
    const fishBreeds = ['plakat', 'halfmoon', 'hmpk', 'crowntail', 'giant', 'double tail', 'dumbo ear', 'veiltail', 'rosetail'];
    const isFishBreed = fishBreeds.includes(p.category?.toLowerCase());
    if (isKebutuhan || isFishBreed) return p.variant || p.category || 'Koleksi Cupang';
    return p.variant ? `${p.category} - ${p.variant}` : p.category || 'Koleksi Cupang';
  }

  const modalImages = selected
    ? [selected.img, selected.img2, selected.img3, selected.img4].filter((x) => x && x.trim() !== '')
    : [];

  return (
    <section aria-label="Etalase Koleksi Cupang Klaten" className="ck-strip-section">
      <div className="ck-strip-inner">
        <div className="ck-strip-header">
          <div className="ck-strip-title">
            <i className="fas fa-layer-group" style={{ fontSize: '11px', color: 'var(--ck-accent)' }} />
            <span>Etalase Stok & Kisaran Harga</span>
          </div>
          <Link href="/stok" className="ck-strip-link">
            <span>Lihat Semua</span>
            <i className="fas fa-arrow-right" style={{ fontSize: '10px' }} />
          </Link>
        </div>

        <div className="ck-strip-track-wrap">
          <button type="button" className="ck-strip-arrow left" onClick={() => scrollByAmount(-1)} aria-label="Geser kiri">
            <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
          </button>

          <div ref={scrollRef} className="ck-strip-scroll">
            {loading ? (
              [...Array(7)].map((_, i) => <div key={i} className="ck-strip-skeleton" />)
            ) : products.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--ck-text-muted)', padding: '12px 4px' }}>
                Koleksi stok sedang diperbarui.{' '}
                <a href="https://wa.me/628992020444" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ck-accent)', fontWeight: 700 }}>
                  Hubungi via WhatsApp
                </a>
              </div>
            ) : (
              products.map((item) => {
                const isHabis = !item.is_available || item.stock <= 0;
                const title = getTitle(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="ck-strip-card"
                    onClick={() => { setSelected(item); setImgIdx(0); }}
                  >
                    <div className="ck-strip-thumb">
                      {item.is_video ? (
                        <video src={item.img} muted loop autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <img
                          src={item.img || '/logo-cansbetta.jpg'}
                          alt={title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isHabis ? 0.72 : 1 }}
                        />
                      )}
                      <span style={{
                        position: 'absolute',
                        top: '6px',
                        left: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(9, 10, 13, 0.82)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        color: isHabis ? '#d1d5db' : '#34c77b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: isHabis ? '#9ca3af' : '#34c77b',
                        }} />
                        {isHabis ? 'Habis' : `Stok ${item.stock}`}
                      </span>
                    </div>
                    <div style={{ padding: '7px 9px 8px' }}>
                      <div style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: 'var(--ck-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '2px',
                      }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ck-text-2)' }}>
                        {formatShortRupiah(item.price)}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <button type="button" className="ck-strip-arrow right" onClick={() => scrollByAmount(1)} aria-label="Geser kanan">
            <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
          </button>
        </div>
      </div>

      {/* Info Detail Modal */}
      {selected && (
        <div className="ck-modal-overlay" onClick={() => setSelected(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--ck-modal-bg)',
              border: '1px solid var(--ck-border-strong)',
              borderRadius: '14px',
              overflow: 'hidden',
              color: 'var(--ck-text)',
              boxShadow: '0 28px 70px rgba(0,0,0,0.45)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '240px', background: '#050608' }}>
              {selected.is_video && imgIdx === 0 ? (
                <video src={modalImages[0]} controls autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img
                  src={modalImages[imgIdx] || '/logo-cansbetta.jpg'}
                  alt={getTitle(selected)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.18)',
                  background: 'rgba(9,10,13,0.82)', color: '#ffffff', fontSize: '14px', cursor: 'pointer',
                }}
              >
                <i className="fas fa-times" />
              </button>
              {modalImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImgIdx((i) => (i === 0 ? modalImages.length - 1 : i - 1))}
                    style={{
                      position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                      width: '30px', height: '30px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(9,10,13,0.75)', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgIdx((i) => (i + 1) % modalImages.length)}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      width: '30px', height: '30px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.18)',
                      background: 'rgba(9,10,13,0.75)', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
                  </button>
                  <div style={{
                    position: 'absolute', bottom: '8px', right: '10px',
                    background: 'rgba(9,10,13,0.82)', color: '#ffffff',
                    fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px',
                  }}>
                    {imgIdx + 1} / {modalImages.length}
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ck-text-muted)', marginBottom: '3px' }}>
                {selected.category}
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: 'var(--ck-text)' }}>
                {getTitle(selected)}
              </h3>
              <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Kisaran Harga</div>
              <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--ck-text)', marginBottom: '12px' }}>
                {formatFullRupiah(selected.price)}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                background: 'var(--ck-surface-2)',
                borderRadius: '10px',
                padding: '10px 12px',
                border: '1px solid var(--ck-border)',
                fontSize: '11.5px',
                marginBottom: '14px',
              }}>
                <div><span style={{ color: 'var(--ck-text-muted)' }}>Kode:</span> <strong>{selected.code || '-'}</strong></div>
                <div><span style={{ color: 'var(--ck-text-muted)' }}>Kelamin:</span> <strong>{selected.gender || '-'}</strong></div>
                <div><span style={{ color: 'var(--ck-text-muted)' }}>Ukuran:</span> <strong>{selected.size || '-'}</strong></div>
                <div>
                  <span style={{ color: 'var(--ck-text-muted)' }}>Status:</span>{' '}
                  <strong style={{ color: (!selected.is_available || selected.stock <= 0) ? 'var(--ck-text-muted)' : 'var(--ck-ok)' }}>
                    {(!selected.is_available || selected.stock <= 0) ? 'Stok Habis' : `Ready (${selected.stock})`}
                  </strong>
                </div>
              </div>

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta cupangklaten, saya ingin menanyakan info mengenai ${getTitle(selected)} (Kode: ${selected.code || '-'}).`
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
                Tanya Info Resmi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
