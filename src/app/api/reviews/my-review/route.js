import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ hasReview: false });
        }
        
        const rows = await query('SELECT id, status FROM reviews WHERE user_id = ?', [session.user.id]);
        return NextResponse.json({ hasReview: rows.length > 0, review: rows[0] || null });
    } catch (err) {
        console.error('My Review API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
