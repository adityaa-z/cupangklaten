import mysql from 'mysql2/promise';

let pool = null;

export function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST || '127.0.0.1',
            port: parseInt(process.env.MYSQL_PORT || '3306'),
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'cupang_klaten',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // Timezone & charset
            timezone: '+07:00',
            charset: 'utf8mb4',
        });
    }
    return pool;
}

/**
 * Helper: execute a query and return rows
 */
export async function query(sql, params = []) {
    const db = getPool();
    const [rows] = await db.execute(sql, params);
    return rows;
}

/**
 * Helper: execute an insert/update/delete and return result info
 */
export async function execute(sql, params = []) {
    const db = getPool();
    const [result] = await db.execute(sql, params);
    return result;
}
