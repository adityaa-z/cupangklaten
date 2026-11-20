'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { loadState, saveState, createDefaultFish, getLocalDateString } from './gameState';
import { FISH_CATALOG, MUTATION_STAGES, getFishById, getMutationStage } from './fishConfig';
import {
  AQUARIUM_LEVELS,
  FOOD_CONFIG,
  DISEASE_CONFIG,
  getAquariumLevelConfig,
  getFoodById,
} from './gameConfig';
import FishDisplay from './FishDisplay';
import AquariumSVG from './AquariumSVG';
import CheckinModal from './CheckinModal';
import UpgradeModal from './UpgradeModal';
import FishCollectionModal from './FishCollectionModal';
import ShopModal from './ShopModal';
import './soliter.css';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/* ─── Sleek Studio HUD Metric Bar ─────────────────────────────────────────── */
function HudBar({ label, value, displayText, max = 100, color }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '5px',
      }}>
        <span style={{
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ck-text-muted)',
        }}>
          {label}
        </span>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color }}>
          {displayText ?? `${Math.round(value)}%`}
        </span>
      </div>
      <div style={{
        height: '4px',
        borderRadius: '99px',
        background: 'var(--ck-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '99px',
          background: color,
          transition: 'width 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }} />
      </div>
    </div>
  );
}

/* ─── Trait Indicator (Body / Sirip / Warna) ──────────────────────────────── */
function TraitPill({ label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: 'var(--ck-surface)',
      border: '1px solid var(--ck-border)',
      borderRadius: '10px',
      padding: '8px 10px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
        <span style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ck-text-muted)' }}>
          {label}
        </span>
        <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ck-text)' }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: '3px', borderRadius: '99px', background: 'var(--ck-border)', overflow: 'hidden' }}>
        <div style={{ width: `${clamp(value, 0, 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

/* ─── Action Button ───────────────────────────────────────────────────────── */
function ActionBtn({ icon, label, onClick, disabled, alertDot, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`ck-action-btn ${active ? 'active' : ''}`}
    >
      <i className={`fas ${icon}`} style={{ fontSize: '15px' }} />
      <span style={{ fontSize: '10.5px', fontWeight: 600, whiteSpace: 'nowrap' }}>{label}</span>
      {alertDot && (
        <span style={{
          position: 'absolute',
          top: '6px',
          right: '8px',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: '#e05252',
        }} />
      )}
    </button>
  );
}

/* ─── Navigation Button ───────────────────────────────────────────────────── */
function NavBtn({ icon, label, onClick, active, dot }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ck-nav-btn ${active ? 'active' : ''}`}
    >
      <i className={`fas ${icon}`} style={{ fontSize: '15px' }} />
      <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{label}</span>
      {dot && (
        <span style={{
          position: 'absolute',
          top: '6px',
          right: '26%',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: 'var(--ck-accent)',
        }} />
      )}
    </button>
  );
}

/* ─── Toast Notification ──────────────────────────────────────────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [message, onDone]);

  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--ck-surface-2)',
      border: '1px solid var(--ck-border-strong)',
      borderRadius: '10px',
      padding: '9px 16px',
      color: 'var(--ck-text)',
      fontSize: '12.5px',
      fontWeight: 600,
      zIndex: 9998,
      pointerEvents: 'none',
      boxShadow: '0 14px 36px rgba(0,0,0,0.35)',
      maxWidth: '90vw',
      textAlign: 'center',
    }}>
      {message}
    </div>
  );
}

/* ─── Panduan Perawatan Modal ─────────────────────────────────────────────── */
function InfoModal({ gameState, onClose }) {
  const fishCfg = getFishById(gameState.activeFishId);
  const aq = gameState.aquarium;
  return (
    <div className="ck-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ck-modal-card" style={{ maxWidth: '460px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Panduan Perawatan Cupang</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ck-text-muted)', fontSize: '17px', cursor: 'pointer' }}
            aria-label="Tutup"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--ck-text-2)', lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'var(--ck-surface-2)', borderRadius: '10px', padding: '11px 12px', border: '1px solid var(--ck-border)' }}>
            <div style={{ color: 'var(--ck-text)', fontWeight: 700, marginBottom: '4px' }}>Kualitas Air & pH</div>
            pH ideal umum <strong style={{ color: 'var(--ck-text)' }}>6.5–7.0</strong> (Wild Betta <strong style={{ color: 'var(--ck-text)' }}>6.0–6.6</strong>). Gunakan <strong style={{ color: 'var(--ck-text)' }}>Ganti Air Parsial</strong> agar pH stabil. Jika melakukan <strong style={{ color: 'var(--ck-text)' }}>Kuras Total</strong>, wajib tambahkan Ketapang & Garam Ikan untuk mencegah stres dan Velvet.
          </div>

          <div style={{ background: 'var(--ck-surface-2)', borderRadius: '10px', padding: '11px 12px', border: '1px solid var(--ck-border)' }}>
            <div style={{ color: 'var(--ck-text)', fontWeight: 700, marginBottom: '4px' }}>Nutrisi 5 Jenis Pakan & Mutasi 1–5 Bulan</div>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li><strong style={{ color: 'var(--ck-text)' }}>Pelet Harian</strong> — nutrisi dasar seimbang.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Cacing Sutra</strong> — protein tinggi untuk massa body & tulang sirip.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Kutu Air (Daphnia)</strong> — serat alami, melancarkan pencernaan & menyembuhkan kembung.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Jentik / Artemia</strong> — memicu insting berburu, flaring & bukaan ekor.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Pakan Pencerah</strong> — Astaxanthin untuk mempertajam saturasi warna.</li>
            </ul>
          </div>

          <div style={{ background: 'var(--ck-surface-2)', borderRadius: '10px', padding: '11px 12px', border: '1px solid var(--ck-border)' }}>
            <div style={{ color: 'var(--ck-text)', fontWeight: 700, marginBottom: '4px' }}>Penanganan 3 Penyakit (Soft Decay)</div>
            <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <li><strong style={{ color: 'var(--ck-text)' }}>Fin Rot</strong> — Ganti Air + Obat Kuning (Acriflavine) + Garam Ikan.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Velvet / White Spot</strong> — Obat Biru (Methylene Blue) + Garam + Ketapang.</li>
              <li><strong style={{ color: 'var(--ck-text)' }}>Kembung</strong> — Puasakan pakan biasa, lalu beri Kutu Air (Daphnia).</li>
            </ul>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--ck-text-muted)', display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span>Ikan aktif: <strong style={{ color: 'var(--ck-text)' }}>{fishCfg.species}</strong></span>
            <span>pH {aq.waterPH.toFixed(1)} · Tanin {Math.round(aq.taninLevel)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Soliter Virtual Game Component ─────────────────────────────────── */
export default function SoliterGame({ embedded = false }) {
  const { data: session, status } = useSession();
  const userKey = session?.user?.email || null;
  const isLoggedIn = status === 'authenticated' && Boolean(session);
  const isLocked = !isLoggedIn;

  const [state, setState] = useState(null);
  const [modal, setModal] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFlaring, setIsFlaring] = useState(false);
  const [flareCooldown, setFlareCooldown] = useState(0);
  const [previewMonth, setPreviewMonth] = useState(null); // optional preview of 1..5 month stage
  const decayRef = useRef(null);
  const flareTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    setState(loadState(userKey));
  }, [userKey]);

  useEffect(() => {
    if (state && isLoggedIn) saveState(state, userKey);
  }, [state, isLoggedIn, userKey]);

  useEffect(() => {
    if (flareCooldown <= 0) return;
    const id = setInterval(() => {
      setFlareCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [flareCooldown]);

  useEffect(() => {
    return () => {
      if (flareTimerRef.current) clearTimeout(flareTimerRef.current);
    };
  }, []);

  // ─── Simulation Tick (every 20s, only active when logged in) ──────────────
  useEffect(() => {
    if (!state || !isLoggedIn) return;
    decayRef.current = setInterval(() => {
      setState((prev) => {
        if (!prev) return prev;
        const fishId = prev.activeFishId;
        const fish = prev.fishes[fishId];
        if (!fish) return prev;

        const fishCfg = getFishById(fishId);
        const aqCfg = getAquariumLevelConfig(prev.aquarium.level);
        const aq = { ...prev.aquarium };
        const [idealMinPH, idealMaxPH] = fishCfg.preferPH || [6.5, 7.0];

        const clarityDrop = 0.4 * aqCfg.waterDecayMultiplier;
        aq.waterClarity = clamp(aq.waterClarity - clarityDrop, 0, 100);
        aq.taninLevel = clamp(aq.taninLevel - 0.15, 0, 100);
        aq.saltLevel = clamp(aq.saltLevel - 0.15, 0, 100);

        let nextPH = aq.waterPH;
        if (aq.waterClarity < 45) {
          nextPH = clamp(nextPH + 0.04, 5.0, 8.5);
        } else if (aqCfg.phStabilizer) {
          const targetMid = (idealMinPH + idealMaxPH) / 2;
          if (Math.abs(nextPH - targetMid) > 0.05) {
            nextPH += nextPH > targetMid ? -0.05 : 0.05;
          }
        }
        aq.waterPH = parseFloat(nextPH.toFixed(2));
        aq.lastUpdatedAt = Date.now();

        const nextHunger = clamp(fish.hunger - 0.8, 0, 100);
        let nextOverfeed = fish.overfeedCount || 0;
        if (nextHunger < 70 && nextOverfeed > 0) {
          nextOverfeed = Math.max(0, nextOverfeed - 1);
        }

        const phInIdeal = aq.waterPH >= idealMinPH && aq.waterPH <= idealMaxPH;
        const phExtreme = aq.waterPH < 5.6 || aq.waterPH > 7.9;
        let nextDisease = fish.disease;

        if (!nextDisease) {
          if (aq.waterClarity < 35 && aq.saltLevel < 20 && Math.random() < 0.35) {
            nextDisease = 'finRot';
          } else if ((aq.fullChangeUnconditioned || phExtreme) && aq.saltLevel < 15 && aq.taninLevel < 15 && Math.random() < 0.4) {
            nextDisease = 'velvet';
            aq.fullChangeUnconditioned = false;
          }
        }

        let healthDelta = 0;
        let moodDelta = 0;
        if (nextHunger <= 10) { healthDelta -= 0.8; moodDelta -= 1.2; }
        if (aq.waterClarity < 40) { healthDelta -= 0.6; moodDelta -= 0.8; }
        if (!phInIdeal) {
          moodDelta -= phExtreme ? 1.5 : 0.4;
          if (phExtreme) healthDelta -= 0.7;
        } else if (aq.waterClarity >= 70 && !nextDisease) {
          healthDelta += 0.5;
          moodDelta += 0.4 * aqCfg.moodMultiplier;
        }
        if (fishCfg.lovesTanin && aq.taninLevel >= 25 && phInIdeal) {
          moodDelta += 0.8;
          healthDelta += 0.4;
        }
        if (nextDisease) { healthDelta -= 0.9; moodDelta -= 1.0; }

        return {
          ...prev,
          aquarium: aq,
          fishes: {
            ...prev.fishes,
            [fishId]: {
              ...fish,
              hunger: nextHunger,
              health: clamp(fish.health + healthDelta, 10, 100),
              mood: clamp(fish.mood + moodDelta, 10, 100),
              disease: nextDisease,
              overfeedCount: nextOverfeed,
            },
          },
        };
      });
    }, 20000);
    return () => clearInterval(decayRef.current);
  }, [state !== null, isLoggedIn]);

  // ─── Action Handlers ──────────────────────────────────────────────────────

  function handleFeed(foodId) {
    setOpenMenu(null);
    setPreviewMonth(null);
    const food = getFoodById(foodId);

    setState((prev) => {
      if (!prev) return prev;
      const fishId = prev.activeFishId;
      const fish = { ...createDefaultFish(prev.fishes[fishId]?.species), ...prev.fishes[fishId] };
      const inv = { ...prev.inventory };
      const aqCfg = getAquariumLevelConfig(prev.aquarium.level);

      if (!inv[foodId] || inv[foodId] < 1) {
        showToast(`Stok ${food.shortLabel} habis. Tukar poin untuk mengisi ulang.`);
        return prev;
      }

      if (fish.disease === 'bloated') {
        if (food.curesBloated) {
          showToast('Kutu Air (Daphnia) melancarkan pencernaan — kembung pulih.');
          return {
            ...prev,
            inventory: { ...inv, [foodId]: inv[foodId] - 1 },
            fishes: {
              ...prev.fishes,
              [fishId]: {
                ...fish,
                disease: null,
                overfeedCount: 0,
                hunger: clamp(fish.hunger + 8, 0, 100),
                health: clamp(fish.health + 12, 10, 100),
                mood: clamp(fish.mood + 10, 10, 100),
                lastFedAt: Date.now(),
              },
            },
          };
        }
        showToast('Ikan sedang kembung. Puasakan pakan biasa dan berikan Kutu Air (Daphnia).');
        return {
          ...prev,
          inventory: { ...inv, [foodId]: inv[foodId] - 1 },
          fishes: {
            ...prev.fishes,
            [fishId]: {
              ...fish,
              health: clamp(fish.health - 5, 10, 100),
              mood: clamp(fish.mood - 6, 10, 100),
              lastFedAt: Date.now(),
            },
          },
        };
      }

      const isOverfeeding = fish.hunger >= 85 && !food.curesBloated;
      let nextOverfeed = food.curesBloated ? 0 : fish.overfeedCount || 0;
      let nextDisease = fish.disease;

      if (isOverfeeding) {
        nextOverfeed += 1;
        if (nextOverfeed >= 2) {
          nextDisease = 'bloated';
          showToast('Overfeeding terdeteksi — ikan mengalami kembung. Beri Kutu Air (Daphnia).');
        } else {
          showToast('Ikan masih kenyang. Hindari memberi makan berulang agar tidak kembung.');
        }
      }

      const isPreferred = food.preferredSpecies.includes(fishId);
      const bodyGain = food.bodySize + (isPreferred && foodId === 'tubifex' ? 2 : 0);
      const finGain = food.finSpread + (isPreferred && foodId === 'artemia' ? 2 : 0);
      const colorGain = food.colorVibrancy + (foodId === 'colorFood' && prev.aquarium.level >= 3 ? 2 : 0);
      const moodGain = Math.round(food.mood * aqCfg.moodMultiplier);

      // Growth / Mutation progression (Bulan 1 -> Bulan 5)
      let nextAge = fish.ageMonth || 1;
      let nextExp = (fish.growthExp || 0) + (isOverfeeding ? 0 : food.growthExp || 12);
      let agedUp = false;
      if (nextAge < 5 && nextExp >= 100) {
        nextAge += 1;
        nextExp -= 100;
        agedUp = true;
      } else if (nextAge >= 5) {
        nextExp = 100;
      }

      if (!isOverfeeding) {
        if (agedUp) {
          const stage = getMutationStage(nextAge);
          showToast(`Mutasi naik ke Bulan ${nextAge}: ${stage.title}`);
        } else {
          showToast(`${fish.species} diberi ${food.shortLabel}${isPreferred ? ' (nutrisi optimal)' : ''}.`);
        }
      }

      return {
        ...prev,
        inventory: { ...inv, [foodId]: inv[foodId] - 1 },
        aquarium: {
          ...prev.aquarium,
          waterClarity: clamp(prev.aquarium.waterClarity + food.waterImpact, 0, 100),
          lastUpdatedAt: Date.now(),
        },
        fishes: {
          ...prev.fishes,
          [fishId]: {
            ...fish,
            ageMonth: nextAge,
            growthExp: nextExp,
            hunger: clamp(fish.hunger + food.hunger, 0, 100),
            health: clamp(fish.health + (isOverfeeding ? -4 : food.health), 10, 100),
            mood: clamp(fish.mood + (isOverfeeding ? -5 : moodGain), 10, 100),
            bodySize: clamp(fish.bodySize + bodyGain, 10, 100),
            finSpread: clamp(fish.finSpread + finGain, 10, 100),
            colorVibrancy: clamp(fish.colorVibrancy + colorGain, 10, 100),
            overfeedCount: nextOverfeed,
            disease: nextDisease,
            lastFedAt: Date.now(),
          },
        },
      };
    });
  }

  function handleFlaring() {
    setOpenMenu(null);
    if (!state) return;
    const fish = state.fishes[state.activeFishId];
    if (fish?.disease) {
      showToast('Ikan sedang sakit — obati terlebih dahulu sebelum sesi flaring.');
      return;
    }
    if (flareCooldown > 0 || isFlaring) return;

    const aqCfg = getAquariumLevelConfig(state.aquarium.level);
    setIsFlaring(true);
    setFlareCooldown(12);

    const moodBoost = Math.round(10 * aqCfg.flaringBonus);
    const finBoost = Math.round(2 * aqCfg.flaringBonus);
    const pointsReward = 3;

    setState((prev) => {
      if (!prev) return prev;
      const fId = prev.activeFishId;
      const f = prev.fishes[fId];
      return {
        ...prev,
        points: prev.points + pointsReward,
        fishes: {
          ...prev.fishes,
          [fId]: {
            ...f,
            mood: clamp(f.mood + moodBoost, 10, 100),
            finSpread: clamp(f.finSpread + finBoost, 10, 100),
            colorVibrancy: clamp(f.colorVibrancy + 1, 10, 100),
          },
        },
      };
    });

    showToast(`Sesi flaring aktif — Mood +${moodBoost}, Sirip +${finBoost}, +${pointsReward} poin.`);
    flareTimerRef.current = setTimeout(() => setIsFlaring(false), 4000);
  }

  function handlePartialWaterChange() {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const aq = prev.aquarium;
      const nextPH = parseFloat((aq.waterPH + (6.9 - aq.waterPH) * 0.35).toFixed(2));
      showToast('Ganti air parsial (40%) selesai — kejernihan meningkat dan pH tetap stabil.');
      return {
        ...prev,
        aquarium: {
          ...aq,
          waterClarity: clamp(aq.waterClarity + 38, 0, 100),
          waterPH: nextPH,
          taninLevel: clamp(aq.taninLevel * 0.65, 0, 100),
          saltLevel: clamp(aq.saltLevel * 0.65, 0, 100),
          fullChangeUnconditioned: false,
          lastUpdatedAt: Date.now(),
        },
      };
    });
  }

  function handleFullWaterChange() {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      showToast('Kuras total 100% selesai — tambahkan Ketapang & Garam Ikan agar ikan tidak stres.');
      return {
        ...prev,
        aquarium: {
          ...prev.aquarium,
          waterClarity: 100,
          waterPH: 7.3,
          taninLevel: 0,
          saltLevel: 0,
          fullChangeUnconditioned: true,
          lastUpdatedAt: Date.now(),
        },
        fishes: {
          ...prev.fishes,
          [fishId]: { ...fish, mood: clamp(fish.mood - 15, 10, 100) },
        },
      };
    });
  }

  function handleKetapang() {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const inv = { ...prev.inventory };
      if (!inv.ketapang || inv.ketapang < 1) {
        showToast('Stok Ekstrak Ketapang habis. Tukar di menu Tukar Poin.');
        return prev;
      }
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      const fishCfg = getFishById(fishId);
      const nextPH = parseFloat(clamp(prev.aquarium.waterPH - 0.25, 5.5, 8.5).toFixed(2));
      const moodBonus = fishCfg.lovesTanin ? 14 : 8;
      const healthBonus = fishCfg.lovesTanin ? 5 : 2;
      const conditioned = prev.aquarium.saltLevel >= 10 ? false : prev.aquarium.fullChangeUnconditioned;

      showToast(`Ekstrak Ketapang ditambahkan — pH ${nextPH}, kadar tanin meningkat.`);
      return {
        ...prev,
        inventory: { ...inv, ketapang: inv.ketapang - 1 },
        aquarium: {
          ...prev.aquarium,
          taninLevel: clamp(prev.aquarium.taninLevel + 25, 0, 100),
          waterPH: nextPH,
          fullChangeUnconditioned: conditioned,
          lastUpdatedAt: Date.now(),
        },
        fishes: {
          ...prev.fishes,
          [fishId]: {
            ...fish,
            mood: clamp(fish.mood + moodBonus, 10, 100),
            health: clamp(fish.health + healthBonus, 10, 100),
          },
        },
      };
    });
  }

  function handleSalt() {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const inv = { ...prev.inventory };
      if (!inv.aquariumSalt || inv.aquariumSalt < 1) {
        showToast('Stok Garam Ikan habis. Tukar di menu Tukar Poin.');
        return prev;
      }
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      const conditioned = prev.aquarium.taninLevel >= 10 ? false : prev.aquarium.fullChangeUnconditioned;

      showToast('Garam Ikan ditambahkan — membantu osmoregulasi dan mencegah jamur.');
      return {
        ...prev,
        inventory: { ...inv, aquariumSalt: inv.aquariumSalt - 1 },
        aquarium: {
          ...prev.aquarium,
          saltLevel: clamp(prev.aquarium.saltLevel + 25, 0, 100),
          fullChangeUnconditioned: conditioned,
          lastUpdatedAt: Date.now(),
        },
        fishes: {
          ...prev.fishes,
          [fishId]: { ...fish, health: clamp(fish.health + 4, 10, 100) },
        },
      };
    });
  }

  function handleMedicine(medType) {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const inv = { ...prev.inventory };
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      const aq = prev.aquarium;

      if (!inv[medType] || inv[medType] < 1) {
        showToast('Stok obat habis. Tukar di menu Tukar Poin.');
        return prev;
      }
      if (!fish.disease) {
        showToast('Ikan dalam kondisi sehat, tidak memerlukan obat.');
        return prev;
      }

      if (medType === 'medicineYellow') {
        if (fish.disease !== 'finRot') {
          showToast('Obat Kuning (Acriflavine) digunakan khusus untuk Fin Rot.');
          return prev;
        }
        if (aq.waterClarity < 55) {
          showToast('Lakukan ganti air terlebih dahulu (min. 55% jernih) sebelum mengobati Fin Rot.');
          return prev;
        }
        const hasSalt = aq.saltLevel >= 10;
        showToast(
          hasSalt
            ? 'Fin Rot sembuh — kombinasi Obat Kuning, air bersih, dan Garam Ikan berhasil.'
            : 'Fin Rot teratasi. Disarankan menambah Garam Ikan untuk pemulihan sirip.'
        );
        return {
          ...prev,
          inventory: { ...inv, medicineYellow: inv.medicineYellow - 1 },
          fishes: {
            ...prev.fishes,
            [fishId]: {
              ...fish,
              disease: null,
              health: clamp(fish.health + (hasSalt ? 18 : 12), 10, 100),
              mood: clamp(fish.mood + 10, 10, 100),
            },
          },
        };
      }

      if (medType === 'medicineBlue') {
        if (fish.disease !== 'velvet') {
          showToast('Obat Biru (Methylene Blue) digunakan khusus untuk Velvet / White Spot.');
          return prev;
        }
        const hasSupport = aq.saltLevel >= 10 && aq.taninLevel >= 10;
        showToast(
          hasSupport
            ? 'Velvet sembuh total — Obat Biru, Garam, dan Ketapang bekerja optimal.'
            : 'Velvet teratasi. Tambahkan Garam dan Ketapang agar kondisi air tetap stabil.'
        );
        return {
          ...prev,
          inventory: { ...inv, medicineBlue: inv.medicineBlue - 1 },
          aquarium: { ...aq, fullChangeUnconditioned: false },
          fishes: {
            ...prev.fishes,
            [fishId]: {
              ...fish,
              disease: null,
              health: clamp(fish.health + (hasSupport ? 18 : 12), 10, 100),
              mood: clamp(fish.mood + 10, 10, 100),
            },
          },
        };
      }
      return prev;
    });
  }

  // ─── Modal Handlers ───────────────────────────────────────────────────────

  function handleCheckin(pointsEarned, newStreak) {
    setState((prev) => ({
      ...prev,
      points: prev.points + pointsEarned,
      checkin: { lastCheckinDate: getLocalDateString(), streakDays: newStreak },
    }));
    setModal(null);
    showToast(`+${pointsEarned} poin check-in diterima · Streak hari ke-${newStreak}`);
  }

  function handleUpgrade(toLevel) {
    const target = AQUARIUM_LEVELS.find((l) => l.level === toLevel);
    if (!target) return;
    setState((prev) => {
      if (prev.points < target.cost) {
        showToast('Poin belum mencukupi.');
        return prev;
      }
      showToast(`Upgrade ke Level ${toLevel} (${target.name}) berhasil.`);
      return {
        ...prev,
        points: prev.points - target.cost,
        aquarium: { ...prev.aquarium, level: toLevel },
      };
    });
    setModal(null);
  }

  function handleUnlock(fishId) {
    const fishCfg = FISH_CATALOG.find((f) => f.id === fishId);
    if (!fishCfg) return;
    setState((prev) => {
      if (prev.points < fishCfg.unlockCost) {
        showToast('Poin belum mencukupi.');
        return prev;
      }
      if (prev.unlockedFishes.includes(fishId)) return prev;
      showToast(`${fishCfg.species} berhasil dibuka.`);
      return {
        ...prev,
        points: prev.points - fishCfg.unlockCost,
        unlockedFishes: [...prev.unlockedFishes, fishId],
        fishes: {
          ...prev.fishes,
          [fishId]: prev.fishes[fishId] || createDefaultFish(fishCfg.species),
        },
      };
    });
  }

  function handleActivate(fishId) {
    const fishCfg = FISH_CATALOG.find((f) => f.id === fishId);
    setPreviewMonth(null);
    setState((prev) => ({
      ...prev,
      activeFishId: fishId,
      fishes: {
        ...prev.fishes,
        [fishId]: prev.fishes[fishId] || createDefaultFish(fishCfg?.species || 'Plakat'),
      },
    }));
    setModal(null);
    showToast(`${fishCfg?.species} ditampilkan di soliter utama.`);
  }

  function handleBuyShopItem(item) {
    setState((prev) => {
      if (prev.points < item.cost) {
        showToast('Poin belum mencukupi.');
        return prev;
      }
      showToast(`Ditukar: ${item.name} (-${item.cost} poin)`);
      return {
        ...prev,
        points: prev.points - item.cost,
        inventory: {
          ...prev.inventory,
          [item.key]: (prev.inventory[item.key] || 0) + item.qty,
        },
      };
    });
  }

  if (!state) {
    return (
      <div style={{
        minHeight: embedded ? '420px' : '100vh',
        background: '#090a0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280',
        fontSize: '13px',
      }}>
        Memuat Soliter Virtual...
      </div>
    );
  }

  const fishId = state.activeFishId;
  const fish = { ...createDefaultFish('Plakat'), ...(state.fishes[fishId] || {}) };
  const fishCfg = getFishById(fishId);
  const aq = state.aquarium;
  const aqCfg = getAquariumLevelConfig(aq.level);
  const [idealMinPH, idealMaxPH] = fishCfg.preferPH || [6.5, 7.0];
  const phIdeal = aq.waterPH >= idealMinPH && aq.waterPH <= idealMaxPH;
  const phExtreme = aq.waterPH < 5.6 || aq.waterPH > 7.9;
  const unclaimedToday = state.checkin.lastCheckinDate !== getLocalDateString();
  const activeDisease = fish.disease ? DISEASE_CONFIG[fish.disease] : null;

  const displayAge = previewMonth ?? (fish.ageMonth || 1);
  const currentStage = getMutationStage(displayAge);
  const displayFishState = previewMonth ? { ...fish, ageMonth: previewMonth } : fish;

  const hungerColor = fish.hunger > 50 ? 'var(--ck-ok)' : fish.hunger > 25 ? 'var(--ck-warn)' : 'var(--ck-err)';
  const waterColor = aq.waterClarity > 60 ? 'var(--ck-water)' : aq.waterClarity > 35 ? 'var(--ck-warn)' : 'var(--ck-err)';
  const phColor = phIdeal ? 'var(--ck-ok)' : phExtreme ? 'var(--ck-err)' : 'var(--ck-warn)';
  const healthColor = fish.health > 60 ? 'var(--ck-ok)' : fish.health > 30 ? 'var(--ck-warn)' : 'var(--ck-err)';
  const moodColor = fish.mood > 55 ? 'var(--ck-text)' : 'var(--ck-text-muted)';
  const phPct = clamp(((aq.waterPH - 5.0) / (8.5 - 5.0)) * 100, 0, 100);

  const hudContent = (
    <div className="ck-panel" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <HudBar label="Kenyang" value={fish.hunger} color={hungerColor} />
        <HudBar label="Air" value={aq.waterClarity} color={waterColor} />
        <HudBar label="pH" value={phPct} displayText={aq.waterPH.toFixed(1)} color={phColor} />
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <HudBar label="Kesehatan" value={fish.health} color={healthColor} />
        <HudBar label="Mood" value={fish.mood} color={moodColor} />
      </div>
    </div>
  );

  const navItems = (
    <>
      <NavBtn icon="fa-calendar-check" label="Check-In" onClick={() => setModal('checkin')} active={modal === 'checkin'} dot={unclaimedToday} />
      <NavBtn icon="fa-bag-shopping" label="Tukar Poin" onClick={() => setModal('shop')} active={modal === 'shop'} />
      <NavBtn icon="fa-layer-group" label="Soliter" onClick={() => setModal('upgrade')} active={modal === 'upgrade'} />
      <NavBtn icon="fa-fish" label="Koleksi" onClick={() => setModal('collection')} active={modal === 'collection'} />
      <NavBtn icon="fa-book-open" label="Panduan" onClick={() => setModal('info')} active={modal === 'info'} />
    </>
  );

  return (
    <div className="ck-game-root" style={{ minHeight: embedded ? 'auto' : '100vh' }}>
      <div className="ck-game-container" style={{ minHeight: embedded ? 'auto' : '100vh' }}>

        {/* ── Top Bar ── */}
        <div
          className="ck-game-topbar"
          style={{ position: embedded ? 'relative' : 'sticky', top: 0, zIndex: 100 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'var(--ck-surface-2)',
              border: '1px solid var(--ck-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ck-text)',
              fontSize: '14px',
            }}>
              <i className="fas fa-fish" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '14.5px', lineHeight: 1.2, color: 'var(--ck-text)' }}>
                Soliter Virtual
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ck-text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                {isLoggedIn && unclaimedToday && (
                  <button
                    type="button"
                    onClick={() => setModal('checkin')}
                    style={{
                      background: 'var(--ck-accent-soft)',
                      border: '1px solid var(--ck-accent-border)',
                      color: 'var(--ck-text)',
                      borderRadius: '5px',
                      padding: '1px 7px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <i className="fas fa-gift" style={{ fontSize: '9.5px' }} />
                    <span>Klaim Poin Harian</span>
                  </button>
                )}
                <span>{isLocked ? 'Khusus Member' : aqCfg.shortName}</span>
                <span>·</span>
                <span>{isLocked ? 'Login untuk Bermain' : fishCfg.species}</span>
                {!embedded && (
                  <>
                    <span>·</span>
                    <Link href="/" style={{ color: 'var(--ck-text)', textDecoration: 'none', fontWeight: 600 }}>
                      Beranda
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {isLoggedIn ? (
            <button
              type="button"
              className="ck-points-pill"
              onClick={() => setModal('checkin')}
              title="Poin Check-In Harian"
            >
              <i className="fas fa-coins" style={{ color: 'var(--ck-text)', fontSize: '12px' }} />
              <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ck-text)' }}>
                {state.points.toLocaleString()}
              </span>
              <span style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)', fontWeight: 600 }}>pts</span>
              {unclaimedToday && (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ck-text)' }} />
              )}
            </button>
          ) : (
            <Link
              href="/login"
              className="ck-points-pill"
              style={{ textDecoration: 'none', fontSize: '12px', fontWeight: 700, color: 'var(--ck-text)' }}
            >
              <i className="fas fa-lock" style={{ fontSize: '11px' }} />
              <span>Masuk</span>
            </Link>
          )}
        </div>

        {/* ── Main Responsive Grid (Blurred & Locked when not logged in) ── */}
        <div className="ck-lock-stage-wrap">
          <main className={`ck-game-grid ${isLocked ? 'ck-locked-blur' : ''}`} aria-hidden={isLocked}>

          {/* ── LEFT / TOP COLUMN: Viewing Tank + Mutation Timeline + Visual Traits ── */}
          <div className="ck-stage-col">
            <div className="ck-hud-mobile">{hudContent}</div>

            <div className={`ck-stage-card ${isFlaring ? 'flaring' : ''}`}>
              {/* Subtle Tank Telemetry Header */}
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '10.5px',
                marginBottom: '6px',
                gap: '6px',
                flexWrap: 'wrap',
              }}>
                <span style={{
                  background: 'rgba(17,19,24,0.85)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  color: '#ffffff',
                  fontWeight: 600,
                }}>
                  {fishCfg.species} · Bulan {displayAge}
                </span>

                <div style={{ display: 'flex', gap: '6px', color: '#d1d5db' }}>
                  <span style={{
                    background: 'rgba(17,19,24,0.85)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                  }}>
                    Tanin <strong style={{ color: '#ffffff' }}>{Math.round(aq.taninLevel)}%</strong>
                  </span>
                  <span style={{
                    background: 'rgba(17,19,24,0.85)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                  }}>
                    Garam <strong style={{ color: '#ffffff' }}>{Math.round(aq.saltLevel)}%</strong>
                  </span>
                </div>
              </div>

              {isFlaring && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '2px 10px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  zIndex: 5,
                }}>
                  SESI FLARING AKTIF
                </div>
              )}

              <div className="ck-aquarium-wrap">
                <AquariumSVG
                  level={aq.level}
                  taninLevel={aq.taninLevel}
                  waterClarity={aq.waterClarity}
                  saltLevel={aq.saltLevel}
                  isFlaring={isFlaring}
                >
                  <FishDisplay
                    fishConfig={fishCfg}
                    fishState={displayFishState}
                    size="fluid"
                    animate
                    isFlaring={isFlaring}
                    ledBoost={aqCfg.colorBoost}
                  />
                </AquariumSVG>
              </div>

              <div style={{
                fontSize: '11px',
                color: phIdeal ? '#d1d5db' : '#f59e0b',
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}>
                <span>pH {aq.waterPH.toFixed(1)}</span>
                <span style={{ color: '#6b7280' }}>·</span>
                <span>Rentang ideal {idealMinPH}–{idealMaxPH}</span>
                <span style={{
                  color: phIdeal ? '#34c77b' : '#f59e0b',
                  fontWeight: 700,
                }}>
                  {phIdeal ? 'Stabil' : 'Perlu Penyesuaian'}
                </span>
              </div>
            </div>

            {/* ── Fase Perpecahan / Mutasi Warna 1–5 Bulan ── */}
            <div className="ck-mutation-bar">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ck-text-muted)' }}>
                    Fase Mutasi Warna ({displayAge}/5 Bulan)
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ck-text)', marginTop: '2px' }}>
                    {currentStage.title}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', color: 'var(--ck-text-muted)' }}>
                  {fish.ageMonth < 5 ? (
                    <span>Progres <strong style={{ color: 'var(--ck-text)' }}>{Math.round(fish.growthExp || 0)}%</strong></span>
                  ) : (
                    <span style={{ color: 'var(--ck-ok)', fontWeight: 600 }}>Dewasa Penuh</span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ck-text-2)', marginTop: '3px' }}>
                {currentStage.note}
              </div>

              <div className="ck-mutation-steps">
                {MUTATION_STAGES.map((stage) => {
                  const isCurrent = displayAge === stage.month;
                  const isReached = (fish.ageMonth || 1) >= stage.month;
                  return (
                    <button
                      key={stage.month}
                      type="button"
                      onClick={() => setPreviewMonth(stage.month === fish.ageMonth ? null : stage.month)}
                      className={`ck-mutation-step ${isReached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
                      title={`Lihat fase ${stage.shortLabel}: ${stage.title}`}
                    >
                      {stage.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Dynamic Visual Traits (Body, Sirip, Warna) ── */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <TraitPill label="Body" value={fish.bodySize} color="var(--ck-text)" />
              <TraitPill label="Sirip" value={fish.finSpread} color="var(--ck-water)" />
              <TraitPill label="Warna" value={fish.colorVibrancy} color="#d926ff" />
            </div>
          </div>

          {/* ── RIGHT / BOTTOM COLUMN: Controls Panel ── */}
          <div className="ck-controls-col">
            <div className="ck-hud-desktop">{hudContent}</div>

            {activeDisease && (
              <div style={{
                background: 'rgba(224, 82, 82, 0.08)',
                border: `1px solid ${activeDisease.color}`,
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '12px',
                lineHeight: 1.45,
              }}>
                <div style={{ fontWeight: 700, color: activeDisease.color, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={`fas ${activeDisease.icon}`} />
                  <span>{activeDisease.name}</span>
                </div>
                <div style={{ color: 'var(--ck-text-2)' }}>
                  <strong style={{ color: 'var(--ck-text)' }}>Penanganan:</strong> {activeDisease.cure}
                </div>
              </div>
            )}

            {!activeDisease && aq.fullChangeUnconditioned && (
              <div style={{
                background: 'var(--ck-surface-2)',
                border: '1px solid var(--ck-border-strong)',
                borderRadius: '10px',
                padding: '9px 12px',
                fontSize: '11.5px',
                color: 'var(--ck-text)',
                lineHeight: 1.45,
              }}>
                <i className="fas fa-circle-info" style={{ marginRight: '6px' }} />
                Setelah kuras total, tambahkan <strong>Ketapang</strong> dan <strong>Garam Ikan</strong> agar ikan tidak stres.
              </div>
            )}

            {/* ── Care Actions Row + Popovers ── */}
            <div style={{ position: 'relative' }}>
              {openMenu === 'feed' && (
                <div className="ck-popover">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ck-text-muted)' }}>
                      Pilih Pakan
                    </span>
                    <button
                      type="button"
                      onClick={() => { setOpenMenu(null); setModal('shop'); }}
                      style={{ background: 'none', border: 'none', color: 'var(--ck-text)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      + Tukar Poin
                    </button>
                  </div>
                  {FOOD_CONFIG.map((food) => {
                    const count = state.inventory[food.id] || 0;
                    const isPref = food.preferredSpecies.includes(fishId);
                    return (
                      <button
                        key={food.id}
                        type="button"
                        disabled={count <= 0}
                        onClick={() => handleFeed(food.id)}
                        className="ck-popover-item"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          <i className={`fas ${food.icon}`} style={{ color: 'var(--ck-text-muted)', width: '16px', textAlign: 'center', fontSize: '12px' }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ck-text)' }}>
                              {food.shortLabel}
                              {isPref && <span style={{ fontSize: '10px', color: 'var(--ck-ok)', marginLeft: '6px' }}>Optimal</span>}
                            </div>
                            <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>{food.tag}</div>
                          </div>
                        </div>
                        <span style={{ color: 'var(--ck-text)', fontWeight: 700, fontSize: '12px' }}>×{count}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {openMenu === 'water' && (
                <div className="ck-popover">
                  <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ck-text-muted)', padding: '4px 6px' }}>
                    Perawatan Air & Suplemen
                  </div>
                  <button type="button" onClick={handlePartialWaterChange} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Ganti Air Parsial (30–50%)</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Air +38% jernih, pH stabil tanpa stres</div>
                    </div>
                    <span style={{ color: 'var(--ck-ok)', fontSize: '11px', fontWeight: 700 }}>Aman</span>
                  </button>
                  <button type="button" onClick={handleFullWaterChange} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Kuras Total (100%)</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-2)' }}>Instan 100% jernih · perlu Ketapang & Garam</div>
                    </div>
                    <span style={{ color: 'var(--ck-text)', fontSize: '11px', fontWeight: 700 }}>100%</span>
                  </button>
                  <button type="button" disabled={state.inventory.ketapang <= 0} onClick={handleKetapang} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Ekstrak / Daun Ketapang</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Turunkan pH (-0.25), tanin alami, redakan stres</div>
                    </div>
                    <span style={{ color: 'var(--ck-text)', fontSize: '12px', fontWeight: 700 }}>×{state.inventory.ketapang}</span>
                  </button>
                  <button type="button" disabled={state.inventory.aquariumSalt <= 0} onClick={handleSalt} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Garam Ikan (Aquarium Salt)</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Cegah jamur & bantu osmoregulasi</div>
                    </div>
                    <span style={{ color: 'var(--ck-text)', fontSize: '12px', fontWeight: 700 }}>×{state.inventory.aquariumSalt}</span>
                  </button>
                </div>
              )}

              {openMenu === 'medicine' && (
                <div className="ck-popover">
                  <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--ck-text-muted)', padding: '4px 6px' }}>
                    Pengobatan Ikan
                  </div>
                  <button type="button" disabled={state.inventory.medicineYellow <= 0} onClick={() => handleMedicine('medicineYellow')} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Obat Kuning (Acriflavine)</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Untuk Fin Rot — pastikan air jernih & ada garam</div>
                    </div>
                    <span style={{ color: 'var(--ck-text)', fontSize: '12px', fontWeight: 700 }}>×{state.inventory.medicineYellow}</span>
                  </button>
                  <button type="button" disabled={state.inventory.medicineBlue <= 0} onClick={() => handleMedicine('medicineBlue')} className="ck-popover-item">
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: 600 }}>Obat Biru (Methylene Blue)</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--ck-text-muted)' }}>Untuk Velvet / White Spot (+ Garam & Ketapang)</div>
                    </div>
                    <span style={{ color: 'var(--ck-text)', fontSize: '12px', fontWeight: 700 }}>×{state.inventory.medicineBlue}</span>
                  </button>
                  {fish.disease === 'bloated' && (
                    <div style={{ padding: '8px 10px', borderRadius: '8px', background: 'rgba(224,82,82,0.1)', fontSize: '11px', color: 'var(--ck-text)' }}>
                      Penanganan kembung tidak menggunakan obat kimia — puasakan pelet dan beri <strong>Kutu Air (Daphnia)</strong> di menu Pakan.
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <ActionBtn
                  icon="fa-utensils"
                  label="Pakan"
                  active={openMenu === 'feed'}
                  onClick={() => setOpenMenu((m) => (m === 'feed' ? null : 'feed'))}
                />
                <ActionBtn
                  icon="fa-expand"
                  label={flareCooldown > 0 ? `Flaring ${flareCooldown}s` : 'Flaring'}
                  disabled={flareCooldown > 0 || isFlaring}
                  active={isFlaring}
                  onClick={handleFlaring}
                />
                <ActionBtn
                  icon="fa-droplet"
                  label="Air"
                  active={openMenu === 'water'}
                  alertDot={aq.waterClarity < 45}
                  onClick={() => setOpenMenu((m) => (m === 'water' ? null : 'water'))}
                />
                <ActionBtn
                  icon="fa-kit-medical"
                  label="Obat"
                  active={openMenu === 'medicine'}
                  alertDot={Boolean(fish.disease)}
                  onClick={() => setOpenMenu((m) => (m === 'medicine' ? null : 'medicine'))}
                />
              </div>
            </div>

            {/* Desktop Dock Navigation */}
            <div className="ck-desktop-nav">{navItems}</div>
          </div>

          {openMenu && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 400 }} onClick={() => setOpenMenu(null)} />
          )}
          </main>

          {/* ── Auth Lock Overlay (shown when guest hasn't logged in) ── */}
          {isLocked && (
            <div className="ck-lock-overlay">
              <div className="ck-lock-card">
                <div className="ck-lock-icon">
                  <i className={`fas ${status === 'loading' ? 'fa-spinner fa-spin' : 'fa-lock'}`} />
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 700, color: 'var(--ck-text)' }}>
                  {status === 'loading' ? 'Memeriksa Akun...' : 'Soliter Virtual Terkunci'}
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', lineHeight: 1.55, color: 'var(--ck-text-2)' }}>
                  {status === 'loading'
                    ? 'Menyiapkan data akuarium dan koleksi ikan Anda.'
                    : 'Masuk atau daftar member gratis terlebih dahulu untuk memelihara cupang virtual, klaim poin harian, dan mengoleksi 9 jenis ikan.'}
                </p>

                {status !== 'loading' && (
                  <div className="ck-lock-actions">
                    <Link href="/login" className="ck-hero-btn-primary">
                      <i className="fas fa-sign-in-alt" />
                      <span>Masuk</span>
                    </Link>
                    <Link href="/register" className="ck-hero-btn-ghost">
                      <i className="fas fa-user-plus" />
                      <span>Daftar Gratis</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile & Tablet Fixed Bottom Nav (only shown when logged in) */}
        {isLoggedIn && <nav className="ck-bottom-nav">{navItems}</nav>}

        {isLoggedIn && modal === 'checkin' && <CheckinModal gameState={state} onClaim={handleCheckin} onClose={() => setModal(null)} />}
        {isLoggedIn && modal === 'shop' && <ShopModal gameState={state} onBuyItem={handleBuyShopItem} onClose={() => setModal(null)} />}
        {isLoggedIn && modal === 'upgrade' && <UpgradeModal gameState={state} onUpgrade={handleUpgrade} onClose={() => setModal(null)} />}
        {isLoggedIn && modal === 'collection' && <FishCollectionModal gameState={state} onUnlock={handleUnlock} onActivate={handleActivate} onClose={() => setModal(null)} />}
        {isLoggedIn && modal === 'info' && <InfoModal gameState={state} onClose={() => setModal(null)} />}
        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>
    </div>
  );
}
