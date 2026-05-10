import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Ambil data user lengkap
        const users = await query('SELECT id, name, email, phone, address, status, role, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const user = users[0];

        // Ambil riwayat lelang yang Dimenangkan (Ended & bid tertinggi milik user)
        const wonAuctions = await query(`
            SELECT a.*, b.amount as win_bid 
            FROM auctions a 
            JOIN (
                SELECT auction_id, MAX(amount) as max_amount 
                FROM bids 
                GROUP BY auction_id
            ) max_bids ON a.id = max_bids.auction_id
            JOIN bids b ON b.auction_id = max_bids.auction_id AND b.amount = max_bids.max_amount
            WHERE a.status = 'ended' AND b.user_id = ?
            ORDER BY a.end_time DESC
        `, [userId]);

        return NextResponse.json({ user, wonAuctions });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
