import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    
    // Auto update status lelang yang sudah lewat end_time tapi masih active
    await query("UPDATE auctions SET status = 'ended' WHERE end_time < NOW() AND status = 'active'");
    
    const auctions = await query(`
        SELECT a.*, 
               (SELECT u.name FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = a.id ORDER BY b.amount DESC LIMIT 1) as winner_name,
               (SELECT u.phone FROM bids b JOIN users u ON b.user_id = u.id WHERE b.auction_id = a.id ORDER BY b.amount DESC LIMIT 1) as winner_phone,
               (SELECT MAX(amount) FROM bids WHERE auction_id = a.id) as max_bid
        FROM auctions a ORDER BY a.created_at DESC
    `);
    return NextResponse.json(auctions);
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { id, title, description, image_url, start_price, min_bid_increment, start_time, end_time, status, action } = body;

        if (action === 'mark_paid') {
            await query("UPDATE auctions SET payment_status = 'paid' WHERE id = ?", [id]);
            return NextResponse.json({ success: true });
        }

        if (id) {
            // Update
            await query(
                'UPDATE auctions SET title=?, description=?, image_url=?, start_price=?, min_bid_increment=?, start_time=?, end_time=?, status=? WHERE id=?',
                [title, description, image_url, start_price, min_bid_increment, start_time, end_time, status, id]
            );
        } else {
            // Insert
            await query(
                'INSERT INTO auctions (title, description, image_url, start_price, min_bid_increment, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [title, description, image_url, start_price, min_bid_increment, start_time, end_time, status || 'draft']
            );
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await query('DELETE FROM auctions WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
