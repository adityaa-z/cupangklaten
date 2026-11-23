'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BETTA_CARDS, GAME_MODES } from './memoryFishData';
import { GameHeader, ArenaWinModal, formatTime, playArenaTone } from './ArenaShared';

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

function getStarRating(moves, totalPairs) {
  if (moves <= Math.ceil(totalPairs * 1.45)) return 3;
  if (moves <= Math.ceil(totalPairs * 2.15)) return 2;
  return 1;
}

const BEST_RECORD_KEY = 'ck_memory_match_best_v1';

export default function MemoryMatchGame({ onBack }) {
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

  useEffect(() => {
    if (!hasStarted || isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isWon]);

  const handleCardClick = (card) => {
    if (isLocked || isWon) return;
    if (card.matched) return;
    if (firstPick && firstPick.uid === card.uid) return;
    if (secondPick) return;

    if (!hasStarted) setHasStarted(true);
    playArenaTone('flip', soundOn);

    if (!firstPick) {
      setFirstPick(card);
      return;
    }

    const pickedFirst = firstPick;
    const pickedSecond = card;
    const nextMoves = moves + 1;

    setSecondPick(pickedSecond);
    setMoves(nextMoves);
    setIsLocked(true);

    if (pickedFirst.fishId === pickedSecond.fishId) {
      timeoutRef.current = setTimeout(() => {
        playArenaTone('match', soundOn);

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

        if (nextMatched === mode.pairs) {
          setIsWon(true);
          playArenaTone('win', soundOn);

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
      setMismatchUids([pickedFirst.uid, pickedSecond.uid]);
      setBanner({
        type: 'mismatch',
        headline: 'Belum cocok — hafalkan posisinya!',
        fact: `${pickedFirst.shortName} ≠ ${pickedSecond.shortName}. Coba buka pasangan lain.`,
        image: null,
      });

      timeoutRef.current = setTimeout(() => {
        playArenaTone('mismatch', soundOn);
        setFirstPick(null);
        setSecondPick(null);
        setMismatchUids([]);
        setIsLocked(false);
      }, 850);
    }
  };

  const matchedFishIds = new Set(cards.filter((c) => c.matched).map((c) => c.fishId));
  const bestForMode = bestRecords[modeKey];
  const accuracy = moves > 0 ? Math.min(100, Math.round((matchedPairs / moves) * 100)) : 100;
  const stars = getStarRating(moves, mode.pairs);

  return (
    <div>
      <GameHeader
        title="Memory Match"
        subtitle={`Cocokkan Kartu (${mode.gridLabel})`}
        onBack={() => {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          onBack();
        }}
        onRestart={() => initGame(modeKey)}
      />

      {/* Panel Informasi (HUD) */}
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
            >
              <i className={soundOn ? 'fas fa-volume-up' : 'fas fa-volume-mute'} />
              <span>{soundOn ? 'Suara' : 'Senyap'}</span>
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
              <i className={banner.type === 'mismatch' ? 'fas fa-sync-alt' : 'fas fa-fish'} />
            </div>
          )}
          <div className="mm-edu-text">
            <div className="mm-edu-headline">{banner.headline}</div>
            <div className="mm-edu-fact">{banner.fact}</div>
          </div>
        </div>
      </div>

      {/* Papan Permainan */}
      <section className={`mm-board mode-${modeKey}`} aria-label={`Papan Memory Match ${mode.gridLabel}`}>
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
                <div className="mm-card-face mm-card-back">
                  <img
                    src="/logo-cansbetta.jpg"
                    alt="cans.betta x cupangklaten"
                    className="mm-back-logo"
                  />
                  <span className="mm-back-label">cans.betta</span>
                </div>

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

      {/* Daftar Jenis Ikan Ditemukan */}
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
              <div key={fish.id} className={`mm-guide-item ${found ? 'found' : 'locked'}`}>
                <img
                  src={fish.image}
                  alt={found ? fish.name : 'Belum ditemukan'}
                  className="mm-guide-thumb"
                />
                <div style={{ minWidth: 0 }}>
                  <div className="mm-guide-name">{found ? fish.name : '???'}</div>
                  <div className="mm-guide-cat">
                    {found ? fish.category : 'Cocokkan kartu untuk membuka'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <ArenaWinModal
        open={isWon}
        title="Selamat, Semua Cocok!"
        badgeText={isNewRecord ? `Rekor Terbaik Baru (${mode.label})!` : undefined}
        subtitle={`Kamu berhasil mencocokkan semua ${mode.pairs} pasang ikan cupang di ${mode.label} (${mode.gridLabel}).`}
        stars={stars}
        stats={[
          { label: 'Langkah', value: moves },
          { label: 'Waktu', value: formatTime(seconds) },
          { label: 'Akurasi', value: `${accuracy}%` },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru saja menyelesaikan Memory Match (${moves} langkah dalam ${formatTime(seconds)}) dan tertarik melihat koleksi ikan cupangnya.`}
        onPlayAgain={() => initGame(modeKey)}
        onBackToHub={onBack}
      />
    </div>
  );
}
