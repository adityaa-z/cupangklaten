import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

function isValidSession(request) {
    return true; // Proteksi oleh next-auth middleware
}

export async function GET(request) {
    if (!isValidSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const members = await query('SELECT id, name, email, phone, address, status, role, created_at FROM users ORDER BY created_at DESC');
    return NextResponse.json(members);
}

export async function POST(request) {
    if (!isValidSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id, status } = await request.json();
        await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
