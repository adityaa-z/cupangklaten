'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BETTA_CARDS } from '../shared/bettaData';
import { GameHeader, ArenaWinModal, playArenaTone } from '../shared/ArenaShared';
import './serok-timing.css';

const MAX_LIVES = 3;
const BEST_KEY = 'ck_serok_best_v1';

function getRoundConfig(round) {
  // Zona hijau makin kecil & jarum makin cepat setiap ronde
  const zoneWidth = Math.max(10, 28 - (round - 1) * 2.2);
  // Posisi zona sedikit bervariasi di sekitar tengah (30%..70%) mulai ronde 2
  const maxOffset = round === 1 ? 0 : Math.min(18, (round - 1) * 4);
  const center = 50 + (Math.random() * 2 - 1) * maxOffset;
  const zoneStart = Math.max(8, Math.min(92 - zoneWidth, center - zoneWidth / 2));
  const speed = Math.min(175, 58 + (round - 1) * 14); // % per detik
  return {
    zoneStart,
    zoneWidth,
    speed,
    fish: BETTA_CARDS[(round - 1) % BETTA_CARDS.length],
  };
}

export default function SerokTimingGame({ onBack }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [bestRound, setBestRound] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [config, setConfig] = useState(() => getRoundConfig(1));
  const [needlePos, setNeedlePos] = useState(10);
  const [feedback, setFeedback] = useState(null); // { type: 'hit' | 'miss', text: string }
  const [fishAnim, setFishAnim] = useState('swim'); // 'swim' | 'caught' | 'escape'
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const needleRef = useRef(10);
  const dirRef = useRef(1);
  const lastTimeRef = useRef(null);
  const rafRef = useRef(null);
  const pauseTimerRef = useRef(null);

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
      if (!Number.isNaN(saved)) setBestRound(saved);
    } catch {
      // Ignore storage errors
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    const firstCfg = getRoundConfig(1);
    setRound(1);
    setScore(0);
    setCaughtCount(0);
    setLives(MAX_LIVES);
    setIsNewRecord(false);
    setConfig(firstCfg);
    needleRef.current = 10;
    dirRef.current = 1;
    lastTimeRef.current = null;
    setNeedlePos(10);
    setFeedback(null);
    setFishAnim('swim');
    setIsPaused(false);
    setIsGameOver(false);
  }, []);

  // 60fps needle animation
  useEffect(() => {
    if (isPaused || isGameOver) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const tick = (timestamp) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      let nextPos = needleRef.current + dirRef.current * config.speed * dt;
      if (nextPos >= 98) {
        nextPos = 98;
        dirRef.current = -1;
      } else if (nextPos <= 2) {
        nextPos = 2;
        dirRef.current = 1;
      }

      needleRef.current = nextPos;
      setNeedlePos(nextPos);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPaused, isGameOver, config.speed]);

  const handleSerok = useCallback(() => {
    if (isPaused || isGameOver) return;

    const pos = needleRef.current;
    const isHit = pos >= config.zoneStart && pos <= config.zoneStart + config.zoneWidth;
    setIsPaused(true);

    if (isHit) {
      const nextScore = score + 100;
      const nextCaught = caughtCount + 1;
      const nextRound = round + 1;

      setScore(nextScore);
      setCaughtCount(nextCaught);
      setFishAnim('caught');
      setFeedback({
        type: 'hit',
        text: `Terserok! ${config.fish.name} (+100 poin)`,
      });
      playArenaTone('correct');

      if (round > bestRound) {
        setBestRound(round);
        setIsNewRecord(true);
        try {
          localStorage.setItem(BEST_KEY, String(round));
        } catch {
          // Ignore
        }
      }

      pauseTimerRef.current = setTimeout(() => {
        const nextCfg = getRoundConfig(nextRound);
        setRound(nextRound);
        setConfig(nextCfg);
        needleRef.current = 5;
        dirRef.current = 1;
        setNeedlePos(5);
        setFishAnim('swim');
        setFeedback(null);
        setIsPaused(false);
      }, 900);
    } else {
      const nextLives = lives - 1;
      setLives(nextLives);
      setFishAnim('escape');
      setFeedback({
        type: 'miss',
        text: nextLives > 0 ? 'Meleset! Ikan kabur — coba ulang ronde ini.' : 'Meleset! Nyawa habis.',
      });
      playArenaTone('wrong');

      pauseTimerRef.current = setTimeout(() => {
        if (nextLives <= 0) {
          setIsGameOver(true);
          playArenaTone('win');
        } else {
          setFishAnim('swim');
          setFeedback(null);
          setIsPaused(false);
        }
      }, 950);
    }
  }, [isPaused, isGameOver, config, score, caughtCount, round, lives, bestRound]);

  // Keyboard support (Space / Enter)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleSerok();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSerok]);

  const stars = caughtCount >= 8 ? 3 : caughtCount >= 4 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Tarik Ulur Serok"
        subtitle={`Ronde ${round} · Timing Bar`}
        onBack={() => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
          onBack();
        }}
        onRestart={resetGame}
      />

      <div className="srk-wrap">
        {/* HUD Bar */}
        <div className="mm-stats-grid" style={{ marginBottom: '12px' }}>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Ronde</span>
            <span className="mm-stat-value">{round}</span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Skor</span>
            <span className="mm-stat-value">{score}</span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Nyawa</span>
            <span className="mm-stat-value" style={{ display: 'inline-flex', justifyContent: 'center', gap: '4px' }}>
              {[1, 2, 3].map((n) => (
                <i
                  key={n}
                  className="fas fa-heart"
                  style={{ fontSize: '14px', color: n <= lives ? '#ef4444' : 'var(--ck-border-strong)' }}
                />
              ))}
            </span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Rekor</span>
            <span className="mm-stat-value">R{Math.max(bestRound, caughtCount)}</span>
          </div>
        </div>

        {/* Tank Display */}
        <div className={`srk-tank ${fishAnim}`}>
          <div className="srk-water-surface" />
          <div className="srk-fish-badge">
            <span>Target: {config.fish.name}</span>
          </div>

          <div className={`srk-fish-stage ${fishAnim}`}>
            <img src={config.fish.image} alt={config.fish.name} draggable={false} />
          </div>

          {fishAnim === 'caught' && (
            <div className="srk-net-fx">
              <i className="fas fa-check-circle" />
              <span>MASUK WADAH!</span>
            </div>
          )}

          {fishAnim === 'escape' && (
            <div className="srk-escape-fx">
              <i className="fas fa-water" />
              <span>IKAN KABUR!</span>
            </div>
          )}
        </div>

        {/* Feedback Line */}
        <div className="mm-banner-slot" style={{ minHeight: '42px', margin: '12px 0' }}>
          <div
            className={`mm-edu-banner ${
              feedback?.type === 'hit' ? 'matched' : feedback?.type === 'miss' ? 'mismatch' : ''
            }`}
            style={{ padding: '8px 12px' }}
          >
            <div className="mm-edu-text" style={{ textAlign: 'center' }}>
              <div className="mm-edu-headline" style={{ fontSize: '12.5px' }}>
                {feedback
                  ? feedback.text
                  : 'Tekan tombol SEROK! tepat saat jarum berada di zona hijau.'}
              </div>
            </div>
          </div>
        </div>

        {/* Timing Bar */}
        <div className="srk-bar-shell">
          <div className="srk-bar-track">
            <div
              className="srk-bar-zone"
              style={{ left: `${config.zoneStart}%`, width: `${config.zoneWidth}%` }}
            />
            <div className="srk-bar-needle" style={{ left: `${needlePos}%` }} />
          </div>
        </div>

        {/* Big SEROK Button */}
        <button
          type="button"
          className="srk-action-btn"
          onClick={handleSerok}
          disabled={isPaused || isGameOver}
        >
          <i className="fas fa-bullseye" />
          <span>SEROK!</span>
        </button>
      </div>

      <ArenaWinModal
        open={isGameOver}
        title="Sesi Serok Selesai!"
        badgeText={isNewRecord && caughtCount > 0 ? `Rekor Ronde Baru: Ronde ${bestRound}!` : undefined}
        subtitle={`Kamu berhasil menyerok ${caughtCount} ekor ikan cupang dan mencapai Ronde ${round}.`}
        stars={stars}
        stats={[
          { label: 'Ikan Terserok', value: caughtCount },
          { label: 'Total Skor', value: score },
          { label: 'Rekor Ronde', value: `R${Math.max(bestRound, caughtCount)}` },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru main Tarik Ulur Serok Ikan dan berhasil menyerok ${caughtCount} ikan (${score} poin). Mau lihat stok ikannya dong!`}
        onPlayAgain={resetGame}
        onBackToHub={onBack}
      />
    </div>
  );
}
