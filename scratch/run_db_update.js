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
    console.log("Connecting to database with config:");
    console.log("Host:", process.env.MYSQL_HOST || '127.0.0.1');
    console.log("Port:", process.env.MYSQL_PORT || '3306');
    console.log("User:", process.env.MYSQL_USER || 'root');
    console.log("Database:", process.env.MYSQL_DATABASE || 'cupang_klaten');

    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || '127.0.0.1',
        port: parseInt(process.env.MYSQL_PORT || '3306'),
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'cupang_klaten',
    });

    console.log("\nConnection successful. Running migrations...");

    // 1. Alter table reviews to add user_id
    try {
        await connection.query("ALTER TABLE reviews ADD COLUMN user_id INT NULL");
        console.log("✓ Added user_id column.");
    } catch (e) {
        console.log("⚠️ user_id column might already exist:", e.message);
    }

    // 2. Alter table reviews to add status
    try {
        await connection.query("ALTER TABLE reviews ADD COLUMN status ENUM('pending', 'approved') DEFAULT 'approved'");
        console.log("✓ Added status column.");
    } catch (e) {
        console.log("⚠️ status column might already exist:", e.message);
    }

    // 3. Make sure existing reviews have status 'approved' so they remain visible
    try {
        await connection.query("UPDATE reviews SET status = 'approved' WHERE status IS NULL");
        console.log("✓ Updated existing reviews status to approved.");
    } catch (e) {
        console.log("⚠️ Failed to update NULL status reviews:", e.message);
    }

    // 4. Add unique constraint on user_id
    try {
        await connection.query("ALTER TABLE reviews ADD CONSTRAINT uq_reviews_user UNIQUE (user_id)");
        console.log("✓ Added unique constraint uq_reviews_user.");
    } catch (e) {
        console.log("⚠️ uq_reviews_user constraint might already exist:", e.message);
    }

    // 5. Add foreign key constraint
    try {
        await connection.query("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
        console.log("✓ Added foreign key constraint fk_reviews_user.");
    } catch (e) {
        console.log("⚠️ fk_reviews_user constraint might already exist:", e.message);
    }

    await connection.end();
    console.log("\n🎉 Database migrations completed successfully!");
}

run().catch(err => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
});
