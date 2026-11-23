'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { GameHeader, playArenaTone } from '../shared/ArenaShared';
import './gacha-card.css';

/**
 * 12 Kartu Koleksi TCG Ikan Cupang — 4 Tier Kelangkaan
 * Common (55%), Rare (30%), Super Rare / SR (12%), Ultra Rare / UR (3%)
 */
const GACHA_CARDS = [
  // COMMON (55%)
  {
    id: 'c-koi-basic',
    name: 'Plakat Koi Classic',
    rarity: 'C',
    rarityLabel: 'Common',
    image: '/pk-001.png',
    tail: 'Plakat Rapi',
    trait: 'Lincah & Mudah Dirawat',
    note: 'Corak koi klasik merah-putih yang sangat populer di kalangan penghobi.',
  },
  {
    id: 'c-ct-young',
    name: 'Crowntail Crimson',
    rarity: 'C',
    rarityLabel: 'Common',
    image: '/memory-game/crowntail.jpg',
    tail: 'Serit / Crowntail',
    trait: 'Mental Berani',
    note: 'Sirip tajam meruncing dengan perpaduan merah menyala dan dasar hitam.',
  },
  {
    id: 'c-giant-young',
    name: 'Giant Teal Junior',
    rarity: 'C',
    rarityLabel: 'Common',
    image: '/gt-005.png',
    tail: 'Plakat Giant',
    trait: 'Kekar & Tenang',
    note: 'Garis genetik tubuh besar berwarna biru toska yang enak dipandang.',
  },
  {
    id: 'c-nemo-basic',
    name: 'Plakat Nemo Classic',
    rarity: 'C',
    rarityLabel: 'Common',
    image: '/memory-game/plakat-nemo.jpg',
    tail: 'Plakat Simetris',
    trait: 'Aktif & Cerah',
    note: 'Warna kuning-oranye segar ala ikan nemo yang langsung mencuri perhatian.',
  },

  // RARE (30%)
  {
    id: 'r-double-tail',
    name: 'Double Tail Violet',
    rarity: 'R',
    rarityLabel: 'Rare',
    image: '/memory-game/double-tail.jpg',
    tail: 'Double Tail Belah Dua',
    trait: 'Elegan & Megah',
    note: 'Ekor terbelah dua simetris dengan dorsal lebar berkilau ungu metalik.',
  },
  {
    id: 'r-nemo-candy',
    name: 'Plakat Nemo Candy',
    rarity: 'R',
    rarityLabel: 'Rare',
    image: '/memory-game/plakat-nemo.jpg',
    tail: 'Halfmoon Plakat',
    trait: 'Agresif & Flaring Lebar',
    note: 'Gradasi candy kuning-oranye-merah pekat dengan sisik putih mutiara.',
  },
  {
    id: 'r-giant-solid',
    name: 'Giant Turquoise Solid',
    rarity: 'R',
    rarityLabel: 'Rare',
    image: '/gt-005.png',
    tail: 'Giant HMPK',
    trait: 'Dominan & Gagah',
    note: 'Ukuran tubuh jumbo dengan warna biru toska solid merata hingga ujung ekor.',
  },

  // SUPER RARE / SR (12%)
  {
    id: 'sr-black-samurai',
    name: 'Black Samurai Armor',
    rarity: 'SR',
    rarityLabel: 'Super Rare',
    image: '/memory-game/black-samurai.jpg',
    tail: 'Dragon Plakat',
    trait: 'Tegas & Sangar',
    note: 'Tubuh hitam pekat berlapis sisik armor perak metalik tegas di punggung.',
  },
  {
    id: 'sr-koi-galaxy',
    name: 'Plakat Koi Galaxy',
    rarity: 'SR',
    rarityLabel: 'Super Rare',
    image: '/pk-001.png',
    tail: 'HMPK Grade A',
    trait: 'Agresif & Responsif',
    note: 'Mutasi corak koi kontras tinggi dengan percikan sisik galaxy berkilau.',
  },
  {
    id: 'sr-blue-rim',
    name: 'Blue Rim Clean Body',
    rarity: 'SR',
    rarityLabel: 'Super Rare',
    image: '/memory-game/blue-rim.jpg',
    tail: 'HMPK Seleksi',
    trait: 'Tenang & Berkelas',
    note: 'Badan putih bersih tanpa bocor warna dengan list biru kobalt di tepi sirip.',
  },

  // ULTRA RARE / UR (3%)
  {
    id: 'ur-halfmoon-copper',
    name: 'Halfmoon Copper Gold Champion',
    rarity: 'UR',
    rarityLabel: 'Ultra Rare',
    image: '/hm-012.png',
    tail: 'Halfmoon 180° Sempurna',
    trait: 'Mental Juara Kontes',
    note: 'Bukaan ekor D-tail 180° presisi dengan kilau tembaga emas kelas kompetisi.',
  },
  {
    id: 'ur-blue-rim-king',
    name: 'Blue Rim Show Grade A+',
    rarity: 'UR',
    rarityLabel: 'Ultra Rare',
    image: '/memory-game/blue-rim.jpg',
    tail: 'HMPK Form Kontes',
    trait: 'Form & Warna Sempurna',
    note: 'Koleksi unggulan: warna putih salju super bersih dengan bingkai biru tajam.',
  },
];

const DEX_KEY = 'ck_gacha_dex_v1';

function rollRarity() {
  const r = Math.random() * 100;
  if (r < 3) return 'UR';
  if (r < 15) return 'SR';
  if (r < 45) return 'R';
  return 'C';
}

function pullRandomCard() {
  const rarity = rollRarity();
  const pool = GACHA_CARDS.filter((c) => c.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function GachaCardGame({ onBack }) {
  const [phase, setPhase] = useState('pack'); // 'pack' | 'flash' | 'reveal'
  const [tearProgress, setTearProgress] = useState(0); // 0..100
  const [pulledCard, setPulledCard] = useState(null);
  const [isNewUnlock, setIsNewUnlock] = useState(false);
  const [unlockedIds, setUnlockedIds] = useState([]);
  const [showAlbum, setShowAlbum] = useState(false);
  const [inspectCard, setInspectCard] = useState(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50 });

  const draggingRef = useRef(false);
  const tearBarRef = useRef(null);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DEX_KEY) || '[]');
      if (Array.isArray(saved)) setUnlockedIds(saved);
    } catch {
      // Ignore
    }
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const triggerOpenPack = useCallback(() => {
    const card = pullRandomCard();
    setPulledCard(card);
    setPhase('flash');
    playArenaTone(card.rarity === 'UR' || card.rarity === 'SR' ? 'win' : 'match');

    setUnlockedIds((prev) => {
      if (prev.includes(card.id)) {
        setIsNewUnlock(false);
        return prev;
      }
      setIsNewUnlock(true);
      const next = [...prev, card.id];
      try {
        localStorage.setItem(DEX_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });

    flashTimerRef.current = setTimeout(() => {
      setPhase('reveal');
    }, 520);
  }, []);

  const resetPack = useCallback(() => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setPhase('pack');
    setTearProgress(0);
    setPulledCard(null);
    setIsNewUnlock(false);
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  }, []);

  const updateTearFromClientX = (clientX) => {
    if (!tearBarRef.current) return;
    const rect = tearBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setTearProgress(pct);
    if (pct >= 84) {
      draggingRef.current = false;
      setTearProgress(100);
      triggerOpenPack();
    }
  };

  const handleTearPointerDown = (e) => {
    if (phase !== 'pack') return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateTearFromClientX(e.clientX);
  };

  const handleTearPointerMove = (e) => {
    if (!draggingRef.current || phase !== 'pack') return;
    updateTearFromClientX(e.clientX);
  };

  const handleTearPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (tearProgress < 84) {
      setTearProgress(0);
    }
  };

  const handleCardPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      rx: (0.5 - py) * 18,
      ry: (px - 0.5) * 22,
      gx: px * 100,
      gy: py * 100,
    });
  };

  const handleCardPointerLeave = () => {
    setTilt({ rx: 0, ry: 0, gx: 50, gy: 50 });
  };

  const activeDisplayCard = inspectCard || pulledCard;

  return (
    <div>
      <GameHeader
        title="Gacha Kartu Koleksi"
        subtitle="Mystery Pack Ikan Cupang"
        onBack={() => {
          if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
          onBack();
        }}
        onRestart={resetPack}
      />

      <div className="gc-wrap">
        {/* Top Bar: Album Toggle & Drop Rates */}
        <div className="gc-topbar">
          <button
            type="button"
            className="mm-icon-btn"
            onClick={() => {
              setShowAlbum((prev) => !prev);
              setInspectCard(null);
            }}
          >
            <i className={showAlbum ? 'fas fa-box-open' : 'fas fa-book'} />
            <span>
              {showAlbum
                ? 'Kembali ke Booster Pack'
                : `Lihat Album Koleksi (${unlockedIds.length}/${GACHA_CARDS.length})`}
            </span>
          </button>

          <div className="gc-rates-pill" aria-label="Peluang Rarity">
            <span>C 55%</span>
            <span>·</span>
            <span style={{ color: '#60a5fa' }}>R 30%</span>
            <span>·</span>
            <span style={{ color: '#fbbf24' }}>SR 12%</span>
            <span>·</span>
            <span className="ck-brand-gradient">UR 3%</span>
          </div>
        </div>

        {showAlbum ? (
          /* ─── ALBUM KOLEKSI (DEX / BINDER) ──────────────────────────── */
          <div className="gc-album-box">
            <div className="mm-guide-head">
              <h2 className="mm-guide-title">
                <i className="fas fa-book-open" />
                <span>Album Koleksi Kartu ({unlockedIds.length} / {GACHA_CARDS.length})</span>
              </h2>
            </div>

            <div className="gc-album-grid">
              {GACHA_CARDS.map((card) => {
                const owned = unlockedIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    className={`gc-dex-item rarity-${card.rarity} ${owned ? 'owned' : 'locked'}`}
                    onClick={() => owned && setInspectCard(card)}
                    disabled={!owned}
                  >
                    <div className="gc-dex-thumb">
                      {owned ? (
                        <img src={card.image} alt={card.name} />
                      ) : (
                        <div className="gc-dex-silhouette">
                          <i className="fas fa-question" />
                        </div>
                      )}
                      <span className={`gc-rarity-tag rarity-${card.rarity}`}>{card.rarity}</span>
                    </div>
                    <div className="gc-dex-name">{owned ? card.name : '???'}</div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : phase === 'pack' ? (
          /* ─── BOOSTER PACK TERTUTUP (SWIPE TO TEAR) ─────────────────── */
          <div className="gc-pack-stage">
            <div className="gc-booster-pack">
              {/* Tear Strip di Bagian Atas */}
              <div
                ref={tearBarRef}
                className="gc-tear-strip"
                onPointerDown={handleTearPointerDown}
                onPointerMove={handleTearPointerMove}
                onPointerUp={handleTearPointerUp}
                onPointerCancel={handleTearPointerUp}
              >
                <div className="gc-tear-fill" style={{ width: `${tearProgress}%` }} />
                <div className="gc-tear-handle" style={{ left: `calc(${tearProgress}% - 14px)` }}>
                  <i className="fas fa-cut" />
                </div>
                <span className="gc-tear-text">Geser kiri → kanan untuk sobek</span>
              </div>

              <div className="gc-pack-body">
                <span className="gc-pack-edition">SERI KOMPETISI · VOL. 1</span>
                <img src="/logo-cansbetta.jpg" alt="cans.betta x cupangklaten" className="gc-pack-logo" />
                <h2 className="gc-pack-title">MYSTERY BETTA PACK</h2>
                <p className="gc-pack-sub">Berisi 1 Kartu Profil Ikan Cupang Acak (C / R / SR / UR)</p>

                <button
                  type="button"
                  className="gc-quick-open-btn"
                  onClick={triggerOpenPack}
                >
                  <i className="fas fa-sparkles" /> Atau Ketuk untuk Buka Cepat
                </button>
              </div>
            </div>
          </div>
        ) : phase === 'flash' && pulledCard ? (
          /* ─── KILATAN CAHAYA SESUAI KELANGKAAN ──────────────────────── */
          <div className={`gc-flash-stage rarity-${pulledCard.rarity}`}>
            <div className="gc-flash-orb" />
            <div className="gc-flash-label">Membuka Kartu {pulledCard.rarityLabel}...</div>
          </div>
        ) : null}

        {/* ─── TAMPILAN KARTU TCG (REVEAL ATAU INSPEKSI ALBUM) ────────── */}
        {((phase === 'reveal' && pulledCard && !showAlbum) || inspectCard) && activeDisplayCard && (
          <div className="gc-reveal-stage">
            {inspectCard && (
              <button
                type="button"
                className="mm-icon-btn"
                style={{ marginBottom: '10px' }}
                onClick={() => setInspectCard(null)}
              >
                <i className="fas fa-times" /> Tutup Pratinjau Kartu
              </button>
            )}

            <div
              className={`gc-tcg-card rarity-${activeDisplayCard.rarity}`}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={handleCardPointerLeave}
              style={{
                transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              }}
            >
              <div
                className="gc-holo-glare"
                style={{
                  background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.42), transparent 58%)`,
                }}
              />

              <div className="gc-tcg-head">
                <span className={`gc-rarity-pill rarity-${activeDisplayCard.rarity}`}>
                  {activeDisplayCard.rarity} · {activeDisplayCard.rarityLabel}
                </span>
                {isNewUnlock && !inspectCard && (
                  <span className="gc-new-pill">BARU!</span>
                )}
              </div>

              <div className="gc-tcg-photo">
                <img src={activeDisplayCard.image} alt={activeDisplayCard.name} draggable={false} />
              </div>

              <h3 className="gc-tcg-name">{activeDisplayCard.name}</h3>

              <div className="gc-tcg-stats">
                <div>
                  <span>Bentuk Ekor</span>
                  <strong>{activeDisplayCard.tail}</strong>
                </div>
                <div>
                  <span>Karakter</span>
                  <strong>{activeDisplayCard.trait}</strong>
                </div>
              </div>

              <p className="gc-tcg-note">{activeDisplayCard.note}</p>
            </div>

            {/* Tombol Aksi di Bawah Kartu */}
            <div className="gc-reveal-actions">
              {!inspectCard && (
                <button type="button" className="mm-cta-btn mm-cta-primary" onClick={resetPack}>
                  <i className="fas fa-box-open" />
                  <span>Buka Bungkus Lagi</span>
                </button>
              )}

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta x cupangklaten! Saya baru dapat kartu "${activeDisplayCard.name}" (${activeDisplayCard.rarityLabel}) di Gacha Kartu Koleksi. Apakah ada stok ikan jenis ini?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mm-cta-btn mm-cta-wa"
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '15px' }} />
                <span>Tanya Stok Ikan Ini</span>
              </a>

              <div className="mm-cta-row">
                <Link href="/stok" className="mm-cta-btn mm-cta-secondary">
                  <i className="fas fa-fish" />
                  <span>Lihat Koleksi</span>
                </Link>
                <button type="button" className="mm-cta-btn mm-cta-secondary" onClick={onBack}>
                  <i className="fas fa-th-large" />
                  <span>Pilih Game Lain</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
