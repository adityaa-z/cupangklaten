'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import '@/app/homepage.css';

export const ETALASE_CATEGORIES = [
  { id: 'Grade A',  label: 'Grade A',  icon: 'fa-award' },
  { id: 'Grade B',  label: 'Grade B',  icon: 'fa-star' },
  { id: 'Grade C',  label: 'Grade C',  icon: 'fa-fish' },
  { id: 'Kolektor', label: 'Kolektor', icon: 'fa-gem' },
];

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

function formatPriceRangeShort(minPrice, maxPrice) {
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || 0;
  if (max > min) {
    return `${formatShortRupiah(min)} – ${formatShortRupiah(max).replace(/^Rp\s*/, '')}`;
  }
  return formatShortRupiah(min);
}

function formatPriceRangeFull(minPrice, maxPrice) {
  const min = Number(minPrice) || 0;
  const max = Number(maxPrice) || 0;
  if (max > min) {
    return `${formatFullRupiah(min)} – ${formatFullRupiah(max)}`;
  }
  return formatFullRupiah(min);
}

function getTitle(p) {
  if (p.variant && p.variant.trim() !== '') return p.variant;
  return p.category || 'Koleksi Cupang';
}

/* ─── Single Grade Horizontal Gallery Row ─────────────────────────────────── */
function CategoryRow({ indexLabel, category, items, loading, onSelect, viewAllHref }) {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
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
      { threshold: 0.06 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function scrollByAmount(dir) {
    if (!scrollRef.current) return;
    const step = Math.max(260, scrollRef.current.clientWidth * 0.65);
    scrollRef.current.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  return (
    <section
      ref={sectionRef}
      aria-label={`Etalase ${category.label}`}
      className="ed-strip-section"
    >
      <div className={`ed-strip-inner ed-reveal ${visible ? 'is-visible' : ''}`}>
        <div className="ed-strip-head">
          <div className="ed-strip-title-group">
            <span className="ed-strip-kicker">
              <span>{indexLabel}</span>
              {!loading && items.length > 0 && (
                <>
                  <span>·</span>
                  <span>{String(items.length).padStart(2, '0')} KOLEKSI</span>
                </>
              )}
            </span>
            <h2 className="ed-strip-heading">Etalase {category.label}</h2>
          </div>

          <Link href={viewAllHref} className="ed-strip-more">
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
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="ed-skeleton" />)
            ) : (
              items.map((item) => {
                const isHabis = !item.is_available || item.stock <= 0;
                const title = getTitle(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="ed-prod-card"
                    onClick={() => onSelect(item)}
                  >
                    <div className="ed-prod-media">
                      {item.is_video ? (
                        <video src={item.img} muted loop autoPlay playsInline />
                      ) : (
                        <img
                          src={item.img || '/logo-cansbetta.jpg'}
                          alt={title}
                          loading="lazy"
                          style={{ opacity: isHabis ? 0.68 : 1 }}
                        />
                      )}

                      <span className={`ed-stock-tag ${isHabis ? 'sold' : ''}`}>
                        <span className="ed-stock-dot" />
                        <span>{isHabis ? 'Habis' : `Stok ${item.stock}`}</span>
                      </span>
                    </div>

                    <div className="ed-prod-body">
                      <div className="ed-prod-title">{title}</div>
                      <div className="ed-prod-foot">
                        <span className="ed-prod-price">
                          {formatPriceRangeShort(item.price, item.price_max)}
                        </span>
                        <span className="ed-prod-cue" aria-hidden="true">
                          <i className="fas fa-arrow-right" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
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
    </section>
  );
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

        const sorted = [...(data || [])].sort((a, b) => {
          const aReady = a.is_available && a.stock > 0 ? 1 : 0;
          const bReady = b.is_available && b.stock > 0 ? 1 : 0;
          if (bReady !== aReady) return bReady - aReady;
          return (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0);
        });
        setProducts(sorted);
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

  const knownLower = ETALASE_CATEGORIES.map((c) => c.id.toLowerCase());
  const legacyItems = products.filter((p) => {
    const cat = (p.category || '').toLowerCase().trim();
    const isSupply =
      cat.includes('kebutuhan') ||
      cat.includes('pakan') ||
      cat.includes('obat') ||
      cat.includes('alat') ||
      cat.includes('aksesoris');
    return !isSupply && !knownLower.includes(cat);
  });
  const legacyHasStock = legacyItems.some((p) => p.is_available && p.stock > 0);

  // Build visible category rows so index numbering (01, 02, ...) stays sequential
  const visibleRows = ETALASE_CATEGORIES.map((cat) => {
    const catItems = products.filter(
      (p) => (p.category || '').toLowerCase().trim() === cat.id.toLowerCase()
    );
    const hasStock = catItems.some((p) => p.is_available && p.stock > 0);
    return hasStock
      ? {
          key: cat.id,
          category: cat,
          items: catItems,
          viewAllHref: `/stok?category=${encodeURIComponent(cat.id)}`,
        }
      : null;
  }).filter(Boolean);

  if (legacyHasStock) {
    visibleRows.push({
      key: 'lainnya',
      category: { id: 'lainnya', label: 'Koleksi Lainnya', icon: 'fa-layer-group' },
      items: legacyItems,
      viewAllHref: '/stok',
    });
  }

  const modalImages = selected
    ? [selected.img, selected.img2, selected.img3, selected.img4].filter((x) => x && x.trim() !== '')
    : [];

  return (
    <div>
      {loading ? (
        <CategoryRow
          indexLabel="KATALOG"
          category={{ id: 'loading', label: 'Stok Ikan', icon: 'fa-layer-group' }}
          items={[]}
          loading
          viewAllHref="/stok"
          onSelect={() => {}}
        />
      ) : (
        visibleRows.map((row, idx) => (
          <CategoryRow
            key={row.key}
            indexLabel={`KATALOG · ${String(idx + 1).padStart(2, '0')}`}
            category={row.category}
            items={row.items}
            loading={false}
            viewAllHref={row.viewAllHref}
            onSelect={(item) => {
              setSelected(item);
              setImgIdx(0);
            }}
          />
        ))
      )}

      {/* Boutique Detail Lightbox Modal */}
      {selected && (
        <div className="ed-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="ed-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="ed-modal-media">
              {selected.is_video && imgIdx === 0 ? (
                <video src={modalImages[0]} controls autoPlay loop muted playsInline />
              ) : (
                <img
                  src={modalImages[imgIdx] || '/logo-cansbetta.jpg'}
                  alt={getTitle(selected)}
                />
              )}

              <button
                type="button"
                className="ed-modal-close"
                onClick={() => setSelected(null)}
                aria-label="Tutup"
              >
                <i className="fas fa-times" />
              </button>

              {modalImages.length > 1 && (
                <>
                  <button
                    type="button"
                    className="ed-modal-nav prev"
                    onClick={() => setImgIdx((i) => (i === 0 ? modalImages.length - 1 : i - 1))}
                    aria-label="Foto sebelumnya"
                  >
                    <i className="fas fa-chevron-left" style={{ fontSize: '11px' }} />
                  </button>
                  <button
                    type="button"
                    className="ed-modal-nav next"
                    onClick={() => setImgIdx((i) => (i + 1) % modalImages.length)}
                    aria-label="Foto berikutnya"
                  >
                    <i className="fas fa-chevron-right" style={{ fontSize: '11px' }} />
                  </button>
                  <div className="ed-modal-counter">
                    {imgIdx + 1} / {modalImages.length}
                  </div>
                </>
              )}
            </div>

            <div className="ed-modal-content">
              <div className="ed-modal-kicker">Kelas · {selected.category}</div>
              <h3 className="ed-modal-title">{getTitle(selected)}</h3>

              <div className="ed-modal-price-label">Kisaran Harga</div>
              <div className="ed-modal-price">
                {formatPriceRangeFull(selected.price, selected.price_max)}
              </div>

              <div className="ed-spec-ledger">
                <div className="ed-spec-item">
                  <span>Kode</span>
                  <strong>{selected.code || '-'}</strong>
                </div>
                <div className="ed-spec-item">
                  <span>Kelamin</span>
                  <strong>{selected.gender || '-'}</strong>
                </div>
                <div className="ed-spec-item">
                  <span>Ukuran</span>
                  <strong>{selected.size || '-'}</strong>
                </div>
                <div className="ed-spec-item">
                  <span>Status</span>
                  <strong
                    style={{
                      color:
                        !selected.is_available || selected.stock <= 0
                          ? 'var(--ed-ink-muted)'
                          : 'var(--ed-ok)',
                    }}
                  >
                    {!selected.is_available || selected.stock <= 0
                      ? 'Stok Habis'
                      : `Ready (${selected.stock})`}
                  </strong>
                </div>
              </div>

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta x cupangklaten, saya ingin menanyakan info mengenai ${getTitle(selected)} (${selected.category} · Kode: ${selected.code || '-'}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-wa-btn"
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '15px' }} />
                Tanya Info Resmi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
