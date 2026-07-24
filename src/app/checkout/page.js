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
    const [orderCode, setOrderCode] = useState(null);
    const [waLink, setWaLink] = useState('');
    const [savedCart, setSavedCart] = useState([]);
    const [savedTotal, setSavedTotal] = useState(0);

    useEffect(() => {
        if (cart.length > 0 && savedCart.length === 0) {
            setSavedCart(cart);
            setSavedTotal(cartTotal);
        }
    }, [cart]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        }
    }, [status, router]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleCheckout = async (e, goToWa = false) => {
        if (e) e.preventDefault();
        
        if (orderCode) {
            if (goToWa) window.location.href = waLink;
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart: savedCart,
                    shipping_name: '', // Akan diambil otomatis dari DB
                    shipping_phone: '',
                    shipping_address: '',
                    courier: 'wa',
                    shipping_cost: 0, 
                    total_amount: savedTotal
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan');

            // Generate WA Link
            const waAdmin = "6285700846152"; 
            let itemText = savedCart.map(i => `- ${i.category} ${i.variant ? `(${i.variant})` : ''} x${i.quantity} (Kode: ${i.code})`).join('%0A');
            const waText = `Halo Admin Cupang Klaten,%0A%0ASaya sudah melakukan pemesanan di website.%0A%0A*📌 Order ID:* ${data.order_code}%0A%0A*Detail Pesanan Ikan:*%0A${itemText}%0A%0A*💰 Total Harga Ikan:* ${formatRupiah(savedTotal)}%0A%0AMohon info ketersediaan pengiriman & biaya packing / ongkir, atau link Shopee jika bisa. Terima kasih.`;
            const generatedWaLink = `https://wa.me/${waAdmin}?text=${waText}`;

            setOrderCode(data.order_code);
            setWaLink(generatedWaLink);
            clearCart();
            
            if (goToWa) {
                window.location.href = generatedWaLink;
            } else {
                alert('Pesanan berhasil dibuat! Order ID Anda: ' + data.order_code + '\nSilakan lanjutkan ke WhatsApp untuk konfirmasi.');
            }

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Memuat...</div>;
    
    if (savedCart.length === 0) return (
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

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 20px' }}>

                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Tagihan Pembayaran</h2>

                    <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #fde68a' }}>
                        <strong>Perhatian:</strong> Harga di bawah ini <strong>HANYA UNTUK IKAN</strong> dan belum termasuk biaya packing serta ongkos kirim. Silakan hubungi admin via WhatsApp untuk total keseluruhan atau untuk meminta link checkout via Shopee.
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', textAlign: 'left', color: '#111827' }}>
                        {savedCart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', padding: '0.8rem', background: '#f9fafb', borderRadius: '8px' }}>
                                <span>{item.quantity}x {item.category} {item.variant ? `- ${item.variant}` : ''}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '2rem' }}>
                        <span>Total Ikan</span>
                        <span>{formatRupiah(savedTotal)}</span>
                    </div>

                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <h3 style={{ color: '#111827', marginBottom: '1rem', textAlign: 'center' }}>Pilihan Pembayaran</h3>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px', flex: '1 1 250px', background: 'white' }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', marginBottom: '1rem' }}>SeaBank / DANA</h4>
                                <p style={{ color: '#111827', margin: '0', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>SeaBank: 901709292959</p>
                                <p style={{ color: '#111827', margin: '0.5rem 0 0 0', fontSize: '1.1rem', fontWeight: 'bold', letterSpacing: '1px' }}>DANA: 085700846152</p>
                                <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>a.n Aditya Bintang Zidan Pratama</p>
                            </div>
                            
                            <div style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px', flex: '1 1 250px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#111827', marginBottom: '1rem' }}>Scan QRIS (Cupang Depo)</h4>
                                <img src="/qris.jpeg" alt="QRIS Cupang Depo" style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                        <h4 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}><i className="fas fa-info-circle"></i> Langkah Terakhir: Konfirmasi & Ongkir</h4>
                        <p style={{ color: '#1d4ed8', margin: 0, marginBottom: '1rem' }}>Silakan klik tombol WhatsApp di bawah ini untuk <strong>membuat pesanan dan konfirmasi pembayaran ikan</strong>. Untuk pembayaran biaya Ongkir & Packing (Rp 10.000), Anda bisa menggunakan link Shopee di bawah ini.</p>
                        
                        <a href="https://id.shp.ee/zQm8HFez" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', padding: '1rem', background: '#ee4d2d', color: 'white', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', transition: 'background 0.3s', marginBottom: '1rem', textAlign: 'center' }}>
                            <i className="fas fa-shopping-bag" style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}></i> Link Shopee (Khusus Ongkir & Packing)
                        </a>

                        {orderCode && (
                            <div style={{ marginBottom: '1rem', padding: '0.8rem', background: '#dcfce7', color: '#166534', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #bbf7d0' }}>
                                ✅ Pesanan Dibuat! Order ID: {orderCode}
                            </div>
                        )}

                        <button onClick={(e) => handleCheckout(e, false)} disabled={loading || orderCode} style={{ width: '100%', padding: '1rem', background: orderCode ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading || orderCode ? 'not-allowed' : 'pointer', transition: 'background 0.3s', textAlign: 'center', marginBottom: '1rem' }}>
                            {loading ? 'Memproses Pesanan...' : orderCode ? 'Pesanan Sudah Dibuat' : '1. Buat Pesanan Sekarang'}
                        </button>

                        <button onClick={(e) => handleCheckout(e, true)} style={{ width: '100%', padding: '1rem', background: '#25d366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.3s', textAlign: 'center' }}>
                            <i className="fab fa-whatsapp" style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}></i> 2. Lanjut ke WhatsApp
                        </button>
                    </div>

                </div>

            </div>
            <Footer />
        </>
    );
}
