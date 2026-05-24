const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        const env = fs.readFileSync(envPath, 'utf8');
        env.split(/\r?\n/).forEach(line => {
            const index = line.indexOf('=');
            if (index > 0) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                process.env[key] = value;
            }
        });
    } catch (e) {
        console.error("Warning: Failed to load .env file directly", e.message);
    }
}

loadEnv();

async function run() {
    console.log("Connecting to database for Z-IFC migrations...");
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'cupang_klaten',
    });

    console.log("Connected successfully. Running Z-IFC migrations...\n");

    // 1. Create categories table
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nama_kategori VARCHAR(100) NOT NULL,
                jenis ENUM('masuk', 'keluar') NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log("✓ Table 'categories' created or already exists.");
    } catch (e) {
        console.error("❌ Failed to create 'categories' table:", e.message);
    }

    // Seed categories if empty
    try {
        const [rows] = await connection.query("SELECT COUNT(*) as count FROM categories");
        if (rows[0].count === 0) {
            const seeds = [
                ['Jual Ikan Eceran', 'masuk'],
                ['Pembelian Stok Grosir', 'keluar'],
                ['Pakan & Aksesoris (Masuk)', 'masuk'],
                ['Pakan & Aksesoris (Keluar)', 'keluar'],
                ['Operasional', 'keluar']
            ];
            for (const seed of seeds) {
                await connection.query("INSERT INTO categories (nama_kategori, jenis) VALUES (?, ?)", seed);
            }
            console.log("✓ Seeded categories successfully.");
        } else {
            console.log("✓ Categories already seeded.");
        }
    } catch (e) {
        console.error("❌ Failed to seed 'categories' table:", e.message);
    }

    // 2. Create fish_stocks table
    try {
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log("✓ Table 'fish_stocks' created or already exists.");
    } catch (e) {
        console.error("❌ Failed to create 'fish_stocks' table:", e.message);
    }

    // 3. Create transactions table
    try {
        await connection.query(`
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log("✓ Table 'transactions' created or already exists.");
    } catch (e) {
        console.error("❌ Failed to create 'transactions' table:", e.message);
    }

    await connection.end();
    console.log("\n🎉 Z-IFC database migrations completed successfully!");
}

run().catch(err => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
