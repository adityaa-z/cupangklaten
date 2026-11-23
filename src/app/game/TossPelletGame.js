'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BETTA_CARDS } from './memoryFishData';
import { GameHeader, ArenaWinModal, playArenaTone } from './ArenaShared';

const MAX_PELLETS = 5;
const BEST_KEY = 'ck_toss_pellet_best_v1';
const W = 420;
const H = 520;
const START_X = W / 2;
const START_Y = H - 64;

export default function TossPelletGame({ onBack }) {
  const [score, setScore] = useState(0);
  const [pelletsLeft, setPelletsLeft] = useState(MAX_PELLETS);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Usap (swipe) pelet di bawah ke atas menuju mulut toples!');
  const [windDisplay, setWindDisplay] = useState(0);

  const canvasRef = useRef(null);
  const fishImagesRef = useRef([]);
  const rafRef = useRef(null);

  // Mutable simulation state for smooth 60fps canvas rendering
  const simRef = useRef({
    score: 0,
    pelletsLeft: MAX_PELLETS,
    jarX: W / 2,
    jarY: 168,
    jarW: 112,
    jarH: 124,
    jarMouthW: 84,
    jarVx: 0,
    wind: 0,
    fishIdx: 0,
    pellet: { x: START_X, y: START_Y, vx: 0, vy: 0, active: false, radius: 11 },
    drag: { active: false, startX: 0, startY: 0, currX: 0, currY: 0, startTime: 0 },
    splash: null, // { x, y, t, hit }
    gameOver: false,
  });

  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);
      if (!Number.isNaN(saved)) setBestScore(saved);
    } catch {
      // Ignore
    }

    // Preload fish images for jar
    fishImagesRef.current = BETTA_CARDS.map((f) => {
      const img = new Image();
      img.src = f.image;
      return img;
    });
  }, []);

  const setupNextJar = useCallback((nextScore) => {
    const s = simRef.current;
    // Posisi acak baru
    s.jarX = 95 + Math.random() * (W - 190);
    s.fishIdx = nextScore % BETTA_CARDS.length;

    // Mulai skor ke-3: toples bergerak pelan kiri-kanan + angin samping ringan
    if (nextScore >= 3) {
      const speed = Math.min(115, 42 + (nextScore - 2) * 11);
      s.jarVx = (Math.random() > 0.5 ? 1 : -1) * speed;
      s.wind = Math.round(((Math.random() * 2 - 1) * Math.min(90, 28 + (nextScore - 2) * 8)));
    } else {
      s.jarVx = 0;
      s.wind = 0;
    }
    setWindDisplay(s.wind);
  }, []);

  const resetGame = useCallback(() => {
    const s = simRef.current;
    s.score = 0;
    s.pelletsLeft = MAX_PELLETS;
    s.jarX = W / 2;
    s.jarVx = 0;
    s.wind = 0;
    s.fishIdx = 0;
    s.pellet = { x: START_X, y: START_Y, vx: 0, vy: 0, active: false, radius: 11 };
    s.drag = { active: false, startX: 0, startY: 0, currX: 0, currY: 0, startTime: 0 };
    s.splash = null;
    s.gameOver = false;

    setScore(0);
    setPelletsLeft(MAX_PELLETS);
    setWindDisplay(0);
    setIsNewRecord(false);
    setIsGameOver(false);
    setStatusMsg('Usap (swipe) pelet di bawah ke atas menuju mulut toples!');
  }, []);

  useEffect(() => {
    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.035, (now - lastTime) / 1000);
      lastTime = now;

      const s = simRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas ? canvas.getContext('2d') : null;

      // Update Jar movement
      if (!s.gameOver && s.jarVx !== 0) {
        s.jarX += s.jarVx * dt;
        const minX = s.jarW / 2 + 22;
        const maxX = W - s.jarW / 2 - 22;
        if (s.jarX <= minX) {
          s.jarX = minX;
          s.jarVx = Math.abs(s.jarVx);
        } else if (s.jarX >= maxX) {
          s.jarX = maxX;
          s.jarVx = -Math.abs(s.jarVx);
        }
      }

      // Update Pellet physics
      if (s.pellet.active) {
        const prevY = s.pellet.y;
        s.pellet.vx += s.wind * 1.15 * dt;
        s.pellet.vy += 860 * dt; // Gravity
        s.pellet.x += s.pellet.vx * dt;
        s.pellet.y += s.pellet.vy * dt;

        const mouthTopY = s.jarY - s.jarH / 2 + 6;
        const mouthHalf = s.jarMouthW / 2;

        // Check if pellet enters jar mouth (while falling or peaking into opening)
        const crossedMouth =
          s.pellet.vy > -120 &&
          prevY <= mouthTopY + 18 &&
          s.pellet.y >= mouthTopY - 6 &&
          s.pellet.y <= mouthTopY + 34 &&
          Math.abs(s.pellet.x - s.jarX) <= mouthHalf;

        if (crossedMouth) {
          s.pellet.active = false;
          s.pellet.x = START_X;
          s.pellet.y = START_Y;
          s.score += 1;
          s.splash = { x: s.jarX, y: mouthTopY + 12, t: 1, hit: true };
          playArenaTone('correct');

          setScore(s.score);
          setStatusMsg(
            s.score >= 3
              ? `Masuk! Skor ${s.score} — Hati-hati, toples bergerak & ada angin!`
              : `Masuk! Ikan langsung menyambar pelet (+1)`
          );

          setBestScore((prevBest) => {
            if (s.score > prevBest) {
              setIsNewRecord(true);
              try {
                localStorage.setItem(BEST_KEY, String(s.score));
              } catch {
                // Ignore
              }
              return s.score;
            }
            return prevBest;
          });

          setupNextJar(s.score);
        } else if (
          s.pellet.y > H + 30 ||
          s.pellet.x < -30 ||
          s.pellet.x > W + 30 ||
          s.pellet.y < -120
        ) {
          // Missed!
          s.pellet.active = false;
          s.pellet.x = START_X;
          s.pellet.y = START_Y;
          s.pelletsLeft -= 1;
          s.splash = { x: Math.max(40, Math.min(W - 40, s.pellet.x)), y: H - 120, t: 1, hit: false };
          playArenaTone('wrong');

          setPelletsLeft(s.pelletsLeft);
          if (s.pelletsLeft <= 0) {
            s.gameOver = true;
            setIsGameOver(true);
            setStatusMsg('Stok pelet habis!');
            playArenaTone('win');
          } else {
            setStatusMsg(`Meleset! Sisa ${s.pelletsLeft} kesempatan lagi — atur arah usapan!`);
          }
        }
      }

      if (s.splash) {
        s.splash.t -= dt * 2.2;
        if (s.splash.t <= 0) s.splash = null;
      }

      // Draw Scene
      if (ctx) {
        // Background studio gradient
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0, '#0d1321');
        bg.addColorStop(0.65, '#111827');
        bg.addColorStop(1, '#1e293b');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        // Subtle shelf line behind jar
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(0, s.jarY + s.jarH / 2 + 2, W, 6);

        // Wind indicator bubbles if wind != 0
        if (s.wind !== 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          for (let i = 0; i < 6; i++) {
            const wx = ((now * (s.wind > 0 ? 0.08 : -0.08) + i * 75) % W + W) % W;
            const wy = 42 + i * 26;
            ctx.beginPath();
            ctx.arc(wx, wy, 3 + (i % 3), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // Draw Soliter Glass Jar
        const jx = s.jarX - s.jarW / 2;
        const jy = s.jarY - s.jarH / 2;

        // Water inside jar
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(jx + 4, jy + 22, s.jarW - 8, s.jarH - 26, [6, 6, 14, 14]);
        ctx.clip();

        const waterGrad = ctx.createLinearGradient(0, jy + 22, 0, jy + s.jarH);
        waterGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
        waterGrad.addColorStop(1, 'rgba(14, 116, 144, 0.5)');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(jx, jy + 22, s.jarW, s.jarH);

        // Draw betta fish photo circularly inside jar
        const fishImg = fishImagesRef.current[s.fishIdx];
        if (fishImg && fishImg.complete && fishImg.naturalWidth > 0) {
          const bob = Math.sin(now / 360) * 4;
          const imgSize = 74;
          ctx.save();
          ctx.beginPath();
          ctx.arc(s.jarX, s.jarY + 12 + bob, imgSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(fishImg, s.jarX - imgSize / 2, s.jarY + 12 + bob - imgSize / 2, imgSize, imgSize);
          ctx.restore();
        }
        ctx.restore();

        // Glass jar body outline
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.72)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(jx, jy + 10, s.jarW, s.jarH - 10, [10, 10, 16, 16]);
        ctx.stroke();

        // Open mouth rim (target area!)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.24)';
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(s.jarX, jy + 10, s.jarMouthW / 2, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Glass specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fillRect(jx + 10, jy + 24, 8, s.jarH - 42);

        // Splash / Hit FX
        if (s.splash) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, s.splash.t);
          ctx.font = '800 18px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = s.splash.hit ? '#4ade80' : '#f87171';
          ctx.fillText(
            s.splash.hit ? '+1 MASUK!' : 'MELESET!',
            s.splash.x,
            s.splash.y - (1 - s.splash.t) * 32
          );
          ctx.restore();
        }

        // Aim guide line while dragging
        if (s.drag.active && !s.pellet.active) {
          const dx = s.drag.currX - s.drag.startX;
          const dy = s.drag.currY - s.drag.startY;
          if (dy < -12) {
            ctx.save();
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(START_X, START_Y);
            ctx.lineTo(START_X + dx * 1.45, START_Y + dy * 1.45);
            ctx.stroke();
            ctx.restore();
          }
        }

        // Launch pad circle at bottom
        ctx.beginPath();
        ctx.arc(START_X, START_Y, 26, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pellet (either idle at bottom or flying)
        if (!s.gameOver) {
          const px = s.pellet.x;
          const py = s.pellet.y;
          const r = s.pellet.radius;
          const pGrad = ctx.createRadialGradient(px - 3, py - 3, 2, px, py, r);
          pGrad.addColorStop(0, '#fef08a');
          pGrad.addColorStop(0.55, '#f59e0b');
          pGrad.addColorStop(1, '#92400e');
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = pGrad;
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.stroke();
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [setupNextJar]);

  const getCanvasCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * W,
      y: ((e.clientY - rect.top) / rect.height) * H,
    };
  };

  const handlePointerDown = (e) => {
    const s = simRef.current;
    if (s.gameOver || s.pellet.active) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getCanvasCoords(e);
    s.drag = {
      active: true,
      startX: pt.x,
      startY: pt.y,
      currX: pt.x,
      currY: pt.y,
      startTime: performance.now(),
    };
  };

  const handlePointerMove = (e) => {
    const s = simRef.current;
    if (!s.drag.active) return;
    const pt = getCanvasCoords(e);
    s.drag.currX = pt.x;
    s.drag.currY = pt.y;
  };

  const handlePointerUp = (e) => {
    const s = simRef.current;
    if (!s.drag.active) return;
    const pt = getCanvasCoords(e);
    s.drag.active = false;

    const dx = pt.x - s.drag.startX;
    const dy = pt.y - s.drag.startY;
    const dist = Math.hypot(dx, dy);

    // Require upward swipe
    if (dy > -22 || dist < 24) {
      setStatusMsg('Usap lebih tegas ke arah atas menuju mulut toples!');
      return;
    }

    const elapsedSec = Math.max(0.12, Math.min(0.45, (performance.now() - s.drag.startTime) / 1000));
    const powerScale = Math.min(1.25, Math.max(0.75, 0.25 / elapsedSec));

    // Map swipe vector to launch velocity
    const vx = Math.max(-520, Math.min(520, dx * 3.1 * powerScale));
    const vy = Math.max(-1080, Math.min(-640, dy * 4.4 * powerScale));

    s.pellet = {
      x: START_X,
      y: START_Y,
      vx,
      vy,
      active: true,
      radius: 11,
    };
    playArenaTone('flip');
  };

  const stars = score >= 8 ? 3 : score >= 4 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Lempar Pelet"
        subtitle="Toss & Aim ke Toples"
        onBack={() => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          onBack();
        }}
        onRestart={resetGame}
      />

      <div className="toss-wrap">
        {/* HUD */}
        <div className="mm-stats-grid" style={{ marginBottom: '10px' }}>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Masuk</span>
            <span className="mm-stat-value">{score}</span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Kesempatan</span>
            <span className="mm-stat-value" style={{ display: 'inline-flex', justifyContent: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: n <= pelletsLeft ? '#f59e0b' : 'var(--ck-border-strong)',
                    display: 'inline-block',
                  }}
                />
              ))}
            </span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Angin</span>
            <span className="mm-stat-value" style={{ fontSize: '13.5px' }}>
              {windDisplay === 0 ? 'Tenang' : windDisplay > 0 ? `Kanan →` : `← Kiri`}
            </span>
          </div>
          <div className="mm-stat-card">
            <span className="mm-stat-label">Rekor</span>
            <span className="mm-stat-value">{bestScore}</span>
          </div>
        </div>

        <div className="mm-banner-slot" style={{ minHeight: '40px', marginBottom: '10px' }}>
          <div className="mm-edu-banner" style={{ padding: '7px 12px' }}>
            <div className="mm-edu-text" style={{ textAlign: 'center' }}>
              <div className="mm-edu-headline" style={{ fontSize: '12px' }}>{statusMsg}</div>
            </div>
          </div>
        </div>

        {/* Interactive Physics Canvas */}
        <div className="toss-canvas-shell">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="toss-canvas"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
          <div className="toss-hint-overlay">
            <i className="fas fa-hand-pointer" /> Usap ke atas dari bawah layar
          </div>
        </div>
      </div>

      <ArenaWinModal
        open={isGameOver}
        title="Sesi Lempar Pelet Selesai!"
        badgeText={isNewRecord && score > 0 ? `Rekor Baru: ${score} Lemparan Masuk!` : undefined}
        subtitle={`Kamu berhasil memasukkan ${score} butir pelet tepat ke mulut toples ikan cupang.`}
        stars={stars}
        stats={[
          { label: 'Skor Masuk', value: score },
          { label: 'Rekor', value: bestScore },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru main Lempar Pelet ke Toples dengan skor ${score} masuk dan tertarik melihat koleksi ikannya.`}
        onPlayAgain={resetGame}
        onBackToHub={onBack}
      />
    </div>
  );
}
