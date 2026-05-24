# Panduan Pembersihan Kode Pop-Up Promosi (PROMO_CLEANUP_GUIDE)

Dokumen ini mencatat seluruh bagian kode yang perlu Anda hapus secara manual apabila promosi telah selesai dan Anda ingin menjaga agar kode website tetap bersih (*clean code*).

---

## 1. Apakah Pop-Up Akan Hilang Otomatis?

**YA, pop-up akan otomatis hilang** tanpa Anda harus menghapus kode secara manual. 

Logika pemeriksaan tanggal otomatis pada `src/app/page.js` akan memastikan hal ini:
```javascript
const isPromoDateActive = (
  (now >= new Date('2025-05-24T00:00:00') && now <= new Date('2025-05-30T23:59:59')) ||
  (now >= new Date('2026-05-24T00:00:00') && now <= new Date('2026-05-30T23:59:59'))
);
```
Ketika waktu sistem browser pengunjung melewati **30 Mei 2025 / 2026 jam 23:59:59**, kondisi di atas otomatis bernilai `false`. Pop-up tidak akan diproses, tidak akan masuk ke state, dan **tidak akan pernah muncul kembali**.

---

## 2. Cara Menghapus Kode Secara Manual (Untuk Clean Code)

Jika Anda ingin membersihkan kode sisa promosi sepenuhnya dari file website, Anda hanya perlu menghapus kode pada 2 file berikut:

### Bagian A: Berkas [src/app/page.js](file:///d:/scratch/cupang-klaten/src/app/page.js)

Buka berkas `src/app/page.js` dan hapus baris-baris berikut:

1. **Hapus Deklarasi State (Sekitar baris 28-29):**
   ```javascript
   // Promo Popup States
   const [showPromoPopup, setShowPromoPopup] = useState(false);
   ```

2. **Hapus Logika Pemeriksaan Tanggal (Sekitar baris 43-67):**
   ```javascript
   useEffect(() => {
     // Check Date Eligibility (May 24/25 - May 30) for 2025 or 2026 (active testing year)
     const now = new Date();
     const isPromoDateActive = (
       (now >= new Date('2025-05-24T00:00:00') && now <= new Date('2025-05-30T23:59:59')) ||
       (now >= new Date('2026-05-24T00:00:00') && now <= new Date('2026-05-30T23:59:59'))
     );

     if (isPromoDateActive) {
       const lastSeen = localStorage.getItem('promo_popup_seen');
       const todayStr = now.toDateString();
       if (lastSeen !== todayStr) {
         const timer = setTimeout(() => {
           setShowPromoPopup(true);
         }, 1200);
         return () => clearTimeout(timer);
       }
     }
   }, []);

   const handleClosePromo = () => {
     setShowPromoPopup(false);
     const todayStr = new Date().toDateString();
     localStorage.setItem('promo_popup_seen', todayStr);
   };
   ```

3. **Hapus Struktur Tampilan JSX Pop-Up (Sekitar baris 573-597, di atas tag `<Footer />`):**
   ```javascript
   {/* Promo Popup */}
   {showPromoPopup && (
       <div className="promo-overlay" onClick={handleClosePromo}>
           <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
               <button className="promo-close-btn" onClick={handleClosePromo} aria-label="Close promotion">&times;</button>
               <span className="promo-tag">Promo Terbatas!</span>
               <h3 className="promo-title">PROMO SPESIAL!</h3>
               <div className="promo-price-box">
                   <span className="promo-old-price">Rp 25.000/ekor</span>
                   <span className="promo-new-price">Rp 20.000 Dapat 2 Ekor Cupang</span>
               </div>
               <p className="promo-terms">Syarat: <strong>Kunjungi toko kami langsung</strong></p>
               <a 
                   href="https://wa.me/6285700846152?text=Halo%20Admin,%20saya%20tertarik%20dengan%20Promo%20Spesial%202%20Ekor%20Cupang%20Rp%2020.000"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="promo-cta-btn"
                   onClick={handleClosePromo}
               >
                   <i className="fas fa-store"></i> Kunjungi Toko Sekarang
               </a>
               <span className="promo-period">Periode: 24 - 30 Mei 2025</span>
           </div>
       </div>
   )}
   ```

---

### Bagian B: Berkas [src/app/globals.css](file:///d:/scratch/cupang-klaten/src/app/globals.css)

Buka berkas `src/app/globals.css`, scroll ke bagian paling bawah, dan hapus seluruh blok style promosi di bawah penanda komentar ini:

```css
/* ==========================================================================
   PROMO POPUP MODULE (Z-IFC & PROMOTIONS)
   ========================================================================== */
.promo-overlay {
    ...
}

... (hapus terus ke bawah hingga baris paling akhir file globals.css)
```
