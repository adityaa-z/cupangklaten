import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        // Harus login untuk submit ulasan
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Anda harus login untuk memberikan ulasan.' }, { status: 401 });
        }

        const userId = session.user.id;
        const userName = session.user.name;

        // Cek apakah user sudah pernah submit ulasan
        const existing = await query(
            'SELECT id FROM reviews WHERE user_id = ?',
            [userId]
        );
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Anda sudah pernah memberikan ulasan. Terima kasih!' }, { status: 409 });
        }

        const body = await request.json();
        const { rating, content } = body;

        // Validasi input
        if (!content || content.trim().length < 10) {
            return NextResponse.json({ error: 'Komentar minimal 10 karakter.' }, { status: 400 });
        }
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating harus antara 1-5 bintang.' }, { status: 400 });
        }

        const name = userName || 'Anonim';
        const avatar_char = name.charAt(0).toUpperCase();

        await execute(
            'INSERT INTO reviews (name, rating, content, avatar_char, status, user_id) VALUES (?, ?, ?, ?, ?, ?)',
            [name, parseInt(rating), content.trim(), avatar_char, 'pending', userId]
        );

        return NextResponse.json({ success: true, message: 'Ulasan Anda berhasil dikirim dan sedang menunggu persetujuan admin.' });
    } catch (err) {
        console.error('Submit Review API Error:', err);
        return NextResponse.json({ error: 'Terjadi kesalahan. Silakan coba lagi.' }, { status: 500 });
    }
}
