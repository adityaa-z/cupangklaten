'use client';

import React, { useId, useEffect } from 'react';

const FISH_KEYFRAMES = `
@keyframes fishSwim {
  0%   { transform: translate(0px, 0px) rotate(-1.5deg); }
  25%  { transform: translate(4px, -3px) rotate(0.5deg); }
  50%  { transform: translate(0px, 2px) rotate(1.8deg); }
  75%  { transform: translate(-4px, -2px) rotate(-0.5deg); }
  100% { transform: translate(0px, 0px) rotate(-1.5deg); }
}
@keyframes fishFlare {
  0%   { transform: translate(-8px, 0px) rotate(-3deg) scale(1.06); }
  25%  { transform: translate(-12px, -3px) rotate(2deg) scale(1.09); }
  50%  { transform: translate(-9px, 2px) rotate(-2deg) scale(1.07); }
  75%  { transform: translate(-13px, -1px) rotate(3deg) scale(1.09); }
  100% { transform: translate(-8px, 0px) rotate(-3deg) scale(1.06); }
}
@keyframes fishBloated {
  0%   { transform: translate(0px, 2px) rotate(-11deg); }
  50%  { transform: translate(1px, 5px) rotate(-15deg); }
  100% { transform: translate(0px, 2px) rotate(-11deg); }
}
@keyframes fishLethargic {
  0%   { transform: translate(0px, 4px) rotate(3deg); }
  50%  { transform: translate(-2px, 6px) rotate(5deg); }
  100% { transform: translate(0px, 4px) rotate(3deg); }
}
`;

let styleInjected = false;
function ensureFishStyles() {
  if (styleInjected || typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.textContent = FISH_KEYFRAMES;
  document.head.appendChild(style);
  styleInjected = true;
}

function FinRotOverlay({ x, y, h }) {
  return (
    <g opacity="0.85">
      <polygon points={`${x - 6},${y - h * 0.65} ${x + 3},${y - h * 0.85} ${x + 1},${y - h * 0.45}`} fill="#1e293b" />
      <polygon points={`${x - 4},${y + h * 0.25} ${x + 4},${y + h * 0.45} ${x - 2},${y + h * 0.62}`} fill="#1e293b" />
      <path
        d={`M${x - 4},${y - h * 0.7} L${x + 1},${y - h * 0.4} L${x - 3},${y} L${x + 2},${y + h * 0.4} L${x - 4},${y + h * 0.7}`}
        fill="none"
        stroke="#475569"
        strokeWidth="2"
        strokeDasharray="3,2"
      />
    </g>
  );
}

function renderTail(tailType, color, accent, highlight, spreadFactor, finRot) {
  const opacity = finRot ? 0.58 : 0.9;
  const tailX = 132;

  switch (tailType) {
    case 'wide': {
      // Halfmoon 180° sweeping fan
      const r = 34 + spreadFactor * 20;
      const len = 36 + spreadFactor * 14;
      return (
        <g opacity={opacity}>
          <path
            d={`M${tailX},100
                C${tailX + 12},${100 - r * 0.95} ${tailX + len * 0.85},${100 - r * 1.05} ${tailX + len},${100 - r * 0.72}
                Q${tailX + len + 8},100 ${tailX + len},${100 + r * 0.72}
                C${tailX + len * 0.85},${100 + r * 1.05} ${tailX + 12},${100 + r * 0.95} ${tailX},100 Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.2"
          />
          {[-0.6, -0.3, 0, 0.3, 0.6].map((f, i) => (
            <line key={i} x1={tailX + 2} y1={100} x2={tailX + len - 2} y2={100 + f * r} stroke={highlight} strokeWidth="0.9" opacity="0.45" />
          ))}
          {finRot && <FinRotOverlay x={tailX + len - 2} y={100} h={r * 0.7} />}
        </g>
      );
    }

    case 'hmpk': {
      // Halfmoon Plakat: compact length, crisp 180° D-shape opening
      const r = 28 + spreadFactor * 16;
      const len = 24 + spreadFactor * 8;
      return (
        <g opacity={opacity}>
          <path
            d={`M${tailX},100
                L${tailX + 6},${100 - r}
                Q${tailX + len + 8},100 ${tailX + 6},${100 + r}
                Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.3"
          />
          {[-0.5, 0, 0.5].map((f, i) => (
            <line key={i} x1={tailX + 2} y1={100} x2={tailX + len} y2={100 + f * r * 0.85} stroke={highlight} strokeWidth="1" opacity="0.45" />
          ))}
          {finRot && <FinRotOverlay x={tailX + len} y={100} h={r * 0.7} />}
        </g>
      );
    }

    case 'crown': {
      // Crowntail / Serit: spiky crown rays
      const baseH = 26 + spreadFactor * 16;
      const len = 30 + spreadFactor * 12;
      const rays = [-1.05, -0.7, -0.35, 0, 0.35, 0.7, 1.05];
      return (
        <g opacity={opacity}>
          {rays.map((factor, i) => {
            const tipY = 100 + factor * baseH;
            const tipX = tailX + len + (1 - Math.abs(factor) * 0.3) * 8;
            return (
              <g key={i}>
                <polygon
                  points={`${tailX},${100 - 4} ${tailX},${100 + 4} ${tipX},${tipY}`}
                  fill={color}
                  stroke={accent}
                  strokeWidth="0.9"
                />
                <line x1={tailX} y1={100} x2={tipX + 4} y2={tipY} stroke={highlight} strokeWidth="1.2" opacity="0.7" />
              </g>
            );
          })}
          {finRot && <FinRotOverlay x={tailX + len} y={100} h={baseH * 0.75} />}
        </g>
      );
    }

    case 'veil': {
      // Veiltail: long flowing drooping tail
      const spread = 20 + spreadFactor * 12;
      const len = 40 + spreadFactor * 16;
      return (
        <g opacity={opacity}>
          <path
            d={`M${tailX},95
                Q${tailX + len * 0.55},${82 - spread * 0.4} ${tailX + len},${104 + spread * 0.55}
                Q${tailX + len * 0.72},${122 + spread * 0.75} ${tailX + len * 0.45},${118 + spread * 0.6}
                Q${tailX + 12},110 ${tailX},105 Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.2"
          />
          <path
            d={`M${tailX + 4},99 Q${tailX + len * 0.5},98 ${tailX + len * 0.85},${108 + spread * 0.45}`}
            fill="none"
            stroke={highlight}
            strokeWidth="1"
            opacity="0.45"
          />
          {finRot && <FinRotOverlay x={tailX + len * 0.8} y={110} h={20} />}
        </g>
      );
    }

    case 'double_short':
    case 'double_wide': {
      const isWide = tailType === 'double_wide';
      const h = (isWide ? 32 : 24) + spreadFactor * (isWide ? 16 : 10);
      const len = (isWide ? 38 : 26) + spreadFactor * 10;
      return (
        <g opacity={opacity}>
          {/* Upper lobe */}
          <path
            d={`M${tailX},97
                C${tailX + 10},${100 - h * 1.05} ${tailX + len},${100 - h * 1.1} ${tailX + len},${100 - h * 0.35}
                Q${tailX + len * 0.6},99 ${tailX},99 Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.1"
          />
          {/* Lower lobe */}
          <path
            d={`M${tailX},103
                C${tailX + 10},${100 + h * 1.05} ${tailX + len},${100 + h * 1.1} ${tailX + len},${100 + h * 0.35}
                Q${tailX + len * 0.6},101 ${tailX},101 Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.1"
          />
          <line x1={tailX + 2} y1={98} x2={tailX + len * 0.8} y2={100 - h * 0.55} stroke={highlight} strokeWidth="0.9" opacity="0.45" />
          <line x1={tailX + 2} y1={102} x2={tailX + len * 0.8} y2={100 + h * 0.55} stroke={highlight} strokeWidth="0.9" opacity="0.45" />
          {finRot && <FinRotOverlay x={tailX + len - 2} y={100} h={h * 0.7} />}
        </g>
      );
    }

    case 'wild': {
      // Wild Betta: spade / rounded natural tail with iridescent rim
      const h = 18 + spreadFactor * 10;
      const len = 26 + spreadFactor * 8;
      return (
        <g opacity={opacity}>
          <path
            d={`M${tailX},96
                Q${tailX + len * 0.7},${100 - h} ${tailX + len + 4},100
                Q${tailX + len * 0.7},${100 + h} ${tailX},104 Z`}
            fill={color}
            stroke="#ef4444"
            strokeWidth="1.6"
          />
          <ellipse cx={tailX + len * 0.48} cy={100} rx={len * 0.3} ry={h * 0.45} fill={highlight} opacity="0.3" />
          {finRot && <FinRotOverlay x={tailX + len} y={100} h={h * 0.65} />}
        </g>
      );
    }

    case 'short':
    default: {
      // Plakat: sturdy rounded spade/fan short tail
      const h = 21 + spreadFactor * 11;
      const len = 24 + spreadFactor * 8;
      return (
        <g opacity={opacity}>
          <path
            d={`M${tailX},96
                Q${tailX + len * 0.5},${100 - h} ${tailX + len},${100 - h * 0.72}
                Q${tailX + len + 6},100 ${tailX + len},${100 + h * 0.72}
                Q${tailX + len * 0.5},${100 + h} ${tailX},104 Z`}
            fill={color}
            stroke={accent}
            strokeWidth="1.2"
          />
          <line x1={tailX + 2} y1={100} x2={tailX + len - 2} y2={100} stroke={highlight} strokeWidth="0.9" opacity="0.45" />
          {finRot && <FinRotOverlay x={tailX + len} y={100} h={h * 0.65} />}
        </g>
      );
    }
  }
}

/**
 * FishSVG — renders an animated inline SVG betta fish with dynamic Modul 3 & 4 visuals.
 */
export default function FishSVG({
  fishConfig,
  fishState,
  size = 200,
  animate = true,
  isFlaring = false,
  ledBoost = 0,
}) {
  const uid = useId().replace(/:/g, '');
  useEffect(() => {
    ensureFishStyles();
  }, []);

  if (!fishConfig) return null;

  const {
    svgColor,
    svgAccent,
    svgHighlight = '#ffffff',
    tailType,
    bodyShape,
  } = fishConfig;

  const {
    bodySize = 60,
    finSpread = 65,
    colorVibrancy = 70,
    mood = 80,
    health = 90,
    disease = null,
  } = fishState || {};

  const isGiant = bodyShape === 'giant';
  const isFinRot = disease === 'finRot';
  const isVelvet = disease === 'velvet';
  const isBloated = disease === 'bloated';

  // Effective fin spread boosted during Flaring!
  const effectiveFinSpread = Math.min(135, finSpread + (isFlaring ? 35 : 0) - (isFinRot ? 20 : 0));
  const spreadFactor = Math.max(0.2, effectiveFinSpread / 100);

  // Body dimensions driven by bodySize (0–100) + giant shape
  const baseRx = isGiant ? 43 : 33;
  const baseRy = isGiant ? 21 : 14;
  const sizeScale = 0.72 + (bodySize / 100) * 0.56;
  const rx = baseRx * sizeScale;
  const ry = baseRy * sizeScale;

  // Color saturation & brightness driven by colorVibrancy, LED boost, mood, & disease
  const stressPenalty = (disease ? 0.4 : 0) + (mood < 40 ? 0.2 : 0) + (health < 50 ? 0.15 : 0);
  const saturation = Math.max(0.25, 0.35 + (colorVibrancy / 100) * 1.25 + ledBoost - stressPenalty);
  const brightness = disease ? 0.8 : 0.92 + (colorVibrancy / 100) * 0.16 + ledBoost * 0.35;

  const filterId = `fish-flt-${uid}`;
  const gradId = `fish-grd-${uid}`;

  let animStyle = 'none';
  if (animate) {
    if (isFlaring) animStyle = 'fishFlare 0.7s ease-in-out infinite';
    else if (isBloated) animStyle = 'fishBloated 3.8s ease-in-out infinite';
    else if (isVelvet) animStyle = 'fishLethargic 4.2s ease-in-out infinite';
    else animStyle = 'fishSwim 2.5s ease-in-out infinite';
  }

  return (
    <svg
      width={size === 'fluid' ? '100%' : size}
      height={size === 'fluid' ? '100%' : size}
      viewBox="0 0 210 200"
      style={{
        animation: animStyle,
        display: 'block',
        overflow: 'visible',
        maxWidth: size === 'fluid' ? '230px' : undefined,
        maxHeight: size === 'fluid' ? '210px' : undefined,
      }}
      aria-label={fishConfig.species}
    >
      <defs>
        <filter id={filterId}>
          <feColorMatrix type="saturate" values={saturation.toFixed(2)} />
          <feComponentTransfer>
            <feFuncR type="linear" slope={brightness.toFixed(2)} />
            <feFuncG type="linear" slope={brightness.toFixed(2)} />
            <feFuncB type="linear" slope={brightness.toFixed(2)} />
          </feComponentTransfer>
        </filter>
        <radialGradient id={gradId} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={svgHighlight} stopOpacity="0.65" />
          <stop offset="45%" stopColor={svgColor} stopOpacity="1" />
          <stop offset="100%" stopColor={svgAccent} stopOpacity="1" />
        </radialGradient>
      </defs>

      <g filter={`url(#${filterId})`}>
        {/* Tail */}
        {renderTail(tailType, svgColor, svgAccent, svgHighlight, spreadFactor, isFinRot)}

        {/* Dorsal fin (top) */}
        <path
          d={`M${95 - rx * 0.25},${100 - ry + 1}
              Q${105},${100 - ry - (16 + spreadFactor * 18)}
              ${98 + rx * 0.78},${100 - ry * 0.72}
              Q${98 + rx * 0.55},${100 - ry + 2}
              ${95 - rx * 0.25},${100 - ry + 1} Z`}
          fill={svgColor}
          stroke={svgAccent}
          strokeWidth="1.1"
          opacity={isFinRot ? 0.55 : 0.85}
        />

        {/* Anal / Ventral fin (bottom) */}
        <path
          d={`M${96 - rx * 0.15},${100 + ry - 1}
              Q${106},${100 + ry + (16 + spreadFactor * 18)}
              ${100 + rx * 0.82},${100 + ry * 0.65}
              Q${100 + rx * 0.5},${100 + ry - 1}
              ${96 - rx * 0.15},${100 + ry - 1} Z`}
          fill={svgColor}
          stroke={svgAccent}
          strokeWidth="1.1"
          opacity={isFinRot ? 0.52 : 0.82}
        />

        {/* Pelvic fin (front bottom spikes) */}
        <path
          d={`M${92 - rx * 0.35},${100 + ry * 0.72}
              L${92 - rx * 0.52},${100 + ry + 11 + spreadFactor * 6}
              L${92 - rx * 0.16},${100 + ry * 0.85} Z`}
          fill={svgAccent}
          opacity="0.88"
        />

        {/* Flaring Gill Beard (visible when flaring!) */}
        {isFlaring && (
          <path
            d={`M${96 - rx * 0.58},${100 - ry * 0.3}
                Q${96 - rx * 0.92},${100 + ry * 0.35}
                ${96 - rx * 0.45},${100 + ry * 1.15}
                Q${96 - rx * 0.3},${100 + ry * 0.4}
                ${96 - rx * 0.58},${100 - ry * 0.3} Z`}
            fill="#111827"
            stroke="#ef4444"
            strokeWidth="1.5"
            opacity="0.92"
          />
        )}

        {/* Bloated belly indicator (Modul 3: Kembung) */}
        {isBloated && (
          <ellipse
            cx={94 - rx * 0.12}
            cy={100 + ry * 0.62}
            rx={rx * 0.45}
            ry={ry * 0.68}
            fill={svgHighlight}
            stroke={svgAccent}
            strokeWidth="1.2"
            opacity="0.88"
          />
        )}

        {/* Main Body */}
        <ellipse
          cx={96}
          cy={100}
          rx={rx}
          ry={ry}
          fill={`url(#${gradId})`}
          stroke={svgAccent}
          strokeWidth="1.5"
        />

        {/* Iridescent Scale Shimmer */}
        {[-0.25, 0.05, 0.32].map((offset, i) => (
          <ellipse
            key={i}
            cx={96 + offset * rx * 0.65}
            cy={100}
            rx={rx * 0.24}
            ry={ry * 0.55}
            fill="none"
            stroke={svgHighlight}
            strokeWidth="0.7"
            opacity="0.32"
          />
        ))}

        {/* Pectoral fin */}
        <ellipse
          cx={96 - rx * 0.18}
          cy={100 + ry * 0.22}
          rx={8 + spreadFactor * 3}
          ry={5}
          fill={svgHighlight}
          opacity="0.55"
          transform={`rotate(${isFlaring ? -10 : 20}, ${96 - rx * 0.18}, ${100 + ry * 0.22})`}
        />

        {/* Eye */}
        <circle
          cx={96 - rx * 0.64}
          cy={100 - ry * 0.15}
          r={isGiant ? 5 : 3.6}
          fill="#0f172a"
          stroke="#f8fafc"
          strokeWidth="1.1"
        />
        <circle
          cx={96 - rx * 0.64 - 0.8}
          cy={100 - ry * 0.15 - 0.8}
          r={isGiant ? 1.8 : 1.2}
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Velvet / White Spot visual indicator (Modul 3) */}
        {isVelvet && (
          <g>
            <circle cx={96} cy={95} r={2.2} fill="#fef08a" opacity="0.92" />
            <circle cx={106} cy={103} r={1.8} fill="#ffffff" opacity="0.9" />
            <circle cx={88} cy={104} r={2} fill="#fde047" opacity="0.88" />
            <circle cx={114} cy={96} r={1.6} fill="#ffffff" opacity="0.85" />
            <circle cx={82} cy={97} r={1.5} fill="#fef08a" opacity="0.85" />
            <circle cx={101} cy={107} r={1.5} fill="#ffffff" opacity="0.8" />
          </g>
        )}

        {/* Flaring energy lines */}
        {isFlaring && (
          <g stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
            <line x1={96 - rx - 10} y1={85} x2={96 - rx - 18} y2={79} />
            <line x1={96 - rx - 12} y1={100} x2={96 - rx - 21} y2={100} />
            <line x1={96 - rx - 10} y1={115} x2={96 - rx - 18} y2={121} />
          </g>
        )}
      </g>
    </svg>
  );
}
