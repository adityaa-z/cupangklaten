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
    }, 750);
  }

  const bonusText =
    displayStreak >= 30
      ? 'Termasuk bonus Streak 30 Hari (+120)'
      : displayStreak >= 14
        ? 'Termasuk bonus Streak 14 Hari (+60)'
        : displayStreak >= 7
          ? 'Termasuk bonus Streak 7 Hari (+30)'
          : displayStreak >= 3
            ? 'Termasuk bonus Streak 3 Hari (+15)'
            : 'Pertahankan check-in hingga hari ke-3 untuk bonus streak';

  return (
    <div className="ck-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="ck-modal-card" style={{ maxWidth: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-calendar-check" style={{ color: 'var(--ck-accent)', fontSize: '15px' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {justClaimed ? 'Check-In Berhasil' : alreadyClaimedToday ? 'Check-In Harian' : 'Klaim Check-In Harian'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ck-text-muted)', fontSize: '17px', cursor: 'pointer' }}
            aria-label="Tutup"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <p style={{ color: 'var(--ck-text-2)', fontSize: '12.5px', margin: '0 0 14px', lineHeight: 1.5 }}>
          {alreadyClaimedToday
            ? 'Poin harian hari ini sudah diklaim. Kembali besok untuk melanjutkan streak.'
            : 'Klaim poin gratis setiap hari untuk membuka jenis ikan, upgrade soliter, dan menukar pakan.'}
        </p>

        <div style={{
          background: 'var(--ck-surface-2)',
          border: '1px solid var(--ck-border)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '14px',
          textAlign: 'center',
        }}>
          {!alreadyClaimedToday && (
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ck-text)', letterSpacing: '-0.02em' }}>
              +{pts} Poin
            </div>
          )}
          <div style={{ fontSize: '11.5px', color: 'var(--ck-ok)', marginTop: '3px' }}>{bonusText}</div>
          <div style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--ck-accent-soft)',
            border: '1px solid var(--ck-accent-border)',
            borderRadius: '99px',
            padding: '3px 12px',
            fontSize: '12px',
            color: 'var(--ck-text)',
            fontWeight: 700,
          }}>
            <i className="fas fa-fire" style={{ fontSize: '11px' }} />
            Streak Hari ke-{displayStreak}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
          {[[3, 15], [7, 30], [14, 60], [30, 120]].map(([day, bonus]) => {
            const reached = displayStreak >= day;
            return (
              <div
                key={day}
                style={{
                  background: reached ? 'var(--ck-accent-soft)' : 'var(--ck-surface-2)',
                  border: reached ? '1px solid var(--ck-accent-border)' : '1px solid var(--ck-border)',
                  borderRadius: '9px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  opacity: reached ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: '12px', color: reached ? 'var(--ck-text)' : 'var(--ck-text-muted)', fontWeight: 700 }}>+{bonus}</div>
                <div style={{ fontSize: '10px', color: 'var(--ck-text-muted)', marginTop: '2px' }}>Hari {day}</div>
              </div>
            );
          })}
        </div>

        {alreadyClaimedToday ? (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '9px',
              border: '1px solid var(--ck-border-strong)',
              background: 'var(--ck-surface-2)',
              color: 'var(--ck-text)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        ) : (
          <button onClick={handleClaim} disabled={justClaimed} className="ck-btn-primary">
            {justClaimed ? `+${pts} Poin Ditambahkan` : `Klaim +${pts} Poin`}
          </button>
        )}
      </div>
    </div>
  );
}
