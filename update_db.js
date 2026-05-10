const { query } = require('./src/lib/db.js');

async function run() {
    try {
        await query(`
            ALTER TABLE auctions 
            ADD COLUMN image2_url TEXT DEFAULT NULL, 
            ADD COLUMN image3_url TEXT DEFAULT NULL, 
            ADD COLUMN image4_url TEXT DEFAULT NULL, 
            ADD COLUMN is_video TINYINT(1) DEFAULT 0
        `);
        console.log("Success updating auctions table!");
    } catch (err) {
        console.error(err.message);
    }
    process.exit();
}
run();
