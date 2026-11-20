'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { loadState, saveState, createDefaultFish, getLocalDateString } from './gameState';
import { FISH_CATALOG, getFishById } from './fishConfig';
import {
  AQUARIUM_LEVELS,
  FOOD_CONFIG,
  DISEASE_CONFIG,
  getAquariumLevelConfig,
  getFoodById,
} from './gameConfig';
import FishSVG from './FishSVG';
import AquariumSVG from './AquariumSVG';
import CheckinModal from './CheckinModal';
import UpgradeModal from './UpgradeModal';
import FishCollectionModal from './FishCollectionModal';
import ShopModal from './ShopModal';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

/* ─── HUD Bar ─────────────────────────────────────────────────────────────── */
function HudBar({ icon, label, value, displayText, max = 100, color }) {
  const pct = clamp((value / max) * 100, 0, 100);
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '10px',
        color: '#94a3b8',
        marginBottom: '3px',
        fontWeight: 700,
      }}>
        <span style={{ whiteSpace: 'nowrap' }}>{icon} {label}</span>
        <span style={{ color, fontWeight: 800 }}>{displayText ?? Math.round(value)}</span>
      </div>
      <div style={{
        height: '6px',
        borderRadius: '99px',
        background: '#1e293b',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          borderRadius: '99px',
          background: color,
          transition: 'width 0.45s ease',
        }} />
      </div>
    </div>
  );
}

/* ─── Mini Trait Bar (Modul 4: Body, Sirip, Warna) ────────────────────────── */
function TraitPill({ icon, label, value, color }) {
  return (
    <div style={{
      flex: 1,
      background: 'rgba(15, 23, 42, 0.75)',
      border: '1px solid #1e293b',
      borderRadius: '10px',
      padding: '6px 8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginBottom: '3px' }}>
        <span style={{ color: '#94a3b8', fontWeight: 600 }}>{icon} {label}</span>
        <span style={{ color, fontWeight: 800 }}>{Math.round(value)}%</span>
      </div>
      <div style={{ height: '4px', borderRadius: '99px', background: '#1e293b', overflow: 'hidden' }}>
        <div style={{ width: `${clamp(value, 0, 100)}%`, height: '100%', background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  );
}

/* ─── Action Button ───────────────────────────────────────────────────────── */
function ActionBtn({ emoji, label, onClick, disabled, badge, active, highlightColor }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        padding: '9px 4px',
        borderRadius: '12px',
        border: active
          ? '1.5px solid #38bdf8'
          : highlightColor
            ? `1.5px solid ${highlightColor}`
            : disabled
              ? '1px solid #1e293b'
              : '1px solid #334155',
        background: active
          ? 'rgba(56, 189, 248, 0.16)'
          : disabled
            ? 'rgba(15, 23, 42, 0.45)'
            : 'rgba(30, 41, 59, 0.92)',
        color: disabled ? '#475569' : '#f1f5f9',
        cursor: disabled ? 'not-allowed' : 'pointer',
        flex: 1,
        minWidth: 0,
        position: 'relative',
        transition: 'transform 0.1s, border-color 0.2s',
      }}
    >
      <span style={{ fontSize: '19px', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: '10px', fontWeight: 700, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{label}</span>
      {badge !== undefined && badge !== null && (
        <span style={{
          position: 'absolute',
          top: '3px',
          right: '5px',
          fontSize: '9px',
          color: '#fbbf24',
          fontWeight: 800,
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}

/* ─── Bottom Nav Button ───────────────────────────────────────────────────── */
function NavBtn({ emoji, label, onClick, active, dot }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        flex: 1,
        padding: '8px 2px',
        border: 'none',
        background: 'none',
        color: active ? '#38bdf8' : '#94a3b8',
        cursor: 'pointer',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{emoji}</span>
      <span style={{ fontSize: '9.5px', fontWeight: active ? 800 : 600 }}>{label}</span>
      {dot && (
        <span style={{
          position: 'absolute',
          top: '5px',
          right: '24%',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#ef4444',
          boxShadow: '0 0 6px #ef4444',
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
      top: '68px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(15, 23, 42, 0.96)',
      border: '1px solid #38bdf8',
      borderRadius: '14px',
      padding: '9px 16px',
      color: '#f8fafc',
      fontSize: '12.5px',
      fontWeight: 700,
      zIndex: 9998,
      pointerEvents: 'none',
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      maxWidth: '90vw',
      textAlign: 'center',
    }}>
      {message}
    </div>
  );
}

/* ─── Educational Guide Modal ─────────────────────────────────────────────── */
function InfoModal({ gameState, onClose }) {
  const fishCfg = getFishById(gameState.activeFishId);
  const aq = gameState.aquarium;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.82)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '14px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(145deg,#0f172a,#1e293b)',
        border: '1px solid #334155',
        borderRadius: '18px',
        padding: '20px 18px',
        maxWidth: '390px',
        width: '100%',
        color: '#f1f5f9',
        boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>ℹ️ Panduan Perawatan Cupang</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '20px', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.55, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: '#0b1120', borderRadius: '10px', padding: '10px', border: '1px solid #1e293b' }}>
            <strong style={{ color: '#38bdf8' }}>💧 Kualitas Air & pH</strong>
            <p style={{ margin: '4px 0 0', color: '#94a3b8' }}>
              pH ideal umum <strong>6.5–7.0</strong> (Wild Betta <strong>6.0–6.6</strong>). Gunakan <strong>Ganti Air Parsial</strong> agar ikan tidak stres. Jika <strong>Kuras Total</strong>, wajib beri <strong>Ketapang + Garam Ikan</strong> agar tidak terkena Velvet.
            </p>
          </div>

          <div style={{ background: '#0b1120', borderRadius: '10px', padding: '10px', border: '1px solid #1e293b' }}>
            <strong style={{ color: '#fbbf24' }}>🍖 5 Pakan & Efek Visual</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: '16px', color: '#94a3b8' }}>
              <li><strong>Pelet</strong>: Nutrisi harian seimbang.</li>
              <li><strong>Cacing Sutra</strong>: Protein tinggi → besarkan <strong>Body</strong> (Giant, Plakat, HMPK).</li>
              <li><strong>Kutu Air (Daphnia)</strong>: Serat alami → lancarkan pencernaan & sembuhkan <strong>Kembung</strong>.</li>
              <li><strong>Jentik / Artemia</strong>: Insting buru → lebarkan <strong>Sirip</strong> & Flaring.</li>
              <li><strong>Pencerah (Rebon)</strong>: Astaxanthin → tajamkan <strong>Warna</strong> ikan.</li>
            </ul>
          </div>

          <div style={{ background: '#0b1120', borderRadius: '10px', padding: '10px', border: '1px solid #1e293b' }}>
            <strong style={{ color: '#f87171' }}>💊 3 Penyakit & Obatnya (Ikan Tidak Mati Permanen)</strong>
            <ul style={{ margin: '4px 0 0', paddingLeft: '16px', color: '#94a3b8' }}>
              <li><strong>Fin Rot</strong> (air kotor): Ganti Air + <strong>Obat Kuning</strong> + Garam Ikan.</li>
              <li><strong>Velvet / White Spot</strong> (syok pH/kuras total): <strong>Obat Biru</strong> + Garam + Ketapang.</li>
              <li><strong>Kembung</strong> (overfeeding): Puasa pelet + beri <strong>Kutu Air (Daphnia)</strong>.</li>
            </ul>
          </div>

          <div style={{ fontSize: '11.5px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
            <span>Ikan aktif: <strong style={{ color: '#f8fafc' }}>{fishCfg.species}</strong></span>
            <span>pH: <strong style={{ color: '#a78bfa' }}>{aq.waterPH}</strong> · Tanin: <strong>{Math.round(aq.taninLevel)}%</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Soliter Virtual Game Component ─────────────────────────────────── */
export default function SoliterGame({ embedded = false }) {
  const [state, setState] = useState(null);
  const [modal, setModal] = useState(null); // 'checkin'|'upgrade'|'collection'|'shop'|'info'
  const [openMenu, setOpenMenu] = useState(null); // 'feed'|'water'|'medicine'|null
  const [toast, setToast] = useState(null);
  const [isFlaring, setIsFlaring] = useState(false);
  const [flareCooldown, setFlareCooldown] = useState(0);
  const decayRef = useRef(null);
  const flareTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
  }, []);

  // Load state on mount
  useEffect(() => {
    setState(loadState());
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    if (state) saveState(state);
  }, [state]);

  // Auto-open daily check-in modal once on mount if not yet claimed today
  const checkedAutoRef = useRef(false);
  useEffect(() => {
    if (!state || checkedAutoRef.current) return;
    checkedAutoRef.current = true;
    const today = getLocalDateString();
    if (state.checkin.lastCheckinDate !== today) {
      setModal('checkin');
    }
  }, [state]);

  // Flaring cooldown ticker
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

  // ─── Realistic Simulation Loop (every 20s) ────────────────────────────────
  useEffect(() => {
    if (!state) return;
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

        // 1. Water clarity & pH drift
        const clarityDrop = 0.4 * aqCfg.waterDecayMultiplier;
        aq.waterClarity = clamp(aq.waterClarity - clarityDrop, 0, 100);
        aq.taninLevel = clamp(aq.taninLevel - 0.15, 0, 100);
        aq.saltLevel = clamp(aq.saltLevel - 0.15, 0, 100);

        // pH naturally rises slightly if water is murky; Aquascape Lv4 gently pulls pH toward ideal!
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

        // 2. Hunger & fasting recovery
        const nextHunger = clamp(fish.hunger - 0.8, 0, 100);
        let nextOverfeed = fish.overfeedCount || 0;
        if (nextHunger < 70 && nextOverfeed > 0) {
          nextOverfeed = Math.max(0, nextOverfeed - 1);
        }

        // 3. Evaluate environment suitability
        const phInIdeal = aq.waterPH >= idealMinPH && aq.waterPH <= idealMaxPH;
        const phExtreme = aq.waterPH < 5.6 || aq.waterPH > 7.9;
        let nextDisease = fish.disease;

        // Disease checks (if currently healthy)
        if (!nextDisease) {
          if (aq.waterClarity < 35 && aq.saltLevel < 20 && Math.random() < 0.35) {
            nextDisease = 'finRot';
          } else if ((aq.fullChangeUnconditioned || phExtreme) && aq.saltLevel < 15 && aq.taninLevel < 15 && Math.random() < 0.4) {
            nextDisease = 'velvet';
            aq.fullChangeUnconditioned = false;
          }
        }

        // 4. Health & Mood soft decay (never dies permanently: min health 10)
        let healthDelta = 0;
        let moodDelta = 0;

        if (nextHunger <= 10) {
          healthDelta -= 0.8;
          moodDelta -= 1.2;
        }
        if (aq.waterClarity < 40) {
          healthDelta -= 0.6;
          moodDelta -= 0.8;
        }
        if (!phInIdeal) {
          moodDelta -= phExtreme ? 1.5 : 0.4;
          if (phExtreme) healthDelta -= 0.7;
        } else if (aq.waterClarity >= 70 && !nextDisease) {
          healthDelta += 0.5;
          moodDelta += 0.4 * aqCfg.moodMultiplier;
        }

        // Wild Betta loves tannin + ideal acidic pH
        if (fishCfg.lovesTanin && aq.taninLevel >= 25 && phInIdeal) {
          moodDelta += 0.8;
          healthDelta += 0.4;
        }

        if (nextDisease) {
          healthDelta -= 0.9;
          moodDelta -= 1.0;
        }

        const nextHealth = clamp(fish.health + healthDelta, 10, 100);
        const nextMood = clamp(fish.mood + moodDelta, 10, 100);

        return {
          ...prev,
          aquarium: aq,
          fishes: {
            ...prev.fishes,
            [fishId]: {
              ...fish,
              hunger: nextHunger,
              health: nextHealth,
              mood: nextMood,
              disease: nextDisease,
              overfeedCount: nextOverfeed,
            },
          },
        };
      });
    }, 20000);

    return () => clearInterval(decayRef.current);
  }, [state !== null]);

  // ─── Action Handlers ──────────────────────────────────────────────────────

  function handleFeed(foodId) {
    setOpenMenu(null);
    const food = getFoodById(foodId);

    setState((prev) => {
      if (!prev) return prev;
      const fishId = prev.activeFishId;
      const fish = { ...prev.fishes[fishId] };
      const inv = { ...prev.inventory };
      const aqCfg = getAquariumLevelConfig(prev.aquarium.level);

      if (!inv[foodId] || inv[foodId] < 1) {
        showToast(`❌ Stok ${food.shortLabel} habis! Tukar di menu Tukar Poin.`);
        return prev;
      }

      // If fish is bloated (Kembung):
      if (fish.disease === 'bloated') {
        if (food.curesBloated) {
          showToast('🫧 Kutu Air (Daphnia) melancarkan pencernaan! Kembung sembuh.');
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
        } else {
          showToast('🎈 Ikan sedang Kembung! Puasakan dulu & beri Kutu Air (Daphnia).');
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
      }

      // Check overfeeding (feeding non-daphnia when already full >= 85)
      const isOverfeeding = fish.hunger >= 85 && !food.curesBloated;
      let nextOverfeed = food.curesBloated ? 0 : fish.overfeedCount || 0;
      let nextDisease = fish.disease;

      if (isOverfeeding) {
        nextOverfeed += 1;
        if (nextOverfeed >= 2) {
          nextDisease = 'bloated';
          showToast('🎈 Overfeeding! Ikan terkena Kembung — puasakan & beri Kutu Air (Daphnia).');
        } else {
          showToast('⚠️ Ikan masih kenyang! Jangan beri makan berulang agar tidak Kembung.');
        }
      }

      const isPreferred = food.preferredSpecies.includes(fishId);
      const bodyGain = food.bodySize + (isPreferred && foodId === 'tubifex' ? 2 : 0);
      const finGain = food.finSpread + (isPreferred && foodId === 'artemia' ? 2 : 0);
      const colorGain = food.colorVibrancy + (foodId === 'colorFood' && prev.aquarium.level >= 3 ? 2 : 0);
      const moodGain = Math.round(food.mood * aqCfg.moodMultiplier);

      if (!isOverfeeding) {
        const bonusNote = isPreferred ? ' (Cocok banget!)' : '';
        showToast(`${food.emoji} ${fish.species} makan ${food.shortLabel}${bonusNote}`);
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
      showToast('⚠️ Ikan sedang sakit! Sembuhkan dulu sebelum diajak flaring.');
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

    showToast(`🪞 Flaring aktif! Mood +${moodBoost}, Sirip +${finBoost}, ⭐ +${pointsReward} poin`);

    flareTimerRef.current = setTimeout(() => {
      setIsFlaring(false);
    }, 4000);
  }

  function handlePartialWaterChange() {
    setOpenMenu(null);
    setState((prev) => {
      if (!prev) return prev;
      const aq = prev.aquarium;
      const targetPH = 6.9;
      const nextPH = parseFloat((aq.waterPH + (targetPH - aq.waterPH) * 0.35).toFixed(2));
      showToast('💧 Ganti Air Parsial (40%) — Air lebih jernih & pH tetap stabil!');
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
      const oldPH = prev.aquarium.waterPH;
      const newPH = 7.3;
      const phJump = Math.abs(newPH - oldPH);

      showToast(
        phJump >= 0.6
          ? '🚿 Kuras Total 100%! pH berubah drastis — segera beri Ketapang & Garam agar tidak Velvet!'
          : '🚿 Kuras Total 100%! Mood sedikit turun — beri Ketapang & Garam agar rileks.'
      );

      return {
        ...prev,
        aquarium: {
          ...prev.aquarium,
          waterClarity: 100,
          waterPH: newPH,
          taninLevel: 0,
          saltLevel: 0,
          fullChangeUnconditioned: true,
          lastUpdatedAt: Date.now(),
        },
        fishes: {
          ...prev.fishes,
          [fishId]: {
            ...fish,
            mood: clamp(fish.mood - 15, 10, 100),
          },
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
        showToast('❌ Ekstrak Ketapang habis! Tukar di menu Tukar Poin.');
        return prev;
      }
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      const fishCfg = getFishById(fishId);
      const nextPH = parseFloat(clamp(prev.aquarium.waterPH - 0.25, 5.5, 8.5).toFixed(2));
      const moodBonus = fishCfg.lovesTanin ? 14 : 8;
      const healthBonus = fishCfg.lovesTanin ? 5 : 2;
      const conditioned = prev.aquarium.saltLevel >= 10 ? false : prev.aquarium.fullChangeUnconditioned;

      showToast(
        fishCfg.lovesTanin
          ? `🌿 Wild Betta sangat suka Ketapang! pH → ${nextPH}, Mood +${moodBonus}`
          : `🌿 Ekstrak Ketapang ditambahkan! pH → ${nextPH}, air tanin meredakan stres.`
      );

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
        showToast('❌ Garam Ikan habis! Tukar di menu Tukar Poin.');
        return prev;
      }
      const fishId = prev.activeFishId;
      const fish = prev.fishes[fishId];
      const conditioned = prev.aquarium.taninLevel >= 10 ? false : prev.aquarium.fullChangeUnconditioned;

      showToast('🧂 Garam Ikan ditambahkan! Membantu osmoregulasi & cegah jamur.');
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
          [fishId]: {
            ...fish,
            health: clamp(fish.health + 4, 10, 100),
          },
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
        showToast('❌ Stok obat habis! Tukar di menu Tukar Poin.');
        return prev;
      }

      if (!fish.disease) {
        showToast('✅ Ikan sedang sehat — tidak perlu diberi obat.');
        return prev;
      }

      // Obat Kuning (Acriflavine) -> Fin Rot
      if (medType === 'medicineYellow') {
        if (fish.disease !== 'finRot') {
          showToast('⚠️ Obat Kuning (Acriflavine) khusus untuk Fin Rot (Busuk Sirip)!');
          return prev;
        }
        if (aq.waterClarity < 55) {
          showToast('💧 Ganti air dulu agar jernih (≥55%) sebelum mengobati Fin Rot!');
          return prev;
        }
        const hasSalt = aq.saltLevel >= 10;
        showToast(
          hasSalt
            ? '🟡 Obat Kuning + Garam + Air Bersih bekerja sempurna! Fin Rot sembuh!'
            : '🟡 Obat Kuning berhasil menyembuhkan Fin Rot! Tips: tambahkan Garam Ikan untuk pemulihan sirip.'
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

      // Obat Biru (Methylene Blue) -> Velvet / White Spot
      if (medType === 'medicineBlue') {
        if (fish.disease !== 'velvet') {
          showToast('⚠️ Obat Biru (Methylene Blue) khusus untuk Velvet / White Spot!');
          return prev;
        }
        const hasSupport = aq.saltLevel >= 10 && aq.taninLevel >= 10;
        showToast(
          hasSupport
            ? '🔵 Obat Biru + Garam + Ketapang bekerja maksimal! Velvet sembuh total!'
            : '🔵 Obat Biru menyembuhkan Velvet! Tips: tambahkan Garam + Ketapang agar tidak kambuh.'
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
    showToast(`🎁 +${pointsEarned} poin gratis! Streak hari ke-${newStreak}`);
  }

  function handleUpgrade(toLevel) {
    const target = AQUARIUM_LEVELS.find((l) => l.level === toLevel);
    if (!target) return;
    setState((prev) => {
      if (prev.points < target.cost) {
        showToast('❌ Poin check-in belum cukup!');
        return prev;
      }
      showToast(`🏠 Akuarium di-upgrade ke Lv.${toLevel} (${target.name})!`);
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
        showToast('❌ Poin check-in belum cukup!');
        return prev;
      }
      if (prev.unlockedFishes.includes(fishId)) return prev;
      showToast(`🔓 ${fishCfg.species} berhasil dibuka! Tap Tampilkan untuk memelihara.`);
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
    setState((prev) => ({
      ...prev,
      activeFishId: fishId,
      fishes: {
        ...prev.fishes,
        [fishId]: prev.fishes[fishId] || createDefaultFish(fishCfg?.species || 'Plakat'),
      },
    }));
    setModal(null);
    showToast(`🐟 ${fishCfg?.species} kini berenang di soliter utama!`);
  }

  function handleBuyShopItem(item) {
    setState((prev) => {
      if (prev.points < item.cost) {
        showToast('❌ Poin belum cukup!');
        return prev;
      }
      showToast(`✅ Ditukar: ${item.name} (-${item.cost} poin)`);
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

  // ─── Loading Guard ────────────────────────────────────────────────────────
  if (!state) {
    return (
      <div style={{
        minHeight: embedded ? '420px' : '100vh',
        background: '#0b1120',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: '14px',
      }}>
        🐠 Menyiapkan Soliter Virtual...
      </div>
    );
  }

  const fishId = state.activeFishId;
  const fish = state.fishes[fishId] || createDefaultFish('Plakat');
  const fishCfg = getFishById(fishId);
  const aq = state.aquarium;
  const aqCfg = getAquariumLevelConfig(aq.level);
  const [idealMinPH, idealMaxPH] = fishCfg.preferPH || [6.5, 7.0];
  const phIdeal = aq.waterPH >= idealMinPH && aq.waterPH <= idealMaxPH;
  const phExtreme = aq.waterPH < 5.6 || aq.waterPH > 7.9;
  const unclaimedToday = state.checkin.lastCheckinDate !== getLocalDateString();
  const activeDisease = fish.disease ? DISEASE_CONFIG[fish.disease] : null;

  const hungerColor = fish.hunger > 50 ? '#22c55e' : fish.hunger > 25 ? '#f59e0b' : '#ef4444';
  const waterColor = aq.waterClarity > 60 ? '#38bdf8' : aq.waterClarity > 35 ? '#f59e0b' : '#ef4444';
  const phColor = phIdeal ? '#22c55e' : phExtreme ? '#ef4444' : '#f59e0b';
  const healthColor = fish.health > 60 ? '#34d399' : fish.health > 30 ? '#f59e0b' : '#ef4444';
  const moodColor = fish.mood > 55 ? '#fb923c' : '#94a3b8';
  const phPct = clamp(((aq.waterPH - 5.0) / (8.5 - 5.0)) * 100, 0, 100);

  return (
    <div style={{
      minHeight: embedded ? 'auto' : '100vh',
      background: '#0b1120',
      color: '#f1f5f9',
      fontFamily: 'var(--font-outfit, system-ui, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        minHeight: embedded ? 'auto' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>

        {/* ── Standalone Top Bar (hidden if embedded header handled externally, or compact HUD header) ── */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: embedded ? '10px 14px 6px' : '12px 16px',
          background: 'rgba(15, 23, 42, 0.96)',
          borderBottom: '1px solid #1e293b',
          position: embedded ? 'relative' : 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <span style={{ fontSize: '22px' }}>🐠</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '14.5px', lineHeight: 1.1, color: '#f8fafc' }}>
                Soliter Virtual Cupang Klaten
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{aqCfg.shortName}</span>
                {!embedded && (
                  <Link href="/" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>
                    ← Kembali ke Web
                  </Link>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => setModal('checkin')}
            style={{
              background: '#1e293b',
              border: unclaimedToday ? '1px solid #fbbf24' : '1px solid #334155',
              borderRadius: '999px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              cursor: 'pointer',
            }}
            title="Poin Check-In Harian"
          >
            <span style={{ fontSize: '13px' }}>⭐</span>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#fbbf24' }}>
              {state.points.toLocaleString()}
            </span>
            {unclaimedToday && (
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#ef4444',
                marginLeft: '2px',
              }} />
            )}
          </button>
        </div>

        {/* ── Main Arena ── */}
        <main style={{
          flex: 1,
          padding: '10px 12px 82px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>

          {/* ── HUD Status (5 Indicators: Hunger, Water, pH, Health, Mood) ── */}
          <div style={{
            background: '#0f172a',
            borderRadius: '14px',
            padding: '10px 12px',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <HudBar icon="🍖" label="Lapar" value={fish.hunger} color={hungerColor} />
              <HudBar icon="💧" label="Air" value={aq.waterClarity} color={waterColor} />
              <HudBar icon="⚗️" label="pH" value={phPct} displayText={aq.waterPH.toFixed(1)} color={phColor} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <HudBar icon="❤️" label="Sehat" value={fish.health} color={healthColor} />
              <HudBar icon="🔥" label="Mood" value={fish.mood} color={moodColor} />
            </div>
          </div>

          {/* ── Disease Alert Banner (if sick) ── */}
          {activeDisease && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: `1px solid ${activeDisease.color}`,
              borderRadius: '12px',
              padding: '9px 12px',
              fontSize: '11.5px',
              lineHeight: 1.4,
            }}>
              <div style={{ fontWeight: 800, color: activeDisease.color, marginBottom: '2px' }}>
                {activeDisease.emoji} Ikan terkena {activeDisease.name}!
              </div>
              <div style={{ color: '#e2e8f0' }}>
                <strong>Penanganan:</strong> {activeDisease.cure}
              </div>
            </div>
          )}

          {/* ── Post Full-Water-Change Conditioning Hint ── */}
          {!activeDisease && aq.fullChangeUnconditioned && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '10px',
              padding: '7px 11px',
              fontSize: '11px',
              color: '#fde68a',
            }}>
              ⚠️ Baru Kuras Total! Tambahkan <strong>Ketapang</strong> & <strong>Garam Ikan</strong> agar ikan tidak stres/Velvet.
            </div>
          )}

          {/* ── Soliter / Aquarium Stage ── */}
          <div style={{
            borderRadius: '16px',
            overflow: 'hidden',
            border: isFlaring ? '1.5px solid #fbbf24' : '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(ellipse at center top, #0f2942 0%, #0b1120 75%)',
            padding: '10px 8px 6px',
            position: 'relative',
            transition: 'border-color 0.25s',
          }}>
            {/* Top subtle environment badges */}
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '10.5px',
              marginBottom: '2px',
              padding: '0 4px',
            }}>
              <span style={{
                background: 'rgba(15,23,42,0.75)',
                border: '1px solid #334155',
                borderRadius: '99px',
                padding: '2px 8px',
                color: '#e2e8f0',
                fontWeight: 700,
              }}>
                🐟 {fishCfg.species}
              </span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid #334155',
                  borderRadius: '99px',
                  padding: '2px 7px',
                  color: '#fbbf24',
                }}>
                  🌿 {Math.round(aq.taninLevel)}%
                </span>
                <span style={{
                  background: 'rgba(15,23,42,0.75)',
                  border: '1px solid #334155',
                  borderRadius: '99px',
                  padding: '2px 7px',
                  color: '#e2e8f0',
                }}>
                  🧂 {Math.round(aq.saltLevel)}%
                </span>
              </div>
            </div>

            {isFlaring && (
              <div style={{
                position: 'absolute',
                top: '36px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid #fbbf24',
                color: '#fde047',
                borderRadius: '99px',
                padding: '2px 10px',
                fontSize: '10.5px',
                fontWeight: 800,
                zIndex: 5,
              }}>
                🪞 FLARING MODE!
              </div>
            )}

            <AquariumSVG
              level={aq.level}
              taninLevel={aq.taninLevel}
              waterClarity={aq.waterClarity}
              saltLevel={aq.saltLevel}
              isFlaring={isFlaring}
              width={310}
              height={235}
            >
              <FishSVG
                fishConfig={fishCfg}
                fishState={fish}
                size={138}
                animate
                isFlaring={isFlaring}
                ledBoost={aqCfg.colorBoost}
              />
            </AquariumSVG>

            <div style={{
              fontSize: '11px',
              color: phIdeal ? '#34d399' : '#f59e0b',
              marginTop: '2px',
              fontWeight: 600,
            }}>
              pH {aq.waterPH.toFixed(1)} · Ideal {fishCfg.species}: {idealMinPH}–{idealMaxPH}{' '}
              {phIdeal ? '✓' : '⚠️'}
            </div>
          </div>

          {/* ── Dynamic Visual Traits Strip (Modul 4: Body, Sirip, Warna) ── */}
          <div style={{ display: 'flex', gap: '7px' }}>
            <TraitPill icon="💪" label="Body" value={fish.bodySize} color="#f97316" />
            <TraitPill icon="🪶" label="Sirip" value={fish.finSpread} color="#38bdf8" />
            <TraitPill icon="🎨" label="Warna" value={fish.colorVibrancy} color="#e879f9" />
          </div>

          {/* ── Care Action Buttons Row ── */}
          <div style={{ position: 'relative' }}>
            {/* Popup Submenu: 5 Jenis Pakan */}
            {openMenu === 'feed' && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                background: '#0f172a',
                border: '1px solid #38bdf8',
                borderRadius: '14px',
                padding: '8px',
                zIndex: 500,
                boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', padding: '2px 4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>🍖 Pilih Pakan (Modul Nutrisi & Visual)</span>
                  <button onClick={() => { setOpenMenu(null); setModal('shop'); }} style={{ background: 'none', border: 'none', color: '#fbbf24', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                    + Tukar Poin
                  </button>
                </div>
                {FOOD_CONFIG.map((food) => {
                  const count = state.inventory[food.id] || 0;
                  const isPref = food.preferredSpecies.includes(fishId);
                  return (
                    <button
                      key={food.id}
                      onClick={() => handleFeed(food.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '9px',
                        border: isPref ? '1px solid rgba(52,211,153,0.4)' : '1px solid #1e293b',
                        background: count > 0 ? '#1e293b' : 'rgba(30,41,59,0.35)',
                        color: count > 0 ? '#f8fafc' : '#64748b',
                        cursor: count > 0 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        textAlign: 'left',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700 }}>
                          {food.emoji} {food.shortLabel}{' '}
                          {isPref && <span style={{ fontSize: '10px', color: '#34d399' }}>★ Cocok</span>}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>{food.tag}</div>
                      </div>
                      <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '12px' }}>×{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Popup Submenu: Perawatan Air (Parsial, Kuras Total, Ketapang, Garam) */}
            {openMenu === 'water' && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                background: '#0f172a',
                border: '1px solid #38bdf8',
                borderRadius: '14px',
                padding: '8px',
                zIndex: 500,
                boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', padding: '2px 4px' }}>
                  💧 Perawatan Air & Suplemen
                </div>
                <button
                  onClick={handlePartialWaterChange}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid #1e293b', background: '#1e293b',
                    color: '#f8fafc', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>💧 Ganti Air Parsial (30–50%)</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Air +38% jernih, pH stabil, ikan tidak stres</div>
                  </div>
                  <span style={{ color: '#34d399', fontSize: '11px', fontWeight: 700 }}>Aman</span>
                </button>
                <button
                  onClick={handleFullWaterChange}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid rgba(245,158,11,0.35)', background: '#1e293b',
                    color: '#f8fafc', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>🚿 Kuras Total (100%)</div>
                    <div style={{ fontSize: '10.5px', color: '#fbbf24' }}>Langsung 100% jernih · Wajib tambah Ketapang & Garam</div>
                  </div>
                  <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>100%</span>
                </button>
                <button
                  onClick={handleKetapang}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid #1e293b',
                    background: state.inventory.ketapang > 0 ? '#1e293b' : 'rgba(30,41,59,0.35)',
                    color: state.inventory.ketapang > 0 ? '#f8fafc' : '#64748b',
                    cursor: state.inventory.ketapang > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>🌿 Ekstrak / Daun Ketapang</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Turunkan pH (-0.25), tanin alami, redakan stres</div>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>×{state.inventory.ketapang}</span>
                </button>
                <button
                  onClick={handleSalt}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid #1e293b',
                    background: state.inventory.aquariumSalt > 0 ? '#1e293b' : 'rgba(30,41,59,0.35)',
                    color: state.inventory.aquariumSalt > 0 ? '#f8fafc' : '#64748b',
                    cursor: state.inventory.aquariumSalt > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>🧂 Garam Ikan (Aquarium Salt)</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Cegah jamur/parasit & bantu osmoregulasi</div>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>×{state.inventory.aquariumSalt}</span>
                </button>
              </div>
            )}

            {/* Popup Submenu: Obat Penyakit */}
            {openMenu === 'medicine' && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                right: 0,
                marginBottom: '8px',
                background: '#0f172a',
                border: '1px solid #c084fc',
                borderRadius: '14px',
                padding: '8px',
                zIndex: 500,
                boxShadow: '0 16px 40px rgba(0,0,0,0.75)',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#c084fc', padding: '2px 4px' }}>
                  💊 Obat & Penanganan Penyakit
                </div>
                <button
                  onClick={() => handleMedicine('medicineYellow')}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid #1e293b',
                    background: state.inventory.medicineYellow > 0 ? '#1e293b' : 'rgba(30,41,59,0.35)',
                    color: state.inventory.medicineYellow > 0 ? '#f8fafc' : '#64748b',
                    cursor: state.inventory.medicineYellow > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>🟡 Obat Kuning (Acriflavine)</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Obati Fin Rot (pastikan air bersih & ada Garam)</div>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>×{state.inventory.medicineYellow}</span>
                </button>
                <button
                  onClick={() => handleMedicine('medicineBlue')}
                  style={{
                    padding: '9px 10px', borderRadius: '9px', border: '1px solid #1e293b',
                    background: state.inventory.medicineBlue > 0 ? '#1e293b' : 'rgba(30,41,59,0.35)',
                    color: state.inventory.medicineBlue > 0 ? '#f8fafc' : '#64748b',
                    cursor: state.inventory.medicineBlue > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700 }}>🔵 Obat Biru (Methylene Blue)</div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>Obati Velvet / White Spot (+ Garam & Ketapang)</div>
                  </div>
                  <span style={{ color: '#fbbf24', fontSize: '12px', fontWeight: 800 }}>×{state.inventory.medicineBlue}</span>
                </button>
                {fish.disease === 'bloated' && (
                  <div style={{ padding: '7px 10px', borderRadius: '9px', background: 'rgba(251,113,133,0.12)', fontSize: '11px', color: '#fda4af' }}>
                    🎈 Untuk <strong>Kembung</strong>, tidak pakai obat kimia — puasakan pelet & beri <strong>Kutu Air (Daphnia)</strong> di menu Pakan!
                  </div>
                )}
              </div>
            )}

            {/* Main 4 Care Action Buttons */}
            <div style={{ display: 'flex', gap: '7px' }}>
              <ActionBtn
                emoji="🍖"
                label="Pakan"
                active={openMenu === 'feed'}
                onClick={() => setOpenMenu((m) => (m === 'feed' ? null : 'feed'))}
              />
              <ActionBtn
                emoji="🪞"
                label={flareCooldown > 0 ? `Flaring ${flareCooldown}s` : 'Flaring'}
                disabled={flareCooldown > 0 || isFlaring}
                highlightColor={isFlaring ? '#fbbf24' : undefined}
                onClick={handleFlaring}
              />
              <ActionBtn
                emoji="💧"
                label="Air & Rawat"
                active={openMenu === 'water'}
                highlightColor={aq.waterClarity < 45 ? '#f59e0b' : undefined}
                onClick={() => setOpenMenu((m) => (m === 'water' ? null : 'water'))}
              />
              <ActionBtn
                emoji="💊"
                label="Obat"
                active={openMenu === 'medicine'}
                highlightColor={fish.disease ? '#ef4444' : undefined}
                badge={fish.disease ? '!' : null}
                onClick={() => setOpenMenu((m) => (m === 'medicine' ? null : 'medicine'))}
              />
            </div>
          </div>

          {/* Click-outside backdrop for open action submenu */}
          {openMenu && (
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 400 }}
              onClick={() => setOpenMenu(null)}
            />
          )}
        </main>

        {/* ── Bottom Navigation Bar ── */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          display: 'flex',
          background: 'rgba(11, 17, 32, 0.98)',
          borderTop: '1px solid #1e293b',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 200,
        }}>
          <NavBtn emoji="📅" label="Check-In" onClick={() => setModal('checkin')} active={modal === 'checkin'} dot={unclaimedToday} />
          <NavBtn emoji="🎁" label="Tukar Poin" onClick={() => setModal('shop')} active={modal === 'shop'} />
          <NavBtn emoji="🏠" label="Akuarium" onClick={() => setModal('upgrade')} active={modal === 'upgrade'} />
          <NavBtn emoji="🐟" label="Koleksi" onClick={() => setModal('collection')} active={modal === 'collection'} />
          <NavBtn emoji="ℹ️" label="Panduan" onClick={() => setModal('info')} active={modal === 'info'} />
        </nav>

        {/* ── Modals ── */}
        {modal === 'checkin' && (
          <CheckinModal
            gameState={state}
            onClaim={handleCheckin}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'shop' && (
          <ShopModal
            gameState={state}
            onBuyItem={handleBuyShopItem}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'upgrade' && (
          <UpgradeModal
            gameState={state}
            onUpgrade={handleUpgrade}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'collection' && (
          <FishCollectionModal
            gameState={state}
            onUnlock={handleUnlock}
            onActivate={handleActivate}
            onClose={() => setModal(null)}
          />
        )}
        {modal === 'info' && (
          <InfoModal
            gameState={state}
            onClose={() => setModal(null)}
          />
        )}

        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </div>
    </div>
  );
}
