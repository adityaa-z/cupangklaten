import { NextResponse } from 'next/server';
import { query, getPool } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

// Guard: verify admin email
async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== 'zidanp13794@gmail.com') {
        return false;
    }
    return true;
}

export async function GET() {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Categories
        const categories = await query("SELECT * FROM categories ORDER BY id ASC");

        // 2. Fetch Active Fish Stocks (available or recently active)
        const fishStocks = await query("SELECT * FROM fish_stocks ORDER BY id DESC");

        // 3. Fetch Transactions with category details
        const transactions = await query(`
            SELECT t.*, c.nama_kategori, c.jenis, f.kode_ikan, f.nama_tipe, f.grade
            FROM transactions t
            JOIN categories c ON t.category_id = c.id
            LEFT JOIN fish_stocks f ON t.fish_stock_id = f.id
            ORDER BY t.tanggal DESC, t.id DESC
        `);

        // 4. Calculate Stats
        const [masukRow] = await query("SELECT SUM(nominal) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.jenis = 'masuk'");
        const [keluarRow] = await query("SELECT SUM(nominal) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.jenis = 'keluar'");
        const saldo_kas = Number(masukRow[0]?.total || 0) - Number(keluarRow[0]?.total || 0);

        const [asetRow] = await query("SELECT SUM(stok_sisa * harga_beli_per_ekor) as total FROM fish_stocks");
        const estimasi_aset = Number(asetRow[0]?.total || 0);

        return NextResponse.json({
            categories,
            fishStocks,
            transactions,
            stats: {
                saldo_kas,
                estimasi_aset
            }
        });
    } catch (err) {
        console.error('API Keuangan GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    let connection;
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tanggal, category_id, nominal, keterangan, fish_stock_id, purchase_data } = body;

        if (!tanggal || !category_id || nominal === undefined) {
            return NextResponse.json({ error: 'Data tanggal, kategori, dan nominal wajib diisi.' }, { status: 400 });
        }

        // Get single connection for transaction
        const pool = getPool();
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Check if category is income ('masuk') or expense ('keluar')
        const [catRows] = await connection.execute("SELECT * FROM categories WHERE id = ?", [category_id]);
        if (catRows.length === 0) {
            await connection.rollback();
            connection.release();
            return NextResponse.json({ error: 'Kategori tidak valid.' }, { status: 400 });
        }
        const category = catRows[0];

        let final_fish_stock_id = fish_stock_id || null;
        let hpp_total = 0;

        // Flow Jual Ikan Eceran (Category ID 1)
        if (Number(category_id) === 1) {
            if (!final_fish_stock_id) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({ error: 'Pilih ikan yang terjual untuk mencatat penjualan eceran.' }, { status: 400 });
            }

            // Lock row for update
            const [stockRows] = await connection.execute("SELECT * FROM fish_stocks WHERE id = ? FOR UPDATE", [final_fish_stock_id]);
            if (stockRows.length === 0) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({ error: 'Data stok ikan tidak ditemukan.' }, { status: 404 });
            }

            const fish = stockRows[0];
            if (fish.stok_sisa < 1) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({ error: `Stok ikan ${fish.kode_ikan} sudah habis.` }, { status: 400 });
            }

            // Decrement stock
            await connection.execute("UPDATE fish_stocks SET stok_sisa = stok_sisa - 1 WHERE id = ?", [final_fish_stock_id]);
            hpp_total = Number(fish.harga_beli_per_ekor);
        }

        // Flow Pembelian Stok Grosir (Category ID 2)
        if (Number(category_id) === 2) {
            if (!purchase_data || !purchase_data.kode_ikan || !purchase_data.nama_tipe || !purchase_data.grade || purchase_data.harga_beli_per_ekor === undefined || !purchase_data.stok_sisa) {
                await connection.rollback();
                connection.release();
                return NextResponse.json({ error: 'Data pembelian grosir (kode, tipe, grade, harga, jumlah) wajib diisi.' }, { status: 400 });
            }

            const { kode_ikan, nama_tipe, grade, harga_beli_per_ekor, stok_sisa, lokasi } = purchase_data;

            // Check if fish code already exists
            const [existingRows] = await connection.execute("SELECT id FROM fish_stocks WHERE kode_ikan = ? FOR UPDATE", [kode_ikan]);
            if (existingRows.length > 0) {
                final_fish_stock_id = existingRows[0].id;
                // Increment stock sisa & update metadata
                await connection.execute(
                    "UPDATE fish_stocks SET stok_sisa = stok_sisa + ?, nama_tipe = ?, grade = ?, harga_beli_per_ekor = ? WHERE id = ?",
                    [stok_sisa, nama_tipe, grade, harga_beli_per_ekor, final_fish_stock_id]
                );
            } else {
                // Insert new fish stock
                const [insertResult] = await connection.execute(
                    "INSERT INTO fish_stocks (kode_ikan, nama_tipe, grade, harga_beli_per_ekor, stok_sisa, lokasi) VALUES (?, ?, ?, ?, ?, ?)",
                    [kode_ikan, nama_tipe, grade, harga_beli_per_ekor, stok_sisa, lokasi || 'Pabrik_Pembesaran']
                );
                final_fish_stock_id = insertResult.insertId;
            }
        }

        // Insert Transaction
        await connection.execute(
            "INSERT INTO transactions (tanggal, category_id, fish_stock_id, nominal, hpp_total, keterangan) VALUES (?, ?, ?, ?, ?, ?)",
            [tanggal, category_id, final_fish_stock_id, nominal, hpp_total, keterangan || null]
        );

        await connection.commit();
        connection.release();

        return NextResponse.json({ success: true, message: 'Transaksi berhasil disimpan.' });
    } catch (err) {
        console.error('API Keuangan POST Error:', err);
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollErr) {
                console.error('Rollback Error:', rollErr);
            }
            connection.release();
        }
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
