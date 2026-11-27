import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

let tableEnsured = false;
async function ensureHeroGalleryTable() {
    if (tableEnsured) return;
    await execute(`
        CREATE TABLE IF NOT EXISTS hero_gallery (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image_url TEXT NOT NULL,
            caption VARCHAR(200) DEFAULT 'Galeri Soliter & Prestasi · Klaten',
            sort_order INT DEFAULT 0,
            is_active TINYINT(1) DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    tableEnsured = true;
}

export async function GET() {
    try {
        await ensureHeroGalleryTable();
        const rows = await query(
            'SELECT * FROM hero_gallery WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
        );
        const items = rows.map(row => ({
            ...row,
            is_active: !!row.is_active,
        }));
        return NextResponse.json(items);
    } catch (err) {
        console.error('Public Hero Gallery API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
