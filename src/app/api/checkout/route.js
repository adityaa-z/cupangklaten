import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getPool } from '@/lib/db';

function generateOrderCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'ORD-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let connection;
    try {
        const body = await req.json();
        const { cart, shipping_name, shipping_phone, shipping_address, courier, shipping_cost, total_amount } = body;

        if (!cart || cart.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const pool = getPool();
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verify Stock for Normal Products
        for (const item of cart) {
            if (!item.isAuction) {
                const [rows] = await connection.execute('SELECT stock, is_available FROM products WHERE id = ? FOR UPDATE', [item.id]);
                if (rows.length === 0) throw new Error(`Produk dengan ID ${item.id} tidak ditemukan.`);
                
                const product = rows[0];
                if (!product.is_available || product.stock < item.quantity) {
                    throw new Error(`Stok tidak mencukupi untuk ikan kode ${item.code}. Sisa stok: ${product.stock}`);
                }
            } else {
                // Verify Auction
                const [rows] = await connection.execute('SELECT status, payment_status FROM auctions WHERE id = ? FOR UPDATE', [item.auction_id]);
                if (rows.length === 0) throw new Error(`Lelang dengan ID ${item.auction_id} tidak ditemukan.`);
                if (rows[0].payment_status === 'paid' || rows[0].payment_status === 'confirmed') {
                    throw new Error(`Lelang ${item.code} sudah diproses.`);
                }
            }
        }

        // 2. Insert Order
        const orderCode = generateOrderCode();
        // Cek email user di db untuk dapet ID-nya
        const [userRows] = await connection.execute('SELECT id FROM users WHERE email = ?', [session.user.email]);
        let userId;
        if (userRows.length > 0) {
            userId = userRows[0].id;
        } else {
            // Jika user pakai google auth dan belum masuk tabel users secara utuh, ini jaga-jaga
            const [insertUser] = await connection.execute(
                'INSERT INTO users (name, email, role, status) VALUES (?, ?, ?, ?)',
                [session.user.name, session.user.email, 'member', 'approved']
            );
            userId = insertUser.insertId;
        }

        const [orderResult] = await connection.execute(
            `INSERT INTO orders (user_id, order_code, shipping_name, shipping_phone, shipping_address, courier, shipping_cost, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [userId, orderCode, shipping_name, shipping_phone, shipping_address, courier, shipping_cost, total_amount]
        );
        const orderId = orderResult.insertId;

        // 3. Insert Order Items & Update Stock/Auction Status
        for (const item of cart) {
            if (item.isAuction) {
                await connection.execute(
                    'INSERT INTO order_items (order_id, auction_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.auction_id, item.quantity, item.price]
                );

                await connection.execute(
                    'UPDATE auctions SET payment_status = "confirmed" WHERE id = ?',
                    [item.auction_id]
                );
            } else {
                await connection.execute(
                    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
                    [orderId, item.id, item.quantity, item.price]
                );

                await connection.execute(
                    'UPDATE products SET stock = stock - ? WHERE id = ?',
                    [item.quantity, item.id]
                );

                // Jika stok habis, set is_available = 0, sold_at = NOW()
                await connection.execute(
                    'UPDATE products SET is_available = 0, sold_at = NOW() WHERE id = ? AND stock <= 0',
                    [item.id]
                );
            }
        }

        await connection.commit();
        connection.release();

        return NextResponse.json({ success: true, order_id: orderId, order_code: orderCode });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
