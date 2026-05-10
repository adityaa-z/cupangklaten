import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json();
        const { name, phone, address } = body;

        await query(
            'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
            [name, phone, address, userId]
        );

        return NextResponse.json({ success: true, message: 'Profil berhasil diperbarui' });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
    }
}
