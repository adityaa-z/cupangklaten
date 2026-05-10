import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    try {
        const auctions = await query('SELECT * FROM auctions WHERE id = ?', [id]);
        
        if (auctions.length === 0) {
            return NextResponse.json({ error: 'Lelang tidak ditemukan' }, { status: 404 });
        }

        const auction = auctions[0];

        // Ambil history bid
        const bids = await query(`
            SELECT b.*, u.name 
            FROM bids b 
            JOIN users u ON b.user_id = u.id 
            WHERE b.auction_id = ? 
            ORDER BY b.amount DESC
        `, [id]);

        return NextResponse.json({ auction, bids });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
