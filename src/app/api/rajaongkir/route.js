import { NextResponse } from 'next/server';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || ''; 
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const provinceId = searchParams.get('province');

    if (!RAJAONGKIR_API_KEY) {
        return NextResponse.json({ error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di .env' }, { status: 500 });
    }

    try {
        if (type === 'province') {
            const response = await fetch(`${BASE_URL}/destination/province`, {
                headers: { 'key': RAJAONGKIR_API_KEY }
            });
            const data = await response.json();
            return NextResponse.json(data.data || []);
        }

        if (type === 'city') {
            if (!provinceId) return NextResponse.json({ error: 'Province ID required' }, { status: 400 });
            const response = await fetch(`${BASE_URL}/destination/city/${provinceId}`, {
                headers: { 'key': RAJAONGKIR_API_KEY }
            });
            const data = await response.json();
            return NextResponse.json(data.data || []);
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    if (!RAJAONGKIR_API_KEY) {
        return NextResponse.json({ error: 'RAJAONGKIR_API_KEY belum dikonfigurasi di .env' }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { destination, weight, courier } = body;
        const origin = '542'; // ID Kota Klaten di Komerce

        if (!destination || !weight || !courier) {
            return NextResponse.json({ error: 'Incomplete parameters' }, { status: 400 });
        }

        const response = await fetch(`${BASE_URL}/calculate/domestic-cost`, {
            method: 'POST',
            headers: {
                'key': RAJAONGKIR_API_KEY,
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                origin,
                destination,
                weight: weight.toString(), 
                courier
            })
        });

        const data = await response.json();
        if (data.meta && data.meta.status === 'success') {
            return NextResponse.json(data.data);
        } else {
            return NextResponse.json({ error: data.meta?.message || 'Gagal menghitung ongkir' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
