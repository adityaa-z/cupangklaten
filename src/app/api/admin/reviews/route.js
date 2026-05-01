import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rows = await query('SELECT * FROM reviews ORDER BY id DESC');
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
        const { id, name, rating, content, img } = body;
        const avatar_char = name.charAt(0).toUpperCase();

        if (id) {
            // Update
            await execute(
                'UPDATE reviews SET name = ?, rating = ?, content = ?, img = ?, avatar_char = ? WHERE id = ?',
                [name, rating, content, img || null, avatar_char, id]
            );
        } else {
            // Insert
            await execute(
                'INSERT INTO reviews (name, rating, content, img, avatar_char) VALUES (?, ?, ?, ?, ?)',
                [name, rating, content, img || null, avatar_char]
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
