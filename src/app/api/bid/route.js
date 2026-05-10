import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        
        // Proteksi 1: Harus login dan disetujui
        if (!session || !session.user || session.user.status !== 'approved') {
            return NextResponse.json({ error: 'Akses ditolak. Pastikan Anda sudah login dan akun berstatus Approved.' }, { status: 403 });
        }

        const body = await request.json();
        const { auction_id, amount } = body;
        const userId = session.user.id;

        if (!auction_id || !amount) {
            return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 });
        }

        // Ambil data lelang
        const auctions = await query('SELECT * FROM auctions WHERE id = ?', [auction_id]);
        if (auctions.length === 0) return NextResponse.json({ error: 'Lelang tidak ditemukan.' }, { status: 404 });
        
        const auction = auctions[0];

        // Proteksi 2: Apakah lelang masih berjalan?
        const now = new Date();
        const endTime = new Date(auction.end_time);
        
        if (now > endTime || auction.status === 'ended') {
            // Update status ke ended jika kebetulan belum terupdate
            await query("UPDATE auctions SET status = 'ended' WHERE id = ?", [auction_id]);
            return NextResponse.json({ error: 'Mohon maaf, waktu lelang sudah berakhir.' }, { status: 400 });
        }
        
        if (now < new Date(auction.start_time)) {
            return NextResponse.json({ error: 'Lelang belum dimulai.' }, { status: 400 });
        }

        // Ambil bid tertinggi saat ini
        const maxBids = await query('SELECT MAX(amount) as maxAmount FROM bids WHERE auction_id = ?', [auction_id]);
        const currentMaxBid = maxBids[0]?.maxAmount || 0;

        // Proteksi 3: Validasi jumlah Bid
        let requiredAmount = auction.start_price;
        if (currentMaxBid > 0) {
            requiredAmount = currentMaxBid + auction.min_bid_increment;
        }

        if (amount < requiredAmount) {
            return NextResponse.json({ 
                error: `Bid Anda terlalu rendah. Minimal bid saat ini adalah Rp ${requiredAmount.toLocaleString('id-ID')}` 
            }, { status: 400 });
        }

        // --- SISTEM ANTI-SNIPE ---
        // Jika bid dilakukan di <= 30 detik terakhir, perpanjang waktu lelang selama 2 menit
        const timeLeftMs = endTime.getTime() - now.getTime();
        let newEndTime = null;
        
        if (timeLeftMs <= 30000 && timeLeftMs > 0) { // 30 detik
            // Tambah 2 menit (120000 ms) dari endTime saat ini
            newEndTime = new Date(endTime.getTime() + 120000); 
            // Format waktu MySQL: YYYY-MM-DD HH:MM:SS
            const formattedNewEndTime = newEndTime.toISOString().slice(0, 19).replace('T', ' ');
            
            await query("UPDATE auctions SET end_time = ? WHERE id = ?", [formattedNewEndTime, auction_id]);
        }

        // Masukkan Bid ke Database
        await query(
            'INSERT INTO bids (auction_id, user_id, amount) VALUES (?, ?, ?)',
            [auction_id, userId, amount]
        );

        return NextResponse.json({ 
            success: true, 
            message: 'Bid berhasil masuk!', 
            antiSnipeTriggered: newEndTime !== null,
            newEndTime: newEndTime 
        });

    } catch (error) {
        console.error("Bidding Error:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan sistem internal.' }, { status: 500 });
    }
}
