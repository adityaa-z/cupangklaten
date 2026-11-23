'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BETTA_CARDS } from './memoryFishData';
import { GameHeader, ArenaWinModal, playArenaTone } from './ArenaShared';

const TOTAL_TIME_SEC = 15.0;
const CANVAS_SIZE = 600;
const GRID_DIM = 24; // 24x24 = 576 sel tracking kebersihan real-time (0 lag!)
const BRUSH_RADIUS = 48;

function drawDirtyAlgaeLayer(ctx, size) {
  ctx.globalCompositeOperation = 'source-over';
  ctx.clearRect(0, 0, size, size);

  // 1. Lapisan embun buram / kaca kotor kehijauan
  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0, 'rgba(38, 64, 46, 0.94)');
  baseGrad.addColorStop(0.5, 'rgba(54, 83, 56, 0.91)');
  baseGrad.addColorStop(1, 'rgba(28, 52, 42, 0.95)');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // 2. Bercak lumut hijau organik
  for (let i = 0; i < 65; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 24 + Math.random() * 68;
    const g = ctx.createRadialGradient(rx, ry, 4, rx, ry, rad);
    g.addColorStop(0, i % 2 === 0 ? 'rgba(74, 124, 58, 0.65)' : 'rgba(132, 169, 108, 0.45)');
    g.addColorStop(1, 'rgba(74, 124, 58, 0)');
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // 3. Bercak kerak air / embun putih samar
  for (let i = 0; i < 40; i++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 12 + Math.random() * 34;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(226, 240, 232, 0.16)';
    ctx.fill();
  }
}

export default function CleanTankGame({ onBack }) {
  const [fishIdx, setFishIdx] = useState(0);
  const [cleanPct, setCleanPct] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SEC);
  const [hasStarted, setHasStarted] = useState(false);
  const [status, setStatus] = useState('playing'); // 'playing' | 'won' | 'lost'
  const [elapsedWin, setElapsedWin] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  const canvasRef = useRef(null);
  const cleanedGridRef = useRef(new Uint8Array(GRID_DIM * GRID_DIM));
  const cleanedCountRef = useRef(0);
  const isDrawingRef = useRef(false);
  const lastPtRef = useRef(null);
  const startMsRef = useRef(null);
  const timerRef = useRef(null);
  const modalTimeoutRef = useRef(null);

  const currentFish = BETTA_CARDS[fishIdx];

  const initTank = useCallback((targetIdx = fishIdx) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);

    setFishIdx(targetIdx);
    cleanedGridRef.current = new Uint8Array(GRID_DIM * GRID_DIM);
    cleanedCountRef.current = 0;
    isDrawingRef.current = false;
    lastPtRef.current = null;
    startMsRef.current = null;

    setCleanPct(0);
    setTimeLeft(TOTAL_TIME_SEC);
    setHasStarted(false);
    setStatus('playing');
    setElapsedWin(0);
    setShowModal(false);
    setBubbles([]);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawDirtyAlgaeLayer(ctx, CANVAS_SIZE);
    }
  }, [fishIdx]);

  useEffect(() => {
    const startFish = Math.floor(Math.random() * BETTA_CARDS.length);
    initTank(startFish);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer (100ms precision)
  useEffect(() => {
    if (!hasStarted || status !== 'playing') return;
    startMsRef.current = performance.now();

    timerRef.current = setInterval(() => {
      const elapsed = (performance.now() - startMsRef.current) / 1000;
      const remain = Math.max(0, TOTAL_TIME_SEC - elapsed);
      setTimeLeft(remain);

      if (remain <= 0) {
        clearInterval(timerRef.current);
        setStatus('lost');
        playArenaTone('wrong');
        setShowModal(true);
      }
    }, 80);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasStarted, status]);

  const markCleanedAt = (cx, cy) => {
    const grid = cleanedGridRef.current;
    const cellSize = CANVAS_SIZE / GRID_DIM;
    const rCells = Math.ceil(BRUSH_RADIUS / cellSize);
    const gx = Math.floor(cx / cellSize);
    const gy = Math.floor(cy / cellSize);

    for (let dy = -rCells; dy <= rCells; dy++) {
      for (let dx = -rCells; dx <= rCells; dx++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= GRID_DIM || ny < 0 || ny >= GRID_DIM) continue;
        const centerDist = Math.hypot((nx + 0.5) * cellSize - cx, (ny + 0.5) * cellSize - cy);
        if (centerDist <= BRUSH_RADIUS * 0.96) {
          const idx = ny * GRID_DIM + nx;
          if (grid[idx] === 0) {
            grid[idx] = 1;
            cleanedCountRef.current += 1;
          }
        }
      }
    }

    const pct = Math.min(100, Math.round((cleanedCountRef.current / (GRID_DIM * GRID_DIM)) * 100));
    setCleanPct(pct);

    if (pct >= 95 && status === 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      const elapsed = startMsRef.current
        ? Math.max(0.1, (performance.now() - startMsRef.current) / 1000)
        : 0.5;
      setElapsedWin(elapsed);
      setCleanPct(100);
      setStatus('won');
      playArenaTone('win');

      // Hapus sisa lumut 100% langsung
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }

      modalTimeoutRef.current = setTimeout(() => {
        setShowModal(true);
      }, 950);
    }
  };

  const scrubAt = (e) => {
    if (status !== 'playing' || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = BRUSH_RADIUS * 2;

    if (lastPtRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPtRef.current.x, lastPtRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lastPtRef.current = { x, y };
    markCleanedAt(x, y);

    // Spawn small soap bubble visual occasionally
    if (Math.random() < 0.35) {
      const bId = `${Date.now()}-${Math.random()}`;
      const xPct = (x / CANVAS_SIZE) * 100;
      const yPct = (y / CANVAS_SIZE) * 100;
      setBubbles((prev) => [...prev.slice(-10), { id: bId, x: xPct, y: yPct }]);
    }
  };

  const handlePointerDown = (e) => {
    if (status !== 'playing') return;
    if (!hasStarted) setHasStarted(true);
    isDrawingRef.current = true;
    lastPtRef.current = null;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubAt(e);
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || status !== 'playing') return;
    scrubAt(e);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
    lastPtRef.current = null;
  };

  const handleNextTank = () => {
    const nextIdx = (fishIdx + 1) % BETTA_CARDS.length;
    initTank(nextIdx);
  };

  const stars = status !== 'won' ? 1 : elapsedWin <= 6.5 ? 3 : elapsedWin <= 10.5 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Bersihkan Kaca"
        subtitle="Quick Swipe Clean"
        onBack={() => {
          if (timerRef.current) clearInterval(timerRef.current);
          if (modalTimeoutRef.current) clearTimeout(modalTimeoutRef.current);
          onBack();
        }}
        onRestart={() => initTank(fishIdx)}
      />

      <div className="cln-wrap">
        {/* HUD: Timer Mundur & Persentase Kebersihan */}
        <div className="cln-hud">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: timeLeft <= 4 && status === 'playing' ? '#ef4444' : 'var(--ck-text)', fontVariantNumeric: 'tabular-nums' }}>
              <i className="fas fa-stopwatch" style={{ marginRight: '6px' }} />
              {timeLeft.toFixed(1)} detik
            </div>

            <div style={{ fontSize: '14px', fontWeight: 800, color: cleanPct >= 95 ? '#22c55e' : 'var(--ck-text)', fontVariantNumeric: 'tabular-nums' }}>
              <i className="fas fa-sparkles" style={{ marginRight: '5px' }} />
              Bersih: {cleanPct}%
            </div>
          </div>

          <div className="qz-progress-track">
            <div
              className="qz-progress-fill"
              style={{
                width: `${cleanPct}%`,
                background: cleanPct >= 95 ? '#22c55e' : undefined,
              }}
            />
          </div>
        </div>

        {/* Tank Scrub Stage */}
        <div className={`cln-stage ${status === 'won' ? 'sparkle' : ''}`}>
          <img
            src={currentFish.image}
            alt={currentFish.name}
            className="cln-fish-bg"
            draggable={false}
          />

          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="cln-algae-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />

          {/* Soap Bubbles FX */}
          {bubbles.map((b) => (
            <span
              key={b.id}
              className="cln-soap-bubble"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            />
          ))}

          {!hasStarted && status === 'playing' && (
            <div className="cln-start-hint">
              <i className="fas fa-hand-sparkles" />
              <span>Gosok layar bolak-balik untuk membersihkan lumut!</span>
            </div>
          )}

          {status === 'won' && (
            <div className="cln-clean-banner">
              <i className="fas fa-check-circle" />
              <span>Kaca Kinclong! · {currentFish.name}</span>
            </div>
          )}
        </div>
      </div>

      <ArenaWinModal
        open={showModal}
        title={status === 'won' ? `Selesai dalam ${elapsedWin.toFixed(1)} detik!` : 'Waktu Habis!'}
        subtitle={
          status === 'won'
            ? `Kaca akuarium ${currentFish.name} kembali kinclong! ${currentFish.fact}`
            : `Kebersihan kaca mencapai ${cleanPct}%. Gosok lebih cepat hingga 95% sebelum 15 detik habis!`
        }
        stars={stars}
        previewImage={currentFish.image}
        previewLabel={currentFish.name}
        stats={
          status === 'won'
            ? [
                { label: 'Waktu', value: `${elapsedWin.toFixed(1)}s` },
                { label: 'Kebersihan', value: '100%' },
                { label: 'Jenis Ikan', value: currentFish.shortName },
              ]
            : [
                { label: 'Kebersihan', value: `${cleanPct}%` },
                { label: 'Target', value: '95%' },
              ]
        }
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru membersihkan akuarium ${currentFish.name} dalam ${elapsedWin.toFixed(1)} detik di Mini-Game Arena. Mau tanya koleksi ikannya!`}
        onNextLevel={status === 'won' ? handleNextTank : undefined}
        nextLevelLabel="Bersihkan Akuarium Lain"
        onPlayAgain={() => initTank(fishIdx)}
        onBackToHub={onBack}
      />
    </div>
  );
}
