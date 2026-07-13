import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { query, execute } from '@/lib/db';

const checkAdmin = async () => {
    const session = await getServerSession(authOptions);
    if (!session || session.user.email !== 'zidanp13794@gmail.com') {
        throw new Error('Unauthorized');
    }
};

export async function GET() {
    try {
        await checkAdmin();
        const orders = await query('SELECT * FROM orders ORDER BY created_at DESC');
        
        // Fetch items for all orders
        const items = await query(`
            SELECT oi.*, 
                   COALESCE(p.category, a.title) as category, 
                   COALESCE(p.variant, 'Ikan Lelang') as variant, 
                   COALESCE(p.code, CONCAT('LELANG-', a.id)) as code
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN auctions a ON oi.auction_id = a.id
        `);

        // Group items by order_id
        const ordersWithItems = orders.map(order => {
            return {
                ...order,
                items: items.filter(item => item.order_id === order.id)
            };
        });

        return NextResponse.json(ordersWithItems);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}

export async function PUT(req) {
    try {
        await checkAdmin();
        const body = await req.json();
        const { order_id, status, tracking_number } = body;

        if (!order_id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        let sql = 'UPDATE orders SET ';
        let params = [];
        let updates = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }

        if (tracking_number !== undefined) {
            updates.push('tracking_number = ?');
            params.push(tracking_number);
        }

        if (updates.length === 0) return NextResponse.json({ message: 'No changes' });

        sql += updates.join(', ') + ' WHERE id = ?';
        params.push(order_id);

        await execute(sql, params);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
