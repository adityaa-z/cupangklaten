import { query, execute } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request) {
    try {
        const { claimCode } = await request.json();
        if (!claimCode) {
            return Response.json({ success: false, error: 'Kode tidak valid' }, { status: 400 });
        }

        const rows = await query('SELECT image_path FROM promo_claims WHERE claim_code = ? LIMIT 1', [claimCode]);
        if (!rows[0]) {
            return Response.json({ success: false, error: 'Klaim tidak ditemukan' }, { status: 404 });
        }
        if (!rows[0].image_path) {
            return Response.json({ success: false, error: 'Tidak ada foto untuk dihapus' }, { status: 400 });
        }

        // Hapus file fisik dari server
        const imagePath = rows[0].image_path;
        // Hapus leading slash agar path.join benar
        const relPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const absolutePath = path.join(process.cwd(), 'public', relPath);
        
        try {
            await fs.unlink(absolutePath);
        } catch (e) {
            // File mungkin sudah tidak ada di disk, tetap lanjutkan hapus dari DB
            console.warn('File tidak ditemukan di disk:', absolutePath);
        }

        await execute('UPDATE promo_claims SET image_path = NULL WHERE claim_code = ?', [claimCode]);
        return Response.json({ success: true });
    } catch (e) {
        console.error('delete-image API error:', e);
        return Response.json({ success: false, error: e.message }, { status: 500 });
    }
}
