'use client';

import React, { useState } from 'react';
import { FISH_CATALOG } from './fishConfig';
import FishDisplay from './FishDisplay';
import { createDefaultFish } from './gameState';

export default function FishCollectionModal({ gameState, onUnlock, onActivate, onClose }) {
  const { unlockedFishes, activeFishId, aquarium, points } = gameState;
  const [selectedInfo, setSelectedInfo] = useState(
    FISH_CATALOG.find((f) => f.id === activeFishId) || FISH_CATALOG[0]
  );

  return (
    <div className="ck-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ck-modal-card" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Koleksi Jenis Cupang</h2>
            <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
              Terbuka {unlockedFishes.length} dari {FISH_CATALOG.length} jenis
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

        {/* Selected Species Spec Card */}
        <div style={{
          background: '#171a22',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '11px',
          padding: '11px 13px',
          marginBottom: '12px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong style={{ color: '#f3f4f6', fontSize: '13.5px' }}>{selectedInfo.species}</strong>
            <span style={{ color: '#d9a441', fontWeight: 700, fontSize: '12.5px' }}>
              <i className="fas fa-coins" style={{ marginRight: '5px', fontSize: '11px' }} />
              {points.toLocaleString()} pts
            </span>
          </div>
          <p style={{ margin: '0 0 7px', color: '#9ca3af', fontSize: '11.5px', lineHeight: 1.45 }}>
            {selectedInfo.description}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: '#9ca3af' }}>
            <span>pH Ideal: <strong style={{ color: '#f3f4f6' }}>{selectedInfo.preferPH[0]}–{selectedInfo.preferPH[1]}</strong></span>
            <span>Min. Soliter: <strong style={{ color: '#f3f4f6' }}>Lv.{selectedInfo.minAquariumLevel}</strong></span>
            {selectedInfo.lovesTanin && <span style={{ color: '#d9a441' }}>Menyukai air ketapang</span>}
          </div>
        </div>

        {/* Grid 3×3 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {FISH_CATALOG.map((fish) => {
            const isUnlocked = unlockedFishes.includes(fish.id);
            const isActive = activeFishId === fish.id;
            const isSelected = selectedInfo.id === fish.id;
            const needsHigherTank = fish.minAquariumLevel > aquarium.level;
            const canAfford = points >= fish.unlockCost;
            const previewState = gameState.fishes[fish.id] || createDefaultFish(fish.species);

            let cardBorder = '1px solid rgba(255,255,255,0.07)';
            if (isActive) cardBorder = '1.5px solid #d9a441';
            else if (isSelected) cardBorder = '1px solid rgba(255,255,255,0.28)';

            return (
              <div
                key={fish.id}
                onClick={() => setSelectedInfo(fish)}
                style={{
                  borderRadius: '10px',
                  border: cardBorder,
                  background: isActive ? 'rgba(217, 164, 65, 0.08)' : '#171a22',
                  padding: '9px 6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '5px',
                  opacity: !isUnlocked && needsHigherTank ? 0.55 : 1,
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {fish.minAquariumLevel > 1 && (
                  <span style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    fontSize: '9px',
                    background: '#111318',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    color: needsHigherTank ? '#e5a93c' : '#9ca3af',
                    fontWeight: 700,
                  }}>
                    Lv.{fish.minAquariumLevel}
                  </span>
                )}

                <div style={{
                  width: '72px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: isUnlocked ? 'none' : 'grayscale(85%) opacity(0.65)',
                }}>
                  <FishDisplay
                    fishConfig={fish}
                    fishState={{ ...previewState, colorVibrancy: isUnlocked ? previewState.colorVibrancy : 35 }}
                    size={68}
                    animate={false}
                  />
                </div>

                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 600,
                  color: isActive ? '#d9a441' : isUnlocked ? '#f3f4f6' : '#9ca3af',
                  textAlign: 'center',
                  lineHeight: 1.2,
                  minHeight: '24px',
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {fish.species}
                </span>

                {isUnlocked ? (
                  isActive ? (
                    <span style={{
                      fontSize: '9.5px',
                      background: 'rgba(217, 164, 65, 0.16)',
                      color: '#d9a441',
                      border: '1px solid rgba(217, 164, 65, 0.4)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontWeight: 700,
                    }}>
                      Aktif
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onActivate(fish.id); }}
                      style={{
                        fontSize: '9.5px',
                        background: '#111318',
                        color: '#e5e7eb',
                        border: '1px solid rgba(255,255,255,0.16)',
                        borderRadius: '6px',
                        padding: '3px 9px',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Tampilkan
                    </button>
                  )
                ) : needsHigherTank ? (
                  <span style={{ fontSize: '9.5px', color: '#e5a93c', fontWeight: 600 }}>
                    Soliter Lv.{fish.minAquariumLevel}
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (canAfford) onUnlock(fish.id); }}
                    disabled={!canAfford}
                    style={{
                      fontSize: '9.5px',
                      background: canAfford ? '#d9a441' : '#111318',
                      color: canAfford ? '#0b0d11' : '#6b7280',
                      border: canAfford ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '6px',
                      padding: '3px 9px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontWeight: 700,
                    }}
                  >
                    {fish.unlockCost} pts
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
