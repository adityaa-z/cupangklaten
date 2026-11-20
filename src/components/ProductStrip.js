'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/products/');
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        if (!active) return;

        // Prioritaskan ikan ready & pinned di strip etalase atas
        const sorted = [...(data || [])].sort((a, b) => {
          const aReady = a.is_available && a.stock > 0 ? 1 : 0;
          const bReady = b.is_available && b.stock > 0 ? 1 : 0;
          if (bReady !== aReady) return bReady - aReady;
          return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
        });
        setProducts(sorted.slice(0, 20));
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
    if (selected) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

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
    <section
      aria-label="Etalase Koleksi Cupang Klaten"
      style={{
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        padding: '8px 0 10px',
      }}
    >
      {/* Strip Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 12px 6px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>🏷️</span>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '0.2px' }}>
            Etalase Stok & Kisaran Harga
          </span>
        </div>
        <Link
          href="/stok"
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#38bdf8',
            textDecoration: 'none',
          }}
        >
          Semua Stok →
        </Link>
      </div>

      {/* 1-Row Horizontal Scroll Strip (PRD Modul 1.2) */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: '8px',
          padding: '2px 12px 4px',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
      >
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                flex: '0 0 116px',
                height: '126px',
                borderRadius: '11px',
                background: '#1e293b',
                border: '1px solid #334155',
                scrollSnapAlign: 'start',
                opacity: 0.6,
              }}
            />
          ))
        ) : products.length === 0 ? (
          <div style={{ fontSize: '12px', color: '#94a3b8', padding: '12px 4px' }}>
            Koleksi stok sedang diperbarui.{' '}
            <a href="https://wa.me/628992020444" target="_blank" rel="noopener noreferrer" style={{ color: '#34d399' }}>
              Tanya via WA
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
                onClick={() => { setSelected(item); setImgIdx(0); }}
                style={{
                  flex: '0 0 118px',
                  scrollSnapAlign: 'start',
                  background: '#1e293b',
                  border: isHabis ? '1px solid #334155' : '1px solid rgba(56, 189, 248, 0.28)',
                  borderRadius: '11px',
                  overflow: 'hidden',
                  padding: 0,
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: '#f1f5f9',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isHabis ? 0.65 : 1,
                }}
              >
                <div style={{ position: 'relative', width: '100%', height: '72px', background: '#0b1120' }}>
                  {item.is_video ? (
                    <video
                      src={item.img}
                      muted
                      loop
                      autoPlay
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img
                      src={item.img || '/logo.png'}
                      alt={title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  )}
                  <span style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '6px',
                    background: isHabis ? 'rgba(239,68,68,0.88)' : 'rgba(16,185,129,0.9)',
                    color: '#ffffff',
                  }}>
                    {isHabis ? 'Habis' : `Stok ${item.stock}`}
                  </span>
                </div>
                <div style={{ padding: '6px 7px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#f8fafc',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '2px',
                  }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#38bdf8' }}>
                    {formatShortRupiah(item.price)}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Info Detail Modal (Non-Transaksi — Info Edukatif & Kontak WA Resmi) */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.84)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '370px',
              background: 'linear-gradient(145deg, #0f172a, #1e293b)',
              border: '1px solid #334155',
              borderRadius: '18px',
              overflow: 'hidden',
              color: '#f1f5f9',
              boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Modal Media */}
            <div style={{ position: 'relative', width: '100%', height: '220px', background: '#0b1120' }}>
              {selected.is_video && imgIdx === 0 ? (
                <video src={modalImages[0]} controls autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img
                  src={modalImages[imgIdx] || '/logo.png'}
                  alt={getTitle(selected)}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(15,23,42,0.8)',
                  color: '#f8fafc',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
              {modalImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImgIdx((i) => (i === 0 ? modalImages.length - 1 : i - 1))}
                    style={{
                      position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                      background: 'rgba(15,23,42,0.75)', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setImgIdx((i) => (i + 1) % modalImages.length)}
                    style={{
                      position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                      width: '30px', height: '30px', borderRadius: '50%', border: 'none',
                      background: 'rgba(15,23,42,0.75)', color: '#fff', cursor: 'pointer',
                    }}
                  >
                    ›
                  </button>
                  <div style={{
                    position: 'absolute', bottom: '8px', right: '10px',
                    background: 'rgba(15,23,42,0.78)', color: '#e2e8f0',
                    fontSize: '10.5px', padding: '2px 8px', borderRadius: '99px',
                  }}>
                    {imgIdx + 1} / {modalImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Modal Info */}
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                Etalase Info · {selected.category}
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#f8fafc' }}>
                {getTitle(selected)}
              </h3>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Kisaran Harga</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8', marginBottom: '12px' }}>
                {formatFullRupiah(selected.price)}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                background: '#0b1120',
                borderRadius: '10px',
                padding: '10px',
                border: '1px solid #1e293b',
                fontSize: '11.5px',
                marginBottom: '14px',
              }}>
                <div><span style={{ color: '#64748b' }}>Kode:</span> <strong>{selected.code || '-'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Kelamin:</span> <strong>{selected.gender || '-'}</strong></div>
                <div><span style={{ color: '#64748b' }}>Ukuran:</span> <strong>{selected.size || '-'}</strong></div>
                <div>
                  <span style={{ color: '#64748b' }}>Status:</span>{' '}
                  <strong style={{ color: (!selected.is_available || selected.stock <= 0) ? '#f87171' : '#34d399' }}>
                    {(!selected.is_available || selected.stock <= 0) ? 'Stok Habis' : `Ready (${selected.stock})`}
                  </strong>
                </div>
              </div>

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin Cupang Klaten, saya ingin info mengenai ${getTitle(selected)} (Kode: ${selected.code || '-'}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  textDecoration: 'none',
                }}
              >
                <i className="fab fa-whatsapp"></i> Tanya Info Resmi via WA
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
