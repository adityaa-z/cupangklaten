'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function playArenaTone(type, soundEnabled = true) {
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

    if (type === 'flip' || type === 'slide') {
      triggerNote(440, 0, 0.07, 0.05, 'triangle');
    } else if (type === 'match' || type === 'correct' || type === 'found') {
      triggerNote(523.25, 0, 0.14, 0.08, 'sine');
      triggerNote(659.25, 0.08, 0.18, 0.08, 'sine');
    } else if (type === 'mismatch' || type === 'wrong') {
      triggerNote(250, 0, 0.11, 0.05, 'triangle');
      triggerNote(195, 0.09, 0.14, 0.04, 'triangle');
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
    // Ignore audio context errors
  }
}

export function GameHeader({ title, subtitle, onBack, onRestart, rightExtra }) {
  return (
    <div className="arena-game-header">
      <button type="button" className="arena-back-btn" onClick={onBack}>
        <i className="fas fa-arrow-left" />
        <span>
          Kembali<span className="arena-back-label-long"> ke Menu Game</span>
        </span>
      </button>

      <div className="arena-header-center">
        <h1 className="arena-header-title">{title}</h1>
        {subtitle && <div className="arena-header-sub">{subtitle}</div>}
      </div>

      <div className="arena-header-right">
        {rightExtra}
        <button type="button" className="arena-restart-btn" onClick={onRestart}>
          <i className="fas fa-redo-alt" />
          <span>Ulangi</span>
        </button>
      </div>
    </div>
  );
}

export function ArenaWinModal({
  open,
  title = 'Selamat!',
  subtitle,
  badgeText,
  stars = 3,
  stats = [],
  previewImage,
  previewLabel,
  waMessage,
  onPlayAgain,
  onNextLevel,
  nextLevelLabel = 'Level Berikutnya',
  onBackToHub,
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const waText =
    waMessage ||
    'Halo Admin cans.betta x cupangklaten! Saya baru bermain di Betta Mini-Game Arena dan ingin melihat koleksi ikan cupangnya.';

  return (
    <div className="mm-win-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="mm-win-modal">
        {previewImage ? (
          <div style={{ width: '92px', height: '92px', margin: '0 auto 12px', borderRadius: '14px', overflow: 'hidden', border: '2px solid #22c55e', background: '#000' }}>
            <img src={previewImage} alt={previewLabel || title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        ) : (
          <div className="mm-win-trophy">
            <i className="fas fa-trophy" />
          </div>
        )}

        <div className="mm-win-stars" aria-label={`${stars} dari 3 bintang`}>
          {[1, 2, 3].map((n) => (
            <i
              key={n}
              className="fas fa-star"
              style={{ color: n <= stars ? '#f59e0b' : 'var(--ck-border-strong)' }}
            />
          ))}
        </div>

        <h2 className="mm-win-title">{title}</h2>

        {badgeText && (
          <div className="mm-win-record-pill">
            <i className="fas fa-medal" />
            <span>{badgeText}</span>
          </div>
        )}

        {subtitle && <p className="mm-win-sub">{subtitle}</p>}

        {stats.length > 0 && (
          <div
            className="mm-win-summary"
            style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)` }}
          >
            {stats.map((st, idx) => (
              <div key={idx} className="mm-win-stat">
                <span className="mm-win-stat-label">{st.label}</span>
                <span className="mm-win-stat-val">{st.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mm-win-actions">
          {onNextLevel && (
            <button type="button" className="mm-cta-btn mm-cta-primary" onClick={onNextLevel}>
              <i className="fas fa-forward" />
              <span>{nextLevelLabel}</span>
            </button>
          )}

          <button
            type="button"
            className={`mm-cta-btn ${onNextLevel ? 'mm-cta-secondary' : 'mm-cta-primary'}`}
            onClick={onPlayAgain}
          >
            <i className="fas fa-redo-alt" />
            <span>Main Lagi</span>
          </button>

          <button type="button" className="mm-cta-btn mm-cta-secondary" onClick={onBackToHub}>
            <i className="fas fa-th-large" />
            <span>Pilih Game Lain</span>
          </button>

          <div className="mm-cta-row">
            <Link href="/stok" className="mm-cta-btn mm-cta-secondary">
              <i className="fas fa-fish" />
              <span>Lihat Koleksi</span>
            </Link>
            <a
              href={`https://wa.me/628992020444?text=${encodeURIComponent(waText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mm-cta-btn mm-cta-wa"
            >
              <i className="fab fa-whatsapp" style={{ fontSize: '15px' }} />
              <span>Hubungi Kami</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
