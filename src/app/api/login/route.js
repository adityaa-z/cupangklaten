import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';

export async function POST(request) {
    const { username, password } = await request.json();

    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

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
}
