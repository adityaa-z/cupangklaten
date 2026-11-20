// fishConfig.js — Katalog modular 9 jenis ikan & konfigurasi fase mutasi 1–5 bulan
// Foto asli per fase umur (1–5 bulan) dapat langsung dimasukkan ke properti `stagePhotos`

export const MUTATION_STAGES = [
  { month: 1, shortLabel: '1 Bln', title: 'Fase Burayak / Besgel', note: 'Warna dasar mulai terlihat, pola mutasi belum keluar.' },
  { month: 2, shortLabel: '2 Bln', title: 'Mulai Pecah Warna', note: 'Pigmen awal mulai muncul di pangkal sirip dan badan.' },
  { month: 3, shortLabel: '3 Bln', title: 'Mutasi Aktif', note: 'Perpecahan warna menyebar, form sirip mulai tegas.' },
  { month: 4, shortLabel: '4 Bln', title: 'Pematangan Warna', note: 'Saturasi warna menebal dan bukaan ekor semakin simetris.' },
  { month: 5, shortLabel: '5 Bln', title: 'Full Mutasi / Siap Kontes', note: 'Warna solid optimal, proporsi badan dan mental flaring maksimal.' },
];

export function getMutationStage(month) {
  return MUTATION_STAGES.find((s) => s.month === month) || MUTATION_STAGES[0];
}

/**
 * @typedef {Object} FishConfig
 * @property {string} id
 * @property {string} species
 * @property {string} shortDesc
 * @property {string} description
 * @property {number} unlockCost
 * @property {number} minAquariumLevel
 * @property {string} svgColor
 * @property {string} svgAccent
 * @property {string} svgHighlight
 * @property {'short'|'wide'|'hmpk'|'crown'|'veil'|'double_short'|'double_wide'|'wild'} tailType
 * @property {'normal'|'giant'} bodyShape
 * @property {[number,number]} preferPH
 * @property {boolean} [lovesTanin]
 * @property {Record<number, string>} [stagePhotos] — path foto asli di /public/game-fish/ per umur 1..5 bulan
 */

/** @type {FishConfig[]} */
export const FISH_CATALOG = [
  {
    id: 'plakat',
    species: 'Plakat',
    shortDesc: 'Sirip pendek kokoh',
    description: 'Cupang sirip pendek klasik yang lincah dan tangguh. Ideal sebagai ikan awal untuk memahami ritme perawatan dan mutasi warna.',
    unlockCost: 0,
    minAquariumLevel: 1,
    svgColor: '#d9483b',
    svgAccent: '#8c231c',
    svgHighlight: '#f5b7b1',
    tailType: 'short',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'veiltail',
    species: 'Veiltail',
    shortDesc: 'Sirip panjang menjuntai',
    description: 'Sirip panjang menjuntai lembut ke bawah dengan gerak berenang elegan.',
    unlockCost: 120,
    minAquariumLevel: 1,
    svgColor: '#d99126',
    svgAccent: '#8c5812',
    svgHighlight: '#f6d899',
    tailType: 'veil',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'hmpk',
    species: 'HMPK',
    shortDesc: 'Plakat bukaan 180°',
    description: 'Halfmoon Plakat — sirip pendek proporsional dengan bukaan ekor simetris 180 derajat.',
    unlockCost: 180,
    minAquariumLevel: 1,
    svgColor: '#7c5cbf',
    svgAccent: '#4b337d',
    svgHighlight: '#cfc2ee',
    tailType: 'hmpk',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'crowntail',
    species: 'Serit / Crowntail',
    shortDesc: 'Ujung sirip mahkota',
    description: 'Ujung sirip meruncing tajam menyerupai sisir atau mahkota. Tampil dominan saat sesi flaring.',
    unlockCost: 220,
    minAquariumLevel: 1,
    svgColor: '#259e6b',
    svgAccent: '#13593c',
    svgHighlight: '#9ce0c1',
    tailType: 'crown',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'halfmoon',
    species: 'Halfmoon',
    shortDesc: 'Ekor lebar 180°',
    description: 'Ekor lebar mengembang simetris 180° menyerupai bulan setengah saat flaring penuh.',
    unlockCost: 260,
    minAquariumLevel: 1,
    svgColor: '#2f7ed8',
    svgAccent: '#194a85',
    svgHighlight: '#a8cdf5',
    tailType: 'wide',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'wild_betta',
    species: 'Wild Betta',
    shortDesc: 'Cupang alam · pH 6.0–6.6',
    description: 'Cupang alam (Imbellis / Mahachaiensis). Menyukai pH sedikit asam (6.0–6.6) dan air kaya tanin ketapang.',
    unlockCost: 300,
    minAquariumLevel: 1,
    svgColor: '#1e8a7d',
    svgAccent: '#104a44',
    svgHighlight: '#7ed9cd',
    tailType: 'wild',
    bodyShape: 'normal',
    preferPH: [6.0, 6.6],
    lovesTanin: true,
    stagePhotos: {},
  },
  {
    id: 'plakat_dt',
    species: 'Plakat Double Tail',
    shortDesc: 'Ekor pendek belah dua',
    description: 'Plakat sirip pendek dengan belahan ekor ganda simetris.',
    unlockCost: 360,
    minAquariumLevel: 2,
    svgColor: '#c94b7d',
    svgAccent: '#7a2548',
    svgHighlight: '#f2b1cb',
    tailType: 'double_short',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'halfmoon_dt',
    species: 'Halfmoon Double Tail',
    shortDesc: 'Ekor 180° belah dua',
    description: 'Ekor lebar 180° terbelah dua simetris sempurna. Koleksi incaran penghobi kontes.',
    unlockCost: 450,
    minAquariumLevel: 2,
    svgColor: '#1b9bb3',
    svgAccent: '#0f5666',
    svgHighlight: '#9ce2ef',
    tailType: 'double_wide',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
  {
    id: 'giant',
    species: 'Giant',
    shortDesc: 'Ukuran tubuh jumbo',
    description: 'Cupang bertubuh jumbo (2–3× ukuran standar). Membutuhkan akuarium minimal Level 3 / Aquascape Level 4.',
    unlockCost: 700,
    minAquariumLevel: 3,
    svgColor: '#d96326',
    svgAccent: '#823611',
    svgHighlight: '#f7c1a3',
    tailType: 'short',
    bodyShape: 'giant',
    preferPH: [6.5, 7.0],
    stagePhotos: {},
  },
];

export function getFishById(id) {
  return FISH_CATALOG.find((f) => f.id === id) || FISH_CATALOG[0];
}
