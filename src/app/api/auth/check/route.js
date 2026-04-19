import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const sessionCookie = request.cookies.get('admin_session');

        if (sessionCookie && sessionCookie.value === 'true') {
            return NextResponse.json({ isLoggedIn: true });
        }

        return NextResponse.json({ isLoggedIn: false });
    } catch (err) {
        console.error('Auth Check Error:', err);
        return NextResponse.json({ isLoggedIn: false });
    }
}
