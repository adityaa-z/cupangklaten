'use client';

import React, { useState } from 'react';
import { getLocalDateString } from './gameState';

function calcCheckinPoints(streakDays) {
  let base = 25;
  if (streakDays >= 30) base += 120;
  else if (streakDays >= 14) base += 60;
  else if (streakDays >= 7) base += 30;
  else if (streakDays >= 3) base += 15;
  return base;
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(2, 6, 23, 0.8)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '16px',
};

const modalStyle = {
  background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid #334155',
  borderRadius: '18px',
  padding: '24px 20px',
  maxWidth: '350px',
  width: '100%',
  textAlign: 'center',
  color: '#f1f5f9',
  boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
};

export default function CheckinModal({ gameState, onClaim, onClose }) {
  const [justClaimed, setJustClaimed] = useState(false);

  const today = getLocalDateString();
  const { lastCheckinDate, streakDays } = gameState.checkin;
  const alreadyClaimedToday = lastCheckinDate === today;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  const isConsecutive = lastCheckinDate === yesterdayStr;
  const displayStreak = alreadyClaimedToday ? streakDays : isConsecutive ? streakDays + 1 : 1;
  const pts = calcCheckinPoints(displayStreak);

  function handleClaim() {
    if (alreadyClaimedToday || justClaimed) return;
    setJustClaimed(true);
    setTimeout(() => {
      onClaim(pts, displayStreak);
    }, 900);
  }

  const streakEmoji =
    displayStreak >= 30 ? '🏆' : displayStreak >= 14 ? '💎' : displayStreak >= 7 ? '🔥' : displayStreak >= 3 ? '✨' : '📅';
  const bonusText =
    displayStreak >= 30
      ? 'Termasuk +120 bonus Streak 30 Hari!'
      : displayStreak >= 14
        ? 'Termasuk +60 bonus Streak 14 Hari!'
        : displayStreak >= 7
          ? 'Termasuk +30 bonus Streak 7 Hari!'
          : displayStreak >= 3
            ? 'Termasuk +15 bonus Streak 3 Hari!'
            : 'Check-in rutin 3 hari berturut-turut untuk bonus!';

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        <div style={{ fontSize: '46px', marginBottom: '6px' }}>{justClaimed ? '🎉' : streakEmoji}</div>
        <h2 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '4px', color: '#fbbf24' }}>
          {justClaimed ? 'Check-In Berhasil!' : alreadyClaimedToday ? 'Sudah Check-In Hari Ini' : 'Check-In Harian Gratis'}
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '14px' }}>
          {alreadyClaimedToday
            ? 'Kembali besok untuk melanjutkan streak & kumpulkan lebih banyak poin gratis!'
            : 'Klaim poin gratis untuk buka jenis ikan, upgrade akuarium, & tukar pakan.'}
        </p>

        {/* Streak box */}
        <div style={{
          background: 'rgba(30, 58, 95, 0.55)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '14px',
        }}>
          {!alreadyClaimedToday && (
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#fbbf24' }}>+{pts} Poin</div>
          )}
          <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>{bonusText}</div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Streak aktif:</span>
            <span style={{
              background: '#fbbf24',
              color: '#0f172a',
              borderRadius: '20px',
              padding: '2px 10px',
              fontWeight: 800,
              fontSize: '13px',
            }}>
              Hari ke-{displayStreak}
            </span>
          </div>
        </div>

        {/* Streak milestone hints */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
          {[
            [3, 15, '✨'],
            [7, 30, '🔥'],
            [14, 60, '💎'],
            [30, 120, '🏆'],
          ].map(([day, bonus, emoji]) => {
            const reached = displayStreak >= day;
            return (
              <div
                key={day}
                style={{
                  background: reached ? 'rgba(251,191,36,0.12)' : 'rgba(15,23,42,0.6)',
                  border: reached ? '1px solid rgba(251,191,36,0.5)' : '1px solid #334155',
                  borderRadius: '10px',
                  padding: '6px 4px',
                  textAlign: 'center',
                  opacity: reached ? 1 : 0.55,
                }}
              >
                <div style={{ fontSize: '16px' }}>{emoji}</div>
                <div style={{ fontSize: '11px', color: '#fbbf24', fontWeight: 700 }}>+{bonus}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Hr {day}</div>
              </div>
            );
          })}
        </div>

        {alreadyClaimedToday ? (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: '#1e293b',
              color: '#f1f5f9',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✓ Tutup
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={justClaimed}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: justClaimed
                ? '#22c55e'
                : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '15px',
              cursor: justClaimed ? 'default' : 'pointer',
            }}
          >
            {justClaimed ? `✓ +${pts} Poin Diterima!` : `🎁 Klaim +${pts} Poin Gratis`}
          </button>
        )}
      </div>
    </div>
  );
}
