import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    if (session && session.value === 'true') {
        return NextResponse.json({ isLoggedIn: true });
    }

    return NextResponse.json({ isLoggedIn: false });
}
