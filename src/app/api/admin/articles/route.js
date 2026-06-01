import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== 'zidanp13794@gmail.com') {
        return false;
    }
    return true;
}

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

export async function GET() {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureArticlesTable();

        const articles = await query('SELECT * FROM articles ORDER BY created_at DESC');
        return NextResponse.json(articles);
    } catch (err) {
        console.error('API Admin Articles GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureArticlesTable();

        const body = await request.json();
        const { id, title, slug, content, thumbnail, category, meta_title, meta_description } = body;

        if (!title || !slug || !content) {
            return NextResponse.json({ error: 'Judul, Slug URL, dan Isi Artikel wajib diisi.' }, { status: 400 });
        }

        if (id) {
            // Update
            await execute(
                `UPDATE articles 
                 SET title = ?, slug = ?, content = ?, thumbnail = ?, category = ?, meta_title = ?, meta_description = ? 
                 WHERE id = ?`,
                [title, slug, content, thumbnail || null, category || null, meta_title || null, meta_description || null, id]
            );
        } else {
            // Insert
            await execute(
                `INSERT INTO articles (title, slug, content, thumbnail, category, meta_title, meta_description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, slug, content, thumbnail || null, category || null, meta_title || null, meta_description || null]
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Admin Articles POST Error:', err);
        // Handle duplicate slug error
        if (err.message?.includes('Duplicate entry')) {
            return NextResponse.json({ error: 'Slug URL sudah digunakan, buat slug yang unik.' }, { status: 400 });
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await ensureArticlesTable();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID artikel wajib disertakan.' }, { status: 400 });
        }

        await execute('DELETE FROM articles WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Admin Articles DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
