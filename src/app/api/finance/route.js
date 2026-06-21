import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

// Initialize tables if not exist
async function initTables() {
    await execute(`
        CREATE TABLE IF NOT EXISTS finance_keuangan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            pengeluaran VARCHAR(255) DEFAULT NULL,
            harga DECIMAL(15,0) DEFAULT 0,
            pendapatan_kotor DECIMAL(15,0) DEFAULT 0,
            keterangan TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await execute(`
        CREATE TABLE IF NOT EXISTS finance_stok_ikan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            jenis_ikan VARCHAR(100) NOT NULL,
            jumlah INT DEFAULT 0,
            harga_satuan DECIMAL(15,0) DEFAULT 0,
            omah DECIMAL(15,0) DEFAULT 0,
            online DECIMAL(15,0) DEFAULT 0,
            ekspor DECIMAL(15,0) DEFAULT 0,
            keterangan TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
}

export async function GET() {
    try {
        await initTables();
        const keuangan = await query('SELECT * FROM finance_keuangan ORDER BY tanggal DESC, id DESC');
        const stok = await query('SELECT * FROM finance_stok_ikan ORDER BY tanggal DESC, id DESC');
        return NextResponse.json({ keuangan, stok });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await initTables();
        const body = await req.json();
        const { type, data } = body;

        if (type === 'pengeluaran') {
            const { pengeluaran, harga, keterangan } = data;
            if (!pengeluaran || !harga) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const result = await execute(
                'INSERT INTO finance_keuangan (tanggal, pengeluaran, harga, pendapatan_kotor, keterangan) VALUES (NOW(), ?, ?, 0, ?)',
                [pengeluaran, Number(harga), keterangan || '']
            );
            return NextResponse.json({ id: result.insertId });

        } else if (type === 'pemasukan') {
            const { keterangan, pendapatan_kotor } = data;
            if (!keterangan || !pendapatan_kotor) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const result = await execute(
                'INSERT INTO finance_keuangan (tanggal, pengeluaran, harga, pendapatan_kotor, keterangan) VALUES (NOW(), NULL, 0, ?, ?)',
                [Number(pendapatan_kotor), keterangan]
            );
            return NextResponse.json({ id: result.insertId });

        } else if (type === 'stok') {
            const { jenis_ikan, jumlah, harga_satuan, omah, online, ekspor, keterangan } = data;
            if (!jenis_ikan || !jumlah) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const result = await execute(
                'INSERT INTO finance_stok_ikan (tanggal, jenis_ikan, jumlah, harga_satuan, omah, online, ekspor, keterangan) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?)',
                [jenis_ikan, Number(jumlah), Number(harga_satuan || 0), Number(omah || 0), Number(online || 0), Number(ekspor || 0), keterangan || '']
            );
            return NextResponse.json({ id: result.insertId });
        }

        return NextResponse.json({ error: 'Type tidak dikenal' }, { status: 400 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const table = searchParams.get('table'); // 'keuangan' or 'stok'
        if (!id || !table) return NextResponse.json({ error: 'Parameter kurang' }, { status: 400 });

        const tableName = table === 'stok' ? 'finance_stok_ikan' : 'finance_keuangan';
        await execute(`DELETE FROM ${tableName} WHERE id = ?`, [Number(id)]);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        const { id, table, field, value } = body;
        if (!id || !table || !field) return NextResponse.json({ error: 'Parameter kurang' }, { status: 400 });

        const tableName = table === 'stok' ? 'finance_stok_ikan' : 'finance_keuangan';
        const allowedKeuanganFields = ['pengeluaran', 'harga', 'pendapatan_kotor', 'keterangan'];
        const allowedStokFields = ['jenis_ikan', 'jumlah', 'harga_satuan', 'omah', 'online', 'ekspor', 'keterangan'];
        const allowed = table === 'stok' ? allowedStokFields : allowedKeuanganFields;

        if (!allowed.includes(field)) return NextResponse.json({ error: 'Field tidak diizinkan' }, { status: 400 });

        await execute(`UPDATE ${tableName} SET ${field} = ? WHERE id = ?`, [value, Number(id)]);
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
