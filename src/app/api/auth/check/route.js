import { NextResponse } from 'next/server';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        if (isValidSession(request)) {
            return NextResponse.json({ isLoggedIn: true });
        }

        return NextResponse.json({ isLoggedIn: false });
    } catch (err) {
        console.error('Auth Check Error:', err);
        return NextResponse.json({ isLoggedIn: false });
    }
}
