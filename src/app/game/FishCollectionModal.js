'use client';

import React, { useState } from 'react';
import { FISH_CATALOG } from './fishConfig';
import FishSVG from './FishSVG';
import { createDefaultFish } from './gameState';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(2, 6, 23, 0.82)',
  backdropFilter: 'blur(4px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: '12px',
};

const modalStyle = {
  background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid #334155',
  borderRadius: '18px',
  padding: '18px 14px',
  maxWidth: '400px',
  width: '100%',
  color: '#f1f5f9',
  boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
  maxHeight: '92vh',
  overflowY: 'auto',
};

export default function FishCollectionModal({ gameState, onUnlock, onActivate, onClose }) {
  const { unlockedFishes, activeFishId, aquarium, points } = gameState;
  const [selectedInfo, setSelectedInfo] = useState(
    FISH_CATALOG.find((f) => f.id === activeFishId) || FISH_CATALOG[0]
  );

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>🐟 Koleksi 9 Jenis Cupang</h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Terbuka {unlockedFishes.length}/{FISH_CATALOG.length} · Tap kartu untuk info jenis
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Points & Selected Info Banner */}
        <div style={{
          background: '#0b1120',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '10px 12px',
          marginBottom: '12px',
          fontSize: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <strong style={{ color: '#38bdf8' }}>{selectedInfo.species}</strong>
            <span style={{ color: '#fbbf24', fontWeight: 700 }}>⭐ {points.toLocaleString()} Poin</span>
          </div>
          <p style={{ margin: '0 0 5px', color: '#cbd5e1', fontSize: '11.5px', lineHeight: 1.4 }}>
            {selectedInfo.description}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', fontSize: '10.5px', color: '#94a3b8' }}>
            <span>⚗️ pH Ideal: <strong style={{ color: '#a78bfa' }}>{selectedInfo.preferPH[0]}–{selectedInfo.preferPH[1]}</strong></span>
            <span>🏠 Min. Akuarium: <strong style={{ color: '#34d399' }}>Lv.{selectedInfo.minAquariumLevel}</strong></span>
            {selectedInfo.lovesTanin && <span style={{ color: '#fbbf24' }}>🌿 Suka Air Ketapang</span>}
          </div>
        </div>

        {/* Grid 3×3 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
        }}>
          {FISH_CATALOG.map((fish) => {
            const isUnlocked = unlockedFishes.includes(fish.id);
            const isActive = activeFishId === fish.id;
            const isSelected = selectedInfo.id === fish.id;
            const needsHigherTank = fish.minAquariumLevel > aquarium.level;
            const canAfford = points >= fish.unlockCost;
            const previewState = gameState.fishes[fish.id] || createDefaultFish(fish.species);

            let cardBorder = '1px solid #334155';
            if (isActive) cardBorder = '2px solid #38bdf8';
            else if (isSelected) cardBorder = '1.5px solid #fbbf24';
            else if (isUnlocked) cardBorder = '1px solid #22c55e';

            return (
              <div
                key={fish.id}
                onClick={() => setSelectedInfo(fish)}
                style={{
                  borderRadius: '12px',
                  border: cardBorder,
                  background: isActive
                    ? 'rgba(56,189,248,0.1)'
                    : isUnlocked
                      ? 'rgba(34,197,94,0.05)'
                      : 'rgba(15,23,42,0.7)',
                  padding: '9px 6px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: !isUnlocked && needsHigherTank ? 0.6 : 1,
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                {fish.minAquariumLevel > 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    fontSize: '9px',
                    background: '#1e293b',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    color: needsHigherTank ? '#f59e0b' : '#34d399',
                    fontWeight: 700,
                  }}>
                    Lv{fish.minAquariumLevel}+
                  </div>
                )}

                <div style={{
                  width: '72px',
                  height: '52px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  filter: isUnlocked ? 'none' : 'grayscale(75%)',
                }}>
                  <FishSVG
                    fishConfig={fish}
                    fishState={{ ...previewState, colorVibrancy: isUnlocked ? previewState.colorVibrancy : 35 }}
                    size={68}
                    animate={isActive}
                  />
                </div>

                <span style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  color: isActive ? '#38bdf8' : isUnlocked ? '#f1f5f9' : '#94a3b8',
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
                      background: '#38bdf8',
                      color: '#0f172a',
                      borderRadius: '20px',
                      padding: '2px 9px',
                      fontWeight: 800,
                    }}>
                      Aktif ✓
                    </span>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); onActivate(fish.id); }}
                      style={{
                        fontSize: '9.5px',
                        background: '#1e3a5f',
                        color: '#38bdf8',
                        border: '1px solid #38bdf8',
                        borderRadius: '20px',
                        padding: '3px 9px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      Tampilkan
                    </button>
                  )
                ) : needsHigherTank ? (
                  <span style={{ fontSize: '9px', color: '#f59e0b', textAlign: 'center', fontWeight: 600 }}>
                    Perlu Lv.{fish.minAquariumLevel}
                  </span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); if (canAfford) onUnlock(fish.id); }}
                    disabled={!canAfford}
                    style={{
                      fontSize: '9.5px',
                      background: canAfford ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : '#1e293b',
                      color: canAfford ? '#0f172a' : '#64748b',
                      border: canAfford ? 'none' : '1px solid #334155',
                      borderRadius: '20px',
                      padding: '3px 8px',
                      cursor: canAfford ? 'pointer' : 'not-allowed',
                      fontWeight: 800,
                    }}
                  >
                    {canAfford ? `🔓 ${fish.unlockCost}p` : `⭐ ${fish.unlockCost}`}
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
