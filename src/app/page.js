'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import StudioHero from '@/components/StudioHero';
import AchievementStrip from '@/components/AchievementStrip';
import ProductStrip from '@/components/ProductStrip';
import Footer from '@/components/Footer';
import '@/app/homepage.css';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="ed-home-page">
      <Navbar />

      {/* 1. Profil Galeri cans.betta x cupangklaten */}
      <StudioHero />

      {/* 2. Prestasi Kontes & Piala (Otomatis sembunyi jika belum ada data) */}
      <AchievementStrip />

      {/* 3. Etalase Stok per Kelas: Grade A, Grade B, Grade C, Kolektor */}
      <ProductStrip />

      {/* 4. Kontak, Lokasi, Sosial Media & Navigasi */}
      <Footer />
    </div>
  );
}
