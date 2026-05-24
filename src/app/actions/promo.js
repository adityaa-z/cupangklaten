'use server';

import { query, execute } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

// Helper for generating uuid-like string
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// ==========================================
// VOUCHER SETTINGS
// ==========================================
export async function getPromoSettings() {
    const rows = await query('SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ("PROMO_ACTIVE", "PROMO_DAILY_LIMIT")');
    const settings = {
        PROMO_ACTIVE: 'true',
        PROMO_DAILY_LIMIT: '10'
    };
    rows.forEach(r => {
        settings[r.setting_key] = r.setting_value;
    });
    return settings;
}

export async function updatePromoSettings(isActive, limit) {
    await execute('UPDATE system_settings SET setting_value = ? WHERE setting_key = "PROMO_ACTIVE"', [String(isActive)]);
    await execute('UPDATE system_settings SET setting_value = ? WHERE setting_key = "PROMO_DAILY_LIMIT"', [String(limit)]);
    return { success: true };
}

// ==========================================
// VOUCHER CLAIMS
// ==========================================
export async function submitClaim(formData) {
    try {
        const mapsName = formData.get('mapsName');
        const whatsappNumber = formData.get('whatsappNumber');
        const screenshot = formData.get('screenshot');

        if (!mapsName || !whatsappNumber || !screenshot) {
            return { success: false, error: 'Semua kolom harus diisi' };
        }

        const settings = await getPromoSettings();
        if (settings.PROMO_ACTIVE !== 'true') {
            return { success: false, error: 'Promo saat ini sedang tidak aktif' };
        }

        // Check daily limit
        const limit = parseInt(settings.PROMO_DAILY_LIMIT, 10) || 10;
        const todayRows = await query(`
            SELECT COUNT(*) as count FROM promo_claims 
            WHERE DATE(created_at) = CURDATE()
        `);
        if (todayRows[0].count >= limit) {
            return { success: false, error: 'Kuota promo hari ini sudah habis. Silakan coba besok.' };
        }

        // Check if number already claimed today
        const userRows = await query(`
            SELECT COUNT(*) as count FROM promo_claims 
            WHERE whatsapp_number = ? AND DATE(created_at) = CURDATE()
        `, [whatsappNumber]);
        
        if (userRows[0].count > 0) {
            return { success: false, error: 'Nomor ini sudah melakukan claim hari ini.' };
        }

        // Save File
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'promo');
        await fs.mkdir(uploadDir, { recursive: true });

        const ext = path.extname(screenshot.name) || '.jpg';
        const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}${ext}`;
        const filePath = path.join(uploadDir, fileName);
        
        const arrayBuffer = await screenshot.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(filePath, buffer);

        const imagePath = `/uploads/promo/${fileName}`;
        const claimCode = `VOUCHER-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const id = generateId();

        await execute(`
            INSERT INTO promo_claims (id, claim_code, maps_name, whatsapp_number, image_path, status)
            VALUES (?, ?, ?, ?, ?, 'pending')
        `, [id, claimCode, mapsName, whatsappNumber, imagePath]);

        return { success: true, claimCode };
    } catch (e) {
        console.error('submitClaim error:', e);
        return { success: false, error: 'Terjadi kesalahan sistem' };
    }
}

export async function getClaimByCode(code) {
    const rows = await query('SELECT * FROM promo_claims WHERE claim_code = ? LIMIT 1', [code]);
    const claim = rows[0] || null;
    if (!claim) return null;

    // Cek kedaluwarsa: voucher hangus jika sudah lebih dari 2 hari
    const createdAt = new Date(claim.created_at);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    claim.is_expired = diffDays > 2;
    claim.created_at = claim.created_at ? claim.created_at.toISOString() : null;
    return claim;
}

export async function processAndCleanUpClaim(code, action) {
    try {
        const claim = await getClaimByCode(code);
        if (!claim) return { success: false, error: 'Voucher tidak ditemukan' };
        if (claim.is_expired) return { success: false, error: 'Voucher sudah hangus (lebih dari 2 hari)' };
        if (claim.status !== 'pending') return { success: false, error: `Voucher ini sudah ${claim.status}` };

        if (action === 'approve') {
            // Potong stok produk (jika ada produk 5k atau serupa)
            try {
                const stocks = await query('SELECT * FROM products WHERE (category = "5k" OR price <= 5000) AND stock > 0 LIMIT 1');
                if (stocks.length > 0) {
                    await execute('UPDATE products SET stock = stock - 1 WHERE id = ?', [stocks[0].id]);
                }
            } catch(err) {
                console.error("Gagal update stok produk", err);
            }

            // Catat transaksi dengan fish_stock_id null karena gratis
            await execute(`
                INSERT INTO transactions (tanggal, category_id, fish_stock_id, nominal, hpp_total, keterangan)
                VALUES (CURDATE(), 1, NULL, 0, 2000, ?)
            `, [`Claim Voucher Google Maps (${claim.maps_name})`]);

            await execute('UPDATE promo_claims SET status = "claimed" WHERE claim_code = ?', [code]);
        } else {
            await execute('UPDATE promo_claims SET status = "rejected" WHERE claim_code = ?', [code]);
        }

        // Delete image to save space
        if (claim.image_path) {
            try {
                const absolutePath = path.join(process.cwd(), 'public', claim.image_path);
                await fs.unlink(absolutePath);
                // Update image_path to null to show it was deleted
                await execute('UPDATE promo_claims SET image_path = NULL WHERE claim_code = ?', [code]);
            } catch (fsErr) {
                console.error('Failed to delete image:', fsErr);
            }
        }

        return { success: true };
    } catch (e) {
        console.error('processAndCleanUpClaim error:', e);
        return { success: false, error: 'Gagal memproses voucher' };
    }
}

export async function deleteClaimImage(claimCode) {
    try {
        const rows = await query('SELECT image_path FROM promo_claims WHERE claim_code = ? LIMIT 1', [claimCode]);
        if (!rows[0] || !rows[0].image_path) return { success: false, error: 'Tidak ada foto untuk dihapus' };
        
        const absolutePath = path.join(process.cwd(), 'public', rows[0].image_path);
        try {
            await fs.unlink(absolutePath);
        } catch (e) {
            // File mungkin sudah dihapus, tetap lanjutkan
        }
        await execute('UPDATE promo_claims SET image_path = NULL WHERE claim_code = ?', [claimCode]);
        return { success: true };
    } catch (e) {
        console.error('deleteClaimImage error:', e);
        return { success: false, error: 'Gagal menghapus foto' };
    }
}

// ==========================================
// GENERAL PROMOS
// ==========================================
export async function createGeneralPromo(data) {
    try {
        const id = generateId();
        await execute(`
            INSERT INTO general_promos (id, title, description, target_category, price_or_discount, start_date, end_date, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id, 
            data.title, 
            data.description, 
            data.targetCategory, 
            data.priceOrDiscount, 
            new Date(data.startDate), 
            new Date(data.endDate), 
            true
        ]);
        return { success: true };
    } catch (e) {
        console.error('createGeneralPromo error:', e);
        return { success: false, error: 'Gagal membuat promo' };
    }
}

export async function getActiveGeneralPromos() {
    const rows = await query(`
        SELECT * FROM general_promos 
        WHERE is_active = 1 AND end_date >= NOW()
        ORDER BY start_date ASC
    `);
    return rows.map(r => ({
        ...r,
        start_date: r.start_date ? r.start_date.toISOString() : null,
        end_date: r.end_date ? r.end_date.toISOString() : null,
        created_at: r.created_at ? r.created_at.toISOString() : null,
        is_active: true
    }));
}

export async function getAllGeneralPromos() {
    const rows = await query('SELECT * FROM general_promos ORDER BY created_at DESC');
    return rows.map(r => ({
        ...r,
        start_date: r.start_date ? r.start_date.toISOString() : null,
        end_date: r.end_date ? r.end_date.toISOString() : null,
        created_at: r.created_at ? r.created_at.toISOString() : null,
        is_active: !!(r.is_active === 1 || (r.is_active && r.is_active[0] === 1) || r.is_active === true)
    }));
}

export async function toggleGeneralPromoStatus(id, isActive) {
    try {
        const val = isActive ? 1 : 0;
        await execute('UPDATE general_promos SET is_active = ? WHERE id = ?', [val, id]);
        return { success: true };
    } catch (e) {
        console.error('toggleGeneralPromoStatus error:', e);
        return { success: false, error: 'Gagal merubah status' };
    }
}

export async function deleteGeneralPromo(id) {
    try {
        await execute('DELETE FROM general_promos WHERE id = ?', [id]);
        return { success: true };
    } catch (e) {
        console.error('deleteGeneralPromo error:', e);
        return { success: false, error: 'Gagal menghapus promo' };
    }
}

export async function getAllClaims() {
    const rows = await query('SELECT * FROM promo_claims ORDER BY created_at DESC');
    return rows;
}

export async function getPromoStats() {
    const settings = await getPromoSettings();
    const limit = parseInt(settings.PROMO_DAILY_LIMIT, 10) || 10;
    
    const todayRows = await query(`
        SELECT COUNT(*) as count FROM promo_claims 
        WHERE DATE(created_at) = CURDATE()
    `);
    const claimedToday = todayRows[0].count;
    
    return {
        limit,
        claimedToday,
        remainingLimit: Math.max(0, limit - claimedToday)
    };
}
