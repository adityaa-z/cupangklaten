import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM faqs ORDER BY created_at ASC');
        return NextResponse.json(rows);
    } catch (err) {
        console.error('Public FAQ API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
