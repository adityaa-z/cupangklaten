import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session_v2'; // Changed name to invalidate old sessions
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'cupang-klaten-fallback-secret-2024';

export function getSession(request) {
    // In App Router, we can use request.cookies or cookies() from next/headers
    // For API routes, it's better to use request.cookies
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    return session?.value;
}

export function isValidSession(request) {
    const sessionToken = getSession(request);
    // Secure comparison (simple for now, but better than "true")
    return sessionToken === ADMIN_SESSION_SECRET;
}

export function setSession(response) {
    response.cookies.set(SESSION_COOKIE_NAME, ADMIN_SESSION_SECRET, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 Hours
        path: '/',
    });
}

export function clearSession(response) {
    response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
    });
}
