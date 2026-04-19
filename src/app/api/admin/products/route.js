import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Gunakan Service Role Key (kunci sakti) — hanya bisa diakses di server
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

function isAuthenticated(request) {
    const session = request.cookies.get('admin_session');
    return session && session.value === 'true';
}

export async function GET(request) {
    try {
        if (!isAuthenticated(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur di Environment Variables' }, { status: 500 });
        }

        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data || []);
    } catch (err) {
        console.error('API Products GET Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        if (!isAuthenticated(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur' }, { status: 500 });
        }

        const body = await request.json();
        const { id, ...inputData } = body;

        const allowedFields = [
            'code', 'category', 'variant', 'gender', 'age', 'size',
            'stock', 'price', 'shopee', 'img', 'is_video',
            'is_available', 'is_pinned', 'is_archived', 'archived_at', 'sold_at'
        ];

        const data = {};
        allowedFields.forEach(field => {
            if (inputData[field] !== undefined) data[field] = inputData[field];
        });

        let result;
        if (id) {
            result = await supabase.from('products').update(data).eq('id', id);
        } else {
            result = await supabase.from('products').insert([data]);
        }

        if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
        return NextResponse.json({ success: true, data: result.data });
    } catch (err) {
        console.error('API Products POST Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        if (!isAuthenticated(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY belum diatur' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Products DELETE Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
