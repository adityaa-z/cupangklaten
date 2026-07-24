'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, cartTotal, cartCount, clearCart } = useCart();

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        }
    }, [status, router]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Memuat...</div>;
    if (cart.length === 0) return (
        <>
            <Navbar />
            <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Keranjang Kosong</h2>
                <p>Silakan pilih ikan terlebih dahulu.</p>
                <button onClick={() => router.push('/')} className="btn-primary" style={{ marginTop: '20px' }}>Kembali Belanja</button>
            </div>
            <Footer />
        </>
    );

    const grandTotal = cartTotal;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 20px' }}>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827', textAlign: 'center' }}>Konfirmasi Pesanan</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', padding: '0.8rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <span>{item.quantity}x {item.category} {item.variant ? `- ${item.variant}` : ''}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                            <span>Total Harga Ikan ({cartCount})</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>{formatRupiah(cartTotal)}</span>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '2rem' }}>
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(grandTotal)}</span>
                    </div>

                    <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '0.95rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                        <i className="fas fa-info-circle"></i> Alamat pengiriman dan kontak akan otomatis menggunakan data dari akun Anda. Ongkir akan diselesaikan di tahap selanjutnya.
                    </div>

                    <button onClick={handleCheckout} disabled={loading} style={{ width: '100%', padding: '1.2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.3s' }}>
                        {loading ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                    </button>
                </div>

            </div>
            <Footer />
        </>
    );
}
