-- ============================================
-- Migration: Tambah kolom status & user_id ke tabel reviews
-- Jalankan di MySQL VPS: mysql -u root -p cupang_klaten < migrate_review_status.sql
-- ============================================

USE cupang_klaten;

-- Tambah kolom status (pending = belum diapprove admin, published = tampil publik)
ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS status ENUM('pending', 'published') DEFAULT 'published' AFTER avatar_char;

-- Tambah kolom user_id untuk track 1 user = 1 ulasan
ALTER TABLE reviews 
    ADD COLUMN IF NOT EXISTS user_id INT DEFAULT NULL AFTER status;

-- Set semua ulasan lama menjadi 'published'
UPDATE reviews SET status = 'published' WHERE status IS NULL;

-- Foreign key opsional (bisa diaktifkan kalau mau strict)
-- ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
