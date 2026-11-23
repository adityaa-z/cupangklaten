'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BETTA_CARDS } from '../shared/bettaData';
import { GameHeader, ArenaWinModal, playArenaTone } from '../shared/ArenaShared';
import './quiz.css';

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(totalCount) {
  const pool = shuffleArray(BETTA_CARDS).slice(0, Math.min(totalCount, BETTA_CARDS.length));
  return pool.map((correctFish) => {
    const distractors = shuffleArray(
      BETTA_CARDS.filter((f) => f.id !== correctFish.id)
    ).slice(0, 3);
    const options = shuffleArray([correctFish, ...distractors]);
    return {
      fish: correctFish,
      options,
    };
  });
}

export default function QuizGame({ onBack }) {
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const timerRef = useRef(null);

  const initQuiz = useCallback((count = totalQuestions) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTotalQuestions(count);
    setQuestions(buildQuestions(count));
    setCurrentIndex(0);
    setScore(0);
    setSelectedId(null);
    setIsFinished(false);
  }, [totalQuestions]);

  useEffect(() => {
    initQuiz(5);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQuestion = questions[currentIndex];
  const hasAnswered = selectedId !== null;
  const isCorrect = hasAnswered && currentQuestion && selectedId === currentQuestion.fish.id;

  const handleSelectOption = (optionFish) => {
    if (hasAnswered || !currentQuestion || isFinished) return;

    const correct = optionFish.id === currentQuestion.fish.id;
    setSelectedId(optionFish.id);

    if (correct) {
      setScore((prev) => prev + 1);
      playArenaTone('correct');
    } else {
      playArenaTone('wrong');
    }

    // Jeda 1,2 detik lalu otomatis pindah ke soal berikutnya
    timerRef.current = setTimeout(() => {
      if (currentIndex + 1 >= questions.length) {
        setIsFinished(true);
        playArenaTone('win');
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedId(null);
      }
    }, 1200);
  };

  const progressPct = questions.length > 0 ? ((currentIndex + (hasAnswered ? 1 : 0)) / questions.length) * 100 : 0;
  const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const stars = accuracy >= 85 ? 3 : accuracy >= 55 ? 2 : 1;

  return (
    <div>
      <GameHeader
        title="Tebak Jenis Cupang"
        subtitle="Kuis Gambar Cepat"
        onBack={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          onBack();
        }}
        onRestart={() => initQuiz(totalQuestions)}
      />

      <div className="qz-wrap">
        {/* Top Bar: Mode Jumlah Soal, Ronde & Skor */}
        <div className="qz-top-bar">
          <div className="mm-mode-switch" role="tablist" aria-label="Pilih Jumlah Soal">
            {[5, 8].map((cnt) => (
              <button
                key={cnt}
                type="button"
                role="tab"
                aria-selected={totalQuestions === cnt}
                className={`mm-mode-btn ${totalQuestions === cnt ? 'active' : ''}`}
                onClick={() => initQuiz(cnt)}
              >
                <span>{cnt} Soal</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 800 }}>
            <span style={{ color: 'var(--ck-text-2)' }}>
              Soal {Math.min(currentIndex + 1, questions.length)} / {questions.length}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '8px',
              background: 'var(--ck-surface-2)',
              border: '1px solid var(--ck-border)',
              color: 'var(--ck-text)',
            }}>
              Skor: {score}
            </span>
          </div>

          <div className="qz-progress-track">
            <div className="qz-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Foto Soal & Pilihan Jawaban */}
        {currentQuestion && (
          <>
            <div className="qz-photo-card">
              <img
                src={currentQuestion.fish.image}
                alt="Tebak jenis ikan cupang ini"
                draggable={false}
              />
            </div>

            <p className="qz-question-prompt">
              Apa nama jenis ikan cupang pada foto di atas?
            </p>

            <div className="qz-options-grid">
              {currentQuestion.options.map((opt) => {
                let stateClass = '';
                if (hasAnswered) {
                  if (opt.id === currentQuestion.fish.id) stateClass = 'correct';
                  else if (opt.id === selectedId) stateClass = 'wrong';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`qz-option-btn ${stateClass}`}
                    disabled={hasAnswered}
                    onClick={() => handleSelectOption(opt)}
                  >
                    <span>{opt.name}</span>
                    {stateClass === 'correct' && <i className="fas fa-check-circle" />}
                    {stateClass === 'wrong' && <i className="fas fa-times-circle" />}
                  </button>
                );
              })}
            </div>

            {hasAnswered && (
              <div className={`qz-feedback-box ${isCorrect ? 'correct' : 'wrong'}`} aria-live="polite">
                <strong style={{ display: 'block', marginBottom: '2px', color: 'var(--ck-text)' }}>
                  {isCorrect
                    ? `Benar! Ini adalah ${currentQuestion.fish.name}.`
                    : `Kurang tepat — jawaban aslinya: ${currentQuestion.fish.name}.`}
                </strong>
                <span>{currentQuestion.fish.fact}</span>
              </div>
            )}
          </>
        )}
      </div>

      <ArenaWinModal
        open={isFinished}
        title={`Skor Kamu: ${score} dari ${questions.length} Benar`}
        subtitle={
          accuracy === 100
            ? 'Sempurna! Kamu benar-benar paham semua jenis ikan cupang hias.'
            : accuracy >= 60
              ? 'Bagus sekali! Pengetahuanmu tentang jenis ikan cupang sudah keren.'
              : 'Mantap! Coba main sekali lagi biar makin hafal semua variannya.'
        }
        stars={stars}
        stats={[
          { label: 'Benar', value: `${score} / ${questions.length}` },
          { label: 'Akurasi', value: `${accuracy}%` },
          { label: 'Mode', value: `${questions.length} Soal` },
        ]}
        waMessage={`Halo Admin cans.betta x cupangklaten! Saya baru main Kuis Tebak Jenis Cupang dengan skor ${score}/${questions.length} dan ingin melihat koleksi ikannya.`}
        onPlayAgain={() => initQuiz(totalQuestions)}
        onBackToHub={onBack}
      />
    </div>
  );
}
