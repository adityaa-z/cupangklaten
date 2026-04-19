import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
);

// Helper function to check session
async function isAuthenticated() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    return session && session.value === 'true';
}

export async function GET() {
    try {
        if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
            console.error('Supabase env variables are missing!');
            return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
        }

        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        
        if (error) {
            console.error('Supabase fetching error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json(data || []);
    } catch (err) {
        console.error('API Products GET Crash:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...inputData } = body;

    // Filter hanya kolom yang diizinkan (Whitelist)
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
        // Update
        result = await supabase.from('products').update(data).eq('id', id);
    } else {
        // Insert
        result = await supabase.from('products').insert([data]);
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: result.data });
}

export async function DELETE(request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
