'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function KalkulatorModal() {
    const [numFish, setNumFish] = useState(1);
    const [shopeeFee, setShopeeFee] = useState(7);
    const [receiptImage, setReceiptImage] = useState(null);
    const [customPrice, setCustomPrice] = useState('');
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

    const totalModal = items.reduce((sum, item) => {
        const q = parseFloat(item.qty) || 0;
        const p = parseFloat(item.price) || 0;
        return sum + (q * p);
    }, 0);
    
    const modalPerFish = totalModal / (parseFloat(numFish) > 0 ? parseFloat(numFish) : 1);

    const calculateTarget = (multiplier) => {
        const baseTarget = modalPerFish * multiplier;
        const tax = baseTarget * (shopeeFee / 100);
        return baseTarget + tax;
    };

    const getTaxBreakdown = (multiplier) => {
        const baseTarget = modalPerFish * multiplier;
        return baseTarget * (shopeeFee / 100);
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
                                        onChange={(e) => setNumFish(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', fontWeight: '700' }}
                                    />
                                </div>
                                <div style={{ background: '#fff7ed', padding: '1rem', borderRadius: '15px', border: '1px solid #ffedd5' }}>
                                    <label style={{ display: 'block', fontWeight: '700', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#9a3412' }}>Pajak Shopee (%):</label>
                                    <input 
                                        type="number" 
                                        value={shopeeFee}
                                        onChange={(e) => setShopeeFee(e.target.value)}
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #fed7aa', background: 'white', fontWeight: '700' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                                {items.map((item) => (
                                    <div key={item.id} className="item-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 40px', gap: '0.8rem', alignItems: 'center', background: 'var(--bg-light)', padding: '1rem', borderRadius: '15px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Nama Biaya</span>
                                            <input type="text" placeholder="Contoh: Ikan HM" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.7rem', fontSize: '0.9rem', width: '100%', color: 'var(--text-dark)' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Jumlah</span>
                                            <input type="number" placeholder="Qty" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.7rem', fontSize: '0.9rem', width: '100%', color: 'var(--text-dark)' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Harga Satuan</span>
                                            <input type="number" placeholder="Rp" value={item.price} onChange={(e) => updateItem(item.id, 'price', e.target.value)} style={{ background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.7rem', fontSize: '0.9rem', width: '100%', color: 'var(--text-dark)' }} />
                                        </div>
                                        <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#ef4444', marginTop: '1rem' }}><i className="fas fa-trash-alt"></i></button>
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

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', borderLeft: '4px solid #f97316', marginBottom: '0.8rem' }}>
                                    <p style={{ color: '#fb923c', fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET JUAL MINIMUM (2x + Pajak):</p>
                                    <h3 style={{ fontSize: '1.3rem' }}>{formatRupiah(calculateTarget(2))}</h3>
                                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.2rem' }}>
                                        (Harga: {formatRupiah(modalPerFish * 2)} + Pajak: {formatRupiah(getTaxBreakdown(2))})
                                    </p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', borderLeft: '4px solid #10b981', marginBottom: '0.8rem' }}>
                                    <p style={{ color: '#34d399', fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET JUAL IDEAL (3x + Pajak):</p>
                                    <h3 style={{ fontSize: '1.3rem' }}>{formatRupiah(calculateTarget(3))}</h3>
                                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.2rem' }}>
                                        (Harga: {formatRupiah(modalPerFish * 3)} + Pajak: {formatRupiah(getTaxBreakdown(3))})
                                    </p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', borderLeft: '4px solid #6366f1', marginBottom: '0.8rem' }}>
                                    <p style={{ color: '#818cf8', fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET JUAL EKSLUKSIF (4x + Pajak):</p>
                                    <h3 style={{ fontSize: '1.3rem' }}>{formatRupiah(calculateTarget(4))}</h3>
                                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.2rem' }}>
                                        (Harga: {formatRupiah(modalPerFish * 4)} + Pajak: {formatRupiah(getTaxBreakdown(4))})
                                    </p>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '15px', borderLeft: '4px solid #a855f7' }}>
                                    <p style={{ color: '#c084fc', fontSize: '0.7rem', fontWeight: 'bold' }}>TARGET JUAL SULTAN (5x + Pajak):</p>
                                    <h3 style={{ fontSize: '1.3rem' }}>{formatRupiah(calculateTarget(5))}</h3>
                                    <p style={{ fontSize: '0.65rem', opacity: 0.5, marginTop: '0.2rem' }}>
                                        (Harga: {formatRupiah(modalPerFish * 5)} + Pajak: {formatRupiah(getTaxBreakdown(5))})
                                    </p>
                                </div>
                            </div>

                            {/* Custom Price Check */}
                            <div className="no-print" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-cyan)' }}>TES HARGA SENDIRI:</p>
                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.2rem', borderRadius: '15px' }}>
                                    <label style={{ display: 'block', fontSize: '0.7rem', opacity: 0.8, marginBottom: '0.5rem' }}>Mau jual di harga berapa?</label>
                                    <input 
                                        type="number"
                                        placeholder="Ketik harga..."
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                        style={{ width: '100%', background: 'white', border: 'none', padding: '0.8rem', borderRadius: '8px', color: 'black', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '1rem' }}
                                    />
                                    
                                    {customPrice > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                                <span>Pajak Shopee ({shopeeFee}%):</span>
                                                <span style={{ color: '#f87171' }}>+ {formatRupiah(customPrice * (shopeeFee / 100))}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '800', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.5rem' }}>
                                                <span>Harga List Shopee:</span>
                                                <span style={{ color: 'var(--primary-cyan)' }}>{formatRupiah(parseFloat(customPrice) + (customPrice * (shopeeFee / 100)))}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button onClick={handlePrint} className="no-print" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--primary-cyan)', color: 'var(--primary-dark)', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                <i className="fas fa-print"></i> Cetak & Simpan Laporan
                            </button>
                        </div>
                    </div>
                </div>

                {/* DEDICATED PRINT REPORT VIEW */}
                <div className="print-report">
                    <div style={{ borderBottom: '4px solid var(--primary-cyan)', paddingBottom: '1rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h2 style={{ color: 'var(--primary-dark)', marginBottom: '0.2rem' }}>CUPANG KLATEN</h2>
                            <p style={{ fontSize: '0.8rem', color: '#666' }}>Laporan Analisis Bisnis Internal</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <h3 style={{ marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Rincian Biaya Modal</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Item</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Qty</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0' }}>Harga/Unit</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{item.name || '-'}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{item.qty || 0}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{formatRupiah(item.price || 0)}</td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>{formatRupiah((item.qty || 0) * (item.price || 0))}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 'bold', background: '#f1f5f9' }}>
                                <td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>TOTAL MODAL KESELURUHAN (BATCH)</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{formatRupiah(totalModal)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div style={{ border: '2px solid #e2e8f0', padding: '1.5rem', borderRadius: '15px' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#64748b' }}>Ringkasan Unit</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Jumlah Ikan:</span>
                                <span style={{ fontWeight: 'bold' }}>{numFish} Ekor</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span>Modal per Ekor:</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-cyan)' }}>{formatRupiah(modalPerFish)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Pajak Shopee diatur:</span>
                                <span style={{ fontWeight: 'bold' }}>{shopeeFee}%</span>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ marginBottom: '1rem', color: '#64748b' }}>Rekomendasi Harga Jual</h4>
                            <div style={{ display: 'grid', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px dashed #ccc' }}>
                                    <span>Target 2x (Min):</span>
                                    <span style={{ fontWeight: 'bold' }}>{formatRupiah(calculateTarget(2))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px dashed #ccc' }}>
                                    <span>Target 3x (Ideal):</span>
                                    <span style={{ fontWeight: 'bold' }}>{formatRupiah(calculateTarget(3))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: '1px dashed #ccc' }}>
                                    <span>Target 5x (Sultan):</span>
                                    <span style={{ fontWeight: 'bold' }}>{formatRupiah(calculateTarget(5))}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {receiptImage && (
                        <div style={{ marginTop: '2rem' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#64748b' }}>Lampiran Bukti Nota</h4>
                            <img src={receiptImage} alt="Bukti Nota" style={{ width: '100%', maxWidth: '500px', border: '1px solid #ddd', borderRadius: '10px' }} />
                        </div>
                    )}

                    <div style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '1rem', fontSize: '0.7rem', color: '#999' }}>
                        Laporan ini dihasilkan secara otomatis oleh Sistem Manajemen Cupang Klaten.
                    </div>
                </div>

                <style jsx>{`
                    .calculator-grid { display: grid; grid-template-columns: 1fr 380px; gap: 2rem; }
                    .print-report { display: none; }
                    @media (max-width: 900px) { .calculator-grid { grid-template-columns: 1fr; } .item-row { grid-template-columns: 1fr 1fr !important; } .item-row input:first-child { grid-column: 1 / -1; } }
                    @media print {
                        @page { margin: 1cm; }
                        body { background: white !important; color: black !important; }
                        .no-print { display: none !important; }
                        .print-report { display: block !important; }
                        .printable-content { max-width: 100% !important; padding: 0 !important; }
                        .calculator-grid { display: none !important; }
                        .summary-section { display: none !important; }
                    }
                `}</style>
            </div>
            <div className="no-print"><Footer /></div>
            <div className="no-print"><FAB /></div>
        </>
    );
}
