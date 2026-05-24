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
            return NextResponse.json({ error: 'ID ikan tidak valid' }, { status: 400 });
        }

        // We delete the fish stock directly
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

export async function PATCH(request, { params }) {
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;
        const { searchParams } = new URL(request.url);
        const reduce = parseInt(searchParams.get('reduce'), 10);

        if (!id || isNaN(reduce) || reduce <= 0) {
            return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
        }

        const result = await query("UPDATE fish_stocks SET stok_sisa = stok_sisa - ? WHERE id = ? AND stok_sisa >= ?", [reduce, id, reduce]);
        
        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Data stok ikan tidak ditemukan atau stok tidak mencukupi' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Stok ikan berhasil dikurangi.' });
    } catch (err) {
        console.error('API Keuangan PATCH Stock Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
