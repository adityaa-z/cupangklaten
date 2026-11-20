'use client';

import React from 'react';
import FishSVG from './FishSVG';

/**
 * FishDisplay — Studio fish renderer.
 * Automatically renders the real fish photo for the current ageMonth (1..5)
 * when `fishConfig.stagePhotos[ageMonth]` is provided, with live CSS swim motion,
 * dynamic color vibrancy, flaring posture, and disease indicators.
 * Gracefully falls back to FishSVG until real photos are added.
 */
export default function FishDisplay({
  fishConfig,
  fishState,
  size = 'fluid',
  animate = true,
  isFlaring = false,
  ledBoost = 0,
}) {
  if (!fishConfig) return null;

  const ageMonth = fishState?.ageMonth || 1;
  const stagePhotos = fishConfig.stagePhotos || {};
  // Use exact month photo, or nearest lower available stage photo
  const realPhoto =
    stagePhotos[ageMonth] ||
    stagePhotos[Math.min(ageMonth, 5)] ||
    Object.values(stagePhotos).find(Boolean) ||
    null;

  if (!realPhoto) {
    return (
      <FishSVG
        fishConfig={fishConfig}
        fishState={fishState}
        size={size}
        animate={animate}
        isFlaring={isFlaring}
        ledBoost={ledBoost}
      />
    );
  }

  const {
    bodySize = 60,
    colorVibrancy = 70,
    mood = 80,
    health = 90,
    disease = null,
  } = fishState || {};

  const isGiant = fishConfig.bodyShape === 'giant';
  const stressPenalty = (disease ? 0.35 : 0) + (mood < 40 ? 0.18 : 0) + (health < 50 ? 0.12 : 0);
  const saturate = Math.max(0.35, 0.55 + (colorVibrancy / 100) * 0.85 + ledBoost - stressPenalty);
  const brightness = disease ? 0.82 : 0.92 + ledBoost * 0.4;
  const ageScale = 0.72 + (ageMonth - 1) * 0.07; // 1 bln lebih kecil -> 5 bln proporsi penuh
  const bodyScale = (0.9 + (bodySize / 100) * 0.2) * ageScale * (isGiant ? 1.12 : 1);

  let anim = 'none';
  if (animate) {
    if (isFlaring) anim = 'ckFlareSwim 0.75s ease-in-out infinite';
    else if (disease === 'bloated') anim = 'ckBloatedSwim 3.8s ease-in-out infinite';
    else anim = 'ckFloatSwim 3.2s ease-in-out infinite';
  }

  return (
    <div
      style={{
        position: 'relative',
        width: size === 'fluid' ? '100%' : `${size}px`,
        height: size === 'fluid' ? '100%' : `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={realPhoto}
        alt={`${fishConfig.species} - Bulan ${ageMonth}`}
        style={{
          width: '88%',
          height: '88%',
          objectFit: 'contain',
          transform: `scale(${bodyScale.toFixed(2)})`,
          filter: `saturate(${saturate.toFixed(2)}) brightness(${brightness.toFixed(2)}) drop-shadow(0 10px 18px rgba(0,0,0,0.65))`,
          animation: anim,
          transition: 'filter 0.4s ease, transform 0.4s ease',
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      />
      {disease === 'velvet' && (
        <div
          style={{
            position: 'absolute',
            inset: '18%',
            backgroundImage: 'radial-gradient(rgba(254, 240, 138, 0.65) 1.2px, transparent 1.2px)',
            backgroundSize: '14px 14px',
            pointerEvents: 'none',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
}
