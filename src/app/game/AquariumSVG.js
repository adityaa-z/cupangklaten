'use client';

import React, { useId } from 'react';

const VB_W = 320;
const VB_H = 232;

/**
 * AquariumSVG — Studio Darkroom Glass Viewing Soliter (Level 1–4)
 * Designed to frame both real fish photography and SVG fallback cleanly.
 */
export default function AquariumSVG({
  level = 1,
  taninLevel = 0,
  waterClarity = 85,
  saltLevel = 0,
  isFlaring = false,
  children,
}) {
  const uid = useId().replace(/:/g, '');

  const tRatio = Math.min(Math.max(taninLevel, 0) / 100, 1);
  const dirtRatio = Math.min(Math.max(100 - waterClarity, 0) / 100, 1);

  // Studio dark water: clear deep charcoal-aqua -> natural amber ketapang -> murky olive
  const waterR = Math.round(18 + tRatio * 120 + dirtRatio * 55);
  const waterG = Math.round(32 + tRatio * 58 + dirtRatio * 42);
  const waterB = Math.round(44 - tRatio * 24 - dirtRatio * 22);
  const waterA = (0.48 + tRatio * 0.25 + dirtRatio * 0.22).toFixed(2);
  const waterColor = `rgba(${waterR},${waterG},${waterB},${waterA})`;
  const glassStroke = tRatio > 0.4 ? 'rgba(217,164,65,0.42)' : 'rgba(255,255,255,0.22)';

  const shared = {
    uid,
    waterColor,
    glassStroke,
    taninLevel,
    saltLevel,
    isFlaring,
    dirtRatio,
    children,
  };

  if (level === 1) return <Level1 {...shared} />;
  if (level === 2) return <Level2 {...shared} />;
  if (level === 3) return <Level3 {...shared} />;
  return <Level4 {...shared} />;
}

function TankEffects({ dirtRatio, saltLevel, isFlaring }) {
  return (
    <>
      {/* Water turbidity particles when water clarity drops */}
      {dirtRatio > 0.3 && (
        <g opacity={Math.min(0.65, dirtRatio)}>
          <circle cx={VB_W * 0.28} cy={VB_H * 0.36} r="1.8" fill="#84a94d" />
          <circle cx={VB_W * 0.68} cy={VB_H * 0.44} r="1.5" fill="#7c9c45" />
          <circle cx={VB_W * 0.46} cy={VB_H * 0.72} r="2.1" fill="#71717a" />
          <circle cx={VB_W * 0.74} cy={VB_H * 0.66} r="1.7" fill="#92713a" />
          <circle cx={VB_W * 0.35} cy={VB_H * 0.61} r="1.3" fill="#84a94d" />
        </g>
      )}

      {/* Subtle dissolved salt shimmer near bottom */}
      {saltLevel > 5 && (
        <g opacity={Math.min(0.55, saltLevel / 90)}>
          <circle cx={VB_W * 0.26} cy={VB_H * 0.83} r="1.2" fill="#e5e7eb" />
          <circle cx={VB_W * 0.41} cy={VB_H * 0.85} r="1" fill="#d1d5db" />
          <circle cx={VB_W * 0.59} cy={VB_H * 0.84} r="1.3" fill="#e5e7eb" />
          <circle cx={VB_W * 0.72} cy={VB_H * 0.82} r="1.1" fill="#d1d5db" />
        </g>
      )}

      {/* Minimalist Studio Viewing Mirror (Left Edge) during Flaring */}
      {isFlaring && (
        <g>
          <rect
            x={VB_W * 0.08}
            y={VB_H * 0.17}
            width="8"
            height={VB_H * 0.62}
            rx="2"
            fill="rgba(229, 231, 235, 0.85)"
            stroke="#d9a441"
            strokeWidth="1.5"
          />
          <line x1={VB_W * 0.08 + 2} y1={VB_H * 0.24} x2={VB_W * 0.08 + 6} y2={VB_H * 0.36} stroke="#ffffff" strokeWidth="1.2" />
          <line x1={VB_W * 0.08 + 2} y1={VB_H * 0.5} x2={VB_W * 0.08 + 6} y2={VB_H * 0.62} stroke="#ffffff" strokeWidth="1.2" />
        </g>
      )}
    </>
  );
}

const fluidWrapperStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: `${VB_W} / ${VB_H}`,
};

/* Level 1: Soliter Plastik Standar */
function Level1({ waterColor, glassStroke, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <rect x={VB_W * 0.18} y={VB_H * 0.15} width={VB_W * 0.64} height={VB_H * 0.78} rx="20" fill={waterColor} stroke={glassStroke} strokeWidth="1.5" />
        <rect x={VB_W * 0.33} y={VB_H * 0.06} width={VB_W * 0.34} height={VB_H * 0.09} rx="5" fill="rgba(255,255,255,0.04)" stroke={glassStroke} strokeWidth="1.2" />
        <line x1={VB_W * 0.2} y1={VB_H * 0.22} x2={VB_W * 0.8} y2={VB_H * 0.22} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
        <rect x={VB_W * 0.21} y={VB_H * 0.24} width="4" height={VB_H * 0.5} rx="2" fill="rgba(255,255,255,0.08)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{ position: 'absolute', top: '20%', left: '21%', width: '58%', height: '67%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* Level 2: Soliter Kaca Bening + Sekat Lepas-Pasang */
function Level2({ waterColor, glassStroke, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <rect x={VB_W * 0.08} y={VB_H * 0.09} width={VB_W * 0.84} height={VB_H * 0.84} rx="4" fill={waterColor} stroke={glassStroke} strokeWidth="1.5" />
        {/* Sekat lepas-pasang */}
        <line
          x1={VB_W * 0.13}
          y1={isFlaring ? VB_H * 0.03 : VB_H * 0.09}
          x2={VB_W * 0.13}
          y2={isFlaring ? VB_H * 0.32 : VB_H * 0.93}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <line x1={VB_W * 0.08} y1={VB_H * 0.16} x2={VB_W * 0.92} y2={VB_H * 0.16} stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        <rect x={VB_W * 0.08} y={VB_H * 0.87} width={VB_W * 0.84} height={VB_H * 0.06} fill="rgba(255,255,255,0.05)" />
        <rect x={VB_W * 0.1} y={VB_H * 0.14} width="3" height={VB_H * 0.66} rx="1.5" fill="rgba(255,255,255,0.08)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{ position: 'absolute', top: '14%', left: '15%', width: '70%', height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* Level 3: Akuarium Kaca Rimless + Lampu LED Viewing Kontes */
function Level3({ uid, waterColor, glassStroke, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const beamColor = taninLevel > 45 ? 'rgba(217,164,65,0.28)' : 'rgba(226,232,240,0.2)';
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`beam3-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={beamColor} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        {/* Minimalist LED Lamp Bar */}
        <rect x={VB_W * 0.22} y={VB_H * 0.025} width={VB_W * 0.56} height="4.5" rx="2" fill="#374151" />
        <rect x={VB_W * 0.26} y={VB_H * 0.045} width={VB_W * 0.48} height="2" rx="1" fill={taninLevel > 45 ? '#e5b869' : '#f3f4f6'} />
        {/* Viewing Light Cone */}
        <polygon points={`${VB_W * 0.24},${VB_H * 0.06} ${VB_W * 0.76},${VB_H * 0.06} ${VB_W * 0.92},${VB_H * 0.72} ${VB_W * 0.08},${VB_H * 0.72}`} fill={`url(#beam3-${uid})`} />
        {/* Rimless Tank */}
        <rect x={VB_W * 0.06} y={VB_H * 0.09} width={VB_W * 0.88} height={VB_H * 0.84} rx="2" fill={waterColor} stroke={glassStroke} strokeWidth="1.4" />
        <line x1={VB_W * 0.06} y1={VB_H * 0.15} x2={VB_W * 0.94} y2={VB_H * 0.15} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <rect x={VB_W * 0.06} y={VB_H * 0.86} width={VB_W * 0.88} height={VB_H * 0.07} fill="rgba(40,34,28,0.65)" />
        <rect x={VB_W * 0.085} y={VB_H * 0.13} width="3" height={VB_H * 0.68} rx="1.5" fill="rgba(255,255,255,0.09)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{ position: 'absolute', top: '14%', left: '15%', width: '70%', height: '70%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

/* Level 4: Akuarium Kolektor + Aquascape Mini */
function Level4({ uid, waterColor, glassStroke, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const beamColor = taninLevel > 45 ? 'rgba(217,164,65,0.28)' : 'rgba(167,243,208,0.18)';
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`beam4-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={beamColor} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect x={VB_W * 0.16} y={VB_H * 0.025} width={VB_W * 0.68} height="5" rx="2" fill="#374151" />
        <rect x={VB_W * 0.2} y={VB_H * 0.045} width={VB_W * 0.6} height="2" rx="1" fill={taninLevel > 45 ? '#e5b869' : '#d1fae5'} />
        <polygon points={`${VB_W * 0.18},${VB_H * 0.06} ${VB_W * 0.82},${VB_H * 0.06} ${VB_W * 0.95},${VB_H * 0.78} ${VB_W * 0.05},${VB_H * 0.78}`} fill={`url(#beam4-${uid})`} />

        {/* Collector Tank */}
        <rect x={VB_W * 0.04} y={VB_H * 0.09} width={VB_W * 0.92} height={VB_H * 0.84} rx="2" fill={waterColor} stroke={glassStroke} strokeWidth="1.5" />
        <line x1={VB_W * 0.04} y1={VB_H * 0.15} x2={VB_W * 0.96} y2={VB_H * 0.15} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

        {/* Dark Aquasoil */}
        <rect x={VB_W * 0.04} y={VB_H * 0.85} width={VB_W * 0.92} height={VB_H * 0.08} fill="rgba(28,25,23,0.85)" />

        {/* Natural muted aquatic plants */}
        <g opacity="0.72">
          <ellipse cx={VB_W * 0.13} cy={VB_H * 0.78} rx="9" ry="18" fill="#14532d" transform={`rotate(-14,${VB_W * 0.13},${VB_H * 0.78})`} />
          <ellipse cx={VB_W * 0.1} cy={VB_H * 0.71} rx="7" ry="14" fill="#166534" transform={`rotate(-22,${VB_W * 0.1},${VB_H * 0.71})`} />
          <ellipse cx={VB_W * 0.18} cy={VB_H * 0.76} rx="6" ry="12" fill="#14532d" transform={`rotate(12,${VB_W * 0.18},${VB_H * 0.76})`} />
        </g>
        <g opacity="0.72">
          <path d={`M${VB_W * 0.74},${VB_H * 0.87} Q${VB_W * 0.84},${VB_H * 0.78} ${VB_W * 0.91},${VB_H * 0.66}`} stroke="#451a03" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <ellipse cx={VB_W * 0.86} cy={VB_H * 0.78} rx="9" ry="17" fill="#14532d" transform={`rotate(14,${VB_W * 0.86},${VB_H * 0.78})`} />
          <ellipse cx={VB_W * 0.9} cy={VB_H * 0.71} rx="7" ry="13" fill="#166534" transform={`rotate(20,${VB_W * 0.9},${VB_H * 0.71})`} />
        </g>

        {/* Seiryu Stones */}
        <ellipse cx={VB_W * 0.48} cy={VB_H * 0.87} rx="18" ry="6.5" fill="rgba(63,63,70,0.75)" />
        <ellipse cx={VB_W * 0.57} cy={VB_H * 0.88} rx="10" ry="4.5" fill="rgba(39,39,42,0.8)" />

        {/* Subtle micro-bubbles */}
        <circle cx={VB_W * 0.86} cy={VB_H * 0.56} r="1.6" fill="rgba(255,255,255,0.35)" style={{ animation: 'ckBubbleRise 4.2s linear infinite' }} />
        <circle cx={VB_W * 0.88} cy={VB_H * 0.64} r="1.2" fill="rgba(255,255,255,0.28)" style={{ animation: 'ckBubbleRise 5.6s linear infinite 1.4s' }} />

        <rect x={VB_W * 0.065} y={VB_H * 0.13} width="3" height={VB_H * 0.68} rx="1.5" fill="rgba(255,255,255,0.08)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{ position: 'absolute', top: '14%', left: '18%', width: '64%', height: '69%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}
