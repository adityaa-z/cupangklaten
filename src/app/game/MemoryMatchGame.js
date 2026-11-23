'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BETTA_CARDS, GAME_MODES } from './memoryFishData';
import '@/app/game/soliter.css';
import './memory-game.css';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(modeKey) {
  const mode = GAME_MODES[modeKey] || GAME_MODES.standard;
  const selectedSpecies = shuffleArray(BETTA_CARDS).slice(0, mode.pairs);

  const pairedCards = selectedSpecies.flatMap((fish) => [
    { uid: `${fish.id}-a`, fishId: fish.id, ...fish, matched: false },
    { uid: `${fish.id}-b`, fishId: fish.id, ...fish, matched: false },
  ]);

  return {
    deck: shuffleArray(pairedCards),
    speciesInRound: selectedSpecies,
  };
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getStarRating(moves, totalPairs) {
  if (moves <= Math.ceil(totalPairs * 1.45)) return 3;
  if (moves <= Math.ceil(totalPairs * 2.15)) return 2;
  return 1;
}

/* ─── Optional Soft Web Audio Sound Effects ───────────────────────────────── */
function playTone(type, soundEnabled) {
  if (!soundEnabled || typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const triggerNote = (freq, startOffset, duration, gainVal = 0.08, wave = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, now + startOffset);
      gain.gain.setValueAtTime(0.001, now + startOffset);
      gain.gain.exponentialRampToValueAtTime(gainVal, now + startOffset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + startOffset);
      osc.stop(now + startOffset + duration + 0.02);
    };

    if (type === 'flip') {
      triggerNote(440, 0, 0.08, 0.05, 'triangle');
    } else if (type === 'match') {
      triggerNote(523.25, 0, 0.14, 0.08, 'sine');
      triggerNote(659.25, 0.08, 0.18, 0.08, 'sine');
    } else if (type === 'mismatch') {
      triggerNote(260, 0, 0.12, 0.05, 'triangle');
      triggerNote(210, 0.09, 0.14, 0.04, 'triangle');
    } else if (type === 'win') {
      triggerNote(523.25, 0, 0.16, 0.09, 'sine');
      triggerNote(659.25, 0.11, 0.16, 0.09, 'sine');
      triggerNote(783.99, 0.22, 0.2, 0.09, 'sine');
      triggerNote(1046.5, 0.34, 0.35, 0.1, 'sine');
    }

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 900);
  } catch {
    // Ignore audio errors when autoplay is restricted
  }
}

const BEST_RECORD_KEY = 'ck_memory_match_best_v1';

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function MemoryMatchGame() {
  const [modeKey, setModeKey] = useState('standard');
  const [cards, setCards] = useState([]);
  const [speciesInRound, setSpeciesInRound] = useState([]);
  const [firstPick, setFirstPick] = useState(null);
  const [secondPick, setSecondPick] = useState(null);
  const [mismatchUids, setMismatchUids] = useState([]);
  const [isLocked, setIsLocked] = useState(false);

  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const [banner, setBanner] = useState({
    type: 'idle',
    headline: 'Buka 2 kartu untuk menemukan pasangan ikan cupang yang sama',
    fact: 'Latih daya ingat sambil mengenal jenis-jenis ikan cupang hias Kelas Kompetisi.',
    image: null,
  });

  const [soundOn, setSoundOn] = useState(true);
  const [bestRecords, setBestRecords] = useState({});
  const [isNewRecord, setIsNewRecord] = useState(false);

  const timeoutRef = useRef(null);
  const mode = GAME_MODES[modeKey];

  const initGame = useCallback((targetMode = modeKey) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const { deck, speciesInRound: roundSpecies } = createDeck(targetMode);
    setModeKey(targetMode);
    setCards(deck);
    setSpeciesInRound(roundSpecies);
    setFirstPick(null);
    setSecondPick(null);
    setMismatchUids([]);
    setIsLocked(false);
    setMoves(0);
    setMatchedPairs(0);
    setSeconds(0);
    setHasStarted(false);
    setIsWon(false);
    setIsNewRecord(false);
    setBanner({
      type: 'idle',
      headline: 'Buka 2 kartu untuk menemukan pasangan ikan cupang yang sama',
      fact: 'Latih daya ingat sambil mengenal jenis-jenis ikan cupang hias Kelas Kompetisi.',
      image: null,
    });
  }, [modeKey]);

  // Initial deck + load saved best records on client mount
  useEffect(() => {
    initGame('standard');
    try {
      const saved = localStorage.getItem(BEST_RECORD_KEY);
      if (saved) setBestRecords(JSON.parse(saved));
    } catch {
      // Ignore storage read errors
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer ticks while game is active and not yet won
  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  // Lock body scroll when victory modal is open
  useEffect(() => {
    if (isWon) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isWon]);

  const handleCardClick = (card) => {
    // Tahap 2 & 3 Guard: blokir saat papan terkunci, kartu sudah cocok, atau klik kartu pertama dua kali
    if (isLocked || isWon) return;
    if (card.matched) return;
    if (firstPick && firstPick.uid === card.uid) return;
    if (secondPick) return;

    if (!hasStarted) setHasStarted(true);
    playTone('flip', soundOn);

    // Pilihan Pertama
    if (!firstPick) {
      setFirstPick(card);
      return;
    }

    // Pilihan Kedua
    const pickedFirst = firstPick;
    const pickedSecond = card;
    const nextMoves = moves + 1;

    setSecondPick(pickedSecond);
    setMoves(nextMoves);
    setIsLocked(true);

    // Tahap 4: Pengecekan Kecocokan
    if (pickedFirst.fishId === pickedSecond.fishId) {
      // A. JIKA COCOK — jeda 0,5 detik agar pemain sempat melihat kedua gambar cocok
      timeoutRef.current = setTimeout(() => {
        playTone('match', soundOn);

        setCards((prev) =>
          prev.map((c) =>
            c.fishId === pickedFirst.fishId ? { ...c, matched: true } : c
          )
        );

        const nextMatched = matchedPairs + 1;
        setMatchedPairs(nextMatched);
        setBanner({
          type: 'matched',
          headline: `Cocok! Jenis: ${pickedFirst.name}`,
          fact: pickedFirst.fact,
          image: pickedFirst.image,
        });

        setFirstPick(null);
        setSecondPick(null);
        setIsLocked(false);

        // Tahap 5: Cek Kondisi Menang
        if (nextMatched === mode.pairs) {
          setIsWon(true);
          playTone('win', soundOn);

          setBestRecords((prevBest) => {
            const currentBest = prevBest[modeKey];
            const improved =
              !currentBest ||
              nextMoves < currentBest.moves ||
              (nextMoves === currentBest.moves && seconds < currentBest.seconds);

            if (improved) {
              setIsNewRecord(true);
              const updated = {
                ...prevBest,
                [modeKey]: { moves: nextMoves, seconds },
              };
              try {
                localStorage.setItem(BEST_RECORD_KEY, JSON.stringify(updated));
              } catch {
                // Ignore storage write errors
              }
              return updated;
            }
            return prevBest;
          });
        }
      }, 500);
    } else {
      // B. JIKA TIDAK COCOK — jeda 0,9 detik agar pemain sempat menghafal gambar & posisi
      setMismatchUids([pickedFirst.uid, pickedSecond.uid]);
      setBanner({
        type: 'mismatch',
        headline: 'Belum cocok — hafalkan posisinya!',
        fact: `${pickedFirst.shortName} ≠ ${pickedSecond.shortName}. Coba buka pasangan lain.`,
        image: null,
      });

      timeoutRef.current = setTimeout(() => {
        playTone('mismatch', soundOn);
        setFirstPick(null);
        setSecondPick(null);
        setMismatchUids([]);
        setIsLocked(false);
      }, 900);
    }
  };

  const matchedFishIds = new Set(cards.filter((c) => c.matched).map((c) => c.fishId));
  const bestForMode = bestRecords[modeKey];
  const accuracy = moves > 0 ? Math.min(100, Math.round((matchedPairs / moves) * 100)) : 100;
  const stars = getStarRating(moves, mode.pairs);

  return (
    <div className="mm-page">
      <Navbar />

      <main className="mm-main">
        {/* Header / Title */}
        <section className="mm-hero">
          <div className="mm-eyebrow">
            <i className="fas fa-puzzle-piece" />
            <span>MINI GAME EDUKASI · CANS.BETTA X CUPANGKLATEN</span>
          </div>
          <h1 className="mm-title">Memory Match Ikan Cupang</h1>
          <p className="mm-subtitle">
            Temukan seluruh pasangan foto ikan cupang hias dengan jumlah langkah seminimal mungkin
            sambil mengenal karakter tiap jenis ikan kelas kompetisi.
          </p>
        </section>

        {/* Panel Informasi (HUD Header) */}
        <section className="mm-hud-panel" aria-label="Panel Informasi Permainan">
          <div className="mm-hud-top">
            <div className="mm-mode-switch" role="tablist" aria-label="Pilih Mode Grid">
              {Object.values(GAME_MODES).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={modeKey === m.id}
                  className={`mm-mode-btn ${modeKey === m.id ? 'active' : ''}`}
                  onClick={() => initGame(m.id)}
                >
                  <span>{m.label}</span>
                  <span className="mm-mode-badge">({m.gridLabel})</span>
                </button>
              ))}
            </div>

            <div className="mm-actions">
              <button
                type="button"
                className="mm-icon-btn"
                onClick={() => setSoundOn((prev) => !prev)}
                aria-label={soundOn ? 'Matikan Suara' : 'Nyalakan Suara'}
                title={soundOn ? 'Suara Aktif' : 'Suara Nonaktif'}
              >
                <i className={soundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute'} />
                <span>{soundOn ? 'Suara' : 'Senyap'}</span>
              </button>

              <button
                type="button"
                className="mm-icon-btn mm-restart-btn"
                onClick={() => initGame(modeKey)}
              >
                <i className="fas fa-redo-alt" />
                <span>Ulangi</span>
              </button>
            </div>
          </div>

          <div className="mm-stats-grid">
            <div className="mm-stat-card">
              <span className="mm-stat-label">
                <i className="fas fa-shoe-prints" /> Langkah
              </span>
              <span className="mm-stat-value">{moves}</span>
            </div>

            <div className="mm-stat-card">
              <span className="mm-stat-label">
                <i className="fas fa-clock" /> Waktu
              </span>
              <span className="mm-stat-value">{formatTime(seconds)}</span>
            </div>

            <div className="mm-stat-card">
              <span className="mm-stat-label">
                <i className="fas fa-layer-group" /> Pasangan
              </span>
              <span className="mm-stat-value">
                {matchedPairs} / {mode.pairs}
              </span>
            </div>

            <div className="mm-stat-card">
              <span className="mm-stat-label">
                <i className="fas fa-trophy" /> Rekor
              </span>
              <span className="mm-stat-value">
                {bestForMode ? `${bestForMode.moves}x · ${formatTime(bestForMode.seconds)}` : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Banner Edukasi Nama Jenis Ikan */}
        <div className="mm-banner-slot" aria-live="polite">
          <div className={`mm-edu-banner ${banner.type}`}>
            {banner.image ? (
              <img src={banner.image} alt={banner.headline} className="mm-edu-thumb" />
            ) : (
              <div className="mm-edu-icon">
                <i
                  className={
                    banner.type === 'mismatch'
                      ? 'fas fa-sync-alt'
                      : 'fas fa-fish'
                  }
                />
              </div>
            )}
            <div className="mm-edu-text">
              <div className="mm-edu-headline">{banner.headline}</div>
              <div className="mm-edu-fact">{banner.fact}</div>
            </div>
          </div>
        </div>

        {/* Papan Permainan (Grid 3x4 atau 4x4) */}
        <section
          className={`mm-board mode-${modeKey}`}
          aria-label={`Papan Memory Match ${mode.gridLabel}`}
        >
          {cards.map((card) => {
            const isFlipped =
              card.matched ||
              firstPick?.uid === card.uid ||
              secondPick?.uid === card.uid;
            const isMismatch = mismatchUids.includes(card.uid);

            return (
              <button
                key={card.uid}
                type="button"
                className={`mm-card-btn ${isFlipped ? 'flipped' : ''} ${
                  card.matched ? 'matched' : ''
                } ${isMismatch ? 'mismatch' : ''}`}
                onClick={() => handleCardClick(card)}
                disabled={isLocked || card.matched || firstPick?.uid === card.uid}
                aria-label={isFlipped ? card.name : 'Kartu ikan cupang tertutup'}
              >
                <div className="mm-card-inner">
                  {/* Belakang Kartu (Kondisi Tertutup) */}
                  <div className="mm-card-face mm-card-back">
                    <img
                      src="/logo-cansbetta.jpg"
                      alt="cans.betta x cupangklaten"
                      className="mm-back-logo"
                    />
                    <span className="mm-back-label">cans.betta</span>
                  </div>

                  {/* Depan Kartu (Kondisi Terbuka) */}
                  <div className="mm-card-face mm-card-front">
                    <img
                      src={card.image}
                      alt={card.name}
                      className="mm-fish-img"
                      draggable={false}
                    />
                    <div className="mm-card-caption">{card.name}</div>
                    {card.matched && (
                      <span className="mm-matched-check" aria-hidden="true">
                        <i className="fas fa-check" />
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        {/* Daftar Jenis Ikan yang Sudah Ditemukan */}
        <section className="mm-guide-section" aria-label="Jenis Ikan dalam Sesi Ini">
          <div className="mm-guide-head">
            <h2 className="mm-guide-title">
              <i className="fas fa-book-open" />
              <span>Jenis Ikan di Papan Ini</span>
            </h2>
            <span className="mm-guide-count">
              {matchedPairs} dari {mode.pairs} ditemukan
            </span>
          </div>

          <div className="mm-guide-grid">
            {speciesInRound.map((fish) => {
              const found = matchedFishIds.has(fish.id);
              return (
                <div
                  key={fish.id}
                  className={`mm-guide-item ${found ? 'found' : 'locked'}`}
                >
                  <img
                    src={fish.image}
                    alt={found ? fish.name : 'Belum ditemukan'}
                    className="mm-guide-thumb"
                  />
                  <div style={{ minWidth: 0 }}>
                    <div className="mm-guide-name">
                      {found ? fish.name : '???'}
                    </div>
                    <div className="mm-guide-cat">
                      {found ? fish.category : 'Cocokkan kartu untuk membuka'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Layar Kemenangan (Pop-Up + CTA Promosi) */}
      {isWon && (
        <div className="mm-win-overlay" role="dialog" aria-modal="true" aria-label="Permainan Selesai">
          <div className="mm-win-modal">
            <div className="mm-win-trophy">
              <i className="fas fa-trophy" />
            </div>

            <div className="mm-win-stars" aria-label={`${stars} dari 3 bintang`}>
              {[1, 2, 3].map((n) => (
                <i
                  key={n}
                  className="fas fa-star"
                  style={{ color: n <= stars ? '#f59e0b' : 'var(--ck-border-strong)' }}
                />
              ))}
            </div>

            <h2 className="mm-win-title">Selamat, Semua Cocok!</h2>

            {isNewRecord && (
              <div className="mm-win-record-pill">
                <i className="fas fa-medal" />
                <span>Rekor Terbaik Baru ({mode.label})!</span>
              </div>
            )}

            <p className="mm-win-sub">
              Kamu berhasil mencocokkan semua <strong>{mode.pairs} pasang</strong> ikan cupang
              di mode <strong>{mode.label} ({mode.gridLabel})</strong>.
            </p>

            <div className="mm-win-summary">
              <div className="mm-win-stat">
                <span className="mm-win-stat-label">Langkah</span>
                <span className="mm-win-stat-val">{moves}</span>
              </div>
              <div className="mm-win-stat">
                <span className="mm-win-stat-label">Waktu</span>
                <span className="mm-win-stat-val">{formatTime(seconds)}</span>
              </div>
              <div className="mm-win-stat">
                <span className="mm-win-stat-label">Akurasi</span>
                <span className="mm-win-stat-val">{accuracy}%</span>
              </div>
            </div>

            <div className="mm-win-actions">
              <button
                type="button"
                className="mm-cta-btn mm-cta-primary"
                onClick={() => initGame(modeKey)}
              >
                <i className="fas fa-redo-alt" />
                <span>Main Lagi</span>
              </button>

              <div className="mm-cta-row">
                <Link href="/stok" className="mm-cta-btn mm-cta-secondary">
                  <i className="fas fa-fish" />
                  <span>Koleksi & Stok</span>
                </Link>
                <Link href="/prestasi" className="mm-cta-btn mm-cta-secondary">
                  <i className="fas fa-trophy" />
                  <span>Galeri Prestasi</span>
                </Link>
              </div>

              <a
                href={`https://wa.me/628992020444?text=${encodeURIComponent(
                  `Halo Admin cans.betta x cupangklaten! Saya baru saja menyelesaikan Memory Match Game (${moves} langkah dalam ${formatTime(seconds)}) dan tertarik melihat koleksi ikan cupangnya.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mm-cta-btn mm-cta-wa"
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '16px' }} />
                <span>Tanya Koleksi Ikan via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
