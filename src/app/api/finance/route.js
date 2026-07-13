import { NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

// Initialize tables if not exist, and migrate existing tables
async function initTables() {
    await execute(`
        CREATE TABLE IF NOT EXISTS finance_keuangan (
            id INT AUTO_INCREMENT PRIMARY KEY,
            tanggal DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            pengeluaran VARCHAR(255) DEFAULT NULL,
            harga DECIMAL(15,0) DEFAULT 0,
            pendapatan_kotor DECIMAL(15,0) DEFAULT 0,
            keterangan TEXT DEFAULT NULL,
            segmen ENUM('showroom','grosir') DEFAULT 'showroom',
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
            segmen ENUM('showroom','grosir') DEFAULT 'showroom',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Migrate existing tables: add segmen column if not exists (MySQL 8.0 compatible)
    const checkAndAddColumn = async (tableName) => {
        try {
            const rows = await query(
                `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'segmen'`,
                [tableName]
            );
            if (rows.length === 0) {
                await execute(`ALTER TABLE ${tableName} ADD COLUMN segmen ENUM('showroom','grosir') DEFAULT 'showroom'`);
            }
        } catch (_) {}
    };
    await checkAndAddColumn('finance_keuangan');
    await checkAndAddColumn('finance_stok_ikan');
}

export async function GET(req) {
    try {
        await initTables();
        const { searchParams } = new URL(req.url);
        const segmen = searchParams.get('segmen'); // 'showroom' | 'grosir' | null (all)

        let keuanganQuery = 'SELECT * FROM finance_keuangan';
        let stokQuery = 'SELECT * FROM finance_stok_ikan';
        const params = [];
        const paramsStok = [];

        if (segmen && (segmen === 'showroom' || segmen === 'grosir')) {
            keuanganQuery += ' WHERE segmen = ?';
            stokQuery += ' WHERE segmen = ?';
            params.push(segmen);
            paramsStok.push(segmen);
        }

        keuanganQuery += ' ORDER BY tanggal DESC, id DESC';
        stokQuery += ' ORDER BY tanggal DESC, id DESC';

        const keuangan = await query(keuanganQuery, params);
        const stok = await query(stokQuery, paramsStok);
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
        const { type, data, segmen } = body;
        const seg = (segmen === 'grosir') ? 'grosir' : 'showroom';

        if (type === 'pengeluaran') {
            const { tanggal, pengeluaran, harga, keterangan } = data;
            if (!pengeluaran || !harga) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const tgl = tanggal ? new Date(tanggal + 'T12:00:00+07:00') : new Date();
            const result = await execute(
                'INSERT INTO finance_keuangan (tanggal, pengeluaran, harga, pendapatan_kotor, keterangan, segmen) VALUES (?, ?, ?, 0, ?, ?)',
                [tgl, pengeluaran, Number(harga), keterangan || '', seg]
            );
            return NextResponse.json({ id: result.insertId });

        } else if (type === 'pemasukan') {
            const { tanggal, keterangan, pendapatan_kotor } = data;
            if (!keterangan || !pendapatan_kotor) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const tgl = tanggal ? new Date(tanggal + 'T12:00:00+07:00') : new Date();
            const result = await execute(
                'INSERT INTO finance_keuangan (tanggal, pengeluaran, harga, pendapatan_kotor, keterangan, segmen) VALUES (?, NULL, 0, ?, ?, ?)',
                [tgl, Number(pendapatan_kotor), keterangan, seg]
            );
            return NextResponse.json({ id: result.insertId });

        } else if (type === 'stok') {
            const { tanggal, jenis_ikan, jumlah, harga_satuan, omah, online, ekspor, keterangan } = data;
            if (!jenis_ikan || !jumlah) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
            const tgl = tanggal ? new Date(tanggal + 'T12:00:00+07:00') : new Date();
            const result = await execute(
                'INSERT INTO finance_stok_ikan (tanggal, jenis_ikan, jumlah, harga_satuan, omah, online, ekspor, keterangan, segmen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [tgl, jenis_ikan, Number(jumlah), Number(harga_satuan || 0), Number(omah || 0), Number(online || 0), Number(ekspor || 0), keterangan || '', seg]
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
