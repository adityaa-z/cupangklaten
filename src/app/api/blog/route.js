import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureArticlesTable() {
    await execute(`
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
    `);
}

export async function GET(request) {
    try {
        await ensureArticlesTable();

        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (slug) {
            // Fetch single article
            const rows = await query('SELECT * FROM articles WHERE slug = ? LIMIT 1', [slug]);
            if (rows.length === 0) {
                return NextResponse.json({ error: 'Artikel tidak ditemukan.' }, { status: 404 });
            }
            return NextResponse.json(rows[0]);
        } else {
            // Fetch all articles
            const articles = await query('SELECT * FROM articles ORDER BY created_at DESC');
            return NextResponse.json(articles);
        }
    } catch (err) {
        console.error('API Public Blog GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
