import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(req, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = params;

        // Verify if user owns this order, or if user is admin
        const isAdmin = session.user.email === 'zidanp13794@gmail.com';

        let orderQuery = 'SELECT * FROM orders WHERE id = ?';
        let queryParams = [id];

        if (!isAdmin) {
            orderQuery += ' AND user_id = (SELECT id FROM users WHERE email = ? LIMIT 1)';
            queryParams.push(session.user.email);
        }

        const orders = await query(orderQuery, queryParams);
        if (orders.length === 0) {
            return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
        }

        const order = orders[0];

        // Fetch items
        const items = await query(`
            SELECT oi.*, 
                   COALESCE(p.category, a.title) as category, 
                   COALESCE(p.variant, 'Ikan Lelang') as variant, 
                   COALESCE(p.code, CONCAT('LELANG-', a.id)) as code, 
                   COALESCE(p.img, a.image_url) as img
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN auctions a ON oi.auction_id = a.id
            WHERE oi.order_id = ?
        `, [id]);

        return NextResponse.json({ order, items });
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
