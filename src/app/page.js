'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import StudioHero from '@/components/StudioHero';
import ProductStrip from '@/components/ProductStrip';
import SoliterGame from '@/app/game/SoliterGame';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#090a0d', color: '#f3f4f6' }}>
      <Navbar />

      {/* Bagian Awal: Profil Galeri Cupang Klaten & Foto Asli Piala + Rak Soliter */}
      <StudioHero />

      {/* ZONA ATAS: Strip Etalase Produk 1 Baris Horizontal Scroll */}
      <ProductStrip />

      {/* ZONA BAWAH: Arena Game Soliter Virtual Cupang Klaten */}
      <div id="soliter-virtual">
        <SoliterGame embedded />
      </div>
    </div>
  );
}
