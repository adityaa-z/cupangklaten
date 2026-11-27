import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

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

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureHeroGalleryTable();
        const rows = await query('SELECT * FROM hero_gallery ORDER BY sort_order ASC, id ASC');
        const items = rows.map(row => ({
            ...row,
            is_active: !!row.is_active,
        }));
        return NextResponse.json(items);
    } catch (err) {
        console.error('Admin Hero Gallery GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureHeroGalleryTable();

        const body = await request.json();
        const { id, ...inputData } = body;

        const allowedFields = ['image_url', 'caption', 'sort_order', 'is_active'];
        const data = {};
        allowedFields.forEach(field => {
            if (inputData[field] !== undefined) data[field] = inputData[field];
        });

        if (data.is_active !== undefined) {
            data.is_active = data.is_active ? 1 : 0;
        }
        if (data.sort_order !== undefined) {
            data.sort_order = parseInt(data.sort_order, 10) || 0;
        }

        if (id) {
            const fields = Object.keys(data);
            if (fields.length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
            }
            const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
            const values = fields.map(f => data[f]);
            values.push(id);
            await execute(`UPDATE hero_gallery SET ${setClause} WHERE id = ?`, values);
        } else {
            if (!data.image_url) {
                return NextResponse.json({ error: 'Foto wajib diupload' }, { status: 400 });
            }
            const fields = Object.keys(data);
            const placeholders = fields.map(() => '?').join(', ');
            const columns = fields.map(f => `\`${f}\``).join(', ');
            const values = fields.map(f => data[f]);
            await execute(`INSERT INTO hero_gallery (${columns}) VALUES (${placeholders})`, values);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Admin Hero Gallery POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureHeroGalleryTable();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await execute('DELETE FROM hero_gallery WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Admin Hero Gallery DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
