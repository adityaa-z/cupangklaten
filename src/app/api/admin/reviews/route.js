import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

function isAuthenticated(request) {
    const session = request.cookies.get('admin_session');
    return session && session.value === 'true';
}

export async function GET() {
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('id', { ascending: false });
    
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, rating, content, img } = body;
    const avatar_char = name.charAt(0).toUpperCase();

    if (id) {
        // Update
        const { error } = await supabase
            .from('reviews')
            .update({ name, rating, content, img, avatar_char })
            .eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
        // Insert
        const { error } = await supabase
            .from('reviews')
            .insert([{ name, rating, content, img, avatar_char }]);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(request) {
    if (!isAuthenticated(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
