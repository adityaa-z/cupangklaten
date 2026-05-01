import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { slug } = await params;
        
        // Join the path components
        const filePath = path.join(process.cwd(), 'uploads', ...slug);
        
        // Read the file
        const fileBuffer = await readFile(filePath);
        
        // Determine content type based on extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';
        else if (ext === '.mp4') contentType = 'video/mp4';
        
        // Return the file
        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (err) {
        console.error('File serve error:', err);
        return new NextResponse('File not found', { status: 404 });
    }
}
