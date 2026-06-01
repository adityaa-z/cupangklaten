-- ============================================
-- Cupang Klaten - MySQL Schema
-- Jalankan script ini di MySQL VPS
-- ============================================

CREATE DATABASE IF NOT EXISTS cupang_klaten
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE cupang_klaten;

-- ============================================
-- Tabel: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    variant VARCHAR(200) DEFAULT NULL,
    gender VARCHAR(20) DEFAULT 'Jantan',
    age VARCHAR(50) DEFAULT NULL,
    size VARCHAR(10) DEFAULT 'M',
    stock INT DEFAULT 1,
    price INT DEFAULT 0,
    shopee TEXT DEFAULT NULL,
    img TEXT DEFAULT NULL,
    img2 TEXT DEFAULT NULL,
    img3 TEXT DEFAULT NULL,
    img4 TEXT DEFAULT NULL,
    is_video TINYINT(1) DEFAULT 0,
    is_available TINYINT(1) DEFAULT 1,
    is_pinned TINYINT(1) DEFAULT 0,
    is_archived TINYINT(1) DEFAULT 0,
    archived_at DATETIME DEFAULT NULL,
    sold_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: reviews
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    rating INT DEFAULT 5,
    content TEXT DEFAULT NULL,
    img TEXT DEFAULT NULL,
    avatar_char VARCHAR(5) DEFAULT NULL,
    user_id INT DEFAULT NULL,
    status ENUM('pending', 'approved') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: faqs
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    google_id VARCHAR(200) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    role ENUM('member', 'admin') DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: auctions
-- ============================================
CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    image_url TEXT DEFAULT NULL,
    image2_url TEXT DEFAULT NULL,
    image3_url TEXT DEFAULT NULL,
    image4_url TEXT DEFAULT NULL,
    is_video TINYINT(1) DEFAULT 0,
    start_price DECIMAL(15, 2) NOT NULL,
    min_bid_increment DECIMAL(15, 2) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('draft', 'active', 'ended') DEFAULT 'draft',
    winner_id INT DEFAULT NULL,
    winning_bid DECIMAL(15, 2) DEFAULT NULL,
    payment_status ENUM('waiting_confirmation', 'confirmed', 'paid') DEFAULT 'waiting_confirmation',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: bids
-- ============================================
CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: categories (Z-IFC)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    jenis ENUM('masuk', 'keluar') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed categories
INSERT INTO categories (id, nama_kategori, jenis) VALUES
(1, 'Jual Ikan Eceran', 'masuk'),
(2, 'Pembelian Stok Grosir', 'keluar'),
(3, 'Pakan & Aksesoris (Masuk)', 'masuk'),
(4, 'Pakan & Aksesoris (Keluar)', 'keluar'),
(5, 'Operasional', 'keluar')
ON DUPLICATE KEY UPDATE nama_kategori=VALUES(nama_kategori), jenis=VALUES(jenis);

-- ============================================
-- Tabel: fish_stocks (Z-IFC)
-- ============================================
CREATE TABLE IF NOT EXISTS fish_stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_ikan VARCHAR(50) NOT NULL UNIQUE,
    nama_tipe VARCHAR(200) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    harga_beli_per_ekor DECIMAL(15, 2) NOT NULL,
    stok_sisa INT DEFAULT 0,
    lokasi ENUM('Pabrik_Pembesaran', 'Gudang', 'Showroom') DEFAULT 'Pabrik_Pembesaran',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: transactions (Z-IFC)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tanggal DATE NOT NULL,
    category_id INT NOT NULL,
    fish_stock_id INT DEFAULT NULL,
    nominal DECIMAL(15, 2) NOT NULL,
    hpp_total DECIMAL(15, 2) DEFAULT 0,
    keterangan TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (fish_stock_id) REFERENCES fish_stocks(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabel: articles (Z-IFC Blog)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    thumbnail TEXT DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    meta_title VARCHAR(255) DEFAULT NULL,
    meta_description TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Buat user database (opsional, ganti password)
-- ============================================
-- CREATE USER 'cupang_user'@'localhost' IDENTIFIED BY 'GANTI_PASSWORD_DISINI';
-- GRANT ALL PRIVILEGES ON cupang_klaten.* TO 'cupang_user'@'localhost';
-- FLUSH PRIVILEGES;

