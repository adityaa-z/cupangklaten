'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect back to main admin dashboard
        router.replace('/admin');
    }, [router]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <p>Redirecting to Dashboard...</p>
        </div>
    );
}
