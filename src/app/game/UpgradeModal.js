'use client';

import React from 'react';
import { AQUARIUM_LEVELS } from './gameConfig';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(2, 6, 23, 0.82)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '14px',
};

const modalStyle = {
  background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid #334155',
  borderRadius: '18px',
  padding: '20px 18px',
  maxWidth: '460px',
  width: '100%',
  color: '#f1f5f9',
  boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default function UpgradeModal({ gameState, onUpgrade, onClose }) {
  const currentLevel = gameState.aquarium.level;
  const points = gameState.points;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>🏠 Upgrade Akuarium</h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Gunakan poin check-in (gratis, non-transaksi)</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div style={{
          background: '#0b1120',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Poin Check-In kamu</span>
          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '16px' }}>⭐ {points.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {AQUARIUM_LEVELS.map((item) => {
            const isCurrent = item.level === currentLevel;
            const isOwned = item.level < currentLevel;
            const isNext = item.level === currentLevel + 1;
            const canAfford = points >= item.cost;
            const isLocked = item.level > currentLevel + 1;

            let statusLabel;
            let statusColor;
            if (isOwned) {
              statusLabel = '✓ Dimiliki';
              statusColor = '#22c55e';
            } else if (isCurrent) {
              statusLabel = '● Aktif';
              statusColor = '#38bdf8';
            } else if (isLocked) {
              statusLabel = `🔒 Lv.${item.level - 1} dulu`;
              statusColor = '#64748b';
            } else {
              statusLabel = `⭐ ${item.cost.toLocaleString()}`;
              statusColor = canAfford ? '#fbbf24' : '#f87171';
            }

            return (
              <div
                key={item.level}
                style={{
                  borderRadius: '12px',
                  padding: '13px',
                  border: isCurrent ? '2px solid #38bdf8' : '1px solid #334155',
                  background: isCurrent ? 'rgba(56,189,248,0.08)' : 'rgba(15,23,42,0.65)',
                  opacity: isLocked ? 0.55 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '11px' }}>
                  <span style={{ fontSize: '26px', flexShrink: 0 }}>{item.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>Lv.{item.level} {item.name}</span>
                      <span style={{ fontSize: '11px', color: statusColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{statusLabel}</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#94a3b8', margin: '0 0 6px', lineHeight: 1.4 }}>
                      {item.description}
                    </p>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      color: '#34d399',
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.25)',
                      borderRadius: '6px',
                      padding: '2px 7px',
                      marginBottom: isNext ? '9px' : '0',
                    }}>
                      ✨ {item.perk}
                    </div>
                    {isNext && (
                      <button
                        onClick={() => canAfford && onUpgrade(item.level)}
                        disabled={!canAfford}
                        style={{
                          width: '100%',
                          padding: '9px',
                          borderRadius: '8px',
                          border: canAfford ? 'none' : '1px solid #334155',
                          background: canAfford ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : '#1e293b',
                          color: canAfford ? '#0f172a' : '#64748b',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          cursor: canAfford ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {canAfford
                          ? `Upgrade ke Level ${item.level} (${item.cost} Poin)`
                          : `Kurang ${(item.cost - points).toLocaleString()} Poin`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
