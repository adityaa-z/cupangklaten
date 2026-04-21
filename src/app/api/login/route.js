import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';

export async function POST(request) {
    try {
        const { username, password } = await request.json();

        const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
            console.error('Login Error: ADMIN_USERNAME or ADMIN_PASSWORD is not defined in environment variables.');
            return NextResponse.json(
                { success: false, message: 'Server configuration error' },
                { status: 500 }
            );
        }

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const response = NextResponse.json({ success: true, message: 'Login successful' });
            setSession(response);
            return response;
        }

        // Penunda (Delay) untuk mencegah Brute Force jika gagal
        await new Promise(resolve => setTimeout(resolve, 1500));

        return NextResponse.json(
            { success: false, message: 'Invalid credentials' },
            { status: 401 }
        );
    } catch (error) {
        console.error('Login Route Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
