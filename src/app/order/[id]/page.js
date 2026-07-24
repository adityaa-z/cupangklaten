'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function OrderInvoicePage({ params }) {
    const { id } = params;
    const { data: session, status } = useSession();
    const router = useRouter();

    const [order, setOrder] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session) {
            fetchOrder();
        }
    }, [status, session, id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            if (res.ok) {
                setOrder(data.order);
                setItems(data.items);
            } else {
                alert(data.error);
                router.push('/');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    if (loading || status === 'loading') {
        return <div style={{ padding: '100px', textAlign: 'center' }}>Memuat Detail Pesanan...</div>;
    }

    if (!order) return null;

    const waAdmin = "6285700846152"; 
    
    // Generate text for WA
    let itemText = items.map(i => `- ${i.category} ${i.variant ? `(${i.variant})` : ''} x${i.quantity} (Kode: ${i.code})`).join('%0A');
    const waText = `Halo Admin Cupang Klaten,%0A%0ASaya sudah melakukan pemesanan di website.%0A%0A*📌 Order ID:* ${order.order_code}%0A*👤 Nama:* ${order.shipping_name}%0A*📍 Alamat:* ${order.shipping_address}%0A%0A*Detail Pesanan Ikan:*%0A${itemText}%0A%0A*💰 Total Harga Ikan:* ${formatRupiah(order.total_amount)}%0A%0AMohon info ketersediaan pengiriman & biaya packing / ongkir, atau link Shopee jika bisa. Terima kasih.`;
    const waLink = `https://wa.me/${waAdmin}?text=${waText}`;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '800px', margin: '100px auto', padding: '0 20px' }}>
                <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <div style={{ color: '#10b981', fontSize: '3rem', marginBottom: '1rem' }}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h1 style={{ color: '#111827', marginBottom: '0.5rem' }}>Pesanan Berhasil Dibuat!</h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem' }}>Order ID: <strong>{order.order_code}</strong></p>

                    <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #fde68a' }}>
                        <strong>Perhatian:</strong> Harga di bawah ini <strong>HANYA UNTUK IKAN</strong> dan belum termasuk biaya packing serta ongkos kirim. Silakan hubungi admin via WhatsApp untuk total keseluruhan atau untuk meminta link checkout via Shopee.
                    </div>

                    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#111827' }}>Rincian Belanja Ikan</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                            <span>Total Harga Ikan</span>
                            <span>{formatRupiah(order.total_amount)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                            <span>Ongkos Kirim & Packing</span>
                            <span>Menyusul</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #d1d5db', fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                            <span>Total (Ikan Saja)</span>
                            <span>{formatRupiah(order.total_amount)}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ color: '#111827', marginBottom: '1rem' }}>Pilihan Pembayaran</h3>
                        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Anda bisa transfer langsung sesuai instruksi WhatsApp (setelah ongkir diinfokan) atau bayar via Shopee.</p>
                        
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

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}><i className="fas fa-info-circle"></i> Langkah Terakhir: Konfirmasi & Ongkir</h4>
                        <p style={{ color: '#1d4ed8', margin: 0, marginBottom: '1rem' }}>Silakan klik tombol WhatsApp di bawah ini untuk <strong>konfirmasi pembayaran ikan</strong>. Untuk pembayaran biaya Ongkir & Packing (Rp 10.000), Anda bisa menggunakan link Shopee di bawah ini.</p>
                        
                        <a href="https://id.shp.ee/zQm8HFez" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', padding: '1rem', background: '#ee4d2d', color: 'white', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', transition: 'background 0.3s', marginBottom: '1rem' }}>
                            <i className="fas fa-shopping-bag" style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}></i> Link Shopee (Khusus Ongkir & Packing)
                        </a>

                        <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', padding: '1rem', background: '#25d366', color: 'white', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', transition: 'background 0.3s' }}>
                            <i className="fab fa-whatsapp" style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}></i> Lanjut ke WhatsApp
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
