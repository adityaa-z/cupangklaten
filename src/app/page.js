'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import StudioHero from '@/components/StudioHero';
import AchievementStrip from '@/components/AchievementStrip';
import ProductStrip from '@/components/ProductStrip';
import SoliterGame from '@/app/game/SoliterGame';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ck-bg)', color: 'var(--ck-text)' }}>
      <Navbar />

      {/* Bagian Awal: Profil Galeri cans.betta x cupangklaten & Foto Asli Piala + Rak Soliter */}
      <StudioHero />

      {/* PRESTASI KONTES: Foto Ikan Juara + Foto Piala (Di Atas Etalase) */}
      <AchievementStrip />

      {/* ZONA ATAS: Strip Etalase Produk 1 Baris Horizontal Scroll */}
      <ProductStrip />

      {/* ZONA BAWAH: Arena Game Soliter Virtual */}
      <div id="soliter-virtual">
        <SoliterGame embedded />
      </div>

      {/* Bagian Paling Bawah: WhatsApp, Instagram (2), TikTok (2), & Google Maps */}
      <Footer />
    </div>
  );
}
