'use client';

import React, { useId } from 'react';

const VB_W = 310;
const VB_H = 235;

/**
 * AquariumSVG — fully fluid responsive soliter/aquarium container (Level 1–4)
 * Scales cleanly across Mobile (320px+), Tablet, and Desktop screens.
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
    taninLevel,
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

function TankEffects({ dirtRatio, saltLevel, isFlaring }) {
  return (
    <>
      {dirtRatio > 0.3 && (
        <g opacity={Math.min(0.75, dirtRatio)}>
          <circle cx={VB_W * 0.28} cy={VB_H * 0.35} r="2.2" fill="#a3e635" />
          <circle cx={VB_W * 0.68} cy={VB_H * 0.45} r="1.8" fill="#84cc16" />
          <circle cx={VB_W * 0.44} cy={VB_H * 0.72} r="2.5" fill="#71717a" />
          <circle cx={VB_W * 0.76} cy={VB_H * 0.66} r="2" fill="#a16207" />
          <circle cx={VB_W * 0.34} cy={VB_H * 0.62} r="1.6" fill="#a3e635" />
        </g>
      )}

      {saltLevel > 5 && (
        <g opacity={Math.min(0.7, saltLevel / 80)}>
          <circle cx={VB_W * 0.24} cy={VB_H * 0.82} r="1.5" fill="#f8fafc" />
          <circle cx={VB_W * 0.38} cy={VB_H * 0.84} r="1.2" fill="#e2e8f0" />
          <circle cx={VB_W * 0.58} cy={VB_H * 0.83} r="1.6" fill="#f8fafc" />
          <circle cx={VB_W * 0.72} cy={VB_H * 0.81} r="1.3" fill="#e2e8f0" />
        </g>
      )}

      {isFlaring && (
        <g>
          <rect
            x={VB_W * 0.08}
            y={VB_H * 0.16}
            width="10"
            height={VB_H * 0.62}
            rx="3"
            fill="rgba(224,242,254,0.85)"
            stroke="#fbbf24"
            strokeWidth="2"
          />
          <line x1={VB_W * 0.08 + 3} y1={VB_H * 0.22} x2={VB_W * 0.08 + 7} y2={VB_H * 0.34} stroke="#ffffff" strokeWidth="1.5" />
          <line x1={VB_W * 0.08 + 3} y1={VB_H * 0.46} x2={VB_W * 0.08 + 7} y2={VB_H * 0.6} stroke="#ffffff" strokeWidth="1.5" />
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

function Level1({ waterColor, waterStroke, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <rect x={VB_W * 0.18} y={VB_H * 0.16} width={VB_W * 0.64} height={VB_H * 0.76} rx="26" fill={waterColor} stroke={waterStroke} strokeWidth="2.5" />
        <rect x={VB_W * 0.32} y={VB_H * 0.07} width={VB_W * 0.36} height={VB_H * 0.1} rx="6" fill="rgba(200,230,255,0.14)" stroke={waterStroke} strokeWidth="2" />
        <ellipse cx={VB_W / 2} cy={VB_H * 0.21} rx={VB_W * 0.28} ry="5" fill="rgba(255,255,255,0.1)" />
        <rect x={VB_W * 0.22} y={VB_H * 0.24} width="7" height={VB_H * 0.48} rx="4" fill="rgba(255,255,255,0.12)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute', top: '20%', left: '22%', width: '56%', height: '66%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

function Level2({ waterColor, waterStroke, dirtRatio, saltLevel, isFlaring, children }) {
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <rect x={VB_W * 0.08} y={VB_H * 0.09} width={VB_W * 0.84} height={VB_H * 0.83} rx="6" fill={waterColor} stroke={waterStroke} strokeWidth="2.5" />
        <line
          x1={VB_W * 0.14}
          y1={isFlaring ? VB_H * 0.03 : VB_H * 0.09}
          x2={VB_W * 0.14}
          y2={isFlaring ? VB_H * 0.35 : VB_H * 0.92}
          stroke="#94a3b8"
          strokeWidth="2"
          strokeDasharray="5,3"
          opacity={isFlaring ? 0.85 : 0.4}
        />
        <rect x={VB_W * 0.08} y={VB_H * 0.84} width={VB_W * 0.84} height={VB_H * 0.08} rx="2" fill="rgba(148,163,184,0.22)" />
        <line x1={VB_W * 0.08} y1={VB_H * 0.15} x2={VB_W * 0.92} y2={VB_H * 0.15} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
        <rect x={VB_W * 0.11} y={VB_H * 0.14} width="6" height={VB_H * 0.62} rx="3" fill="rgba(255,255,255,0.11)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute', top: '13%', left: '16%', width: '68%', height: '68%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

function Level3({ uid, waterColor, waterStroke, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const ledColor = taninLevel > 45 ? 'rgba(251,191,36,0.42)' : 'rgba(56,189,248,0.42)';
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`led3-${uid}`} cx="50%" cy="0%" r="72%">
            <stop offset="0%" stopColor={ledColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x={VB_W * 0.2} y={VB_H * 0.02} width={VB_W * 0.6} height="7" rx="3" fill="#e2e8f0" />
        <rect x={VB_W * 0.24} y={VB_H * 0.05} width={VB_W * 0.52} height="3" rx="1.5" fill={taninLevel > 45 ? '#fde047' : '#38bdf8'} />
        <rect x={VB_W * 0.06} y={VB_H * 0.08} width={VB_W * 0.88} height={VB_H * 0.55} fill={`url(#led3-${uid})`} />
        <rect x={VB_W * 0.06} y={VB_H * 0.09} width={VB_W * 0.88} height={VB_H * 0.84} rx="2" fill={waterColor} stroke={waterStroke} strokeWidth="2" />
        <rect x={VB_W * 0.06} y={VB_H * 0.85} width={VB_W * 0.88} height={VB_H * 0.08} fill="rgba(100,80,55,0.42)" />
        <rect x={VB_W * 0.09} y={VB_H * 0.13} width="5" height={VB_H * 0.66} rx="2" fill="rgba(255,255,255,0.12)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute', top: '13%', left: '16%', width: '68%', height: '68%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

function Level4({ uid, waterColor, waterStroke, taninLevel, dirtRatio, saltLevel, isFlaring, children }) {
  const ledColor = taninLevel > 45 ? 'rgba(251,191,36,0.42)' : 'rgba(52,211,153,0.42)';
  return (
    <div style={fluidWrapperStyle}>
      <svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <radialGradient id={`led4-${uid}`} cx="50%" cy="0%" r="75%">
            <stop offset="0%" stopColor={ledColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x={VB_W * 0.15} y={VB_H * 0.02} width={VB_W * 0.7} height="7" rx="3" fill="#cbd5e1" />
        <rect x={VB_W * 0.19} y={VB_H * 0.05} width={VB_W * 0.62} height="3" rx="1.5" fill={taninLevel > 45 ? '#fbbf24' : '#34d399'} />
        <rect x={VB_W * 0.04} y={VB_H * 0.08} width={VB_W * 0.92} height={VB_H * 0.58} fill={`url(#led4-${uid})`} />
        <rect x={VB_W * 0.04} y={VB_H * 0.09} width={VB_W * 0.92} height={VB_H * 0.84} rx="3" fill={waterColor} stroke={waterStroke} strokeWidth="2.2" />
        <rect x={VB_W * 0.04} y={VB_H * 0.84} width={VB_W * 0.92} height={VB_H * 0.09} fill="rgba(69,50,35,0.65)" rx="1" />
        <g opacity="0.88">
          <ellipse cx={VB_W * 0.15} cy={VB_H * 0.77} rx="11" ry="20" fill="#15803d" transform={`rotate(-12,${VB_W * 0.15},${VB_H * 0.77})`} />
          <ellipse cx={VB_W * 0.11} cy={VB_H * 0.7} rx="8" ry="15" fill="#22c55e" transform={`rotate(-22,${VB_W * 0.11},${VB_H * 0.7})`} />
          <ellipse cx={VB_W * 0.2} cy={VB_H * 0.75} rx="7" ry="13" fill="#166534" transform={`rotate(14,${VB_W * 0.2},${VB_H * 0.75})`} />
          <line x1={VB_W * 0.15} y1={VB_H * 0.85} x2={VB_W * 0.15} y2={VB_H * 0.64} stroke="#14532d" strokeWidth="1.5" />
        </g>
        <g opacity="0.88">
          <path d={`M${VB_W * 0.72},${VB_H * 0.86} Q${VB_W * 0.82},${VB_H * 0.78} ${VB_W * 0.9},${VB_H * 0.65}`} stroke="#78350f" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx={VB_W * 0.85} cy={VB_H * 0.77} rx="11" ry="19" fill="#15803d" transform={`rotate(12,${VB_W * 0.85},${VB_H * 0.77})`} />
          <ellipse cx={VB_W * 0.89} cy={VB_H * 0.69} rx="8" ry="15" fill="#22c55e" transform={`rotate(22,${VB_W * 0.89},${VB_H * 0.69})`} />
          <ellipse cx={VB_W * 0.8} cy={VB_H * 0.76} rx="7" ry="12" fill="#166534" />
        </g>
        <ellipse cx={VB_W * 0.48} cy={VB_H * 0.86} rx="18" ry="7" fill="rgba(100,116,139,0.65)" />
        <ellipse cx={VB_W * 0.57} cy={VB_H * 0.87} rx="11" ry="5" fill="rgba(71,85,105,0.65)" />
        <circle cx={VB_W * 0.86} cy={VB_H * 0.45} r="2.5" fill="rgba(255,255,255,0.45)" />
        <circle cx={VB_W * 0.88} cy={VB_H * 0.34} r="2" fill="rgba(255,255,255,0.4)" />
        <circle cx={VB_W * 0.84} cy={VB_H * 0.24} r="1.5" fill="rgba(255,255,255,0.35)" />
        <rect x={VB_W * 0.07} y={VB_H * 0.12} width="5" height={VB_H * 0.66} rx="2" fill="rgba(255,255,255,0.12)" />
        <TankEffects dirtRatio={dirtRatio} saltLevel={saltLevel} isFlaring={isFlaring} />
      </svg>
      <div style={{
        position: 'absolute', top: '13%', left: '19%', width: '62%', height: '68%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}
