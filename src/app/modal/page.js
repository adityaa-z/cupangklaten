'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function KalkulatorModal() {
    const [items, setItems] = useState([
        { id: 1, name: 'Ikan Indukan', qty: 1, price: 0 },
        { id: 2, name: 'Soliter/Wadah', qty: 1, price: 0 },
        { id: 3, name: 'Pakan (Cacing/Pelet)', qty: 1, price: 0 },
    ]);

    const addItem = () => {
        setItems([...items, { id: Date.now(), name: '', qty: 1, price: 0 }]);
    };

    const removeItem = (id) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const totalModal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '900px', margin: '0 auto', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        Kalkulator <span style={{ color: 'var(--primary-cyan)' }}>Modal Terperinci</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hitung estimasi pengeluaran dan tentukan harga jual ikan Anda dengan tepat.</p>
                </div>

                <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0 1rem' }}>
                        <div>Nama Item</div>
                        <div>Jumlah</div>
                        <div>Harga Satuan</div>
                        <div></div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {items.map((item) => (
                            <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center', background: 'var(--bg-light)', padding: '1rem', borderRadius: '15px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Contoh: Ketapang" 
                                    value={item.name}
                                    onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                    style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)' }}
                                />
                                <input 
                                    type="number" 
                                    min="1"
                                    value={item.qty}
                                    onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                    style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)' }}
                                />
                                <input 
                                    type="number"
                                    placeholder="0"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                    style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)' }}
                                />
                                <button 
                                    onClick={() => removeItem(item.id)}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={addItem}
                        style={{ marginTop: '1.5rem', background: 'none', border: '2px dashed var(--border-color)', width: '100%', padding: '1rem', borderRadius: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
                    >
                        <i className="fas fa-plus-circle" style={{ marginRight: '0.5rem' }}></i> Tambah Item Biaya
                    </button>

                    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Total Estimasi Modal:</h3>
                            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)' }}>{formatRupiah(totalModal)}</h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rekomendasi Harga Jual (+30% Profit):</p>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{formatRupiah(totalModal * 1.3)}</h3>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#e0f2fe', borderRadius: '15px', color: '#0369a1', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <i className="fas fa-lightbulb" style={{ fontSize: '1.5rem' }}></i>
                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                        <strong>Tips:</strong> Masukkan juga biaya operasional seperti listrik, garam ikan, dan ketapang agar perhitungan modal Anda lebih akurat dan tidak rugi di kemudian hari.
                    </p>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
