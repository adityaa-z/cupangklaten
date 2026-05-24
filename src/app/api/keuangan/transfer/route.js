import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.email !== 'zidanp13794@gmail.com') {
        return false;
    }
    return true;
}

export async function POST(request) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { fish_stock_id, lokasi } = body;

        if (!fish_stock_id || !lokasi) {
            return NextResponse.json({ error: 'Data fish_stock_id dan lokasi tujuan wajib diisi.' }, { status: 400 });
        }

        const validLocations = ['Pabrik_Pembesaran', 'Gudang', 'Showroom'];
        if (!validLocations.includes(lokasi)) {
            return NextResponse.json({ error: 'Lokasi tujuan tidak valid.' }, { status: 400 });
        }

        const result = await execute("UPDATE fish_stocks SET lokasi = ? WHERE id = ?", [lokasi, fish_stock_id]);
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Stok ikan tidak ditemukan.' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: `Ikan berhasil ditransfer ke ${lokasi.replace('_', ' ')}.` });
    } catch (err) {
        console.error('API Keuangan Transfer POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
