'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BETTA_CARDS } from './memoryFishData';
import { GameHeader, ArenaWinModal, formatTime, playArenaTone } from './ArenaShared';

const SOLVED_BOARD = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const EMPTY_TILE = 8;

const DIFFICULTIES = {
  easy: { id: 'easy', label: 'Mudah', steps: 8 },
  medium: { id: 'medium', label: 'Sedang', steps: 18 },
  hard: { id: 'hard', label: 'Sulit', steps: 40 },
};

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
 * Pengacakan Valid: melakukan N pergeseran legal mundur dari posisi utuh
 * sehingga 100% dijamin dapat diselesaikan & sesuai tingkat kesulitan.
 */
function createSolvableBoard(steps = 8) {
  const board = [...SOLVED_BOARD];
  let emptyPos = EMPTY_TILE;
  let lastEmptyPos = -1;

  for (let step = 0; step < steps; step++) {
    const candidates = getNeighbors(emptyPos).filter((idx) => idx !== lastEmptyPos);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    [board[emptyPos], board[pick]] = [board[pick], board[emptyPos]];
    lastEmptyPos = emptyPos;
    emptyPos = pick;
  }

  if (isBoardSolved(board)) {
    [board[8], board[7]] = [board[7], board[8]];
    [board[7], board[4]] = [board[4], board[7]];
  }
  return board;
}

function manhattanDistance(board) {
  let dist = 0;
  for (let i = 0; i < 9; i++) {
    const val = board[i];
    if (val === EMPTY_TILE) continue;
    const curR = Math.floor(i / 3);
    const curC = i % 3;
    const goalR = Math.floor(val / 3);
    const goalC = val % 3;
    dist += Math.abs(curR - goalR) + Math.abs(curC - goalC);
  }
  return dist;
}

/**
 * A* Solver singkat untuk 3x3 Slide Puzzle:
 * Mengembalikan indeks kotak terbaik berikutnya untuk digeser (1 langkah optimal).
 */
function findNextHintTileIndex(startBoard) {
  const goalKey = SOLVED_BOARD.join(',');
  const startKey = startBoard.join(',');
  if (startKey === goalKey) return null;

  const open = [
    {
      board: startBoard,
      key: startKey,
      g: 0,
      f: manhattanDistance(startBoard),
      firstMoveIdx: null,
    },
  ];
  const visited = new Map();
  visited.set(startKey, 0);

  let iterations = 0;
  while (open.length > 0 && iterations < 4000) {
    iterations++;
    // Ambil node dengan f terkecil
    let bestPos = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestPos].f) bestPos = i;
    }
    const current = open.splice(bestPos, 1)[0];

    if (current.key === goalKey) {
      return current.firstMoveIdx;
    }

    const emptyIdx = current.board.indexOf(EMPTY_TILE);
    const neighbors = getNeighbors(emptyIdx);

    for (const nIdx of neighbors) {
      const nextBoard = [...current.board];
      [nextBoard[emptyIdx], nextBoard[nIdx]] = [nextBoard[nIdx], nextBoard[emptyIdx]];
      const nextKey = nextBoard.join(',');
      const nextG = current.g + 1;

      if (!visited.has(nextKey) || nextG < visited.get(nextKey)) {
        visited.set(nextKey, nextG);
        open.push({
          board: nextBoard,
          key: nextKey,
          g: nextG,
          f: nextG + manhattanDistance(nextBoard),
          firstMoveIdx: current.firstMoveIdx === null ? nIdx : current.firstMoveIdx,
        });
      }
    }
  }

  return null;
}

export default function SlidePuzzleGame({ onBack }) {
  const [difficultyKey, setDifficultyKey] = useState('easy');
  const [fishIdx, setFishIdx] = useState(0);
  const [board, setBoard] = useState(SOLVED_BOARD);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [hintPosIdx, setHintPosIdx] = useState(null);

  const currentFish = BETTA_CARDS[fishIdx];
  const difficulty = DIFFICULTIES[difficultyKey];

  const initPuzzle = useCallback((targetFishIdx = fishIdx, targetDiff = difficultyKey) => {
    const diffCfg = DIFFICULTIES[targetDiff] || DIFFICULTIES.easy;
    setFishIdx(targetFishIdx);
    setDifficultyKey(targetDiff);
    setBoard(createSolvableBoard(diffCfg.steps));
    setMoves(0);
    setSeconds(0);
    setHasStarted(false);
    setIsSolved(false);
    setShowModal(false);
    setShowPeek(false);
    setHintPosIdx(null);
  }, [fishIdx, difficultyKey]);

  useEffect(() => {
    const randomStart = Math.floor(Math.random() * BETTA_CARDS.length);
    initPuzzle(randomStart, 'easy');
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
    setHintPosIdx(null);
    playArenaTone('slide');

    if (isBoardSolved(nextBoard)) {
      setIsSolved(true);
      playArenaTone('win');
      setTimeout(() => {
        setShowModal(true);
      }, 750);
    }
  };

  const handleHint = () => {
    if (isSolved || showPeek) return;
    const bestTileIdx = findNextHintTileIndex(board);
    if (bestTileIdx !== null) {
      setHintPosIdx(bestTileIdx);
      playArenaTone('flip');
    }
  };

  const handlePlayNextFish = () => {
    const nextIdx = (fishIdx + 1) % BETTA_CARDS.length;
    initPuzzle(nextIdx, difficultyKey);
  };

  const correctCount = board.filter((val, idx) => val !== EMPTY_TILE && val === idx).length;
  const starThreshold3 = difficultyKey === 'easy' ? 14 : difficultyKey === 'medium' ? 28 : 50;
  const starThreshold2 = difficultyKey === 'easy' ? 25 : difficultyKey === 'medium' ? 48 : 80;
  const stars = moves <= starThreshold3 ? 3 : moves <= starThreshold2 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Slide Puzzle 3×3"
        subtitle={`${currentFish.name} · ${difficulty.label}`}
        onBack={onBack}
        onRestart={() => initPuzzle(fishIdx, difficultyKey)}
      />

      <div className="sp-wrap">
        {/* Tingkat Kesulitan + Mini Referensi Foto */}
        <div className="sp-top-row">
          <div className="mm-mode-switch" role="tablist" aria-label="Pilih Tingkat Kesulitan">
            {Object.values(DIFFICULTIES).map((d) => (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={difficultyKey === d.id}
                className={`mm-mode-btn ${difficultyKey === d.id ? 'active' : ''}`}
                onClick={() => initPuzzle(fishIdx, d.id)}
              >
                <span>{d.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className="sp-ref-mini"
            onClick={() => setShowPeek((prev) => !prev)}
            title="Ketuk untuk perbesar foto contoh"
          >
            <img src={currentFish.image} alt={`Contoh ${currentFish.name}`} />
            <span>Contoh</span>
          </button>
        </div>

        {/* HUD Controls */}
        <div className="sp-hud">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', fontWeight: 800 }}>
            <span>
              <i className="fas fa-arrows-alt" style={{ marginRight: '4px', color: 'var(--ck-text-muted)' }} />
              {moves}
            </span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              <i className="fas fa-clock" style={{ marginRight: '4px', color: 'var(--ck-text-muted)' }} />
              {formatTime(seconds)}
            </span>
            <span style={{ color: '#22c55e' }}>
              <i className="fas fa-check-circle" style={{ marginRight: '4px' }} />
              {correctCount}/8 pas
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="mm-icon-btn sp-hint-btn"
              style={{ height: '30px', fontSize: '11.5px' }}
              onClick={handleHint}
              disabled={isSolved}
            >
              <i className="fas fa-lightbulb" />
              <span>Bantuan</span>
            </button>

            <button
              type="button"
              className="mm-icon-btn"
              style={{ height: '30px', fontSize: '11.5px' }}
              onClick={() => setShowNumbers((prev) => !prev)}
            >
              <i className="fas fa-hashtag" />
              <span>{showNumbers ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>

        {/* 3x3 Puzzle Board */}
        <div className="sp-board-shell">
          <div className={`sp-grid ${isSolved ? 'solved' : ''}`}>
            {board.map((tileVal, posIdx) => {
              const isEmpty = tileVal === EMPTY_TILE && !isSolved;
              const canMove = !isSolved && movableIndices.includes(posIdx);
              const isCorrectSpot = tileVal === posIdx;
              const isHint = hintPosIdx === posIdx;
              const bgX = (tileVal % 3) * 50;
              const bgY = Math.floor(tileVal / 3) * 50;

              if (isEmpty) {
                return <div key="empty-slot" className="sp-tile empty" aria-label="Ruang kosong" />;
              }

              return (
                <button
                  key={tileVal}
                  type="button"
                  className={`sp-tile ${canMove ? 'movable' : ''} ${isHint ? 'hinted' : ''}`}
                  onClick={() => handleTileClick(posIdx)}
                  disabled={!canMove}
                  aria-label={`Potongan ${tileVal + 1}`}
                  style={{
                    backgroundImage: `url(${currentFish.image})`,
                    backgroundPosition: `${bgX}% ${bgY}%`,
                  }}
                >
                  {showNumbers && !isSolved && (
                    <span className={`sp-tile-num ${isCorrectSpot ? 'correct' : ''}`}>
                      {tileVal + 1}
                    </span>
                  )}
                  {isHint && !isSolved && (
                    <span className="sp-hint-badge">Geser ini!</span>
                  )}
                </button>
              );
            })}
          </div>

          {showPeek && (
            <div className="sp-peek-overlay" onClick={() => setShowPeek(false)}>
              <img src={currentFish.image} alt={`Contoh utuh ${currentFish.name}`} />
              <span className="sp-peek-tag">Foto Asli: {currentFish.name} (Ketuk untuk tutup)</span>
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
              onClick={() => initPuzzle(idx, difficultyKey)}
            >
              {fish.shortName}
            </button>
          ))}
        </div>
      </div>

      <ArenaWinModal
        open={showModal}
        title="Puzzle Tersusun Utuh!"
        subtitle={`Keren! Foto ${currentFish.name} (${difficulty.label}) berhasil kamu susun sempurna. ${currentFish.fact}`}
        stars={stars}
        previewImage={currentFish.image}
        previewLabel={currentFish.name}
        stats={[
          { label: 'Geseran', value: moves },
          { label: 'Waktu', value: formatTime(seconds) },
          { label: 'Level', value: difficulty.label },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru menyelesaikan Slide Puzzle ${currentFish.name} (${difficulty.label}) dalam ${moves} geseran dan tertarik dengan koleksi ikannya.`}
        onPlayAgain={handlePlayNextFish}
        onBackToHub={onBack}
      />
    </div>
  );
}
