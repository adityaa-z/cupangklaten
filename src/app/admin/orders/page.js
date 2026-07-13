'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user.email !== 'zidanp13794@gmail.com')) {
            router.push('/');
        } else if (session) {
            fetchOrders();
        }
    }, [status, session]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data);
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, status: newStatus })
            });
            if (res.ok) {
                fetchOrders();
            } else {
                alert('Gagal update status');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateTracking = async (orderId, currentResi) => {
        const resi = prompt('Masukkan Nomor Resi:', currentResi || '');
        if (resi === null) return;
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: orderId, tracking_number: resi })
            });
            if (res.ok) {
                fetchOrders();
            } else {
                alert('Gagal update resi');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    if (loading || status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Memuat...</div>;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 20px', minHeight: '60vh' }}>
                <h1 style={{ marginBottom: '2rem' }}>Manajemen Pesanan (In-App Checkout)</h1>
                
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '1rem' }}>Order ID</th>
                                <th style={{ padding: '1rem' }}>Pelanggan</th>
                                <th style={{ padding: '1rem' }}>Total Bayar</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Resi</th>
                                <th style={{ padding: '1rem' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Belum ada pesanan masuk.</td></tr>
                            ) : orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <strong>{order.order_code}</strong><br/>
                                        <small style={{ color: '#6b7280' }}>{new Date(order.created_at).toLocaleString('id-ID')}</small>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {order.shipping_name}<br/>
                                        <a href={`https://wa.me/${order.shipping_phone}`} target="_blank" style={{ color: '#25d366', textDecoration: 'none' }}><i className="fab fa-whatsapp"></i> {order.shipping_phone}</a>
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem', maxWidth: '200px' }}>{order.shipping_address} ({order.courier.toUpperCase()})</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                                        {formatRupiah(order.total_amount)}
                                        <div style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'normal' }}>Ongkir: {formatRupiah(order.shipping_cost)}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem', borderRadius: '8px', border: '1px solid #d1d5db',
                                                background: order.status === 'pending' ? '#fef08a' : order.status === 'paid' ? '#bbf7d0' : order.status === 'shipped' ? '#bfdbfe' : '#fecaca',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            <option value="pending">⏳ Pending</option>
                                            <option value="paid">✅ Lunas (Paid)</option>
                                            <option value="shipped">🚚 Dikirim</option>
                                            <option value="cancelled">❌ Batal</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {order.tracking_number ? (
                                            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{order.tracking_number}</span>
                                        ) : <span style={{ color: '#9ca3af' }}>Belum ada resi</span>}
                                        <br/>
                                        <button onClick={() => updateTracking(order.id, order.tracking_number)} style={{ marginTop: '0.5rem', background: 'none', border: '1px solid #d1d5db', padding: '0.2rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                                            <i className="fas fa-edit"></i> Update Resi
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <details style={{ cursor: 'pointer', color: '#4b5563', fontSize: '0.9rem' }}>
                                            <summary style={{ outline: 'none' }}>Lihat Ikan</summary>
                                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', marginBottom: 0 }}>
                                                {order.items.map(item => (
                                                    <li key={item.id}>{item.quantity}x {item.category} ({item.code})</li>
                                                ))}
                                            </ul>
                                        </details>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </>
    );
}
