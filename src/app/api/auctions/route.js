import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
    // Auto update status lelang yang sudah lewat end_time tapi masih active
    await query("UPDATE auctions SET status = 'ended' WHERE end_time < NOW() AND status = 'active'");
    
    // Auto active lelang yang start_time nya sudah lewat
    await query("UPDATE auctions SET status = 'active' WHERE start_time <= NOW() AND end_time > NOW() AND status = 'draft'");

    const auctions = await query('SELECT * FROM auctions WHERE status IN ("active", "draft") ORDER BY start_time ASC');
    return NextResponse.json(auctions);
}
