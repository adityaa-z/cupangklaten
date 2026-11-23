import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

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

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureAchievementsTable();
        const rows = await query('SELECT * FROM achievements ORDER BY is_pinned DESC, created_at DESC');
        const achievements = rows.map(row => ({
            ...row,
            is_pinned: !!row.is_pinned,
        }));
        return NextResponse.json(achievements);
    } catch (err) {
        console.error('Admin Achievements GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureAchievementsTable();

        const body = await request.json();
        const { id, ...inputData } = body;

        const allowedFields = [
            'title', 'rank_label', 'event_name', 'event_date',
            'fish_img', 'trophy_img', 'description', 'is_pinned'
        ];

        const data = {};
        allowedFields.forEach(field => {
            if (inputData[field] !== undefined) data[field] = inputData[field];
        });

        if (data.is_pinned !== undefined) {
            data.is_pinned = data.is_pinned ? 1 : 0;
        }

        if (id) {
            const fields = Object.keys(data);
            if (fields.length === 0) {
                return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
            }
            const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
            const values = fields.map(f => data[f]);
            values.push(id);
            await execute(`UPDATE achievements SET ${setClause} WHERE id = ?`, values);
        } else {
            const fields = Object.keys(data);
            const placeholders = fields.map(() => '?').join(', ');
            const columns = fields.map(f => `\`${f}\``).join(', ');
            const values = fields.map(f => data[f]);
            await execute(`INSERT INTO achievements (${columns}) VALUES (${placeholders})`, values);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Admin Achievements POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        await ensureAchievementsTable();

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await execute('DELETE FROM achievements WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Admin Achievements DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
