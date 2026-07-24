'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const STATUS_OPTIONS = [
    { value: 'pending',   label: '⏳ Menunggu Konfirmasi', bg: '#fef9c3', color: '#854d0e' },
    { value: 'confirmed', label: '✅ Dikonfirmasi',         bg: '#dcfce7', color: '#166534' },
    { value: 'packing',   label: '📦 Sedang Packing',       bg: '#e0f2fe', color: '#0369a1' },
    { value: 'shipped',   label: '🚚 Sudah Dikirim',        bg: '#ede9fe', color: '#5b21b6' },
    { value: 'done',      label: '🎉 Selesai',              bg: '#f0fdf4', color: '#15803d' },
    { value: 'cancelled', label: '❌ Dibatalkan',           bg: '#fee2e2', color: '#991b1b' },
];

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resiModal, setResiModal] = useState(null);
    const [editModal, setEditModal] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated' || (session && session.user.email !== 'zidanp13794@gmail.com')) {
            router.push('/');
        } else if (session) {
            fetchOrders();
        }
    }, [status, session]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (res.ok) setOrders(data);
            else alert('Error: ' + data.error);
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
            const data = await res.json();
            if (res.ok) fetchOrders();
            else alert('Gagal update status: ' + (data.error || ''));
        } catch (err) {
            console.error(err);
            alert('Error jaringan');
        }
    };

    const saveResi = async () => {
        if (!resiModal?.value?.trim()) { alert('Mohon isi terlebih dahulu.'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: resiModal.orderId, tracking_number: resiModal.value.trim() })
            });
            if (res.ok) { fetchOrders(); setResiModal(null); }
            else alert('Gagal menyimpan resi.');
        } finally {
            setSaving(false);
        }
    };

    const saveEdit = async () => {
        if (!editModal) return;
        setSaving(true);
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order_id: editModal.id, status: editModal.status, tracking_number: editModal.tracking_number })
            });
            if (res.ok) { fetchOrders(); setEditModal(null); }
            else { const d = await res.json(); alert('Gagal: ' + (d.error || '')); }
        } finally {
            setSaving(false);
        }
    };

    const deleteOrder = async (orderId, orderCode) => {
        if (!confirm(`Yakin hapus pesanan ${orderCode}? Tindakan ini tidak bisa dibatalkan.`)) return;
        try {
            const res = await fetch(`/api/admin/orders?id=${orderId}`, { method: 'DELETE' });
            if (res.ok) fetchOrders();
            else alert('Gagal menghapus pesanan.');
        } catch (err) {
            console.error(err);
        }
    };

    const formatRupiah = (n) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

    if (loading || status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i><p>Memuat pesanan...</p></div>;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '900px', margin: '100px auto 60px', padding: '0 20px', minHeight: '60vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h1 style={{ margin: 0, color: '#111827' }}>
                        <i className="fas fa-shopping-cart" style={{ color: '#2563eb', marginRight: '0.75rem' }}></i>
                        Manajemen Pesanan
                    </h1>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        {orders.length} Pesanan
                    </span>
                </div>

                {orders.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
                        <h3 style={{ color: '#374151' }}>Belum ada pesanan masuk</h3>
                        <p style={{ color: '#9ca3af' }}>Pesanan dari checkout website akan muncul di sini.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {orders.map(order => {
                            const st = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0];
                            return (
                                <div key={order.id} style={{ background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                                    {/* Header baris atas */}
                                    <div style={{ padding: '1rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '1rem' }}>{order.order_code}</span>
                                            <span style={{ marginLeft: '0.75rem', fontSize: '0.8rem', color: '#9ca3af' }}>
                                                {new Date(order.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ padding: '0.3rem 0.9rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.8rem', background: st.bg, color: st.color }}>
                                                {st.label}
                                            </span>
                                            {/* Tombol Edit & Hapus */}
                                            <button
                                                onClick={() => setEditModal({ id: order.id, status: order.status, tracking_number: order.tracking_number || '' })}
                                                title="Edit Pesanan"
                                                style={{ padding: '0.35rem 0.7rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-edit"></i> Edit
                                            </button>
                                            <button
                                                onClick={() => deleteOrder(order.id, order.order_code)}
                                                title="Hapus Pesanan"
                                                style={{ padding: '0.35rem 0.7rem', background: '#fff0f0', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold', fontSize: '0.8rem' }}
                                            >
                                                <i className="fas fa-trash"></i> Hapus
                                            </button>
                                        </div>
                                    </div>

                                    {/* Isi kartu */}
                                    <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                        {/* Pelanggan */}
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Pelanggan</div>
                                            <div style={{ fontWeight: '600', color: '#111827' }}>{order.shipping_name || '-'}</div>
                                            {order.shipping_phone && (
                                                <a href={`https://wa.me/${order.shipping_phone?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                                                    <i className="fab fa-whatsapp"></i> {order.shipping_phone}
                                                </a>
                                            )}
                                        </div>

                                        {/* Ikan dipesan */}
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Ikan Dipesan</div>
                                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#374151', fontSize: '0.9rem' }}>
                                                {(order.items || []).map(item => (
                                                    <li key={item.id}>{item.quantity}x {item.category} ({item.code})</li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Total */}
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Total Ikan</div>
                                            <div style={{ fontWeight: 'bold', color: '#059669', fontSize: '1.1rem' }}>{formatRupiah(order.total_amount)}</div>
                                        </div>

                                        {/* Resi */}
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Resi / Shopee</div>
                                            <div style={{ fontSize: '0.85rem', color: '#374151', wordBreak: 'break-all', marginBottom: '0.4rem' }}>
                                                {order.tracking_number
                                                    ? order.tracking_number.startsWith('http')
                                                        ? <a href={order.tracking_number} target="_blank" rel="noreferrer" style={{ color: '#ee4d2d', fontWeight: 'bold' }}><i className="fas fa-shopping-bag"></i> Link Shopee</a>
                                                        : <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{order.tracking_number}</span>
                                                    : <span style={{ color: '#9ca3af' }}>Belum diisi</span>
                                                }
                                            </div>
                                            <button
                                                onClick={() => setResiModal({ orderId: order.id, type: order.tracking_number?.startsWith('http') ? 'shopee' : 'resi', value: order.tracking_number || '' })}
                                                style={{ fontSize: '0.75rem', padding: '0.3rem 0.7rem', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#374151' }}
                                            >
                                                <i className="fas fa-edit"></i> Isi Resi / Shopee
                                            </button>
                                        </div>
                                    </div>

                                    {/* Status Dropdown */}
                                    <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '600' }}>Ubah Status:</span>
                                        <select
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: `2px solid ${st.color}`, background: st.bg, color: st.color, fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s.value} value={s.value}>{s.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Resi / Shopee */}
            {resiModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>
                            <i className="fas fa-truck" style={{ color: '#2563eb', marginRight: '0.5rem' }}></i>
                            Isi Info Pengiriman
                        </h3>
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button onClick={() => setResiModal(m => ({ ...m, type: 'resi', value: '' }))}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: `2px solid ${resiModal.type === 'resi' ? '#2563eb' : '#e5e7eb'}`, background: resiModal.type === 'resi' ? '#eff6ff' : 'white', color: resiModal.type === 'resi' ? '#1e40af' : '#6b7280', fontWeight: 'bold', cursor: 'pointer' }}>
                                📦 Nomor Resi
                            </button>
                            <button onClick={() => setResiModal(m => ({ ...m, type: 'shopee', value: 'https://id.shp.ee/zQm8HFez' }))}
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', border: `2px solid ${resiModal.type === 'shopee' ? '#ee4d2d' : '#e5e7eb'}`, background: resiModal.type === 'shopee' ? '#fff5f2' : 'white', color: resiModal.type === 'shopee' ? '#ee4d2d' : '#6b7280', fontWeight: 'bold', cursor: 'pointer' }}>
                                🛍️ Link Shopee
                            </button>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                                {resiModal.type === 'resi' ? 'Nomor Resi:' : 'Link Shopee:'}
                            </label>
                            <input type="text" value={resiModal.value} onChange={e => setResiModal(m => ({ ...m, value: e.target.value }))}
                                placeholder={resiModal.type === 'resi' ? 'Contoh: JNE12345678...' : 'https://id.shp.ee/...'}
                                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setResiModal(null)} style={{ flex: 1, padding: '0.8rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>Batal</button>
                            <button onClick={saveResi} disabled={saving} style={{ flex: 1, padding: '0.8rem', background: resiModal.type === 'shopee' ? '#ee4d2d' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {saving ? 'Menyimpan...' : <><i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>Simpan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Pesanan */}
            {editModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827' }}>
                            <i className="fas fa-edit" style={{ color: '#2563eb', marginRight: '0.5rem' }}></i>
                            Edit Pesanan
                        </h3>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Status Paket:</label>
                            <select value={editModal.status} onChange={e => setEditModal(m => ({ ...m, status: e.target.value }))}
                                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}>
                                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Nomor Resi / Link:</label>
                            <input type="text" value={editModal.tracking_number} onChange={e => setEditModal(m => ({ ...m, tracking_number: e.target.value }))}
                                placeholder="Nomor resi atau https://id.shp.ee/..."
                                style={{ width: '100%', padding: '0.8rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setEditModal(null)} style={{ flex: 1, padding: '0.8rem', background: 'white', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>Batal</button>
                            <button onClick={saveEdit} disabled={saving} style={{ flex: 1, padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {saving ? 'Menyimpan...' : <><i className="fas fa-save" style={{ marginRight: '0.5rem' }}></i>Simpan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}
