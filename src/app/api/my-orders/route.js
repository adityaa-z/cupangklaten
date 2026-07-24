import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user id
        const users = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [session.user.email ?? null]);
        if (users.length === 0) return NextResponse.json([]);

        const userId = users[0].id;

        const orders = await query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        if (orders.length === 0) return NextResponse.json([]);

        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');

        const items = await query(`
            SELECT oi.*,
                   COALESCE(p.category, a.title) as category,
                   COALESCE(p.variant, 'Ikan Lelang') as variant,
                   COALESCE(p.code, CONCAT('LELANG-', a.id)) as code
            FROM order_items oi
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN auctions a ON oi.auction_id = a.id
            WHERE oi.order_id IN (${placeholders})
        `, orderIds);

        const result = orders.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.id)
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching my orders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
