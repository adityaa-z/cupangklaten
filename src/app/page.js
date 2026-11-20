'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import ProductStrip from '@/components/ProductStrip';
import SoliterGame from '@/app/game/SoliterGame';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f1f5f9' }}>
      <Navbar />

      {/* ZONA ATAS: Strip Etalase Produk 1 Baris Horizontal Scroll (Modul 1.2) */}
      <ProductStrip />

      {/* ZONA BAWAH: Arena Game Soliter Virtual Cupang Klaten (Modul 1.2–5) */}
      <SoliterGame embedded />
    </div>
  );
}
