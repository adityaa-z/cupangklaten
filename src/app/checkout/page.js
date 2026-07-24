'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, cartTotal, clearCart } = useCart();
    
    const [loading, setLoading] = useState(true);
    const hasSubmitted = useRef(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        } else if (status === 'authenticated') {
            if (cart.length === 0) {
                setLoading(false);
            } else if (!hasSubmitted.current) {
                hasSubmitted.current = true;
                handleCheckout();
            }
        }
    }, [status, router, cart]);

    const handleCheckout = async () => {
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shipping_name: '', // Akan diambil otomatis dari DB
                    shipping_phone: '', // Akan diambil otomatis dari DB
                    shipping_address: '', // Akan diambil otomatis dari DB
                    courier: 'wa',
                    shipping_cost: 0, 
                    total_amount: cartTotal
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan');

            clearCart();
            router.push(`/order/${data.order_id}`);
        } catch (err) {
            alert(err.message);
            setLoading(false);
            hasSubmitted.current = false;
        }
    };

    if (status === 'loading' || loading) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '60vh' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#2563eb', marginBottom: '1rem' }}></i>
                    <h2>Memproses Pesanan Anda...</h2>
                    <p>Mohon tunggu sebentar, kami sedang menyiapkan halaman tagihan.</p>
                </div>
                <Footer />
            </>
        );
    }

    if (cart.length === 0) return (
        <>
            <Navbar />
            <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Keranjang Kosong</h2>
                <p>Silakan pilih ikan terlebih dahulu.</p>
                <button onClick={() => router.push('/')} style={{ marginTop: '20px', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Kembali Belanja</button>
            </div>
            <Footer />
        </>
    );

    return null;
}
