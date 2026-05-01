import { NextResponse } from 'next/server';
import { isValidSession } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        if (!isValidSession(request)) {
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

        // Save to public/uploads/produk/ directory
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'produk');
        await mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Return the public URL path
        const publicUrl = `/uploads/produk/${fileName}`;

        return NextResponse.json({ url: publicUrl });
    } catch (err) {
        console.error('Upload API Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
