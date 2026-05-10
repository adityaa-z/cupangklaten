# Panduan Update Website Cupang Klaten di VPS (cupangklaten.my.id)

Jika ada perubahan fitur/kode baru di komputer lokal dan ingin menerapkannya (deploy) ke VPS, ikuti langkah-langkah baku di bawah ini secara berurutan agar tidak terjadi kesalahan/error:

## Tahap 1: Push dari Lokal ke GitHub
Buka terminal di komputer lokalmu (VS Code / CMD di folder project), lalu jalankan:
```bash
git add .
git commit -m "Update fitur baru"
git push origin main
```

## Tahap 2: Tarik Kode di VPS
Login ke VPS melalui SSH (contoh: `ssh root@IP_VPS`), lalu masuk ke direktori website:
```bash
cd /var/www/cupangklaten
git pull origin main
```
*Catatan: Pastikan namamu berada di folder yang benar. Jika ragu, gunakan perintah `ls /var/www/` untuk melihat daftar folder.*

## Tahap 3: Install Package Baru (Wajib)
Jika ada modul atau library baru yang terpasang di lokal (seperti `next-auth`), kamu harus menginstallnya di VPS:
```bash
npm install
```

## Tahap 4: Update Konfigurasi (.env)
Jika ada tambahan variabel lingkungan baru (misal: Token Google, Secret Key), tambahkan ke `.env` di VPS:
```bash
nano .env
```
*(Lalu Copy isinya dari komputer lokalmu. Setelah itu tekan `Ctrl+X`, ketik `Y`, lalu `Enter` untuk menyimpan file).*

## Tahap 5: Update Database (Bila Diperlukan)
Jika ada penambahan struktur tabel baru (seperti tabel pelelangan), masuk ke mode MySQL di VPS:
```bash
mysql -u root -p
```
Lalu masuk ke database:
```sql
USE cupang_klaten;
```
*(Jalankan perintah SQL seperti `ALTER TABLE` atau `CREATE TABLE` baru, sesuaikan dengan penambahan dari lokal).*
*(Lalu ketik `exit;`)*

## Tahap 6: Rebuild & Restart Server
Langkah terakhir yang **Paling Penting** untuk mengaplikasikan perubahannya ke live server:
```bash
npm run build
pm2 restart cupang-klaten
```
*(Jika lupa nama aplikasinya di PM2, ketik `pm2 list` untuk melihat daftarnya terlebih dahulu).*

---
**Selesai!** Website sudah berhasil diupdate secara sempurna.
