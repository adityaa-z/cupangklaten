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
        const masukRow = await query("SELECT SUM(nominal) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.jenis = 'masuk'");
        const keluarRow = await query("SELECT SUM(nominal) as total FROM transactions t JOIN categories c ON t.category_id = c.id WHERE c.jenis = 'keluar'");
        const saldo_kas = Number(masukRow[0]?.total || 0) - Number(keluarRow[0]?.total || 0);

        const estimasi_aset = 0; // Removed stock asset estimation calculation from backend

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
        const { tanggal, category_id, nominal, keterangan, fish_stock_id, purchase_data, items } = body;

        if (!tanggal || !category_id) {
            return NextResponse.json({ error: 'Data tanggal dan kategori wajib diisi.' }, { status: 400 });
        }

        let transactionItems = items || [];
        if (transactionItems.length === 0) {
            if (nominal === undefined) {
                return NextResponse.json({ error: 'Nominal transaksi wajib diisi.' }, { status: 400 });
            }
            transactionItems.push({
                fish_stock_id: fish_stock_id,
                purchase_data: purchase_data,
                nominal: nominal,
                qty: body.qty || 1
            });
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
        
        for (const item of transactionItems) {
            let final_fish_stock_id = item.fish_stock_id || null;
            let hpp_total = 0;
            let item_nominal = item.nominal !== undefined ? item.nominal : 0;
            let qty = Number(item.qty) || 1;

            // Flow Jual Ikan Eceran (Category ID 1)
            if (Number(category_id) === 1) {
                if (!final_fish_stock_id) {
                    throw new Error('Pilih ikan yang terjual untuk mencatat penjualan eceran.');
                }

                // Lock row for update
                const [stockRows] = await connection.execute("SELECT * FROM fish_stocks WHERE id = ? FOR UPDATE", [final_fish_stock_id]);
                if (stockRows.length === 0) {
                    throw new Error('Data stok ikan tidak ditemukan.');
                }

                const fish = stockRows[0];
                if (fish.stok_sisa < qty) {
                    throw new Error(`Stok ikan ${fish.kode_ikan} tidak mencukupi (sisa: ${fish.stok_sisa}, diminta: ${qty}).`);
                }

                // Decrement stock
                await connection.execute("UPDATE fish_stocks SET stok_sisa = stok_sisa - ? WHERE id = ?", [qty, final_fish_stock_id]);
                hpp_total = Number(fish.harga_beli_per_ekor) * qty;
            }

            // Flow Pembelian Stok Grosir (Category ID 2)
            if (Number(category_id) === 2) {
                const pData = item.purchase_data;
                if (!pData || !pData.kode_ikan || !pData.nama_tipe || !pData.grade || pData.harga_beli_per_ekor === undefined || !pData.stok_sisa) {
                    throw new Error('Data pembelian grosir tidak lengkap.');
                }

                const { kode_ikan, nama_tipe, grade, harga_beli_per_ekor, stok_sisa, lokasi } = pData;

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
                [tanggal, category_id, final_fish_stock_id, item_nominal, hpp_total, keterangan || null]
            );
        }

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

export async function PUT(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { target_saldo } = await request.json();
        if (target_saldo === undefined || isNaN(target_saldo)) {
            return NextResponse.json({ error: 'Target saldo tidak valid.' }, { status: 400 });
        }

        // 1. Ensure "Saldo Awal" category exists
        const catRows = await query("SELECT id FROM categories WHERE nama_kategori = 'Saldo Awal'");
        let saldoAwalCatId;
        if (catRows.length === 0) {
            const insertCat = await query("INSERT INTO categories (nama_kategori, jenis) VALUES ('Saldo Awal', 'masuk')");
            saldoAwalCatId = insertCat.insertId;
        } else {
            saldoAwalCatId = catRows[0].id;
        }

        // 2. Calculate other pemasukan (excluding Saldo Awal category)
        const masukRow = await query(
            "SELECT SUM(nominal) as total FROM transactions WHERE category_id != ? AND category_id IN (SELECT id FROM categories WHERE jenis = 'masuk')",
            [saldoAwalCatId]
        );
        const P_other = Number(masukRow[0]?.total || 0);

        // 3. Calculate all pengeluaran
        const keluarRow = await query(
            "SELECT SUM(nominal) as total FROM transactions WHERE category_id IN (SELECT id FROM categories WHERE jenis = 'keluar')"
        );
        const K = Number(keluarRow[0]?.total || 0);

        // 4. Calculate S_awal
        const S_awal = Number(target_saldo) - P_other + K;

        // 5. Check if Saldo Awal transaction already exists
        const transRows = await query(
            "SELECT id FROM transactions WHERE category_id = ? ORDER BY id ASC LIMIT 1",
            [saldoAwalCatId]
        );

        if (transRows.length > 0) {
            // Update existing
            await query("UPDATE transactions SET nominal = ? WHERE id = ?", [S_awal, transRows[0].id]);
        } else {
            // Create new
            const today = new Date().toISOString().split('T')[0];
            await query(
                "INSERT INTO transactions (tanggal, category_id, nominal, keterangan) VALUES (?, ?, ?, 'Saldo Awal Sistem')",
                [today, saldoAwalCatId, S_awal]
            );
        }

        return NextResponse.json({ success: true, message: 'Saldo Kas Utama berhasil diperbarui.' });
    } catch (err) {
        console.error('API Keuangan PUT Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
