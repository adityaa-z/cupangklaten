require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'cupang_klaten',
        timezone: '+07:00'
    });

    console.log('Connected to DB. Running migrations...');

    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS system_settings (
                id VARCHAR(36) PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Table system_settings created.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS promo_claims (
                id VARCHAR(36) PRIMARY KEY,
                claim_code VARCHAR(50) UNIQUE NOT NULL,
                maps_name VARCHAR(100) NOT NULL,
                whatsapp_number VARCHAR(50) NOT NULL,
                image_path VARCHAR(255) NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Table promo_claims created.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS general_promos (
                id VARCHAR(36) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                target_category VARCHAR(50),
                price_or_discount VARCHAR(100),
                start_date DATETIME NOT NULL,
                end_date DATETIME NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('Table general_promos created.');

        // Insert default settings
        await db.query(`
            INSERT IGNORE INTO system_settings (id, setting_key, setting_value)
            VALUES 
                (UUID(), 'PROMO_ACTIVE', 'true'),
                (UUID(), 'PROMO_DAILY_LIMIT', '10')
        `);
        console.log('Default settings inserted.');
        
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        await db.end();
    }
}

migrate();
