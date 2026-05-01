import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await query('SELECT * FROM products ORDER BY created_at DESC');

        // Convert MySQL tinyint booleans back to JS booleans
        const products = rows.map(row => ({
            ...row,
            is_video: !!row.is_video,
            is_available: !!row.is_available,
            is_pinned: !!row.is_pinned,
            is_archived: !!row.is_archived,
        }));

        return NextResponse.json(products);
    } catch (err) {
        console.error('Public Products API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
