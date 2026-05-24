import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Tampilkan semua ulasan: pending dulu, lalu published, urutkan by id desc
        const rows = await query(
            "SELECT * FROM reviews ORDER BY CASE WHEN status = 'pending' THEN 0 ELSE 1 END, id DESC"
        );
        return NextResponse.json(rows);
    } catch (err) {
        console.error('API Reviews GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, name, rating, content, img, status } = body;

        // Kalau cuma approve (publish), hanya update status
        if (id && body.action === 'approve') {
            await execute("UPDATE reviews SET status = 'published' WHERE id = ?", [id]);
            return NextResponse.json({ success: true });
        }

        const avatar_char = (name || '?').charAt(0).toUpperCase();
        const reviewStatus = status || 'published'; // Admin tambah manual = langsung published

        if (id) {
            // Update
            await execute(
                'UPDATE reviews SET name = ?, rating = ?, content = ?, img = ?, avatar_char = ?, status = ? WHERE id = ?',
                [name, rating, content, img || null, avatar_char, reviewStatus, id]
            );
        } else {
            // Insert baru oleh admin (langsung published)
            await execute(
                'INSERT INTO reviews (name, rating, content, img, avatar_char, status) VALUES (?, ?, ?, ?, ?, ?)',
                [name, rating, content, img || null, avatar_char, reviewStatus]
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Reviews POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await execute('DELETE FROM reviews WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Reviews DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
