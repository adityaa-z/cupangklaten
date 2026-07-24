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

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressDetail, setAddressDetail] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        } else if (session?.user) {
            setName(session.user.name || '');
        }
    }, [status, session, router]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!addressDetail || !phone) {
            alert('Harap lengkapi semua data pengiriman');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shipping_name: name,
                    shipping_phone: phone,
                    shipping_address: addressDetail,
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
            <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 20px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* Form Section */}
                <div style={{ flex: '1 1 600px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Alamat Pengiriman</h2>
                    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nama Penerima</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>No WhatsApp</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Contoh: 08123456789" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Alamat Lengkap (Provinsi, Kota/Kab, Kecamatan, Jalan, RT/RW)</label>
                            <textarea value={addressDetail} onChange={e => setAddressDetail(e.target.value)} required rows="4" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} placeholder="Tuliskan alamat lengkap pengiriman..."></textarea>
                        </div>
                        
                        <div style={{ padding: '1rem', background: '#fef3c7', borderRadius: '8px', color: '#92400e', fontSize: '0.9rem' }}>
                            <i className="fas fa-info-circle"></i> Harga belum termasuk biaya packing & ongkos kirim. Ongkos kirim akan diinfokan via WhatsApp atau bisa checkout via Shopee.
                        </div>

                        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Memproses...' : 'Buat Pesanan'}
                        </button>
                    </form>
                </div>

                {/* Summary Section */}
                <div style={{ flex: '1 1 350px', background: '#f9fafb', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Ringkasan Belanja</h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span>{item.quantity}x {item.category} {item.variant ? `- ${item.variant}` : ''}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Harga Ikan ({cartCount})</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>{formatRupiah(cartTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Biaya Packing</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>Menyusul</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ongkos Kirim</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>
                                Menyusul
                            </span>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                        <span>Total Ikan</span>
                        <span>{formatRupiah(grandTotal)}</span>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
}
