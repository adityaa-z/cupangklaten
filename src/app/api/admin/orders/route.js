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
        
        if (orders.length === 0) return NextResponse.json([]);

        const items = await query(`
            SELECT oi.*, 
                   COALESCE(p.category, a.title) as category, 
                   COALESCE(p.variant, 'Ikan Lelang') as variant, 
                   COALESCE(p.code, CONCAT('LELANG-', a.id)) as code
            FROM order_items oi 
            LEFT JOIN products p ON oi.product_id = p.id
            LEFT JOIN auctions a ON oi.auction_id = a.id
        `);

        const ordersWithItems = orders.map(order => ({
            ...order,
            items: items.filter(item => item.order_id === order.id)
        }));

        return NextResponse.json(ordersWithItems);
    } catch (error) {
        console.error('GET orders error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await checkAdmin();
        const body = await req.json();
        const { order_id, status, tracking_number } = body;

        if (!order_id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        let updates = [];
        let params = [];

        if (status !== undefined && status !== null) {
            updates.push('status = ?');
            params.push(status);
        }

        if (tracking_number !== undefined) {
            updates.push('tracking_number = ?');
            params.push(tracking_number ?? null);
        }

        if (updates.length === 0) return NextResponse.json({ message: 'No changes' });

        const sql = 'UPDATE orders SET ' + updates.join(', ') + ' WHERE id = ?';
        params.push(order_id);

        await execute(sql, params);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PUT orders error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        await checkAdmin();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });

        // Delete order items first
        await execute('DELETE FROM order_items WHERE order_id = ?', [id]);
        // Delete order
        await execute('DELETE FROM orders WHERE id = ?', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE orders error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
