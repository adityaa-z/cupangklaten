'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
    getPromoSettings, 
    updatePromoSettings, 
    getClaimByCode, 
    processAndCleanUpClaim,
    createGeneralPromo,
    getAllGeneralPromos,
    toggleGeneralPromoStatus,
    deleteGeneralPromo
} from '@/app/actions/promo';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';

export default function AdminPromoPage() {
    const [activeTab, setActiveTab] = useState('voucher'); // 'voucher' | 'general'
    
    // Tab 1 States
    const [promoActive, setPromoActive] = useState(false);
    const [dailyLimit, setDailyLimit] = useState(10);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    
    // Scan Modal
    const [scannedClaim, setScannedClaim] = useState(null);
    const [isProcessingClaim, setIsProcessingClaim] = useState(false);
    const [scanMessage, setScanMessage] = useState('');
    
    // Tab 2 States
    const [promos, setPromos] = useState([]);
    const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
    const [formData, setFormData] = useState({
        title: '', description: '', targetCategory: '5k', 
        priceOrDiscount: '', startDate: '', endDate: ''
    });

    useEffect(() => {
        fetchSettings();
        fetchPromos();
    }, []);

    // --- TAB 1 LOGIC ---
    const fetchSettings = async () => {
        const settings = await getPromoSettings();
        setPromoActive(settings.PROMO_ACTIVE === 'true');
        setDailyLimit(parseInt(settings.PROMO_DAILY_LIMIT, 10));
    };

    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        await updatePromoSettings(promoActive, dailyLimit);
        alert('Pengaturan Voucher berhasil disimpan!');
        setIsSavingSettings(false);
    };

    // Scanner
    useEffect(() => {
        if (activeTab === 'voucher' && scannerActive) {
            const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render(onScanSuccess, onScanFailure);

            function onScanSuccess(decodedText) {
                scanner.clear();
                setScannerActive(false);
                handleScannedCode(decodedText);
            }
            function onScanFailure(error) {
                // ignore
            }

            return () => {
                scanner.clear().catch(e => console.error(e));
            };
        }
    }, [scannerActive, activeTab]);

    const handleScannedCode = async (code) => {
        setScanMessage('Memeriksa kode...');
        const claim = await getClaimByCode(code);
        if (claim) {
            setScannedClaim(claim);
            setScanMessage('');
        } else {
            setScanMessage('Kode tidak valid atau tidak ditemukan di database.');
        }
    };

    const handleProcessClaim = async (action) => {
        setIsProcessingClaim(true);
        const res = await processAndCleanUpClaim(scannedClaim.claim_code, action);
        if (res.success) {
            alert(`Voucher berhasil di-${action}`);
            setScannedClaim(null);
        } else {
            alert(`Gagal: ${res.error}`);
        }
        setIsProcessingClaim(false);
    };

    // --- TAB 2 LOGIC ---
    const fetchPromos = async () => {
        const data = await getAllGeneralPromos();
        setPromos(data);
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        setIsSubmittingPromo(true);
        const res = await createGeneralPromo(formData);
        if (res.success) {
            alert('Promo berhasil dibuat!');
            setFormData({title: '', description: '', targetCategory: '5k', priceOrDiscount: '', startDate: '', endDate: ''});
            fetchPromos();
        } else {
            alert('Gagal membuat promo');
        }
        setIsSubmittingPromo(false);
    };

    const handleTogglePromo = async (id, currentStatus) => {
        await toggleGeneralPromoStatus(id, !currentStatus);
        fetchPromos();
    };

    const handleDeletePromo = async (id) => {
        if (confirm('Yakin ingin menghapus promo ini?')) {
            await deleteGeneralPromo(id);
            fetchPromos();
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', background: 'var(--bg-light)', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)', fontWeight: '800' }}>Manajemen Promo & Voucher</h1>
                <Link href="/admin" style={{ padding: '0.5rem 1rem', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '8px', textDecoration: 'none', color: 'var(--text-dark)' }}>
                    Kembali ke Admin
                </Link>
            </div>

            {/* TABS */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                <button 
                    onClick={() => setActiveTab('voucher')}
                    style={{ padding: '0.8rem 1.5rem', background: activeTab === 'voucher' ? 'var(--primary-cyan)' : 'transparent', color: activeTab === 'voucher' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                    <i className="fas fa-ticket-alt"></i> Voucher Maps
                </button>
                <button 
                    onClick={() => setActiveTab('general')}
                    style={{ padding: '0.8rem 1.5rem', background: activeTab === 'general' ? '#D4AF37' : 'transparent', color: activeTab === 'general' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
                >
                    <i className="fas fa-bullhorn"></i> Promo Umum
                </button>
            </div>

            {/* TAB 1 CONTENT */}
            {activeTab === 'voucher' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    
                    {/* Settings Card */}
                    <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-cog"></i> Pengaturan Voucher</h3>
                        
                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Status Promo Maps</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Menampilkan popup voucher di halaman utama</div>
                            </div>
                            <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                                <input type="checkbox" checked={promoActive} onChange={(e) => setPromoActive(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: promoActive ? '#10b981' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
                                    <span style={{ position: 'absolute', content: '""', height: '26px', width: '26px', left: promoActive ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                </span>
                            </label>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Limit Kuota Harian</label>
                            <input 
                                type="number" 
                                value={dailyLimit} 
                                onChange={(e) => setDailyLimit(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                        </div>

                        <button onClick={handleSaveSettings} disabled={isSavingSettings} style={{ width: '100%', padding: '1rem', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </div>

                    {/* Scanner Card */}
                    <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-qrcode"></i> Scan QR Code Pelanggan</h3>
                        
                        {!scannerActive ? (
                            <button onClick={() => setScannerActive(true)} style={{ width: '100%', padding: '3rem', border: '2px dashed var(--primary-cyan)', background: 'rgba(0, 188, 212, 0.05)', borderRadius: '12px', color: 'var(--primary-cyan)', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                <i className="fas fa-camera" style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}></i>
                                Mulai Scan Kamera
                            </button>
                        ) : (
                            <div>
                                <div id="reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
                                <button onClick={() => setScannerActive(false)} style={{ width: '100%', padding: '1rem', marginTop: '1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Batalkan Scan
                                </button>
                            </div>
                        )}

                        {scanMessage && <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', textAlign: 'center' }}>{scanMessage}</div>}
                    </div>

                    {/* Scanned Modal Overlay (Simple inline version) */}
                    {scannedClaim && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: 'white', width: '90%', maxWidth: '500px', borderRadius: '16px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.5rem', color: '#111827', margin: 0 }}>Detail Klaim Voucher</h3>
                                    <button onClick={() => setScannedClaim(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                                </div>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Nama Maps</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{scannedClaim.maps_name}</div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>WhatsApp</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>{scannedClaim.whatsapp_number}</div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Status</div>
                                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: scannedClaim.status === 'pending' ? '#fef3c7' : (scannedClaim.status === 'claimed' ? '#d1fae5' : '#fee2e2'), color: scannedClaim.status === 'pending' ? '#92400e' : (scannedClaim.status === 'claimed' ? '#065f46' : '#991b1b') }}>
                                        {scannedClaim.status.toUpperCase()}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: '2rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>Bukti Screenshot (Akan dihapus otomatis jika diapprove/reject)</div>
                                    {scannedClaim.image_path ? (
                                        <img src={scannedClaim.image_path} alt="Bukti" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                    ) : (
                                        <div style={{ padding: '2rem', background: '#f3f4f6', textAlign: 'center', color: '#9ca3af', borderRadius: '8px' }}>File tidak ada / sudah dihapus</div>
                                    )}
                                </div>

                                {scannedClaim.status === 'pending' && (
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => handleProcessClaim('approve')} disabled={isProcessingClaim} style={{ flex: 1, padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            <i className="fas fa-check"></i> Approve (Potong Stok)
                                        </button>
                                        <button onClick={() => handleProcessClaim('reject')} disabled={isProcessingClaim} style={{ flex: 1, padding: '1rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            <i className="fas fa-times"></i> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2 CONTENT */}
            {activeTab === 'general' && (
                <div>
                    {/* Create Promo Form */}
                    <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-plus-circle"></i> Buat Promo Umum Baru</h3>
                        <form onSubmit={handleCreatePromo} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Judul Promo</label>
                                <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="Misal: Flash Sale Akhir Bulan" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Kategori Target</label>
                                <input required type="text" value={formData.targetCategory} onChange={e=>setFormData({...formData, targetCategory: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="Misal: Plakat, Halfmoon, atau Semua" />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Deskripsi Singkat</label>
                                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px' }} placeholder="Syarat dan ketentuan promo..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Harga Spesial / Diskon</label>
                                <input required type="text" value={formData.priceOrDiscount} onChange={e=>setFormData({...formData, priceOrDiscount: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} placeholder="Misal: Rp 15.000 atau Diskon 20%" />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Tanggal Mulai</label>
                                    <input required type="datetime-local" value={formData.startDate} onChange={e=>setFormData({...formData, startDate: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Tanggal Berakhir</label>
                                    <input required type="datetime-local" value={formData.endDate} onChange={e=>setFormData({...formData, endDate: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                </div>
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                                <button type="submit" disabled={isSubmittingPromo} style={{ padding: '1rem 3rem', background: '#D4AF37', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    {isSubmittingPromo ? 'Menyimpan...' : 'Terbitkan Promo'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Promos Table */}
                    <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-list"></i> Daftar Promo</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Judul</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Masa Berlaku</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                                        <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {promos.length === 0 ? (
                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada promo.</td></tr>
                                    ) : promos.map(promo => (
                                        <tr key={promo.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>{promo.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{promo.price_or_discount}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-dark)' }}>
                                                {new Date(promo.start_date).toLocaleDateString('id-ID')} s/d {new Date(promo.end_date).toLocaleDateString('id-ID')}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button 
                                                    onClick={() => handleTogglePromo(promo.id, promo.is_active)}
                                                    style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', background: promo.is_active ? '#d1fae5' : '#f1f5f9', color: promo.is_active ? '#059669' : '#64748b' }}
                                                >
                                                    {promo.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                </button>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button onClick={() => handleDeletePromo(promo.id)} style={{ padding: '0.5rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
