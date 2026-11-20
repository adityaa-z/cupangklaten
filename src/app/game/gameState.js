// gameState.js — State management for Soliter Virtual Cupang Klaten
// localStorage key: cupangklaten_game_v2

const STORAGE_KEY = 'cupangklaten_game_v2';

export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDefaultFish(species = 'Plakat') {
  return {
    species,
    hunger: 80,
    health: 95,
    mood: 85,
    disease: null, // null | 'finRot' | 'velvet' | 'bloated'
    bodySize: 60,
    finSpread: 65,
    colorVibrancy: 70,
    overfeedCount: 0,
    lastFedAt: Date.now(),
  };
}

export const DEFAULT_STATE = {
  points: 100,
  checkin: {
    lastCheckinDate: null,
    streakDays: 0,
  },
  aquarium: {
    level: 1,
    waterClarity: 85,
    waterPH: 6.8,
    taninLevel: 20,
    saltLevel: 10,
    fullChangeUnconditioned: false,
    lastUpdatedAt: Date.now(),
  },
  activeFishId: 'plakat',
  unlockedFishes: ['plakat'],
  fishes: {
    plakat: createDefaultFish('Plakat'),
  },
  inventory: {
    pellet: 999,
    tubifex: 5,
    daphnia: 5,
    artemia: 5,
    colorFood: 5,
    ketapang: 5,
    aquariumSalt: 5,
    medicineBlue: 2,
    medicineYellow: 2,
  },
};

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function deepMerge(defaults, target) {
  if (typeof defaults !== 'object' || defaults === null) return target ?? defaults;
  const result = { ...defaults };
  for (const key of Object.keys(defaults)) {
    if (target && key in target) {
      if (
        typeof defaults[key] === 'object' &&
        defaults[key] !== null &&
        !Array.isArray(defaults[key])
      ) {
        result[key] = deepMerge(defaults[key], target[key]);
      } else {
        result[key] = target[key];
      }
    }
  }
  if (target && typeof target === 'object') {
    for (const key of Object.keys(target)) {
      if (!(key in result)) {
        result[key] = target[key];
      }
    }
  }
  return result;
}

/**
 * Migrate legacy disease names (e.g. 'ich' -> 'velvet') and apply gentle offline decay
 * capped at 6 hours so fish never dies permanently (soft decay).
 */
function sanitizeAndApplyOfflineDecay(state) {
  const now = Date.now();
  const lastUpdated = state.aquarium?.lastUpdatedAt || now;
  const elapsedMinutes = Math.min(Math.max(0, (now - lastUpdated) / 60000), 360); // cap 6h

  const activeId = state.activeFishId || 'plakat';
  const fish = { ...(state.fishes?.[activeId] || createDefaultFish('Plakat')) };

  // Migrate old 'ich' key if present
  if (fish.disease === 'ich') fish.disease = 'velvet';

  // Gentle offline decay (only if away >= 5 mins)
  if (elapsedMinutes >= 5) {
    const waterDecayFactor = state.aquarium.level >= 4 ? 0.6 : state.aquarium.level === 3 ? 0.8 : 1.0;
    const hungerDrop = elapsedMinutes * 0.12; // ~43 over 6h
    const waterDrop = elapsedMinutes * 0.08 * waterDecayFactor; // ~28 over 6h

    fish.hunger = clamp(fish.hunger - hungerDrop, 15, 100);
    if (fish.hunger < 30) {
      fish.mood = clamp(fish.mood - 10, 20, 100);
    }
    // Overfeed counter naturally resets after fasting
    if (elapsedMinutes >= 30) {
      fish.overfeedCount = 0;
    }

    state.aquarium = {
      ...state.aquarium,
      waterClarity: clamp(state.aquarium.waterClarity - waterDrop, 20, 100),
      lastUpdatedAt: now,
    };
  } else {
    state.aquarium = { ...state.aquarium, lastUpdatedAt: now };
  }

  return {
    ...state,
    fishes: {
      ...state.fishes,
      [activeId]: fish,
    },
  };
}

export function loadState() {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    const merged = deepMerge(DEFAULT_STATE, parsed);
    return sanitizeAndApplyOfflineDecay(merged);
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private mode — silent fail
  }
}
