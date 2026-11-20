// fishConfig.js — Katalog modular 9 jenis ikan Cupang Klaten

/**
 * @typedef {Object} FishConfig
 * @property {string} id
 * @property {string} species
 * @property {string} shortDesc
 * @property {string} description
 * @property {number} unlockCost       — poin check-in yang dibutuhkan
 * @property {number} minAquariumLevel — level akuarium minimum
 * @property {string} svgColor         — warna utama (hex)
 * @property {string} svgAccent        — warna aksen (hex)
 * @property {string} svgHighlight     — warna kilau/highlight (hex)
 * @property {'short'|'wide'|'hmpk'|'crown'|'veil'|'double_short'|'double_wide'|'wild'} tailType
 * @property {'normal'|'giant'} bodyShape
 * @property {[number,number]} preferPH — rentang pH ideal [min, max]
 * @property {boolean} [lovesTanin]
 */

/** @type {FishConfig[]} */
export const FISH_CATALOG = [
  {
    id: 'plakat',
    species: 'Plakat',
    shortDesc: 'Sirip pendek kokoh',
    description: 'Cupang sirip pendek klasik yang lincah dan tangguh. Pilihan awal terbaik untuk belajar perawatan.',
    unlockCost: 0,
    minAquariumLevel: 1,
    svgColor: '#e74c3c',
    svgAccent: '#991b1b',
    svgHighlight: '#fca5a5',
    tailType: 'short',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'veiltail',
    species: 'Veiltail',
    shortDesc: 'Sirip panjang menjuntai',
    description: 'Sirip panjang menjuntai lembut ke bawah dengan gerakan berenang yang anggun.',
    unlockCost: 120,
    minAquariumLevel: 1,
    svgColor: '#f59e0b',
    svgAccent: '#b45309',
    svgHighlight: '#fde68a',
    tailType: 'veil',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'hmpk',
    species: 'HMPK',
    shortDesc: 'Plakat bukaan 180°',
    description: 'Halfmoon Plakat — sirip pendek kokoh dengan bukaan ekor simetris 180 derajat.',
    unlockCost: 180,
    minAquariumLevel: 1,
    svgColor: '#8b5cf6',
    svgAccent: '#5b21b6',
    svgHighlight: '#ddd6fe',
    tailType: 'hmpk',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'crowntail',
    species: 'Serit / Crowntail',
    shortDesc: 'Sirip runcing mahkota',
    description: 'Ujung sirip meruncing menyerupai sisir atau mahkota. Sangat gagah saat flaring.',
    unlockCost: 220,
    minAquariumLevel: 1,
    svgColor: '#10b981',
    svgAccent: '#065f46',
    svgHighlight: '#a7f3d0',
    tailType: 'crown',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'halfmoon',
    species: 'Halfmoon',
    shortDesc: 'Ekor lebar 180°',
    description: 'Ekor lebar mengembang simetris 180° seperti bulan setengah saat diajak flaring.',
    unlockCost: 260,
    minAquariumLevel: 1,
    svgColor: '#3b82f6',
    svgAccent: '#1d4ed8',
    svgHighlight: '#bfdbfe',
    tailType: 'wide',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'wild_betta',
    species: 'Wild Betta',
    shortDesc: 'Cupang alam (pH 6.0–6.6)',
    description: 'Cupang alam (Imbellis / Mahachaiensis). Sangat menyukai pH sedikit asam (6.0–6.6) & air ketapang.',
    unlockCost: 300,
    minAquariumLevel: 1,
    svgColor: '#0d9488',
    svgAccent: '#134e4a',
    svgHighlight: '#5eead4',
    tailType: 'wild',
    bodyShape: 'normal',
    preferPH: [6.0, 6.6],
    lovesTanin: true,
  },
  {
    id: 'plakat_dt',
    species: 'Plakat Double Tail',
    shortDesc: 'Ekor pendek belah dua',
    description: 'Plakat sirip pendek dengan belahan ekor ganda simetris yang unik.',
    unlockCost: 360,
    minAquariumLevel: 2,
    svgColor: '#ec4899',
    svgAccent: '#9d174d',
    svgHighlight: '#fbcfe8',
    tailType: 'double_short',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'halfmoon_dt',
    species: 'Halfmoon Double Tail',
    shortDesc: 'Ekor 180° belah dua',
    description: 'Ekor lebar 180° yang terbelah dua simetris sempurna. Favorit kolektor kontes.',
    unlockCost: 450,
    minAquariumLevel: 2,
    svgColor: '#06b6d4',
    svgAccent: '#155e75',
    svgHighlight: '#a5f3fc',
    tailType: 'double_wide',
    bodyShape: 'normal',
    preferPH: [6.5, 7.0],
  },
  {
    id: 'giant',
    species: 'Giant',
    shortDesc: 'Ukuran tubuh jumbo',
    description: 'Cupang bertubuh jumbo (2–3× ukuran standar). Wajib akuarium minimal Lv.3 / Aquascape Lv.4.',
    unlockCost: 700,
    minAquariumLevel: 3,
    svgColor: '#f97316',
    svgAccent: '#9a3412',
    svgHighlight: '#fed7aa',
    tailType: 'short',
    bodyShape: 'giant',
    preferPH: [6.5, 7.0],
  },
];

export function getFishById(id) {
  return FISH_CATALOG.find((f) => f.id === id) || FISH_CATALOG[0];
}
