'use client';

import React from 'react';
import { AQUARIUM_LEVELS } from './gameConfig';

export default function UpgradeModal({ gameState, onUpgrade, onClose }) {
  const currentLevel = gameState.aquarium.level;
  const points = gameState.points;

  return (
    <div className="ck-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ck-modal-card" style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Upgrade Soliter & Akuarium</h2>
            <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
              Berbasis poin check-in gratis, tanpa transaksi uang
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '17px', cursor: 'pointer' }}
            aria-label="Tutup"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div style={{
          background: '#171a22',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#9ca3af', fontSize: '12.5px' }}>Saldo Poin</span>
          <span style={{ color: '#d9a441', fontWeight: 700, fontSize: '15px' }}>
            <i className="fas fa-coins" style={{ marginRight: '6px', fontSize: '13px' }} />
            {points.toLocaleString()}
          </span>
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
              statusLabel = 'Dimiliki';
              statusColor = '#34c77b';
            } else if (isCurrent) {
              statusLabel = 'Aktif';
              statusColor = '#d9a441';
            } else if (isLocked) {
              statusLabel = `Butuh Lv.${item.level - 1}`;
              statusColor = '#6b7280';
            } else {
              statusLabel = `${item.cost.toLocaleString()} poin`;
              statusColor = canAfford ? '#d9a441' : '#e05252';
            }

            return (
              <div
                key={item.level}
                style={{
                  borderRadius: '11px',
                  padding: '13px',
                  border: isCurrent ? '1px solid rgba(217, 164, 65, 0.55)' : '1px solid rgba(255,255,255,0.07)',
                  background: isCurrent ? 'rgba(217, 164, 65, 0.06)' : '#171a22',
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '9px',
                    background: '#111318',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isCurrent ? '#d9a441' : '#9ca3af',
                    flexShrink: 0,
                  }}>
                    <i className={`fas ${item.icon}`} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '13px' }}>Level {item.level} · {item.name}</span>
                      <span style={{ fontSize: '11px', color: statusColor, fontWeight: 700, whiteSpace: 'nowrap' }}>{statusLabel}</span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#9ca3af', margin: '0 0 7px', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '10.5px',
                      color: '#34c77b',
                      background: 'rgba(52, 199, 123, 0.08)',
                      border: '1px solid rgba(52, 199, 123, 0.22)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      marginBottom: isNext ? '10px' : '0',
                    }}>
                      {item.perk}
                    </div>
                    {isNext && (
                      <button
                        onClick={() => canAfford && onUpgrade(item.level)}
                        disabled={!canAfford}
                        className="ck-btn-primary"
                        style={{ padding: '9px 12px', fontSize: '12.5px' }}
                      >
                        {canAfford
                          ? `Upgrade ke Level ${item.level} (${item.cost.toLocaleString()} Poin)`
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
