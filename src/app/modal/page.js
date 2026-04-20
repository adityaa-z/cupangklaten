'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function KalkulatorModal() {
    const [numFish, setNumFish] = useState(1);
    const [shopeeFee, setShopeeFee] = useState(7); // Default Shopee Admin Fee ~7%
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

    // Calculation with Shopee Fee (adjust price upwards to cover the fee)
    const calculateTarget = (multiplier) => {
        const baseTarget = modalPerFish * multiplier;
        return baseTarget / (1 - (shopeeFee / 100));
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <>
            <Navbar />
            <div className="modal-calculator-page" style={{ padding: '4rem 1rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
                        Analisis <span style={{ color: 'var(--primary-cyan)' }}>Modal & Harga Jual</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Dilengkapi perhitungan otomatis biaya admin Shopee.</p>
                </div>

                <div className="calculator-grid">
                    {/* Left Side: Input Items */}
                    <div style={{ background: 'var(--bg-white)', padding: 'clamp(1rem, 4vw, 2rem)', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '15px' }}>
                                <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Jumlah Ikan:</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    value={numFish}
                                    onChange={(e) => setNumFish(parseInt(e.target.value) || 1)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', fontWeight: '700' }}
                                />
                            </div>
                            <div style={{ background: '#fff7ed', padding: '1rem', borderRadius: '15px', border: '1px solid #ffedd5' }}>
                                <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#9a3412' }}>Admin Shopee (%):</label>
                                <input 
                                    type="number" 
                                    min="0"
                                    step="0.1"
                                    value={shopeeFee}
                                    onChange={(e) => setShopeeFee(parseFloat(e.target.value) || 0)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fed7aa', background: 'white', fontWeight: '700', color: '#c2410c' }}
                                />
                            </div>
                        </div>

                        <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', marginBottom: '1rem', fontWeight: '700', color: 'var(--text-dark)', padding: '0 1rem', fontSize: '0.8rem' }}>
                            <div>Rincian Biaya</div>
                            <div>Qty</div>
                            <div>Harga (Rp)</div>
                            <div></div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            {items.map((item) => (
                                <div key={item.id} className="item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center', background: 'var(--bg-light)', padding: '0.8rem', borderRadius: '12px' }}>
                                    <input 
                                        type="text" 
                                        value={item.name}
                                        onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)', fontSize: '0.85rem', width: '100%' }}
                                    />
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={item.qty}
                                        onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)', fontSize: '0.85rem', width: '100%' }}
                                    />
                                    <input 
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)}
                                        style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.6rem', color: 'var(--text-dark)', fontSize: '0.85rem', width: '100%' }}
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
                            style={{ marginTop: '1.5rem', background: 'none', border: '2px dashed var(--border-color)', width: '100%', padding: '1rem', borderRadius: '15px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                        >
                            <i className="fas fa-plus-circle"></i> Tambah Biaya
                        </button>
                    </div>

                    {/* Right Side: Summary Sidebar */}
                    <div className="summary-sidebar">
                        <div style={{ background: 'var(--primary-dark)', color: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', position: 'sticky', top: '100px' }}>
                            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
                                <p style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Total Modal (Batch):</p>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{formatRupiah(totalModal)}</h2>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.8rem' }}>Modal Bersih / Ekor:</p>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-cyan)' }}>{formatRupiah(modalPerFish)}</h3>
                                </div>

                                <div style={{ borderLeft: '3px solid #f97316', paddingLeft: '1rem', marginBottom: '1.2rem', background: 'rgba(249, 115, 22, 0.1)', padding: '0.8rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.75rem', color: '#fb923c' }}>Target Jual Min (2x + Shopee Tax):</p>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{formatRupiah(calculateTarget(2))}</h4>
                                </div>

                                <div style={{ borderLeft: '3px solid #10b981', paddingLeft: '1rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem' }}>
                                    <p style={{ opacity: 0.8, fontSize: '0.75rem', color: '#34d399' }}>Target Jual Ideal (3x + Shopee Tax):</p>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{formatRupiah(calculateTarget(3))}</h4>
                                </div>
                            </div>

                            <p style={{ fontSize: '0.7rem', opacity: 0.6, lineHeight: '1.4' }}>* Target harga di atas sudah dikalkulasi otomatis agar Anda tetap menerima profit bersih 2x-3x setelah dipotong biaya admin Shopee.</p>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .calculator-grid {
                        display: grid;
                        grid-template-columns: 1fr 350px;
                        gap: 2rem;
                    }
                    @media (max-width: 900px) {
                        .calculator-grid {
                            grid-template-columns: 1fr;
                        }
                        .table-header {
                            display: none !important;
                        }
                        .item-row {
                            grid-template-columns: 1fr 1fr !important;
                            gap: 0.5rem !important;
                        }
                        .item-row input:first-child {
                            grid-column: 1 / -1;
                        }
                    }
                `}</style>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
