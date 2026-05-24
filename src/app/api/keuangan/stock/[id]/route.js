import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

export async function DELETE(request, { params }) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;
        if (!id) {
            return NextResponse.json({ error: 'ID ikan tidak valid' }, { status: 400 });
        }

        // We delete the fish stock directly
        // Karena ada FOREIGN KEY ON DELETE SET NULL di tabel transactions, maka aman untuk dihapus.
        const result = await query("DELETE FROM fish_stocks WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data stok ikan tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Data stok ikan berhasil dihapus.' });
    } catch (err) {
        console.error('API Keuangan DELETE Stock Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
