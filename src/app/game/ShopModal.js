'use client';

import React, { useState } from 'react';
import { SHOP_ITEMS } from './gameConfig';

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
  padding: '20px 16px',
  maxWidth: '390px',
  width: '100%',
  color: '#f1f5f9',
  boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const CATEGORIES = ['Semua', 'Pakan', 'Air', 'Obat'];

export default function ShopModal({ gameState, onBuyItem, onClose }) {
  const [cat, setCat] = useState('Semua');
  const { points, inventory } = gameState;

  const filtered = cat === 'Semua' ? SHOP_ITEMS : SHOP_ITEMS.filter((item) => item.category === cat);

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>🎁 Tukar Poin Perawatan</h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>100% pakai poin check-in gratis (bukan uang)</div>
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
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>Poin tersedia</span>
          <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '16px' }}>⭐ {points.toLocaleString()}</span>
        </div>

        {/* Category Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{
                flex: 1,
                padding: '6px 4px',
                borderRadius: '8px',
                border: cat === c ? '1px solid #38bdf8' : '1px solid #334155',
                background: cat === c ? 'rgba(56,189,248,0.16)' : '#0f172a',
                color: cat === c ? '#38bdf8' : '#94a3b8',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((item) => {
            const canAfford = points >= item.cost;
            const owned = inventory[item.key] || 0;
            return (
              <div
                key={item.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 12px',
                }}
              >
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.desc}</div>
                  <div style={{ fontSize: '10.5px', color: '#38bdf8', marginTop: '2px' }}>
                    Stok kamu: <strong>{owned}</strong>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && onBuyItem(item)}
                  disabled={!canAfford}
                  style={{
                    padding: '7px 11px',
                    borderRadius: '8px',
                    border: canAfford ? 'none' : '1px solid #334155',
                    background: canAfford ? 'linear-gradient(90deg,#fbbf24,#f59e0b)' : '#1e293b',
                    color: canAfford ? '#0f172a' : '#64748b',
                    fontWeight: 800,
                    fontSize: '12px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  ⭐ {item.cost}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
