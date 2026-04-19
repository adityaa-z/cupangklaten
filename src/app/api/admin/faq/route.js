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

        const { data, error } = await supabase.from('faqs').select('*').order('created_at', { ascending: true });
        
        if (error) {
            console.error('Supabase fetching error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json(data || []);
    } catch (err) {
        console.error('API FAQ GET Crash:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, question, answer } = body;

    // Filter input (Whitelist)
    const data = { question, answer };

    let result;
    if (id) {
        result = await supabase.from('faqs').update(data).eq('id', id);
    } else {
        result = await supabase.from('faqs').insert([data]);
    }

    if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
    return NextResponse.json({ success: true, data: result.data });
}

export async function DELETE(request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
