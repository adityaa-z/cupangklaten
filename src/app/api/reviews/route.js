import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM reviews ORDER BY id DESC');
        return NextResponse.json(rows);
    } catch (err) {
        console.error('Public Reviews API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
