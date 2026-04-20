'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function KalkulatorModal() {
    const [numFish, setNumFish] = useState(1);
    const [items, setItems] = useState([
        { id: 1, name: 'Harga Beli Ikan', qty: 1, price: 0 },
        { id: 2, name: 'Plastik & Packing', qty: 1, price: 0 },
        { id: 3, name: 'Biaya Pakan/Hari', qty: 1, price: 0 },
        { id: 4, name: 'Garam & Ketapang', qty: 1, price: 0 },
        { id: 5, name: 'Biaya Lain-lain', qty: 1, price: 0 },
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
    const modalPerFish = totalModal / (numFish > 0 ? numFish : 1);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        Analisis <span style={{ color: 'var(--primary-cyan)' }}>Modal & Harga Jual</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Hitung biaya operasional per ekor untuk menentukan harga jual yang paling menguntungkan.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', alignItems: 'start' }}>
                    {/* Left Side: Input Items */}
                    <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                        <div style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-light)', borderRadius: '15px' }}>
                            <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>Berapa jumlah ikan dalam perhitungan ini?</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={numFish}
                                    onChange={(e) => setNumFish(parseInt(e.target.value) || 1)}
                                    style={{ width: '100px', padding: '0.8rem', borderRadius: '10px', border: '2px solid var(--primary-cyan)', background: 'var(--bg-white)', fontWeight: '700', fontSize: '1.1rem' }}
                                />
                                <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Ekor Ikan</span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0 1rem', fontSize: '0.9rem' }}>
                            <div>Rincian Biaya</div>
                            <div>Jumlah</div>
                            <div>Harga (Rp)</div>
                            <div></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center', background: 'var(--bg-light)', padding: '0.8rem', borderRadius: '12px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Nama biaya..." 
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.56rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                                    />
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.56rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                                    />
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.56rem', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                                    />
                                    <button 
                                        onClick={() => removeItem(item.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    >
                                        <i className="fas fa-times-circle"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={addItem}
                            style={{ marginTop: '1.5rem', background: 'none', border: '2px dashed var(--border-color)', width: '100%', padding: '1rem', borderRadius: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600' }}
                        >
                            <i className="fas fa-plus-circle" style={{ marginRight: '0.5rem' }}></i> Tambah Rincian Biaya
                        </button>
                    </div>

                    {/* Right Side: Summary Sidebar */}
                    <div style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ background: 'var(--primary-dark)', color: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Pengeluaran Keseluruhan:</p>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>{formatRupiah(totalModal)}</h2>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <p style={{ color: 'var(--primary-cyan)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '1rem' }}>Hasil Kalkulasi Per Ekor:</p>
                                
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>Modal per Ekor:</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{formatRupiah(modalPerFish)}</h3>
                                </div>

                                <div style={{ borderLeft: '3px solid var(--primary-cyan)', paddingLeft: '1rem', marginBottom: '1rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>Target Harga Jual (2x):</p>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{formatRupiah(modalPerFish * 2)}</h4>
                                </div>

                                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>Target Harga Jual (3x):</p>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{formatRupiah(modalPerFish * 3)}</h4>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic' }}>* Perhitungan ini sudah mencakup seluruh rincian biaya yang Anda masukkan dibagi jumlah ikan.</p>
                        </div>

                        <div style={{ marginTop: '1.5rem', padding: '1.2rem', background: '#fffbeb', borderRadius: '15px', color: '#92400e', border: '1px solid #fef3c7', fontSize: '0.85rem' }}>
                            <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                            Selalu tambahkan margin 10% untuk biaya tak terduga (ikan sakit, packing bocor, dll).
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
