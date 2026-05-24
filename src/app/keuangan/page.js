'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';
import './keuangan.css';

export const dynamic = 'force-dynamic';

export default function KeuanganPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    // Data states
    const [categories, setCategories] = useState([]);
    const [fishStocks, setFishStocks] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({ saldo_kas: 0, estimasi_aset: 0 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // Tab State: 'transaksi' or 'inventaris'
    const [activeTab, setActiveTab] = useState('transaksi');

    // Form States
    const [formData, setFormData] = useState({
        tanggal: new Date().toISOString().split('T')[0],
        category_id: '',
        nominal: '',
        keterangan: '',
        fish_stock_id: ''
    });

    const [cart, setCart] = useState([]);
    const [saleData, setSaleData] = useState({
        fish: null,
        qty: 1,
        nominal: ''
    });

    const [purchaseData, setPurchaseData] = useState({
        kode_ikan: '',
        nama_tipe: '',
        grade: 'A',
        harga_beli_per_ekor: '',
        stok_sisa: '',
        lokasi: 'Pabrik_Pembesaran'
    });

    // Searchable dropdown state for Selling fish
    const [fishSearch, setFishSearch] = useState('');
    const [showFishDropdown, setShowFishDropdown] = useState(false);

    // Transfer Location inline state
    const [transferLocations, setTransferLocations] = useState({});

    // Toast
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        // Guard check on frontend
        if (authStatus === 'unauthenticated') {
            alert('Akses Ditolak. Anda bukan administrator yang sah.');
            router.push('/');
            return;
        }

        if (session && session.user && session.user.email !== 'zidanp13794@gmail.com') {
            alert('Akses Ditolak. Anda bukan administrator yang sah.');
            router.push('/');
            return;
        }

        if (session && session.user && session.user.email === 'zidanp13794@gmail.com') {
            fetchData();
        }
    }, [session, authStatus]);

    // Auto-calculate nominal when wholesale purchase numbers change
    useEffect(() => {
        if (Number(formData.category_id) === 2 && purchaseData.harga_beli_per_ekor && purchaseData.stok_sisa) {
            const calculated = Number(purchaseData.harga_beli_per_ekor) * Number(purchaseData.stok_sisa);
            setFormData(prev => ({ ...prev, nominal: calculated }));
        }
    }, [purchaseData.harga_beli_per_ekor, purchaseData.stok_sisa, formData.category_id]);

    // Auto-calculate nominal when cart changes, but allow manual override
    useEffect(() => {
        if (Number(formData.category_id) === 1 || Number(formData.category_id) === 2) {
            const total = cart.reduce((acc, item) => acc + Number(item.nominal), 0);
            if (total > 0) {
                setFormData(prev => ({ ...prev, nominal: total }));
            }
        }
    }, [cart, formData.category_id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/keuangan/');
            if (res.status === 401) {
                alert('Akses Ditolak. Anda bukan administrator yang sah.');
                router.push('/');
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setCategories(data.categories || []);
                setFishStocks(data.fishStocks || []);
                setTransactions(data.transactions || []);
                setStats(data.stats || { saldo_kas: 0, estimasi_aset: 0 });
            }
        } catch (err) {
            console.error('Error fetching financial data:', err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePurchaseChange = (e) => {
        const { name, value } = e.target;
        setPurchaseData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectFish = (fish) => {
        setSaleData(prev => ({ ...prev, fish, qty: 1, nominal: '' }));
        setFishSearch(`${fish.kode_ikan} - ${fish.nama_tipe} (${fish.grade}) - Stok: ${fish.stok_sisa}`);
        setShowFishDropdown(false);
    };

    const handleAddToCart = (e) => {
        if (e) e.preventDefault();
        if (Number(formData.category_id) === 1) {
            if (!saleData.fish) return alert("Pilih ikan terlebih dahulu.");
            if (!saleData.qty || saleData.qty < 1) return alert("Jumlah (Qty) tidak valid.");
            if (saleData.qty > saleData.fish.stok_sisa) return alert(`Jumlah melebihi stok yang ada (${saleData.fish.stok_sisa}).`);
            if (!saleData.nominal || saleData.nominal <= 0) return alert("Nominal (Harga Jual) harus diisi.");

            setCart(prev => [...prev, { ...saleData }]);
            setSaleData({ fish: null, qty: 1, nominal: '' });
            setFishSearch('');
        } else if (Number(formData.category_id) === 2) {
            if (!purchaseData.kode_ikan || !purchaseData.nama_tipe || !purchaseData.harga_beli_per_ekor || !purchaseData.stok_sisa) {
                return alert("Lengkapi semua data ikan grosir.");
            }
            const itemNominal = Number(purchaseData.harga_beli_per_ekor) * Number(purchaseData.stok_sisa);
            setCart(prev => [...prev, { ...purchaseData, nominal: itemNominal }]);
            setPurchaseData({
                kode_ikan: '', nama_tipe: '', grade: 'A', harga_beli_per_ekor: '', stok_sisa: '', lokasi: 'Pabrik_Pembesaran'
            });
        }
    };

    const handleRemoveFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteStock = async (id, maxQty) => {
        const qtyStr = prompt(`Berapa banyak ikan yang mati? (Maksimal ${maxQty})\nKetik 'ALL' jika ingin menghapus seluruh data ikan ini.`);
        if (!qtyStr) return;
        
        let qtyToDeduct = 0;
        let isDeleteAll = false;

        if (qtyStr.toUpperCase() === 'ALL') {
            isDeleteAll = true;
        } else {
            qtyToDeduct = parseInt(qtyStr, 10);
            if (isNaN(qtyToDeduct) || qtyToDeduct <= 0) return alert("Jumlah tidak valid.");
            if (qtyToDeduct > maxQty) return alert(`Jumlah melebihi stok yang ada (${maxQty}).`);
            if (qtyToDeduct === maxQty) isDeleteAll = true;
        }

        setActionLoading(true);
        try {
            const url = isDeleteAll 
                ? `/api/keuangan/stock/${id}` 
                : `/api/keuangan/stock/${id}?reduce=${qtyToDeduct}`;
            const method = isDeleteAll ? 'DELETE' : 'PATCH';
            const res = await fetch(url, { method });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification(isDeleteAll ? 'Data stok ikan berhasil dihapus.' : `Stok ikan berhasil dikurangi ${qtyToDeduct}.`);
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetData = async () => {
        if (!confirm("PERINGATAN: Apakah Anda yakin ingin mereset PEMBUKUAN? Ini akan menghapus SELURUH riwayat transaksi dan SELURUH stok ikan yang ada! Pastikan Anda sudah membackup jika perlu.")) return;
        setActionLoading(true);
        try {
            const res = await fetch('/api/keuangan/reset', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showNotification('Pembukuan berhasil direset dari awal.');
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransactionSubmit = async (e) => {
        e.preventDefault();
        setActionLoading(true);

        try {
            const isBatch = Number(formData.category_id) === 1 || Number(formData.category_id) === 2;
            let currentCart = [...cart];
            
            if (isBatch && currentCart.length === 0) {
                if (Number(formData.category_id) === 1) {
                    if (saleData.fish && saleData.qty && saleData.nominal) {
                        currentCart.push({ ...saleData });
                    } else {
                        setActionLoading(false);
                        return alert("Pilih ikan dan lengkapi data penjualan, atau klik Tambah ke Keranjang.");
                    }
                } else if (Number(formData.category_id) === 2) {
                    if (purchaseData.kode_ikan && purchaseData.nama_tipe && purchaseData.harga_beli_per_ekor && purchaseData.stok_sisa) {
                        const itemNominal = Number(purchaseData.harga_beli_per_ekor) * Number(purchaseData.stok_sisa);
                        currentCart.push({ ...purchaseData, nominal: itemNominal });
                    } else {
                        setActionLoading(false);
                        return alert("Lengkapi semua data ikan grosir terlebih dahulu.");
                    }
                }
            }

            const payload = {
                tanggal: formData.tanggal,
                category_id: Number(formData.category_id),
                keterangan: formData.keterangan,
            };

            if (isBatch) {
                let totalCartNominal = currentCart.reduce((acc, item) => acc + Number(item.nominal), 0);
                let manualNominal = Number(formData.nominal);
                
                // If user didn't type anything in nominal, fallback to totalCartNominal
                if (!manualNominal && manualNominal !== 0) {
                    manualNominal = totalCartNominal;
                }
                
                let diff = manualNominal - totalCartNominal;

                payload.items = currentCart.map((item, index) => {
                    let finalItemNominal = Number(item.nominal);
                    if (index === 0) {
                        finalItemNominal += diff; // Adjust first item so total matches manual nominal
                    }
                    if (Number(formData.category_id) === 1) {
                        return { fish_stock_id: item.fish.id, qty: Number(item.qty), nominal: finalItemNominal };
                    } else {
                        return {
                            purchase_data: {
                                kode_ikan: item.kode_ikan, nama_tipe: item.nama_tipe, grade: item.grade,
                                harga_beli_per_ekor: Number(item.harga_beli_per_ekor), stok_sisa: Number(item.stok_sisa), lokasi: item.lokasi
                            },
                            nominal: finalItemNominal
                        };
                    }
                });
            } else {
                payload.nominal = Number(formData.nominal);
            }

            const res = await fetch('/api/keuangan/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Gagal menyimpan transaksi.');
            }

            showNotification('Transaksi berhasil dicatat!');
            
            // Reset forms
            setFormData({
                tanggal: new Date().toISOString().split('T')[0],
                category_id: '',
                nominal: '',
                keterangan: '',
                fish_stock_id: ''
            });
            setPurchaseData({
                kode_ikan: '',
                nama_tipe: '',
                grade: 'A',
                harga_beli_per_ekor: '',
                stok_sisa: '',
                lokasi: 'Pabrik_Pembesaran'
            });
            setFishSearch('');
            setCart([]);
            setSaleData({ fish: null, qty: 1, nominal: '' });
            
            // Refresh data
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransferSubmit = async (fishId) => {
        const destLocation = transferLocations[fishId];
        if (!destLocation) {
            alert('Silakan pilih lokasi tujuan terlebih dahulu.');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch('/api/keuangan/transfer/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fish_stock_id: fishId,
                    lokasi: destLocation
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Gagal melakukan transfer lokasi.');
            }

            showNotification('Lokasi ikan berhasil diperbarui!');
            fetchData();
        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTransferLocationChange = (fishId, location) => {
        setTransferLocations(prev => ({ ...prev, [fishId]: location }));
    };

    // Filtered active fish stocks for selling searchable dropdown
    const filteredFishStocks = fishStocks.filter(fish => {
        if (fish.stok_sisa <= 0) return false;
        const searchStr = `${fish.kode_ikan} ${fish.nama_tipe} ${fish.grade}`.toLowerCase();
        return searchStr.includes(fishSearch.toLowerCase());
    });

    // Grouping fish stocks by physical locations for logistics grid
    const fishByLocation = {
        Pabrik_Pembesaran: fishStocks.filter(f => f.lokasi === 'Pabrik_Pembesaran'),
        Gudang: fishStocks.filter(f => f.lokasi === 'Gudang'),
        Showroom: fishStocks.filter(f => f.lokasi === 'Showroom')
    };

    if (authStatus === 'loading' || (loading && transactions.length === 0)) {
        return (
            <div className="finance-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-mini" style={{ width: '40px', height: '40px', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: '#94a3b8' }}>Memuat Sistem Keuangan Z-IFC...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <div className="finance-body">
                <div className="finance-container">
                    {/* Header */}
                    <div className="finance-header">
                        <div className="finance-logo-group">
                            <i className="fas fa-coins" style={{ fontSize: '2rem', color: '#D4AF37' }}></i>
                            <div>
                                <h1 className="finance-title">Z-IFC MODUL KEUANGAN</h1>
                                <p className="finance-subtitle">Sistem Terintegrasi Cupang Klaten</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={handleResetData} className="btn-home" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                <i className="fas fa-power-off"></i> Reset Pembukuan
                            </button>
                            <Link href="/admin" className="btn-home">
                                <i className="fas fa-arrow-left"></i> Dashboard Admin
                            </Link>
                        </div>
                    </div>

                {/* Dashboard Stats */}
                <section className="finance-stats-grid">
                    <div className="finance-card">
                        <span className="card-label">Saldo Kas Utama</span>
                        <h2 className="card-value green">
                            Rp {stats.saldo_kas.toLocaleString('id-ID')}
                        </h2>
                        <i className="fas fa-wallet card-icon"></i>
                    </div>
                    <div className="finance-card">
                        <span className="card-label">Estimasi Nilai Aset Stok</span>
                        <h2 className="card-value gold">
                            Rp {stats.estimasi_aset.toLocaleString('id-ID')}
                        </h2>
                        <i className="fas fa-fish card-icon"></i>
                    </div>
                </section>

                {/* Main Content Area */}
                <div className="finance-main-grid">
                    
                    {/* Left Column: Transaction Input Form */}
                    <div className="form-panel">
                        <h3 className="panel-title">
                            <i className="fas fa-plus-circle"></i> Catat Transaksi Baru
                        </h3>
                        <form onSubmit={handleTransactionSubmit}>
                            <div className="form-group">
                                <label>Tanggal Transaksi</label>
                                <input 
                                    type="date" 
                                    name="tanggal" 
                                    value={formData.tanggal} 
                                    onChange={handleFormChange} 
                                    className="form-control" 
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label>Kategori</label>
                                <select 
                                    name="category_id" 
                                    value={formData.category_id} 
                                    onChange={handleFormChange} 
                                    className="form-control" 
                                    required
                                >
                                    <option value="">Pilih Kategori...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.nama_kategori} ({cat.jenis.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Conditional Form: Jual Ikan Eceran (Category 1) */}
                            {Number(formData.category_id) === 1 && (
                                <div style={{ 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    marginBottom: '1rem' 
                                }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.8rem' }}>Tambah Ikan ke Keranjang Penjualan</h4>
                                    <div className="form-group" style={{ position: 'relative' }}>
                                        <label>Pilih Ikan (Inventaris Aktif)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Cari kode ikan, tipe, atau grade..."
                                            value={fishSearch}
                                            onChange={(e) => {
                                                setFishSearch(e.target.value);
                                                setShowFishDropdown(true);
                                            }}
                                            onFocus={() => setShowFishDropdown(true)}
                                            className="form-control"
                                        />
                                        {showFishDropdown && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                width: '100%',
                                                maxHeight: '200px',
                                                overflowY: 'auto',
                                                background: '#0f172a',
                                                border: '1px solid rgba(212, 175, 55, 0.3)',
                                                borderRadius: '8px',
                                                zIndex: 50,
                                                boxShadow: '0 10px 15px rgba(0,0,0,0.5)'
                                            }}>
                                                {filteredFishStocks.length > 0 ? (
                                                    filteredFishStocks.map(fish => (
                                                        <div 
                                                            key={fish.id} 
                                                            onClick={() => handleSelectFish(fish)}
                                                            style={{
                                                                padding: '0.6rem 1rem',
                                                                cursor: 'pointer',
                                                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                                fontSize: '0.85rem'
                                                            }}
                                                            onMouseEnter={(e) => e.target.style.background = '#1e293b'}
                                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            <strong style={{ color: '#D4AF37' }}>{fish.kode_ikan}</strong> - {fish.nama_tipe} ({fish.grade}) - <span style={{ color: '#10b981' }}>Stok: {fish.stok_sisa}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ padding: '0.6rem 1rem', color: '#64748b', fontSize: '0.85rem' }}>Ikan tidak ditemukan / stok habis.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                        <div className="form-group">
                                            <label>Jumlah (Qty)</label>
                                            <input 
                                                type="number" 
                                                value={saleData.qty}
                                                onChange={(e) => setSaleData(prev => ({...prev, qty: e.target.value}))}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Harga Jual Total (Rp)</label>
                                            <input 
                                                type="number" 
                                                value={saleData.nominal}
                                                onChange={(e) => setSaleData(prev => ({...prev, nominal: e.target.value}))}
                                                className="form-control"
                                                placeholder="Contoh: 50000"
                                            />
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleAddToCart} className="btn-submit" style={{ padding: '0.5rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                                        <i className="fas fa-plus"></i> Tambah ke Keranjang
                                    </button>
                                </div>
                            )}

                            {/* Conditional Form: Pembelian Stok Grosir (Category 2) */}
                            {Number(formData.category_id) === 2 && (
                                <div style={{ 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid rgba(255, 255, 255, 0.04)',
                                    marginBottom: '1rem' 
                                }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: '700', marginBottom: '0.8rem' }}>Informasi Ikan Grosir</h4>
                                    
                                    <div className="form-group">
                                        <label>Kode Ikan (Harus Unik)</label>
                                        <input 
                                            type="text" 
                                            name="kode_ikan"
                                            placeholder="Contoh: CO-999"
                                            value={purchaseData.kode_ikan}
                                            onChange={handlePurchaseChange}
                                            className="form-control"
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label>Tipe Ikan (Varian/Kategori)</label>
                                        <input 
                                            type="text" 
                                            name="nama_tipe"
                                            placeholder="Contoh: Plakat Blue Rim"
                                            value={purchaseData.nama_tipe}
                                            onChange={handlePurchaseChange}
                                            className="form-control"
                                            required
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                        <div className="form-group">
                                            <label>Grade</label>
                                            <select 
                                                name="grade" 
                                                value={purchaseData.grade} 
                                                onChange={handlePurchaseChange}
                                                className="form-control"
                                            >
                                                <option value="A">A</option>
                                                <option value="S">S</option>
                                                <option value="S+">S+</option>
                                                <option value="M">M</option>
                                                <option value="Contest">Contest</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Lokasi Awal</label>
                                            <select 
                                                name="lokasi" 
                                                value={purchaseData.lokasi} 
                                                onChange={handlePurchaseChange}
                                                className="form-control"
                                            >
                                                <option value="Pabrik_Pembesaran">Pabrik</option>
                                                <option value="Gudang">Gudang</option>
                                                <option value="Showroom">Showroom</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                        <div className="form-group">
                                            <label>Harga Beli /ekor (Rp)</label>
                                            <input 
                                                type="number" 
                                                name="harga_beli_per_ekor"
                                                placeholder="10000"
                                                value={purchaseData.harga_beli_per_ekor}
                                                onChange={handlePurchaseChange}
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Jumlah (Qty)</label>
                                            <input 
                                                type="number" 
                                                name="stok_sisa"
                                                placeholder="10"
                                                value={purchaseData.stok_sisa}
                                                onChange={handlePurchaseChange}
                                                className="form-control"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            
                            {/* CART TABLE */}
                            {(Number(formData.category_id) === 1 || Number(formData.category_id) === 2) && cart.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Keranjang Transaksi:</h4>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                        {cart.map((item, idx) => (
                                            <li key={idx} style={{ 
                                                background: 'rgba(255,255,255,0.03)', 
                                                padding: '0.8rem', 
                                                borderRadius: '8px',
                                                marginBottom: '0.5rem',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                fontSize: '0.85rem'
                                            }}>
                                                <div>
                                                    <div style={{ color: '#D4AF37', fontWeight: 'bold' }}>
                                                        {Number(formData.category_id) === 1 ? `${item.fish.kode_ikan} - ${item.fish.nama_tipe}` : `${item.kode_ikan} - ${item.nama_tipe}`}
                                                    </div>
                                                    <div style={{ color: '#94a3b8' }}>
                                                        Qty: {item.qty || item.stok_sisa} | Rp {Number(item.nominal).toLocaleString('id-ID')}
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveFromCart(idx)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                    <i className="fas fa-times"></i>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
<div className="form-group">
                                <label>Nominal Transaksi (Rp)</label>
                                <input 
                                    type="number" 
                                    name="nominal" 
                                    placeholder="Nominal rupiah..."
                                    value={formData.nominal} 
                                    onChange={handleFormChange} 
                                    className="form-control"
                                    required 
                                />
                                {(Number(formData.category_id) === 1 || Number(formData.category_id) === 2) && (
                                    <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.2rem', display: 'block' }}>
                                        * Anda bisa mengubah total nominal ini jika ada diskon/penyesuaian.
                                    </small>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Keterangan Tambahan (Opsional)</label>
                                <textarea 
                                    name="keterangan" 
                                    placeholder="Catatan kecil transaksi..."
                                    value={formData.keterangan} 
                                    onChange={handleFormChange} 
                                    className="form-control"
                                    style={{ minHeight: '60px', resize: 'vertical' }}
                                />
                            </div>

                            <button type="submit" className="btn-submit" disabled={actionLoading}>
                                {actionLoading ? (
                                    <>
                                        <div className="spinner-mini"></div> Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-save"></i> Catat Transaksi
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Right Column: Dynamic Tabs & Records display */}
                    <div>
                        {/* Tab header selectors */}
                        <div className="tab-header">
                            <button 
                                onClick={() => setActiveTab('transaksi')} 
                                className={`tab-btn ${activeTab === 'transaksi' ? 'active' : ''}`}
                            >
                                <i className="fas fa-exchange-alt"></i> Jurnal Transaksi
                            </button>
                            <button 
                                onClick={() => setActiveTab('inventaris')} 
                                className={`tab-btn ${activeTab === 'inventaris' ? 'active' : ''}`}
                            >
                                <i className="fas fa-boxes"></i> Logistik Inventaris
                            </button>
                        </div>

                        {/* TAB 1: Transaksi Keuangan Ledger */}
                        {activeTab === 'transaksi' && (
                            <div className="table-panel">
                                <h3 className="panel-title" style={{ border: 'none', marginBottom: '1rem', paddingBottom: 0 }}>
                                    <i className="fas fa-history"></i> Riwayat Arus Kas Toko
                                </h3>
                                
                                {(() => {
                                    const totalPemasukan = transactions.filter(t => t.jenis === 'masuk').reduce((acc, t) => acc + Number(t.nominal), 0);
                                    const totalPengeluaran = transactions.filter(t => t.jenis === 'keluar').reduce((acc, t) => acc + Number(t.nominal), 0);
                                    const totalHPP = transactions.filter(t => t.jenis === 'masuk').reduce((acc, t) => acc + Number(t.hpp_total || 0), 0);
                                    const labaKotor = totalPemasukan - totalHPP;
                                    const totalBiayaOperasional = transactions.filter(t => t.jenis === 'keluar' && Number(t.category_id) !== 2).reduce((acc, t) => acc + Number(t.nominal), 0);
                                    const labaBersih = labaKotor - totalBiayaOperasional;

                                    return (
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Total Pemasukan</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>Rp {totalPemasukan.toLocaleString('id-ID')}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Total Pengeluaran</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#ef4444' }}>Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Laba Kotor</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#3b82f6' }}>Rp {labaKotor.toLocaleString('id-ID')}</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Laba Bersih</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#D4AF37' }}>Rp {labaBersih.toLocaleString('id-ID')}</div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                <div className="table-responsive">
                                    <table className="finance-table">
                                        <thead>
                                            <tr>
                                                <th>Tanggal</th>
                                                <th>Kategori</th>
                                                <th>Item Ikan</th>
                                                <th>Catatan</th>
                                                <th>Nominal</th>
                                                <th>Laba Kotor</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {transactions.length > 0 ? (
                                                transactions.map(t => {
                                                    const isIncome = t.jenis === 'masuk';
                                                    const profit = isIncome && t.hpp_total > 0 ? Number(t.nominal) - Number(t.hpp_total) : null;
                                                    return (
                                                        <tr key={t.id}>
                                                            <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                                                {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </td>
                                                            <td>
                                                                <span className={`finance-badge ${t.jenis}`}>
                                                                    {isIncome ? '+' : '-'} {t.nama_kategori}
                                                                </span>
                                                            </td>
                                                            <td style={{ fontWeight: '600' }}>
                                                                {t.kode_ikan ? (
                                                                    <span style={{ color: '#D4AF37' }}>
                                                                        {t.kode_ikan} <small style={{ color: '#94a3b8', fontWeight: 'normal' }}>({t.nama_tipe})</small>
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                            <td style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '180px' }}>
                                                                {t.keterangan || '-'}
                                                            </td>
                                                            <td style={{ 
                                                                fontWeight: '700', 
                                                                color: isIncome ? '#10b981' : '#f87171',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                {isIncome ? '+' : '-'} Rp {Number(t.nominal).toLocaleString('id-ID')}
                                                            </td>
                                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                                {profit !== null ? (
                                                                    <span style={{ color: '#34d399', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                                                        +Rp {profit.toLocaleString('id-ID')}
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>
                                                        <i className="fas fa-info-circle" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}></i>
                                                        Belum ada catatan transaksi keuangan.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: Logistics Inventaris Sebaran */}
                        {activeTab === 'inventaris' && (
                            <div>
                                {/* Sebaran Lokasi Grid */}
                                <div className="location-group-container">
                                    
                                    {/* Location 1: Pabrik */}
                                    <div className="location-card">
                                        <h4 className="location-title pabrik">
                                            <i className="fas fa-warehouse"></i> Pabrik Pembesaran
                                        </h4>
                                        <div className="location-list">
                                            {fishByLocation.Pabrik_Pembesaran.length > 0 ? (
                                                fishByLocation.Pabrik_Pembesaran.map(fish => (
                                                    <div key={fish.id} className="fish-item">
                                                        <div className="fish-item-header">
                                                            <span className="fish-code">{fish.kode_ikan}</span>
                                                            <span className={`fish-qty ${fish.stok_sisa <= 1 ? 'low' : ''}`}>Qty: {fish.stok_sisa}</span>
                                                        </div>
                                                        <div className="fish-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span>Tipe: <strong>{fish.nama_tipe}</strong></span>
                                                            <span>Grade: <strong>{fish.grade}</strong></span>
                                                            <span>Modal: <strong>Rp {Number(fish.harga_beli_per_ekor).toLocaleString('id-ID')}</strong></span>
                                                            <button 
                                                                onClick={() => handleDeleteStock(fish.id, fish.stok_sisa)} 
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 'auto', padding: '0.2rem 0.5rem' }}
                                                                title="Hapus Ikan (Jika Mati/Invalid)"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        <div className="transfer-group">
                                                            <select 
                                                                className="transfer-select"
                                                                onChange={(e) => handleTransferLocationChange(fish.id, e.target.value)}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Pindahkan...</option>
                                                                <option value="Gudang">Gudang</option>
                                                                <option value="Showroom">Showroom</option>
                                                            </select>
                                                            <button 
                                                                onClick={() => handleTransferSubmit(fish.id)}
                                                                className="transfer-btn"
                                                            >
                                                                OK
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Pabrik kosong.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location 2: Gudang */}
                                    <div className="location-card">
                                        <h4 className="location-title gudang">
                                            <i className="fas fa-boxes"></i> Gudang Sortir
                                        </h4>
                                        <div className="location-list">
                                            {fishByLocation.Gudang.length > 0 ? (
                                                fishByLocation.Gudang.map(fish => (
                                                    <div key={fish.id} className="fish-item">
                                                        <div className="fish-item-header">
                                                            <span className="fish-code">{fish.kode_ikan}</span>
                                                            <span className={`fish-qty ${fish.stok_sisa <= 1 ? 'low' : ''}`}>Qty: {fish.stok_sisa}</span>
                                                        </div>
                                                        <div className="fish-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span>Tipe: <strong>{fish.nama_tipe}</strong></span>
                                                            <span>Grade: <strong>{fish.grade}</strong></span>
                                                            <span>Modal: <strong>Rp {Number(fish.harga_beli_per_ekor).toLocaleString('id-ID')}</strong></span>
                                                            <button 
                                                                onClick={() => handleDeleteStock(fish.id, fish.stok_sisa)} 
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 'auto', padding: '0.2rem 0.5rem' }}
                                                                title="Hapus Ikan (Jika Mati/Invalid)"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        <div className="transfer-group">
                                                            <select 
                                                                className="transfer-select"
                                                                onChange={(e) => handleTransferLocationChange(fish.id, e.target.value)}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Pindahkan...</option>
                                                                <option value="Pabrik_Pembesaran">Pabrik</option>
                                                                <option value="Showroom">Showroom</option>
                                                            </select>
                                                            <button 
                                                                onClick={() => handleTransferSubmit(fish.id)}
                                                                className="transfer-btn"
                                                            >
                                                                OK
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Gudang kosong.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Location 3: Showroom */}
                                    <div className="location-card">
                                        <h4 className="location-title showroom">
                                            <i className="fas fa-store"></i> Showroom Utama
                                        </h4>
                                        <div className="location-list">
                                            {fishByLocation.Showroom.length > 0 ? (
                                                fishByLocation.Showroom.map(fish => (
                                                    <div key={fish.id} className="fish-item">
                                                        <div className="fish-item-header">
                                                            <span className="fish-code">{fish.kode_ikan}</span>
                                                            <span className={`fish-qty ${fish.stok_sisa <= 1 ? 'low' : ''}`}>Qty: {fish.stok_sisa}</span>
                                                        </div>
                                                        <div className="fish-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                                                            <span>Tipe: <strong>{fish.nama_tipe}</strong></span>
                                                            <span>Grade: <strong>{fish.grade}</strong></span>
                                                            <span>Modal: <strong>Rp {Number(fish.harga_beli_per_ekor).toLocaleString('id-ID')}</strong></span>
                                                            <button 
                                                                onClick={() => handleDeleteStock(fish.id, fish.stok_sisa)} 
                                                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: 'auto', padding: '0.2rem 0.5rem' }}
                                                                title="Hapus Ikan (Jika Mati/Invalid)"
                                                            >
                                                                <i className="fas fa-trash"></i>
                                                            </button>
                                                        </div>
                                                        <div className="transfer-group">
                                                            <select 
                                                                className="transfer-select"
                                                                onChange={(e) => handleTransferLocationChange(fish.id, e.target.value)}
                                                                defaultValue=""
                                                            >
                                                                <option value="" disabled>Pindahkan...</option>
                                                                <option value="Pabrik_Pembesaran">Pabrik</option>
                                                                <option value="Gudang">Gudang</option>
                                                            </select>
                                                            <button 
                                                                onClick={() => handleTransferSubmit(fish.id)}
                                                                className="transfer-btn"
                                                            >
                                                                OK
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>Showroom kosong.</div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Success Toast */}
            {toast.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: '#fff',
                    padding: '1rem 2rem',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    zIndex: 10000,
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    animation: 'slideDown 0.3s ease'
                }}>
                    <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {toast.message}
                </div>
            )}
            </div>
            <Footer />
            <FAB />
        </>
    );
}
