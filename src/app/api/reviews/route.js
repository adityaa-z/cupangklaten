import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const rows = await query("SELECT * FROM reviews WHERE status = 'approved' ORDER BY id DESC");
        return NextResponse.json(rows);
    } catch (err) {
        console.error('Public Reviews API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Silakan login terlebih dahulu.' }, { status: 401 });
        }

        const body = await request.json();
        const { rating, content } = body;
        const userId = session.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating harus berkisar antara 1 hingga 5.' }, { status: 400 });
        }

        if (!content || content.trim().length < 5) {
            return NextResponse.json({ error: 'Ulasan minimal harus 5 karakter.' }, { status: 400 });
        }

        // Check if user has already reviewed
        const existing = await query('SELECT id FROM reviews WHERE user_id = ?', [userId]);
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Anda sudah pernah memberikan ulasan. Setiap akun dibatasi 1 ulasan.' }, { status: 400 });
        }

        const name = session.user.name || 'Member';
        const avatar_char = name.charAt(0).toUpperCase();

        await execute(
            "INSERT INTO reviews (name, rating, content, avatar_char, user_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [name, rating, content.trim(), avatar_char, userId]
        );

        return NextResponse.json({ success: true, message: 'Ulasan berhasil dikirim dan menunggu persetujuan admin.' });
    } catch (err) {
        console.error('Submit Review API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
