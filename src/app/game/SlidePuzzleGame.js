'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BETTA_CARDS } from './memoryFishData';
import { GameHeader, ArenaWinModal, formatTime, playArenaTone } from './ArenaShared';

const SOLVED_BOARD = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const EMPTY_TILE = 8;

function getNeighbors(index) {
  const row = Math.floor(index / 3);
  const col = index % 3;
  const neighbors = [];
  if (row > 0) neighbors.push(index - 3);
  if (row < 2) neighbors.push(index + 3);
  if (col > 0) neighbors.push(index - 1);
  if (col < 2) neighbors.push(index + 1);
  return neighbors;
}

function isBoardSolved(board) {
  return board.every((val, idx) => val === idx);
}

/**
 * Pengacakan Valid: melakukan 55 pergeseran legal mundur dari posisi utuh
 * sehingga 100% dijamin dapat diselesaikan (never unsolvable).
 */
function createSolvableBoard() {
  const board = [...SOLVED_BOARD];
  let emptyPos = EMPTY_TILE;
  let lastEmptyPos = -1;

  for (let step = 0; step < 55; step++) {
    const candidates = getNeighbors(emptyPos).filter((idx) => idx !== lastEmptyPos);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    [board[emptyPos], board[pick]] = [board[pick], board[emptyPos]];
    lastEmptyPos = emptyPos;
    emptyPos = pick;
  }

  // Pastikan tidak kebetulan kembali ke posisi selesai
  if (isBoardSolved(board)) {
    [board[8], board[7]] = [board[7], board[8]];
    [board[7], board[4]] = [board[4], board[7]];
  }
  return board;
}

export default function SlidePuzzleGame({ onBack }) {
  const [fishIdx, setFishIdx] = useState(0);
  const [board, setBoard] = useState(SOLVED_BOARD);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);

  const currentFish = BETTA_CARDS[fishIdx];

  const initPuzzle = useCallback((targetFishIdx = fishIdx) => {
    setFishIdx(targetFishIdx);
    setBoard(createSolvableBoard());
    setMoves(0);
    setSeconds(0);
    setHasStarted(false);
    setIsSolved(false);
    setShowModal(false);
    setShowPeek(false);
  }, [fishIdx]);

  useEffect(() => {
    const randomStart = Math.floor(Math.random() * BETTA_CARDS.length);
    initPuzzle(randomStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasStarted || isSolved) return;
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStarted, isSolved]);

  const emptyIndex = board.indexOf(EMPTY_TILE);
  const movableIndices = getNeighbors(emptyIndex);

  const handleTileClick = (clickedIdx) => {
    if (isSolved || showPeek) return;
    if (!movableIndices.includes(clickedIdx)) return;

    if (!hasStarted) setHasStarted(true);

    const nextBoard = [...board];
    [nextBoard[emptyIndex], nextBoard[clickedIdx]] = [nextBoard[clickedIdx], nextBoard[emptyIndex]];
    const nextMoves = moves + 1;

    setBoard(nextBoard);
    setMoves(nextMoves);
    playArenaTone('slide');

    if (isBoardSolved(nextBoard)) {
      setIsSolved(true);
      playArenaTone('win');
      // Beri jeda 0,75 detik agar pemain menikmati foto ikan utuh sebelum modal muncul
      setTimeout(() => {
        setShowModal(true);
      }, 750);
    }
  };

  const handlePlayNextFish = () => {
    const nextIdx = (fishIdx + 1) % BETTA_CARDS.length;
    initPuzzle(nextIdx);
  };

  const stars = moves <= 35 ? 3 : moves <= 65 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Slide Puzzle 3×3"
        subtitle={currentFish.name}
        onBack={onBack}
        onRestart={() => initPuzzle(fishIdx)}
      />

      <div className="sp-wrap">
        {/* HUD Controls */}
        <div className="sp-hud">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 800 }}>
            <span>
              <i className="fas fa-arrows-alt" style={{ marginRight: '5px', color: 'var(--ck-text-muted)' }} />
              Geseran: {moves}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              <i className="fas fa-clock" style={{ marginRight: '5px', color: 'var(--ck-text-muted)' }} />
              {formatTime(seconds)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="mm-icon-btn"
              style={{ height: '30px', fontSize: '11.5px' }}
              onClick={() => setShowNumbers((prev) => !prev)}
            >
              <i className="fas fa-hashtag" />
              <span>{showNumbers ? 'Angka: On' : 'Angka: Off'}</span>
            </button>

            <button
              type="button"
              className="mm-icon-btn"
              style={{ height: '30px', fontSize: '11.5px' }}
              onClick={() => setShowPeek((prev) => !prev)}
            >
              <i className={showPeek ? 'fas fa-eye-slash' : 'fas fa-eye'} />
              <span>{showPeek ? 'Tutup' : 'Intip'}</span>
            </button>
          </div>
        </div>

        {/* 3x3 Puzzle Board */}
        <div className="sp-board-shell">
          <div className={`sp-grid ${isSolved ? 'solved' : ''}`}>
            {board.map((tileVal, posIdx) => {
              const isEmpty = tileVal === EMPTY_TILE && !isSolved;
              const canMove = !isSolved && movableIndices.includes(posIdx);
              const bgX = (tileVal % 3) * 50;
              const bgY = Math.floor(tileVal / 3) * 50;

              if (isEmpty) {
                return <div key="empty-slot" className="sp-tile empty" aria-label="Ruang kosong" />;
              }

              return (
                <button
                  key={tileVal}
                  type="button"
                  className={`sp-tile ${canMove ? 'movable' : ''}`}
                  onClick={() => handleTileClick(posIdx)}
                  disabled={!canMove}
                  aria-label={`Potongan ${tileVal + 1}`}
                  style={{
                    backgroundImage: `url(${currentFish.image})`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                  }}
                >
                  {showNumbers && !isSolved && (
                    <span className="sp-tile-num">{tileVal + 1}</span>
                  )}
                </button>
              );
            })}
          </div>

          {showPeek && (
            <div className="sp-peek-overlay" onClick={() => setShowPeek(false)}>
              <img src={currentFish.image} alt={`Contoh utuh ${currentFish.name}`} />
              <span className="sp-peek-tag">Foto Asli: {currentFish.name} (Ketuk untuk lanjut)</span>
            </div>
          )}
        </div>

        {/* Pilihan Foto Ikan Lain */}
        <div className="sp-fish-picker" aria-label="Pilih Foto Ikan Puzzle">
          {BETTA_CARDS.map((fish, idx) => (
            <button
              key={fish.id}
              type="button"
              className={`sp-fish-chip ${idx === fishIdx ? 'active' : ''}`}
              onClick={() => initPuzzle(idx)}
            >
              {fish.shortName}
            </button>
          ))}
        </div>
      </div>

      <ArenaWinModal
        open={showModal}
        title="Puzzle Tersusun Utuh!"
        subtitle={`Keren! Foto ${currentFish.name} berhasil kamu susun sempurna. ${currentFish.fact}`}
        stars={stars}
        previewImage={currentFish.image}
        previewLabel={currentFish.name}
        stats={[
          { label: 'Total Geseran', value: moves },
          { label: 'Waktu', value: formatTime(seconds) },
          { label: 'Jenis Ikan', value: currentFish.shortName },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru menyelesaikan Slide Puzzle ${currentFish.name} dalam ${moves} geseran dan tertarik dengan koleksi ikannya.`}
        onPlayAgain={handlePlayNextFish}
        onBackToHub={onBack}
      />
    </div>
  );
}
