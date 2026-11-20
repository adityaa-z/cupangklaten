# PRD — Soliter Virtual Cupang Klaten

> **Target Domain:** `cupangklaten.my.id`  
> **Rute Tahap Awal:** `cupangklaten.my.id/game` (bangun & uji fitur game terlebih dahulu)  
> **Rute Target Utama:** `cupangklaten.my.id/` (halaman utama setelah fitur game stabil)  
> **Peran Website:** Media promosi, etalase pengenalan, & edukasi Cupang Klaten (**TIDAK ada transaksi belanja / checkout langsung di web**)  
> **Tema Visual:** Dark Mode (`#0b1120` / `#0f172a`), Mobile-First & Responsif

---

## Status Pengerjaan Saat Ini

| Langkah | Modul | Status | Lokasi File |
|---|---|---|---|
| **Langkah 1** | Modul 5 (State Data) + Modul 2 (Check-in, Tukar Poin, Upgrade Lv 1–4, 9 Jenis Ikan) | ✅ Selesai | `src/app/game/*` |
| **Langkah 2** | Modul 3 (pH, Ganti Air Parsial/Kuras Total, Ketapang, Garam, 3 Penyakit & Obat) | ✅ Selesai | `src/app/game/SoliterGame.js`, `AquariumSVG.js`, `FishSVG.js` |
| **Langkah 3** | Modul 4 (5 Pakan, Visual Dinamis Body/Sirip/Warna, & Fitur Flaring Cermin Virtual) | ✅ Selesai | `src/app/game/SoliterGame.js`, `FishSVG.js`, `gameConfig.js` |
| **Langkah 4** | Modul 1 (Layout Halaman Utama `/` — Strip Katalog 1 Baris Horizontal + Arena Game) | ✅ Selesai | `src/app/page.js`, `src/components/ProductStrip.js`, `src/app/layout.js` |
| **Deploy** | Push ke GitHub & Rebuild di VPS | ✅ Push GitHub (tinggal pull & build di VPS) | GitHub / VPS |

---

## [MODUL 1] Arsitektur Halaman Utama & Strip Etalase Produk (1 Baris Horizontal)

### 1.1 Arah Bisnis Website (Non-Transaksi Web)
- Website tidak memiliki keranjang belanja, sistem deposit, atau pembayaran.
- Seluruh halaman difokuskan sebagai media promosi, etalase pengenalan koleksi, dan penjelasan edukatif seputar Cupang Klaten.

### 1.2 Struktur Tata Letak Halaman Utama (`cupangklaten.my.id/`)
Halaman utama dibagi menjadi 2 zona vertikal utama pada tampilan Dark Mode (`#0b1120` / `#0f172a`):
- **ZONA ATAS — Strip Produk 1 Baris Horizontal Scroll:**
  - Daftar koleksi ikan/perlengkapan Cupang Klaten dalam 1 baris sejajar (`display: flex; flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x mandatory;`).
  - Tinggi strip ringkas (kompak) agar arena game di bawahnya langsung terlihat di layar ponsel tanpa scroll jauh.
  - Setiap kartu menampilkan foto ikan/item, nama jenis, dan label singkat.
  - Klik kartu membuka modal penjelasan detail jenis cupang + tombol kontak WA resmi (bukan beli/checkout).
- **ZONA BAWAH — Arena Game Soliter Virtual:**
  - Langsung ditempatkan tepat di bawah strip produk horizontal.
  - Berisi wadah soliter visual, HUD status ikan & air, indikator poin check-in, serta tombol navigasi perawatan di bawah layar.

---

## [MODUL 2] Sistem Poin Check-In, Upgrade Akuarium, & 9+ Koleksi Jenis Ikan

### 2.1 Poin Check-In Harian & Streak
- Pemain mendapat poin gratis setiap kali membuka web dan klaim Check-In harian.
- Bonus akumulasi pada streak berturut-turut: Hari ke-3 (+15), ke-7 (+30), ke-14 (+60), ke-30 (+120).
- Poin dipakai untuk: membuka jenis ikan baru, upgrade akuarium, serta menukar stok pakan khusus, ekstrak ketapang, garam ikan, dan obat.

### 2.2 Upgrade Akuarium / Soliter (Berbasis Poin)
| Level | Nama Wadah | Efek / Bonus |
|---|---|---|
| Level 1 | Soliter / Toples Plastik Standar | Wadah awal pemula |
| Level 2 | Soliter Kaca Bening + Sekat Lepas-Pasang | Meningkatkan efek flaring; syarat Double Tail |
| Level 3 | Akuarium Kaca Rimless + Lampu LED Viewing Kontes | Warna lebih tajam & mempercepat kenaikan Mood; syarat Giant |
| Level 4 | Akuarium Kolektor + Aquascape Mini / Tanaman Air Alami | Menstabilkan kualitas air & pH; habitat terbaik Giant |

### 2.3 Katalog & Ganti Jenis Ikan (Unlock dengan Poin)
1. **Plakat** — sirip pendek standar (gratis sebagai ikan awal)
2. **Veiltail** — sirip panjang menjuntai lembut ke bawah
3. **HMPK / Halfmoon Plakat** — sirip pendek dengan bukaan ekor simetris 180°
4. **Serit / Crowntail** — ujung sirip runcing menyerupai sisir/mahkota
5. **Halfmoon** — ekor lebar mengembang simetris 180°
6. **Wild Betta** — cupang alam (Imbellis/Mahachaiensis); menyukai pH sedikit asam `6.0–6.6` & air ketapang
7. **Plakat Double Tail** — sirip pendek dengan belahan ekor ganda (min. Lv 2)
8. **Halfmoon Double Tail** — ekor lebar 180° terbelah dua simetris (min. Lv 2)
9. **Giant** — ukuran tubuh jumbo (min. Lv 3/4)

---

## [MODUL 3] Simulasi Perawatan Realistis (pH Air, Ganti Air, Garam, & Obat)

### 3.1 Indikator Status & Parameter Lingkungan
- **Hunger** (Rasa Lapar: 0–100)
- **Water Clarity** (Kejernihan Air: 0–100)
- **Water pH** (Skala 5.0–8.5; ideal umum `6.5–7.0`; Wild Betta `6.0–6.6`)
- **Health** (Kesehatan Ikan: 0–100; *soft decay*, ikan tidak mati permanen)
- **Mood** (Semangat / Flaring: 0–100)

### 3.2 Aksi Perawatan Air & Suplemen
- **Ganti Air Parsial (30%–50%)**: Membersihkan air secara bertahap tanpa menggeser pH ekstrem sehingga ikan tidak stres.
- **Kuras Total (100%)**: Kejernihan air langsung 100%, namun menurunkan Mood sementara dan berisiko Velvet jika tidak dibarengi Ketapang & Garam Ikan.
- **Ekstrak / Daun Ketapang**: Menurunkan pH tinggi, memberi warna air kecokelatan alami (tanin), meredakan stres, sangat disukai Wild Betta.
- **Garam Ikan (Aquarium Salt)**: Mencegah jamur/parasit, membantu osmoregulasi setelah ganti air, mempercepat pemulihan luka sirip.

### 3.3 Sistem Penyakit Ikan & Penanganan Obat (Soft Decay)
1. **Fin Rot (Busuk Sirip)**
   - Penyebab: Air kotor / bakteri. Visual: ujung sirip kusam/terkikis.
   - Penanganan: Ganti air + **Obat Kuning (Acriflavine)** + Garam Ikan.
2. **Velvet / White Spot (Bintik Putih/Emas)**
   - Penyebab: Perubahan pH drastis / kuras total tanpa ketapang & garam. Visual: bintik halus putih/emas & gerakan lesu.
   - Penanganan: **Obat Biru (Methylene Blue)** + Garam Ikan + Ekstrak Ketapang.
3. **Kembung (Overfeeding / Gangguan Pencernaan)**
   - Penyebab: Memberi makan berulang kali saat Hunger sudah penuh. Visual: perut membuncit & berenang miring/lambat.
   - Penanganan: Puasakan pakan biasa + beri **Kutu Air (Daphnia)** untuk melancarkan pencernaan.

---

## [MODUL 4] Sistem Pakan Beragam & Pengaruh Visual Warna / Bentuk Ikan

### 4.1 5 Jenis Pakan & Efek Nutrisi
1. **Pelet Harian (Standar)**: Mengisi rasa lapar secara seimbang.
2. **Cacing Sutra (Tubifex) / Bloodworm**: Tinggi protein → mempercepat pertumbuhan massa tubuh & ketebalan sirip (efektif untuk Giant, Plakat, HMPK).
3. **Kutu Air (Daphnia / Moina)**: Serat alami → kelincahan, lancarkan pencernaan, menyembuhkan kembung.
4. **Jentik Nyamuk / Artemia**: Insting berburu → tingkatkan Flaring & bukaan ekor (Halfmoon, Crowntail, Double Tail).
5. **Pakan Pencerah Warna (Udang Rebon / Astaxanthin)**: Kaya pigmen alami → mempertajam saturasi & kecerahan warna ikan.

### 4.2 Atribut Visual Dinamis & Flaring
- `bodySize` (0–100): Proporsi tubuh ikan (kurus → ideal → jumbo).
- `finSpread` (0–100): Lebar bukaan ekor & sirip (terutama saat tombol **Ajak Flaring / Cermin Virtual** ditekan).
- `colorVibrancy` (0–100): Saturasi & kecerahan warna ikan di layar.

---

## [MODUL 5] Skema Data JSON (`localStorage` key: `cupangklaten_game_v2`)

```json
{
  "points": 100,
  "checkin": { "lastCheckinDate": "2026-11-20", "streakDays": 3 },
  "aquarium": {
    "level": 1,
    "waterClarity": 85,
    "waterPH": 6.8,
    "taninLevel": 20,
    "saltLevel": 10,
    "fullChangeUnconditioned": false,
    "lastUpdatedAt": 1795171200000
  },
  "activeFishId": "plakat",
  "unlockedFishes": ["plakat"],
  "fishes": {
    "plakat": {
      "species": "Plakat",
      "hunger": 80,
      "health": 95,
      "mood": 85,
      "disease": null,
      "bodySize": 60,
      "finSpread": 65,
      "colorVibrancy": 70,
      "overfeedCount": 0,
      "lastFedAt": 1795171200000
    }
  },
  "inventory": {
    "pellet": 999, "tubifex": 5, "daphnia": 5, "artemia": 5, "colorFood": 5,
    "ketapang": 5, "aquariumSalt": 5, "medicineBlue": 2, "medicineYellow": 2
  }
}
```

---

## Checklist Sisa Pekerjaan
- [x] Langkah 1: State `localStorage` + Check-in + Tukar Poin + Upgrade Akuarium Lv 1–4 + 9 Jenis Ikan (`/game`)
- [x] Langkah 2: Simulasi pH, Ganti Air Parsial/Kuras Total, Ketapang, Garam, & 3 Penyakit + Obat (`/game`)
- [x] Langkah 3: 5 Jenis Pakan, Visual Dinamis (`bodySize`, `finSpread`, `colorVibrancy`), & Fitur Flaring Cermin Virtual (`/game`)
- [x] Langkah 4: Terapkan Modul 1 di halaman utama `/` (Strip Katalog 1 Baris Horizontal + Arena Game Soliter Virtual)
- [x] Bersihkan sisa `CartDrawer`/`CartProvider` & metadata "Jual" di `src/app/layout.js`
- [x] Push ke GitHub (`main`)
- [ ] Deploy ke VPS (`git pull origin main`, `npm run build`, `pm2 restart cupang-klaten`)
