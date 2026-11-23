import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

let tableEnsured = false;
async function ensureAchievementsTable() {
    if (tableEnsured) return;
    await execute(`
        CREATE TABLE IF NOT EXISTS achievements (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            rank_label VARCHAR(100) NOT NULL,
            event_name VARCHAR(200) DEFAULT NULL,
            event_date VARCHAR(100) DEFAULT NULL,
            fish_img TEXT DEFAULT NULL,
            trophy_img TEXT DEFAULT NULL,
            description TEXT DEFAULT NULL,
            is_pinned TINYINT(1) DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    tableEnsured = true;
}

export async function GET() {
    try {
        await ensureAchievementsTable();
        const rows = await query('SELECT * FROM achievements ORDER BY is_pinned DESC, created_at DESC');
        const achievements = rows.map(row => ({
            ...row,
            is_pinned: !!row.is_pinned,
        }));
        return NextResponse.json(achievements);
    } catch (err) {
        console.error('Public Achievements API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
