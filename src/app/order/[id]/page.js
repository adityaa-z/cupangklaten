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

    const waAdmin = "6285700846152"; // Sesuai nomor yang sudah ada di source code
    
    // Generate text for WA
    let itemText = items.map(i => `- ${i.category} ${i.variant ? `(${i.variant})` : ''} x${i.quantity} (Kode: ${i.code})`).join('%0A');
    const waText = `Halo Admin Cupang Klaten,%0A%0ASaya sudah melakukan pemesanan di website.%0A%0A*📌 Order ID:* ${order.order_code}%0A*👤 Nama:* ${order.shipping_name}%0A*📦 Ekspedisi:* ${order.courier.toUpperCase()}%0A%0A*Detail Pesanan:*%0A${itemText}%0A%0A*💰 Total Tagihan:* ${formatRupiah(order.total_amount)}%0A%0ABerikut saya lampirkan foto/screenshot BUKTI TRANSFER pembayaran saya. Terima kasih.`;
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

                    <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#111827' }}>Rincian Tagihan</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                            <span>Subtotal Produk</span>
                            <span>{formatRupiah(order.total_amount - order.shipping_cost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4b5563' }}>
                            <span>Ongkos Kirim & Packing ({order.courier.toUpperCase()})</span>
                            <span>{formatRupiah(order.shipping_cost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #d1d5db', fontSize: '1.25rem', fontWeight: 'bold', color: '#ef4444' }}>
                            <span>Total Pembayaran</span>
                            <span>{formatRupiah(order.total_amount)}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ color: '#111827', marginBottom: '1rem' }}>Instruksi Pembayaran</h3>
                        <p style={{ color: '#4b5563', marginBottom: '1rem' }}>Silakan transfer tepat <strong>{formatRupiah(order.total_amount)}</strong> ke salah satu rekening berikut:</p>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <div style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px', flex: '1 1 250px', background: 'white' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/id/thumb/5/55/BNI_logo.svg/2560px-BNI_logo.svg.png" alt="BNI" style={{ height: '30px', marginBottom: '1rem' }} />
                                <h4 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '2px', color: '#111827' }}>0821 234 567</h4>
                                <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>a.n Aditya Cupang Klaten</p>
                            </div>
                            
                            <div style={{ border: '1px solid #e5e7eb', padding: '1.5rem', borderRadius: '12px', flex: '1 1 250px', background: 'white' }}>
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/QRIS_logo.svg/1200px-QRIS_logo.svg.png" alt="QRIS" style={{ height: '30px', marginBottom: '1rem' }} />
                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>Scan QRIS Anda</h4>
                                <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>(Minta QRIS via WA)</p>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h4 style={{ color: '#1e40af', margin: '0 0 0.5rem 0' }}><i className="fas fa-info-circle"></i> Langkah Terakhir: Konfirmasi</h4>
                        <p style={{ color: '#1d4ed8', margin: 0 }}>Setelah transfer, Anda <strong>wajib</strong> mengklik tombol di bawah ini untuk mengirimkan bukti transfer ke WhatsApp admin agar pesanan segera diproses.</p>
                    </div>

                    <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', width: '100%', padding: '1rem', background: '#25d366', color: 'white', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', textDecoration: 'none', transition: 'background 0.3s' }}>
                        <i className="fab fa-whatsapp" style={{ fontSize: '1.3rem', marginRight: '0.5rem' }}></i> Konfirmasi Pembayaran via WA
                    </a>
                </div>
            </div>
            <Footer />
        </>
    );
}
