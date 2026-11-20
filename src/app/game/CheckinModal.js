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
            <i className="fas fa-calendar-check" style={{ color: '#d9a441', fontSize: '15px' }} />
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {justClaimed ? 'Check-In Berhasil' : alreadyClaimedToday ? 'Check-In Harian' : 'Klaim Check-In Harian'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '17px', cursor: 'pointer' }}
            aria-label="Tutup"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <p style={{ color: '#9ca3af', fontSize: '12.5px', margin: '0 0 14px', lineHeight: 1.5 }}>
          {alreadyClaimedToday
            ? 'Poin harian hari ini sudah diklaim. Kembali besok untuk melanjutkan streak.'
            : 'Klaim poin gratis setiap hari untuk membuka jenis ikan, upgrade soliter, dan menukar pakan.'}
        </p>

        <div style={{
          background: '#171a22',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '14px',
          textAlign: 'center',
        }}>
          {!alreadyClaimedToday && (
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#d9a441', letterSpacing: '-0.02em' }}>
              +{pts} Poin
            </div>
          )}
          <div style={{ fontSize: '11.5px', color: '#34c77b', marginTop: '3px' }}>{bonusText}</div>
          <div style={{
            marginTop: '10px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(217, 164, 65, 0.14)',
            border: '1px solid rgba(217, 164, 65, 0.35)',
            borderRadius: '99px',
            padding: '3px 12px',
            fontSize: '12px',
            color: '#d9a441',
            fontWeight: 700,
          }}>
            <i className="fas fa-fire" style={{ fontSize: '11px' }} />
            Streak Hari ke-{displayStreak}
          </div>
        </div>

        {/* Streak Milestones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '16px' }}>
          {[
            [3, 15],
            [7, 30],
            [14, 60],
            [30, 120],
          ].map(([day, bonus]) => {
            const reached = displayStreak >= day;
            return (
              <div
                key={day}
                style={{
                  background: reached ? 'rgba(217, 164, 65, 0.12)' : '#171a22',
                  border: reached ? '1px solid rgba(217, 164, 65, 0.45)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '9px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  opacity: reached ? 1 : 0.6,
                }}
              >
                <div style={{ fontSize: '12px', color: reached ? '#d9a441' : '#9ca3af', fontWeight: 700 }}>+{bonus}</div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>Hari {day}</div>
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
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#171a22',
              color: '#f3f4f6',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Tutup
          </button>
        ) : (
          <button
            onClick={handleClaim}
            disabled={justClaimed}
            className="ck-btn-primary"
          >
            {justClaimed ? `+${pts} Poin Ditambahkan` : `Klaim +${pts} Poin`}
          </button>
        )}
      </div>
    </div>
  );
}
