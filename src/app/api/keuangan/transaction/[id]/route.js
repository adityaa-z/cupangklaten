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

        const resolvedParams = await params;
        const id = resolvedParams.id;
        if (!id) {
            return NextResponse.json({ error: 'ID transaksi tidak valid' }, { status: 400 });
        }

        const result = await query("DELETE FROM transactions WHERE id = ?", [id]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data transaksi tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Transaksi berhasil dihapus.' });
    } catch (err) {
        console.error('API Keuangan DELETE Transaction Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const body = await request.json();
        
        const { nominal, keterangan } = body;

        if (!id || isNaN(nominal) || nominal < 0) {
            return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
        }

        const result = await query(
            "UPDATE transactions SET nominal = ?, keterangan = ? WHERE id = ?", 
            [nominal, keterangan || null, id]
        );
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data transaksi tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Transaksi berhasil diubah.' });
    } catch (err) {
        console.error('API Keuangan PATCH Transaction Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
