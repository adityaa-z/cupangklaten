import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
);

function isAuthenticated(request) {
    const session = request.cookies.get('admin_session');
    return session && session.value === 'true';
}

export async function POST(request) {
    try {
        if (!isAuthenticated(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `produk/${fileName}`;

        // Upload to Supabase Storage Bucket named 'produk'
        const { data, error } = await supabase.storage
            .from('produk')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            console.error('Storage error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('produk')
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
    } catch (err) {
        console.error('Upload API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
