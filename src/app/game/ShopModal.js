'use client';

import React, { useState } from 'react';
import { SHOP_ITEMS } from './gameConfig';

const CATEGORIES = ['Semua', 'Pakan', 'Air', 'Obat'];

export default function ShopModal({ gameState, onBuyItem, onClose }) {
  const [cat, setCat] = useState('Semua');
  const { points, inventory } = gameState;

  const filtered = cat === 'Semua' ? SHOP_ITEMS : SHOP_ITEMS.filter((item) => item.category === cat);

  return (
    <div className="ck-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ck-modal-card" style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Tukar Poin Perawatan</h2>
            <div style={{ fontSize: '11.5px', color: 'var(--ck-text-muted)', marginTop: '2px' }}>
              Penukaran stok menggunakan poin check-in gratis
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ck-text-muted)', fontSize: '17px', cursor: 'pointer' }}
            aria-label="Tutup"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div style={{
          background: 'var(--ck-surface-2)',
          border: '1px solid var(--ck-border)',
          borderRadius: '10px',
          padding: '10px 14px',
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ color: 'var(--ck-text-2)', fontSize: '12.5px' }}>Poin Tersedia</span>
          <span style={{ color: 'var(--ck-text)', fontWeight: 700, fontSize: '15px' }}>
            <i className="fas fa-coins" style={{ marginRight: '6px', fontSize: '13px' }} />
            {points.toLocaleString()}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                style={{
                  padding: '7px 4px',
                  borderRadius: '8px',
                  border: active ? '1px solid var(--ck-accent-border)' : '1px solid var(--ck-border)',
                  background: active ? 'var(--ck-accent-soft)' : 'var(--ck-surface-2)',
                  color: active ? 'var(--ck-text)' : 'var(--ck-text-muted)',
                  fontSize: '11.5px',
                  fontWeight: active ? 700 : 600,
                  cursor: 'pointer',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

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
                  gap: '11px',
                  background: 'var(--ck-surface-2)',
                  border: '1px solid var(--ck-border)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--ck-surface)',
                  border: '1px solid var(--ck-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ck-text-2)',
                  flexShrink: 0,
                  fontSize: '13px',
                }}>
                  <i className={`fas ${item.icon}`} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: 'var(--ck-text)' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ck-text-2)', marginTop: '1px' }}>{item.desc}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)', marginTop: '2px' }}>
                    Stok saat ini: <strong style={{ color: 'var(--ck-text)' }}>{owned}</strong>
                  </div>
                </div>
                <button
                  onClick={() => canAfford && onBuyItem(item)}
                  disabled={!canAfford}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    border: canAfford ? 'none' : '1px solid var(--ck-border)',
                    background: canAfford ? 'var(--ck-btn-bg)' : 'var(--ck-surface)',
                    color: canAfford ? 'var(--ck-btn-text)' : 'var(--ck-text-muted)',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.cost} pts
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
