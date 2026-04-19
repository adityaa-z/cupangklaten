import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
    const { username, password } = await request.json();

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set an HTTP-only cookie for better security
        const response = NextResponse.json({ success: true, message: 'Login successful' });
        
        response.cookies.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 2, // 2 Jam saja
            path: '/',
        });

        return response;
    }

    return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
    );
}
