import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'admin_session_v2'; // Changed name to invalidate old sessions
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

if (!ADMIN_SESSION_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_SESSION_SECRET is not defined! System is in insecure state.');
    } else {
        console.warn('ADMIN_SESSION_SECRET is not defined! Using default for development.');
    }
}

const SECRET_TO_USE = ADMIN_SESSION_SECRET || 'dev-only-secret-do-not-use-in-production';

export function getSession(request) {
    // In App Router, we can use request.cookies or cookies() from next/headers
    // For API routes, it's better to use request.cookies
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    return session?.value;
}

export function isValidSession(request) {
    const sessionToken = getSession(request);
    return sessionToken === SECRET_TO_USE;
}

export function setSession(response) {
    response.cookies.set(SESSION_COOKIE_NAME, SECRET_TO_USE, {
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
