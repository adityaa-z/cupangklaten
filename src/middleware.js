import { NextResponse } from 'next/server';
import { isValidSession } from './lib/auth';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Protect /api/admin/*
    if (pathname.startsWith('/api/admin')) {
        if (!isValidSession(request)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
