'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MemoryMatchGame from './MemoryMatchGame';
import QuizGame from './QuizGame';
import SpotDiffGame from './SpotDiffGame';
import SlidePuzzleGame from './SlidePuzzleGame';
import SerokTimingGame from './SerokTimingGame';
import TossPelletGame from './TossPelletGame';
import GachaCardGame from './GachaCardGame';
import CleanTankGame from './CleanTankGame';
import '@/app/game/soliter.css';
import './memory-game.css';
import './arena.css';

const ARENA_GAMES = [
  {
    id: 'memory',
    title: 'Memory Match',
    badge: 'Cocokkan Kartu',
    description: 'Temukan semua pasangan foto ikan cupang di papan 3×4 atau 4×4.',
    icon: 'fa-clone',
    preview: '/pk-001.png',
  },
  {
    id: 'quiz',
    title: 'Tebak Jenis',
    badge: 'Kuis Cepat',
    description: 'Uji ketajamanmu menebak nama varian ikan cupang dari fotonya.',
    icon: 'fa-bolt',
    preview: '/memory-game/crowntail.jpg',
  },
  {
    id: 'spotdiff',
    title: 'Cari Perbedaan',
    badge: 'Spot the Difference',
    description: 'Temukan 5 detail berbeda di antara dua foto ikan cupang.',
    icon: 'fa-search',
    preview: '/memory-game/blue-rim.jpg',
  },
  {
    id: 'puzzle',
    title: 'Slide Puzzle',
    badge: 'Susun Gambar 3×3',
    description: 'Geser 8 potongan foto ikan cupang hingga tersusun utuh sempurna.',
    icon: 'fa-th',
    preview: '/hm-012.png',
  },
  {
    id: 'serok',
    title: 'Tarik Ulur Serok',
    badge: 'Timing Bar',
    description: 'Tangkap ikan dengan serokan tepat saat jarum berada di zona hijau.',
    icon: 'fa-bullseye',
    preview: '/memory-game/plakat-nemo.jpg',
  },
  {
    id: 'toss',
    title: 'Lempar Pelet',
    badge: 'Toss & Aim',
    description: 'Usap pelet ke atas agar masuk tepat ke mulut toples ikan cupang.',
    icon: 'fa-dot-circle',
    preview: '/gt-005.png',
  },
  {
    id: 'gacha',
    title: 'Gacha Kartu Koleksi',
    badge: 'Mystery Pack TCG',
    description: 'Sobek booster pack & koleksi kartu cupang Common hingga Ultra Rare.',
    icon: 'fa-gem',
    preview: '/memory-game/black-samurai.jpg',
  },
  {
    id: 'clean',
    title: 'Bersihkan Kaca',
    badge: 'Quick Swipe Clean',
    description: 'Gosok lumut di kaca akuarium sampai 95% bersih sebelum 15 detik habis.',
    icon: 'fa-hand-sparkles',
    preview: '/memory-game/double-tail.jpg',
  },
];

export default function BettaMiniGameArena() {
  const [activeGame, setActiveGame] = useState(null);

  const handleOpenGame = (gameId) => {
    setActiveGame(gameId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToHub = () => {
    setActiveGame(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderActiveGame = () => {
    switch (activeGame) {
      case 'memory':
        return <MemoryMatchGame onBack={handleBackToHub} />;
      case 'quiz':
        return <QuizGame onBack={handleBackToHub} />;
      case 'spotdiff':
        return <SpotDiffGame onBack={handleBackToHub} />;
      case 'puzzle':
        return <SlidePuzzleGame onBack={handleBackToHub} />;
      case 'serok':
        return <SerokTimingGame onBack={handleBackToHub} />;
      case 'toss':
        return <TossPelletGame onBack={handleBackToHub} />;
      case 'gacha':
        return <GachaCardGame onBack={handleBackToHub} />;
      case 'clean':
        return <CleanTankGame onBack={handleBackToHub} />;
      default:
        return null;
    }
  };

  return (
    <div className="arena-page">
      <Navbar />

      <main className="arena-shell">
        {!activeGame ? (
          <div>
            <section className="arena-lobby-hero">
              <div className="arena-eyebrow">
                <i className="fas fa-gamepad" />
                <span>CANS.BETTA X CUPANGKLATEN · {ARENA_GAMES.length} GAME DALAM 1 ARENA</span>
              </div>
              <h1 className="arena-title">Betta Mini-Game Arena</h1>
              <p className="arena-subtitle">
                Pilih salah satu permainan interaktif di bawah ini untuk bermain sambil mengenal
                ragam jenis ikan cupang hias Kelas Kompetisi.
              </p>
            </section>

            <section className="arena-lobby-grid" aria-label="Pilihan Mini-Game">
              {ARENA_GAMES.map((game) => (
                <button
                  key={game.id}
                  type="button"
                  className="arena-game-card"
                  onClick={() => handleOpenGame(game.id)}
                >
                  <div className="arena-card-preview">
                    <img src={game.preview} alt={game.title} loading="lazy" />
                    <div className="arena-card-preview-vignette" />
                    <span className="arena-card-badge">{game.badge}</span>
                    <span className="arena-card-icon-circle" aria-hidden="true">
                      <i className={`fas ${game.icon}`} />
                    </span>
                  </div>

                  <div className="arena-card-body">
                    <h2 className="arena-card-title">{game.title}</h2>
                    <p className="arena-card-desc">{game.description}</p>
                    <span className="arena-card-play">
                      <span>Main Sekarang</span>
                      <i className="fas fa-arrow-right" />
                    </span>
                  </div>
                </button>
              ))}
            </section>

            {/* Strip Promosi Koleksi & Kontak */}
            <div className="arena-lobby-promo">
              <div className="arena-lobby-promo-text">
                <strong>Tertarik dengan ikan cupang di dalam game?</strong> Lihat stok ready atau
                hubungi admin langsung via WhatsApp.
              </div>
              <div className="arena-lobby-promo-links">
                <Link href="/stok" className="mm-icon-btn" style={{ textDecoration: 'none' }}>
                  <i className="fas fa-fish" />
                  <span>Lihat Koleksi</span>
                </Link>
                <a
                  href="https://wa.me/628992020444?text=Halo%20Admin%20cans.betta%20x%20cupangklaten%2C%20saya%20ingin%20tanya%20koleksi%20ikan%20cupang."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mm-icon-btn"
                  style={{ textDecoration: 'none', background: '#16a34a', borderColor: '#16a34a', color: '#ffffff' }}
                >
                  <i className="fab fa-whatsapp" />
                  <span>Hubungi Kami</span>
                </a>
              </div>
            </div>
          </div>
        ) : (
          renderActiveGame()
        )}
      </main>

      <Footer />
    </div>
  );
}
