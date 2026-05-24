import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
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
    let connection;
    try {
        if (!(await verifyAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const pool = getPool();
        connection = await pool.getConnection();

        await connection.beginTransaction();

        // Delete all transactions and fish stocks
        // Karena kita ingin reset pembukuan dari awal, hapus dua tabel ini
        await connection.execute("DELETE FROM transactions");
        await connection.execute("DELETE FROM fish_stocks");

        // Opsional: Reset auto-increment agar mulai dari 1 lagi
        await connection.execute("ALTER TABLE transactions AUTO_INCREMENT = 1");
        await connection.execute("ALTER TABLE fish_stocks AUTO_INCREMENT = 1");

        await connection.commit();
        connection.release();

        return NextResponse.json({ success: true, message: 'Pembukuan berhasil direset ke awal.' });
    } catch (err) {
        console.error('API Keuangan RESET Error:', err);
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
