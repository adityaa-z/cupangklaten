'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameHeader, ArenaWinModal, formatTime, playArenaTone } from './ArenaShared';

/**
 * 3 Level Cari Perbedaan (Spot the Difference)
 * Menggunakan foto asli ikan cupang 1:1 dan 5 detail perbedaan presisi
 * yang digambar ke canvas Gambar Asli vs Gambar Modifikasi pada koordinat (x%, y%).
 */
const SPOT_LEVELS = [
  {
    id: 'lvl-1',
    title: 'Level 1 · Plakat Koi Galaxy',
    fishName: 'Plakat Koi Galaxy',
    image: '/pk-001.png',
    differences: [
      { id: 'd1', x: 18, y: 17, r: 8, type: 'bubbles', label: 'Gelembung udara kiri atas', drawOn: 'original' },
      { id: 'd2', x: 58, y: 26, r: 8, type: 'fin-glow', color: '#38bdf8', label: 'Kilau sisik biru di sirip punggung', drawOn: 'modified' },
      { id: 'd3', x: 84, y: 47, r: 8.5, type: 'pellet', label: 'Pelet ikan terapung di kanan', drawOn: 'modified' },
      { id: 'd4', x: 19, y: 74, r: 8.5, type: 'leaf-bud', label: 'Kuncup daun hijau di kiri bawah', drawOn: 'original' },
      { id: 'd5', x: 76, y: 84, r: 8.5, type: 'pebble', color: '#f59e0b', label: 'Kerikil keemasan di dasar kanan', drawOn: 'modified' },
    ],
  },
  {
    id: 'lvl-2',
    title: 'Level 2 · Blue Rim',
    fishName: 'Blue Rim',
    image: '/memory-game/blue-rim.jpg',
    differences: [
      { id: 'd1', x: 78, y: 18, r: 8, type: 'bubbles', label: 'Gelembung permukaan kanan atas', drawOn: 'original' },
      { id: 'd2', x: 24, y: 31, r: 8, type: 'pellet', label: 'Butiran pakan di kiri atas', drawOn: 'modified' },
      { id: 'd3', x: 75, y: 48, r: 8.5, type: 'fin-glow', color: '#f43f5e', label: 'Bintik merah muda di ekor', drawOn: 'modified' },
      { id: 'd4', x: 18, y: 79, r: 8.5, type: 'leaf-bud', label: 'Daun muda di pojok kiri bawah', drawOn: 'modified' },
      { id: 'd5', x: 82, y: 83, r: 8.5, type: 'pebble', color: '#38bdf8', label: 'Batu kristal biru di dasar kanan', drawOn: 'original' },
    ],
  },
  {
    id: 'lvl-3',
    title: 'Level 3 · Halfmoon Copper Gold',
    fishName: 'Halfmoon Copper Gold',
    image: '/hm-012.png',
    differences: [
      { id: 'd1', x: 20, y: 20, r: 8, type: 'bubbles', label: 'Rangkaian gelembung di kiri atas', drawOn: 'modified' },
      { id: 'd2', x: 84, y: 23, r: 8, type: 'pellet', label: 'Pakan terapung di kanan atas', drawOn: 'original' },
      { id: 'd3', x: 70, y: 44, r: 8.5, type: 'fin-glow', color: '#a855f7', label: 'Kilau ungu di tengah ekor', drawOn: 'modified' },
      { id: 'd4', x: 18, y: 76, r: 8.5, type: 'leaf-bud', label: 'Tunas tanaman air kiri bawah', drawOn: 'original' },
      { id: 'd5', x: 78, y: 86, r: 8.5, type: 'pebble', color: '#e2e8f0', label: 'Kerikil putih di dasar kanan', drawOn: 'modified' },
    ],
  },
];

function drawDifferenceDetail(ctx, diff, size) {
  const cx = (diff.x / 100) * size;
  const cy = (diff.y / 100) * size;

  ctx.save();

  if (diff.type === 'bubbles') {
    const bubbles = [
      { dx: 0, dy: 0, rad: size * 0.022 },
      { dx: size * 0.028, dy: -size * 0.024, rad: size * 0.015 },
      { dx: -size * 0.022, dy: size * 0.026, rad: size * 0.011 },
    ];
    bubbles.forEach((b) => {
      const bx = cx + b.dx;
      const by = cy + b.dy;
      const grad = ctx.createRadialGradient(bx - b.rad * 0.35, by - b.rad * 0.35, b.rad * 0.1, bx, by, b.rad);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      grad.addColorStop(0.45, 'rgba(186, 230, 253, 0.38)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
      ctx.beginPath();
      ctx.arc(bx, by, b.rad, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.stroke();
    });
  } else if (diff.type === 'fin-glow') {
    const rad = size * 0.042;
    const grad = ctx.createRadialGradient(cx, cy, rad * 0.12, cx, cy, rad);
    grad.addColorStop(0, diff.color || '#38bdf8');
    grad.addColorStop(0.55, `${diff.color || '#38bdf8'}aa`);
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Small pearl star glint inside
    ctx.beginPath();
    ctx.arc(cx - rad * 0.18, cy - rad * 0.18, rad * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fill();
  } else if (diff.type === 'pellet') {
    const rad = size * 0.022;
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 10;
    const grad = ctx.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, rad * 0.1, cx, cy, rad);
    grad.addColorStop(0, '#fde68a');
    grad.addColorStop(0.6, '#d97706');
    grad.addColorStop(1, '#78350f');
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(254, 243, 199, 0.8)';
    ctx.stroke();
  } else if (diff.type === 'leaf-bud') {
    ctx.translate(cx, cy);
    ctx.rotate(-0.45);
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    ctx.shadowBlur = 10;
    const rx = size * 0.042;
    const ry = size * 0.02;
    const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0, '#86efac');
    grad.addColorStop(0.55, '#22c55e');
    grad.addColorStop(1, '#14532d');
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(-rx * 0.85, 0);
    ctx.lineTo(rx * 0.85, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(220, 252, 231, 0.78)';
    ctx.stroke();
  } else if (diff.type === 'pebble') {
    ctx.translate(cx, cy);
    ctx.rotate(0.2);
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 10;
    const rx = size * 0.036;
    const ry = size * 0.023;
    const grad = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 2, 0, 0, rx);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, diff.color || '#f59e0b');
    grad.addColorStop(1, '#1e293b');
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.stroke();
  }

  ctx.restore();
}

export default function SpotDiffGame({ onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [foundIds, setFoundIds] = useState([]);
  const [missMark, setMissMark] = useState(null);
  const [wrongTaps, setWrongTaps] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hintId, setHintId] = useState(null);
  const [statusText, setStatusText] = useState('Amati kedua gambar lalu ketuk area yang berbeda.');
  const [isWon, setIsWon] = useState(false);

  const origCanvasRef = useRef(null);
  const modCanvasRef = useRef(null);
  const missTimeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);

  const level = SPOT_LEVELS[levelIdx];
  const totalDiffs = level.differences.length;

  const resetLevel = useCallback((targetIdx = levelIdx) => {
    if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setLevelIdx(targetIdx);
    setFoundIds([]);
    setMissMark(null);
    setWrongTaps(0);
    setSeconds(0);
    setHintId(null);
    setIsWon(false);
    setStatusText('Amati kedua gambar lalu ketuk 5 detail yang berbeda.');
  }, [levelIdx]);

  // Draw Original & Modified Canvases whenever level changes
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = level.image;
    img.onload = () => {
      if (!active) return;
      const size = 800;

      const drawTo = (canvas, side) => {
        if (!canvas) return;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);

        level.differences.forEach((diff) => {
          if (diff.drawOn === side) {
            drawDifferenceDetail(ctx, diff, size);
          }
        });
      };

      drawTo(origCanvasRef.current, 'original');
      drawTo(modCanvasRef.current, 'modified');
    };

    return () => {
      active = false;
    };
  }, [level]);

  // Timer
  useEffect(() => {
    if (isWon) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWon, levelIdx]);

  useEffect(() => {
    return () => {
      if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, []);

  const handleStageTap = (side, e) => {
    if (isWon) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Check against unfound differences
    const hit = level.differences.find((d) => {
      if (foundIds.includes(d.id)) return false;
      const dist = Math.hypot(xPct - d.x, yPct - d.y);
      return dist <= d.r + 2.2; // Toleransi sentuhan jari HP
    });

    if (hit) {
      const nextFound = [...foundIds, hit.id];
      setFoundIds(nextFound);
      setHintId(null);
      setStatusText(`Ketemu! (${nextFound.length}/${totalDiffs}) — ${hit.label}`);
      playArenaTone('found');

      if (nextFound.length === totalDiffs) {
        setIsWon(true);
        playArenaTone('win');
      }
      return;
    }

    // Check if user tapped an already found spot — ignore silently
    const alreadyFound = level.differences.find((d) => {
      if (!foundIds.includes(d.id)) return false;
      return Math.hypot(xPct - d.x, yPct - d.y) <= d.r + 2;
    });
    if (alreadyFound) return;

    // Missed tap
    setWrongTaps((prev) => prev + 1);
    setMissMark({ side, x: xPct, y: yPct, key: Date.now() });
    setStatusText('Bukan di situ — perhatikan detail gelembung, sirip, daun, atau kerikil!');
    playArenaTone('wrong');

    if (missTimeoutRef.current) clearTimeout(missTimeoutRef.current);
    missTimeoutRef.current = setTimeout(() => {
      setMissMark(null);
    }, 650);
  };

  const handleHint = () => {
    if (isWon) return;
    const remaining = level.differences.find((d) => !foundIds.includes(d.id));
    if (!remaining) return;
    setHintId(remaining.id);
    setStatusText(`Petunjuk aktif: cek area ${remaining.label.toLowerCase()}!`);
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = setTimeout(() => {
      setHintId(null);
    }, 2600);
  };

  const hasNextLevel = levelIdx + 1 < SPOT_LEVELS.length;
  const stars = wrongTaps <= 2 ? 3 : wrongTaps <= 5 ? 2 : 1;

  const renderMarkers = (side) => (
    <>
      {level.differences
        .filter((d) => foundIds.includes(d.id))
        .map((d) => (
          <div
            key={d.id}
            className="sd-found-ring"
            style={{
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: `${d.r * 2.1}%`,
              height: `${d.r * 2.1}%`,
            }}
          />
        ))}

      {hintId &&
        level.differences
          .filter((d) => d.id === hintId)
          .map((d) => (
            <div
              key={`hint-${d.id}`}
              className="sd-hint-ring"
              style={{
                left: `${d.x}%`,
                top: `${d.y}%`,
                width: `${d.r * 2.4}%`,
                height: `${d.r * 2.4}%`,
              }}
            />
          ))}

      {missMark && missMark.side === side && (
        <div
          key={missMark.key}
          className="sd-miss-mark"
          style={{ left: `${missMark.x}%`, top: `${missMark.y}%` }}
        >
          <i className="fas fa-times" />
        </div>
      )}
    </>
  );

  return (
    <div>
      <GameHeader
        title="Cari Perbedaan"
        subtitle={level.title}
        onBack={onBack}
        onRestart={() => resetLevel(levelIdx)}
      />

      {/* HUD Progress & Level Selector */}
      <div className="sd-hud">
        <div className="mm-mode-switch" role="tablist" aria-label="Pilih Level">
          {SPOT_LEVELS.map((lv, idx) => (
            <button
              key={lv.id}
              type="button"
              role="tab"
              aria-selected={idx === levelIdx}
              className={`mm-mode-btn ${idx === levelIdx ? 'active' : ''}`}
              onClick={() => resetLevel(idx)}
            >
              <span>Lv {idx + 1}</span>
            </button>
          ))}
        </div>

        <div className="sd-dots-wrap" aria-label={`${foundIds.length} dari ${totalDiffs} perbedaan ditemukan`}>
          {level.differences.map((d, idx) => {
            const isFound = idx < foundIds.length;
            return (
              <span key={d.id} className={`sd-dot ${isFound ? 'found' : ''}`}>
                <i className="fas fa-check" />
              </span>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
            <i className="fas fa-clock" style={{ marginRight: '5px', color: 'var(--ck-text-muted)' }} />
            {formatTime(seconds)}
          </span>
          <button type="button" className="mm-icon-btn" onClick={handleHint} style={{ height: '30px', fontSize: '11.5px' }}>
            <i className="fas fa-lightbulb" />
            <span>Hint</span>
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="mm-banner-slot" style={{ minHeight: '44px', marginBottom: '12px' }}>
        <div className={`mm-edu-banner ${foundIds.length > 0 && !missMark ? 'matched' : ''}`} style={{ padding: '8px 12px' }}>
          <div className="mm-edu-icon" style={{ width: '30px', height: '30px', fontSize: '12px' }}>
            <i className="fas fa-search" />
          </div>
          <div className="mm-edu-text">
            <div className="mm-edu-headline" style={{ fontSize: '12.5px' }}>{statusText}</div>
          </div>
        </div>
      </div>

      {/* 2 Gambar: Atas-Bawah di HP, Kiri-Kanan di Desktop */}
      <div className="sd-boards-grid">
        <div className="sd-canvas-card">
          <span className="sd-canvas-label">Gambar A</span>
          <div className="sd-canvas-stage" onClick={(e) => handleStageTap('original', e)}>
            <canvas ref={origCanvasRef} />
            {renderMarkers('original')}
          </div>
        </div>

        <div className="sd-canvas-card">
          <span className="sd-canvas-label">Gambar B</span>
          <div className="sd-canvas-stage" onClick={(e) => handleStageTap('modified', e)}>
            <canvas ref={modCanvasRef} />
            {renderMarkers('modified')}
          </div>
        </div>
      </div>

      <ArenaWinModal
        open={isWon}
        title="Semua 5 Perbedaan Ketemu!"
        subtitle={`Mata kamu jeli banget! Semua detail berbeda pada foto ${level.fishName} berhasil ditemukan.`}
        stars={stars}
        previewImage={level.image}
        previewLabel={level.fishName}
        stats={[
          { label: 'Ditemukan', value: `${totalDiffs} / ${totalDiffs}` },
          { label: 'Waktu', value: formatTime(seconds) },
          { label: 'Salah Ketuk', value: wrongTaps },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru menyelesaikan game Cari Perbedaan ${level.fishName} dalam ${formatTime(seconds)} dan tertarik melihat koleksi ikannya.`}
        onNextLevel={hasNextLevel ? () => resetLevel(levelIdx + 1) : undefined}
        nextLevelLabel={`Lanjut ke Level ${levelIdx + 2}`}
        onPlayAgain={() => resetLevel(levelIdx)}
        onBackToHub={onBack}
      />
    </div>
  );
}
