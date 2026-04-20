'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function KalkulatorModal() {
    const [numFish, setNumFish] = useState(1);
    const [shopeeFee, setShopeeFee] = useState(7);
    const [receiptImage, setReceiptImage] = useState(null);
    const [items, setItems] = useState([
        { id: 1, name: 'Total Nota Pembelian', qty: 1, price: 0 },
        { id: 2, name: 'Plastik & Packing', qty: 1, price: 0 },
        { id: 3, name: 'Pakan & Perawatan', qty: 1, price: 0 },
    ]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

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

    const calculateTarget = (multiplier) => {
        const baseTarget = modalPerFish * multiplier;
        return baseTarget / (1 - (shopeeFee / 100));
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <div className="no-print"><Navbar /></div>
            <div className="modal-calculator-page printable-content" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: '800', marginBottom: '0.5rem' }}>
                        Laporan <span style={{ color: 'var(--primary-cyan)' }}>Analisis Harga Jual</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cupang Klaten - Dokumen Internal Management</p>
                </div>

                <div className="calculator-grid">
                    {/* Left Side: Input & Nota */}
                    <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--primary-cyan)' }}></i> Data Nota & Pembelian
                            </h3>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '15px' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Jumlah Ikan (Ekor):</label>
                                    <input 
                                        type="number" 
                                        value={numFish}
                                        onChange={(e) => setNumFish(parseInt(e.target.value) || 1)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', fontWeight: '700' }}
                                    />
                                </div>
                                <div style={{ background: '#fff7ed', padding: '1rem', borderRadius: '15px', border: '1px solid #ffedd5' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#9a3412' }}>Pajak Shopee (%):</label>
                                    <input 
                                        type="number" 
                                        value={shopeeFee}
                                        onChange={(e) => setShopeeFee(parseFloat(e.target.value) || 0)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fed7aa', background: 'white', fontWeight: '700' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
                                {items.map((item) => (
                                    <div key={item.id} className="item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '1rem', alignItems: 'center', background: 'var(--bg-light)', padding: '0.6rem', borderRadius: '12px' }}>
                                        <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.8rem', width: '100%' }} />
                                        <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.8rem', width: '100%' }} />
                                        <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseInt(e.target.value) || 0)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.5rem', fontSize: '0.8rem', width: '100%' }} />
                                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444' }}><i className="fas fa-times"></i></button>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addItem} style={{ fontSize: '0.8rem', color: 'var(--primary-cyan)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>+ Tambah Biaya Lain</button>
                        </div>

                        {/* Upload Receipt Section */}
                        <div style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: '24px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}><i className="fas fa-camera"></i> Lampiran Foto Nota</h3>
                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '1rem', fontSize: '0.8rem' }} />
                            {receiptImage && (
                                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                    <img src={receiptImage} alt="Nota" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Summary & Print Result */}
                    <div className="summary-section">
                        <div className="result-card" style={{ background: 'var(--primary-dark)', color: 'white', padding: '2.5rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
                            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
                                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>TOTAL MODAL:</p>
                                <h1 style={{ fontSize: '2.2rem' }}>{formatRupiah(totalModal)}</h1>
                                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: 'var(--primary-cyan)' }}>untuk {numFish} ekor ikan</p>
                            </div>

                            <div style={{ marginBottom: '2.5rem' }}>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Modal Per Ekor:</p>
                                    <h2 style={{ fontSize: '1.8rem' }}>{formatRupiah(modalPerFish)}</h2>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '15px', borderLeft: '4px solid #f97316', marginBottom: '1rem' }}>
                                    <p style={{ color: '#fb923c', fontSize: '0.75rem', fontWeight: 'bold' }}>HARGA JUAL MINIMUM (2x + Shopee):</p>
                                    <h3 style={{ fontSize: '1.4rem' }}>{formatRupiah(calculateTarget(2))}</h3>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.2rem', borderRadius: '15px', borderLeft: '4px solid #10b981' }}>
                                    <p style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 'bold' }}>HARGA JUAL IDEAL (3x + Shopee):</p>
                                    <h3 style={{ fontSize: '1.4rem' }}>{formatRupiah(calculateTarget(3))}</h3>
                                </div>
                            </div>

                            {receiptImage && <div className="print-only" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                                <p style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>Lampiran Nota Pembelian:</p>
                                <img src={receiptImage} alt="Receipt Attached" style={{ width: '100%', borderRadius: '10px' }} />
                            </div>}

                            <button onClick={handlePrint} className="no-print" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--primary-cyan)', color: 'var(--primary-dark)', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                                <i className="fas fa-print"></i> Cetak & Simpan Laporan
                            </button>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .calculator-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
                    @media (max-width: 900px) { .calculator-grid { grid-template-columns: 1fr; } .item-row { grid-template-columns: 1fr 1fr !important; } .item-row input:first-child { grid-column: 1 / -1; } }
                    @media print {
                        body { background: white !important; color: black !important; }
                        .no-print { display: none !important; }
                        .printable-content { padding: 0 !important; margin: 0 !important; width: 100% !important; max-width: none !important; }
                        .result-card { background: white !important; color: black !important; box-shadow: none !important; border: 1px solid #eee !important; padding: 20px !important; }
                        h1, h2, h3, h4, p { color: black !important; }
                        .print-only { display: block !important; }
                    }
                    .print-only { display: none; }
                `}</style>
            </div>
            <div className="no-print"><Footer /></div>
            <div className="no-print"><FAB /></div>
        </>
    );
}
