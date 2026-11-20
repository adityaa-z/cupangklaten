'use client';

import React, { useId } from 'react';

/**
 * AquariumSVG — renders the soliter/aquarium container (Level 1–4)
 * with realistic water clarity, ketapang tannin tint, salt shimmer,
 * aquascape plants, LED viewing light, and virtual flaring mirror.
 */
export default function AquariumSVG({
  level = 1,
  taninLevel = 0,
  waterClarity = 85,
  saltLevel = 0,
  isFlaring = false,
  children,
  width = 310,
  height = 245,
}) {
  const uid = useId().replace(/:/g, '');

  // Water tint: clear blue -> warm amber ketapang tannin -> murky olive if waterClarity low
  const tRatio = Math.min(Math.max(taninLevel, 0) / 100, 1);
  const dirtRatio = Math.min(Math.max(100 - waterClarity, 0) / 100, 1);

  const waterR = Math.round(45 + tRatio * 145 + dirtRatio * 55);
  const waterG = Math.round(175 - tRatio * 55 - dirtRatio * 45);
  const waterB = Math.round(240 - tRatio * 195 - dirtRatio * 150);
  const waterA = (0.2 + tRatio * 0.24 + dirtRatio * 0.24).toFixed(2);
  const waterColor = `rgba(${waterR},${waterG},${waterB},${waterA})`;
  const waterStroke = tRatio > 0.35 ? '#b45309' : dirtRatio > 0.55 ? '#65a30d' : '#38bdf8';

  const sharedProps = {
    uid,
    waterColor,
    waterStroke,
    width,
    height,
    taninLevel,
    waterClarity,
    saltLevel,
    isFlaring,
    dirtRatio,
    children,
  };

  if (level === 1) return <Level1 {...sharedProps} />;
  if (level === 2) return <Level2 {...sharedProps} />;
  if (level === 3) return <Level3 {...sharedProps} />;
  return <Level4 {...sharedProps} />;
}

/* ─── Shared Overlays: Murky Debris, Salt Shimmer, & Virtual Mirror ─────── */
function TankEffects({ width, height, dirtRatio, saltLevel, isFlaring }) {
  return (
    <>
      {/* Murky debris particles when water is dirty */}
      {dirtRatio > 0.3 && (
        <g opacity={Math.min(0.75, dirtRatio)}>
          <circle cx={width * 0.28} cy={height * 0.35} r="2.2" fill="#a3e635" />
          <circle cx={width * 0.68} cy={height * 0.45} r="1.8" fill="#84cc16" />
          <circle cx={width * 0.44} cy={height * 0.72} r="2.5" fill="#71717a" />
          <circle cx={width * 0.76} cy={height * 0.66} r="2" fill="#a16207" />
          <circle cx={width * 0.34} cy={height * 0.62} r="1.6" fill="#a3e635" />
        </g>
      )}

      {/* Subtle salt particles near bottom when aquarium salt is active */}
      {saltLevel > 5 && (
        <g opacity={Math.min(0.7, saltLevel / 80)}>
          <circle cx={width * 0.24} cy={height * 0.82} r="1.5" fill="#f8fafc" />
          <circle cx={width * 0.38} cy={height * 0.84} r="1.2" fill="#e2e8f0" />
          <circle cx={width * 0.58} cy={height * 0.83} r="1.6" fill="#f8fafc" />
          <circle cx={width * 0.72} cy={height * 0.81} r="1.3" fill="#e2e8f0" />
        </g>
      )}

      {/* Virtual Flaring Mirror on left side of tank */}
      {isFlaring && (
        <g>
          <rect
            x={width * 0.08}
            y={height * 0.16}
            width="10"
            height={height * 0.62}
            rx="3"
            fill="rgba(224,242,254,0.85)"
            stroke="#fbbf24"
            strokeWidth="2"
          />
          <line
            x1={width * 0.08 + 3}
            y1={height * 0.22}
            x2={width * 0.08 + 7}
            y2={height * 0.34}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
          <line
            x1={width * 0.08 + 3}
            y1={height * 0.46}
            x2={width * 0.08 + 7}
            y2={height * 0.6}
            stroke="#ffffff"
            strokeWidth="1.5"
          />
        </g>
      )}
    </>
  );
}

/* ─── Level 1: Soliter / Toples Plastik Standar ──────────────────────────── */
function Level1({ waterColor, waterStroke, width, height, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <rect
          x={width * 0.18}
          y={height * 0.16}
          width={width * 0.64}
          height={height * 0.76}
          rx="26"
          fill={waterColor}
          stroke={waterStroke}
          strokeWidth="2.5"
        />
        <rect
          x={width * 0.32}
          y={height * 0.07}
          width={width * 0.36}
          height={height * 0.1}
          rx="6"
          fill="rgba(200,230,255,0.14)"
          stroke={waterStroke}
          strokeWidth="2"
        />
        <ellipse cx={width / 2} cy={height * 0.21} rx={width * 0.28} ry="5" fill="rgba(255,255,255,0.1)" />
        <rect x={width * 0.22} y={height * 0.24} width="7" height={height * 0.48} rx="4" fill="rgba(255,255,255,0.12)" />
        <TankEffects width={width} height={height} dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute',
        top: height * 0.2,
        left: width * 0.2,
        width: width * 0.6,
        height: height * 0.66,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Level 2: Soliter Kaca Bening + Sekat Lepas-Pasang ─────────────────── */
function Level2({ waterColor, waterStroke, width, height, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <rect
          x={width * 0.08}
          y={height * 0.09}
          width={width * 0.84}
          height={height * 0.83}
          rx="6"
          fill={waterColor}
          stroke={waterStroke}
          strokeWidth="2.5"
        />
        {/* Removable divider (lifts up slightly when flaring!) */}
        <line
          x1={width * 0.14}
          y1={isFlaring ? height * 0.03 : height * 0.09}
          x2={width * 0.14}
          y2={isFlaring ? height * 0.35 : height * 0.92}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,3"
          opacity={isFlaring ? 0.85 : 0.4}
        />
        <rect x={width * 0.08} y={height * 0.84} width={width * 0.84} height={height * 0.08} rx="2" fill="rgba(148,163,184,0.22)" />
        <line x1={width * 0.08} y1={height * 0.15} x2={width * 0.92} y2={height * 0.15} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <rect x={width * 0.11} y={height * 0.14} width="6" height={height * 0.62} rx="3" fill="rgba(255,255,255,0.11)" />
        <TankEffects width={width} height={height} dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.12,
        width: width * 0.78,
        height: height * 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Level 3: Akuarium Kaca Rimless + Lampu LED Viewing Kontes ─────────── */
function Level3({ uid, waterColor, waterStroke, width, height, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const ledColor = taninLevel > 45 ? 'rgba(251,191,36,0.42)' : 'rgba(56,189,248,0.42)';
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`led3-${uid}`} cx="50%" cy="0%" r="72%">
            <stop offset="0%" stopColor={ledColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* LED Fixture bar */}
        <rect x={width * 0.2} y={height * 0.02} width={width * 0.6} height="7" rx="3" fill="#e2e8f0" />
        <rect x={width * 0.24} y={height * 0.05} width={width * 0.52} height="3" rx="1.5" fill={taninLevel > 45 ? '#fde047' : '#38bdf8'} />
        {/* Light cone */}
        <rect x={width * 0.06} y={height * 0.08} width={width * 0.88} height={height * 0.55} fill={`url(#led3-${uid})`} />
        {/* Rimless Tank */}
        <rect
          x={width * 0.06}
          y={height * 0.09}
          width={width * 0.88}
          height={height * 0.84}
          rx="2"
          fill={waterColor}
          stroke={waterStroke}
          strokeWidth="2"
        />
        <rect x={width * 0.06} y={height * 0.85} width={width * 0.88} height={height * 0.08} fill="rgba(100,80,55,0.42)" />
        <rect x={width * 0.09} y={height * 0.13} width="5" height={height * 0.66} rx="2" fill="rgba(255,255,255,0.12)" />
        <TankEffects width={width} height={height} dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.1,
        width: width * 0.8,
        height: height * 0.71,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Level 4: Akuarium Kolektor + Aquascape Mini ───────────────────────── */
function Level4({ uid, waterColor, waterStroke, width, height, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const ledColor = taninLevel > 45 ? 'rgba(251,191,36,0.42)' : 'rgba(52,211,153,0.42)';
  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`led4-${uid}`} cx="50%" cy="0%" r="75%">
            <stop offset="0%" stopColor={ledColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        {/* Premium WRGB LED Lamp */}
        <rect x={width * 0.15} y={height * 0.02} width={width * 0.7} height="7" rx="3" fill="#cbd5e1" />
        <rect x={width * 0.19} y={height * 0.05} width={width * 0.62} height="3" rx="1.5" fill={taninLevel > 45 ? '#fbbf24' : '#34d399'} />
        <rect x={width * 0.04} y={height * 0.08} width={width * 0.92} height={height * 0.58} fill={`url(#led4-${uid})`} />

        {/* Tank */}
        <rect
          x={width * 0.04}
          y={height * 0.09}
          width={width * 0.92}
          height={height * 0.84}
          rx="3"
          fill={waterColor}
          stroke={waterStroke}
          strokeWidth="2.2"
        />

        {/* Soil Substrate */}
        <rect x={width * 0.04} y={height * 0.84} width={width * 0.92} height={height * 0.09} fill="rgba(69,50,35,0.65)" rx="1" />

        {/* Left Aquascape Anubias & Java Fern */}
        <g opacity="0.88">
          <ellipse cx={width * 0.15} cy={height * 0.77} rx="11" ry="20" fill="#15803d" transform={`rotate(-12,${width * 0.15},${height * 0.77})`} />
          <ellipse cx={width * 0.11} cy={height * 0.7} rx="8" ry="15" fill="#22c55e" transform={`rotate(-22,${width * 0.11},${height * 0.7})`} />
          <ellipse cx={width * 0.2} cy={height * 0.75} rx="7" ry="13" fill="#166534" transform={`rotate(14,${width * 0.2},${height * 0.75})`} />
          <line x1={width * 0.15} y1={height * 0.85} x2={width * 0.15} y2={height * 0.64} stroke="#14532d" strokeWidth="1.5" />
        </g>

        {/* Right Aquascape Plants + Driftwood */}
        <g opacity="0.88">
          <path d={`M${width * 0.72},${height * 0.86} Q${width * 0.82},${height * 0.78} ${width * 0.9},${height * 0.65}`} stroke="#78350f" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx={width * 0.85} cy={height * 0.77} rx="11" ry="19" fill="#15803d" transform={`rotate(12,${width * 0.85},${height * 0.77})`} />
          <ellipse cx={width * 0.89} cy={height * 0.69} rx="8" ry="15" fill="#22c55e" transform={`rotate(22,${width * 0.89},${height * 0.69})`} />
          <ellipse cx={width * 0.8} cy={height * 0.76} rx="7" ry="12" fill="#166534" />
        </g>

        {/* Natural River Stones & Oxygen Bubbles */}
        <ellipse cx={width * 0.48} cy={height * 0.86} rx="18" ry="7" fill="rgba(100,116,139,0.65)" />
        <ellipse cx={width * 0.57} cy={height * 0.87} rx="11" ry="5" fill="rgba(71,85,105,0.65)" />
        <circle cx={width * 0.86} cy={height * 0.45} r="2.5" fill="rgba(255,255,255,0.45)" />
        <circle cx={width * 0.88} cy={height * 0.34} r="2" fill="rgba(255,255,255,0.4)" />
        <circle cx={width * 0.84} cy={height * 0.24} r="1.5" fill="rgba(255,255,255,0.35)" />

        <rect x={width * 0.07} y={height * 0.12} width="5" height={height * 0.66} rx="2" fill="rgba(255,255,255,0.12)" />
        <TankEffects width={width} height={height} dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute',
        top: height * 0.12,
        left: width * 0.18,
        width: width * 0.64,
        height: height * 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
