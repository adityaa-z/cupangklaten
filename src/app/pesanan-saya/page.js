'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const statusSteps = [
    { key: 'pending',   icon: '⏳', label: 'Pesanan Masuk',       desc: 'Pesanan Anda sedang menunggu konfirmasi dari admin.' },
    { key: 'confirmed', icon: '✅', label: 'Dikonfirmasi',         desc: 'Admin sudah mengkonfirmasi pembayaran Anda.' },
    { key: 'packing',   icon: '📦', label: 'Sedang Packing',       desc: 'Ikan Anda sedang dikemas dengan hati-hati.' },
    { key: 'shipped',   icon: '🚚', label: 'Sudah Dikirim',        desc: 'Paket sudah dalam perjalanan ke tujuan Anda.' },
    { key: 'done',      icon: '🎉', label: 'Selesai',              desc: 'Paket sudah diterima. Terima kasih sudah berbelanja!' },
];

const statusIndex = { pending: 0, confirmed: 1, packing: 2, shipped: 3, done: 4, cancelled: -1 };

export default function PesananSayaPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/pesanan-saya');
        } else if (status === 'authenticated') {
            fetchOrders();
        }
    }, [status]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/my-orders');
            const data = await res.json();
            if (res.ok) setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatRupiah = (n) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    if (status === 'loading' || loading) {
        return (
            <>
                <Navbar />
                <div style={{ padding: '150px 20px', textAlign: 'center', minHeight: '60vh' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '2.5rem', color: '#2563eb' }}></i>
                    <p style={{ marginTop: '1rem', color: '#6b7280' }}>Memuat pesanan Anda...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '100px auto 60px', padding: '0 20px', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: '0.5rem', color: '#111827' }}>
                    <i className="fas fa-box-open" style={{ marginRight: '0.75rem', color: '#2563eb' }}></i>
                    Pesanan Saya
                </h1>
                <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Pantau status pengiriman pesanan ikan Anda di sini.</p>

                {orders.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐟</div>
                        <h3 style={{ color: '#374151' }}>Belum ada pesanan</h3>
                        <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Yuk belanja ikan cupang pilihan Anda!</p>
                        <button onClick={() => router.push('/')} style={{ padding: '0.8rem 2rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
                            Lihat Produk
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {orders.map(order => {
                            const currentStep = statusIndex[order.status] ?? 0;
                            const isCancelled = order.status === 'cancelled';
                            const isExpanded = expandedId === order.id;

                            return (
                                <div key={order.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {/* Header */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        style={{ padding: '1.25rem 1.5rem', background: isCancelled ? '#fee2e2' : '#eff6ff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 'bold', color: isCancelled ? '#991b1b' : '#1e40af', fontSize: '1.05rem' }}>
                                                Order: {order.order_code}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.2rem' }}>
                                                {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <span style={{
                                                padding: '0.4rem 0.9rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem',
                                                background: isCancelled ? '#fee2e2' : currentStep >= 3 ? '#ede9fe' : currentStep >= 2 ? '#e0f2fe' : currentStep >= 1 ? '#dcfce7' : '#fef9c3',
                                                color: isCancelled ? '#991b1b' : currentStep >= 3 ? '#5b21b6' : currentStep >= 2 ? '#0369a1' : currentStep >= 1 ? '#166534' : '#854d0e',
                                            }}>
                                                {isCancelled ? '❌ Dibatalkan' : statusSteps[currentStep]?.icon + ' ' + statusSteps[currentStep]?.label}
                                            </span>
                                            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`} style={{ color: '#9ca3af' }}></i>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div style={{ padding: '1.5rem' }}>
                                            {/* Progress Steps */}
                                            {!isCancelled && (
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                                                        {/* progress bar */}
                                                        <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '4px', background: '#e5e7eb', zIndex: 0 }}>
                                                            <div style={{ height: '100%', background: '#2563eb', width: `${Math.min(currentStep / (statusSteps.length - 1) * 100, 100)}%`, transition: 'width 0.5s ease' }}></div>
                                                        </div>
                                                        {statusSteps.map((step, idx) => {
                                                            const done = idx <= currentStep;
                                                            return (
                                                                <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                                                                    <div style={{
                                                                        width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        background: done ? '#2563eb' : '#e5e7eb', fontSize: '1.1rem',
                                                                        boxShadow: done ? '0 0 0 4px #bfdbfe' : 'none', transition: 'all 0.3s',
                                                                    }}>
                                                                        {done ? <i className="fas fa-check" style={{ color: 'white', fontSize: '0.85rem' }}></i> : <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{idx + 1}</span>}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.7rem', color: done ? '#1e40af' : '#9ca3af', marginTop: '0.4rem', textAlign: 'center', fontWeight: done ? 'bold' : 'normal', maxWidth: '60px', lineHeight: 1.3 }}>
                                                                        {step.label}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: '#eff6ff', borderRadius: '8px', color: '#1e40af', fontSize: '0.9rem' }}>
                                                        <strong>{statusSteps[currentStep]?.icon} Status saat ini:</strong> {statusSteps[currentStep]?.desc}
                                                    </div>
                                                </div>
                                            )}

                                            {isCancelled && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', fontWeight: 'bold', textAlign: 'center' }}>
                                                    ❌ Pesanan ini telah dibatalkan. Hubungi admin jika ada pertanyaan.
                                                </div>
                                            )}

                                            {/* No. Resi */}
                                            {order.tracking_number && (
                                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#166534', marginBottom: '0.3rem' }}>🚚 Nomor Resi / Info Pengiriman:</div>
                                                    <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '1px' }}>{order.tracking_number}</div>
                                                </div>
                                            )}

                                            {/* Items */}
                                            <div style={{ marginBottom: '1rem' }}>
                                                <h4 style={{ color: '#374151', marginBottom: '0.75rem' }}>Ikan yang Dipesan:</h4>
                                                {(order.items || []).map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: '#f9fafb', borderRadius: '8px', marginBottom: '0.5rem', color: '#111827' }}>
                                                        <span>{item.quantity}x {item.category} {item.variant ? `(${item.variant})` : ''} — Kode: {item.code}</span>
                                                        <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 'bold', color: '#2563eb', padding: '0.8rem', borderTop: '1px solid #e5e7eb' }}>
                                                <span>Total Ikan</span>
                                                <span>{formatRupiah(order.total_amount)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
}
