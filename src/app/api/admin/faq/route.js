import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rows = await query('SELECT * FROM faqs ORDER BY created_at ASC');
        return NextResponse.json(rows);
    } catch (err) {
        console.error('API FAQ GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, question, answer } = body;

        if (id) {
            await execute(
                'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
                [question, answer, id]
            );
        } else {
            await execute(
                'INSERT INTO faqs (question, answer) VALUES (?, ?)',
                [question, answer]
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API FAQ POST Error:', err);
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

        await execute('DELETE FROM faqs WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API FAQ DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
