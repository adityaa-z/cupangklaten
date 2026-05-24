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
    return rows[0] || null;
}

export async function processAndCleanUpClaim(code, action) {
    try {
        const claim = await getClaimByCode(code);
        if (!claim) return { success: false, error: 'Voucher tidak ditemukan' };
        if (claim.status !== 'pending') return { success: false, error: `Voucher ini sudah ${claim.status}` };

        if (action === 'approve') {
            // Find stock 5k
            const stocks = await query('SELECT * FROM fish_stock WHERE category = "5k" AND remaining_stock > 0 LIMIT 1');
            if (stocks.length === 0) {
                return { success: false, error: 'Stok ikan 5k sedang kosong' };
            }
            const stock = stocks[0];

            // Potong stok
            await execute('UPDATE fish_stock SET remaining_stock = remaining_stock - 1 WHERE id = ?', [stock.id]);

            // Catat transaksi
            const txId = generateId();
            await execute(`
                INSERT INTO transactions (id, type, amount, cogs, profit, description, fish_id)
                VALUES (?, 'masuk', 0, 2000, -2000, ?, ?)
            `, [txId, `Claim Voucher Google Maps (${claim.maps_name})`, stock.id]);

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
    return await query(`
        SELECT * FROM general_promos 
        WHERE is_active = true AND end_date >= NOW()
        ORDER BY start_date ASC
    `);
}

export async function getAllGeneralPromos() {
    return await query('SELECT * FROM general_promos ORDER BY created_at DESC');
}

export async function toggleGeneralPromoStatus(id, isActive) {
    try {
        await execute('UPDATE general_promos SET is_active = ? WHERE id = ?', [isActive, id]);
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
