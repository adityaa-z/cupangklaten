'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
    getPromoSettings, updatePromoSettings, getClaimByCode, processAndCleanUpClaim,
    createGeneralPromo, getAllGeneralPromos, toggleGeneralPromoStatus, deleteGeneralPromo, getAllClaims, getPromoStats,
    deleteClaimImage
} from '@/app/actions/promo';

import './admin.css';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Produk');
    const [products, setProducts] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [members, setMembers] = useState([]);
    const [auctions, setAuctions] = useState([]);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);

    // Auth State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('product'); // 'product' or 'faq'
    const [editingItem, setEditingItem] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [uploadingField, setUploadingField] = useState(null);

    // Promo Tab States
    const [promoActiveTab, setPromoActiveTab] = useState('voucher');
    const [promoActive, setPromoActive] = useState(false);
    const [dailyLimit, setDailyLimit] = useState(10);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [scannerActive, setScannerActive] = useState(false);
    const [scannedClaim, setScannedClaim] = useState(null);
    const [isProcessingClaim, setIsProcessingClaim] = useState(false);
    const [scanMessage, setScanMessage] = useState('');
    const [manualCode, setManualCode] = useState('');
    const [generalPromos, setGeneralPromos] = useState([]);
    const [allClaims, setAllClaims] = useState([]);
    const [promoStats, setPromoStats] = useState({ limit: 0, claimedToday: 0, remainingLimit: 0 });
    const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
    const [promoFormData, setPromoFormData] = useState({
        title: '', description: '', targetCategory: '5k', 
        priceOrDiscount: '', startDate: '', endDate: ''
    });


    // Form States (Product)
    const [formData, setFormData] = useState({
        code: '', category: '', variant: '', gender: 'Jantan',
        age: '', size: 'M', stock: 1, price: 0, shopee: '',
        img: '', img2: '', img3: '', img4: '', is_video: false,
        title: '', description: '', image_url: '', image2_url: '', image3_url: '', image4_url: '', start_price: 0, min_bid_increment: 0, start_time: '', end_time: '', status: 'draft'
    });

    useEffect(() => {
        setIsMounted(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, fRes, rRes, mRes, aRes, artRes] = await Promise.all([
                fetch('/api/admin/products/'),
                fetch('/api/admin/faq/'),
                fetch('/api/admin/reviews/'),
                fetch('/api/admin/members/'),
                fetch('/api/admin/auctions/'),
                fetch('/api/admin/articles/')
            ]);

            if (pRes.ok) setProducts(await pRes.json());
            if (fRes.ok) setFaqs(await fRes.json());
            if (rRes.ok) setReviews(await rRes.json());
            if (mRes.ok) setMembers(await mRes.json());
            if (aRes.ok) setAuctions(await aRes.json());
            if (artRes && artRes.ok) setArticles(await artRes.json());
        } catch (err) {
            console.error('Unexpected error fetching data:', err);
        }
        setLoading(false);

    const fetchPromoData = async () => {
        try {
            const settings = await getPromoSettings();
            setPromoActive(settings.PROMO_ACTIVE === 'true');
            setDailyLimit(parseInt(settings.PROMO_DAILY_LIMIT, 10));
            const pData = await getAllGeneralPromos();
            const cData = await getAllClaims();
            setAllClaims(cData);
            const sData = await getPromoStats();
            setPromoStats(sData);
            setGeneralPromos(pData);
        } catch (err) { console.error('Promo fetch error:', err); }
    };
    fetchPromoData();
    
    };

    
    // Promo Logic
    const handleSaveSettings = async () => {
        setIsSavingSettings(true);
        await updatePromoSettings(promoActive, dailyLimit);
        alert('Pengaturan Voucher berhasil disimpan!');
        setIsSavingSettings(false);
    };

    useEffect(() => {
        if (activeTab === 'Promo' && promoActiveTab === 'voucher' && scannerActive) {
            const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: { width: 250, height: 250 } }, false);
            scanner.render((decodedText) => {
                scanner.clear();
                setScannerActive(false);
                handleScannedCode(decodedText);
            }, () => {});
            return () => { scanner.clear().catch(e => console.error(e)); };
        }
    }, [scannerActive, activeTab, promoActiveTab]);

    const handleManualCodeSubmit = async (e) => {
        e.preventDefault();
        if (manualCode) {
            handleScannedCode(manualCode);
            setManualCode('');
        }
    };

    const handleScannedCode = async (code) => {
        setScanMessage('Memeriksa kode...');
        const claim = await getClaimByCode(code);
        if (claim) { setScannedClaim(claim); setScanMessage(''); } 
        else { setScanMessage('Kode tidak valid.'); }
    };

    const handleProcessClaim = async (action) => {
        setIsProcessingClaim(true);
        const res = await processAndCleanUpClaim(scannedClaim.claim_code, action);
        if (res.success) { alert(`Voucher berhasil di-${action}`); setScannedClaim(null); const cData = await getAllClaims(); setAllClaims(cData); } 
        else { alert(`Gagal: ${res.error}`); }
        setIsProcessingClaim(false);
    };

    const handleDeleteClaimImage = async () => {
        if (!scannedClaim || !scannedClaim.image_path) return;
        if (!confirm('Hapus foto/screenshot ini dari server? Tindakan ini tidak bisa dibatalkan.')) return;
        try {
            const res = await fetch('/api/admin/delete-image/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ claimCode: scannedClaim.claim_code })
            });
            const data = await res.json();
            if (data.success) {
                setScannedClaim({ ...scannedClaim, image_path: null });
                const cData = await getAllClaims();
                setAllClaims(cData);
                alert('Foto berhasil dihapus dari server.');
            } else {
                alert(`Gagal: ${data.error}`);
            }
        } catch (e) {
            alert('Terjadi kesalahan jaringan.');
        }
    };

    const handleCreatePromo = async (e) => {
        e.preventDefault();
        setIsSubmittingPromo(true);
        const res = await createGeneralPromo(promoFormData);
        if (res.success) {
            alert('Promo berhasil dibuat!');
            setPromoFormData({title: '', description: '', targetCategory: '5k', priceOrDiscount: '', startDate: '', endDate: ''});
            const pData = await getAllGeneralPromos();
            setGeneralPromos(pData);
        } else { alert('Gagal membuat promo'); }
        setIsSubmittingPromo(false);
    };

    const handleTogglePromoStatus = async (id, currentStatus) => {
        await toggleGeneralPromoStatus(id, !currentStatus);
        const pData = await getAllGeneralPromos(); setGeneralPromos(pData);
    };

    const handleDeleteGeneralPromo = async (id) => {
        if (confirm('Yakin hapus?')) {
            await deleteGeneralPromo(id);
            const pData = await getAllGeneralPromos(); setGeneralPromos(pData);
        }
    };
    
    const handleLogout = async () => {
        signOut({ callbackUrl: '/' });
    };

    // Member Functions
    const updateMemberStatus = async (id, status, phone, name) => {
        if (!confirm(`Yakin ingin mengubah status akun ini menjadi ${status}?`)) return;
        
        const res = await fetch('/api/admin/members/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        
        if (res.status === 401) return handleLogout();
        if (res.ok) {
            fetchData();
            if (status === 'approved' && phone) {
                // Format phone number to WA format (start with 62)
                let waNumber = phone.replace(/\D/g, '');
                if (waNumber.startsWith('0')) waNumber = '62' + waNumber.substring(1);
                
                const waLink = `https://wa.me/${waNumber}?text=Halo%20${name},%0AAkun%20Cupang%20Klaten%20Anda%20telah%20DISETUJUI!%0ASekarang%20Anda%20bisa%20login%20dan%20mengikuti%20lelang%20di%20website%20kami.%0A%0ASelamat%20bergabung!`;
                window.open(waLink, '_blank');
            }
        }
    };

    // Product Functions
    const deleteProduct = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        const res = await fetch(`/api/admin/products/?id=${id}`, { method: 'DELETE' });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const togglePin = async (product) => {
        const res = await fetch('/api/admin/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id, is_pinned: !product.is_pinned })
        });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const toggleStock = async (product) => {
        const update = {
            id: product.id,
            is_available: !product.is_available,
            sold_at: !product.is_available ? new Date().toISOString() : null,
            is_pinned: false // Unpin if sold out
        };
        const res = await fetch('/api/admin/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const updateStock = async (product, delta) => {
        const newStock = Math.max(0, product.stock + delta);
        const update = {
            id: product.id,
            stock: newStock,
            is_available: newStock > 0,
            sold_at: newStock === 0 ? (product.sold_at || new Date().toISOString()) : null
        };
        const res = await fetch('/api/admin/products/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(update)
        });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const archiveOrder = async (id) => {
        const res = await fetch('/api/admin/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, is_archived: true, archived_at: new Date().toISOString() })
        });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const handleFileUpload = async (e, field, isPrimary) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            alert('Ukuran file maksimal 20 MB!');
            e.target.value = '';
            return;
        }

        setUploadingField(field);
        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const res = await fetch('/api/admin/upload/', {
                method: 'POST',
                body: formDataUpload
            });

            if (!res.ok) throw new Error('Gagal upload ke storage');

            const { url } = await res.json();
            const isVid = isPrimary && file.type?.startsWith('video/');
            
            setFormData(prev => ({ 
                ...prev, 
                [field]: url, 
                is_video: isPrimary ? isVid : prev.is_video 
            }));
        } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal mengupload gambar. Silakan coba lagi.');
        } finally {
            setUploadingField(null);
            e.target.value = ''; // Reset input
        }
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        let res;
        if (modalType === 'product') {
            const dataToSave = editingItem ? { ...formData, id: editingItem.id } : { ...formData, is_available: formData.stock > 0 };
            res = await fetch('/api/admin/products/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSave)
            });
        } else if (modalType === 'faq') {
            const faqData = editingItem 
                ? { id: editingItem.id, question: formData.question, answer: formData.answer }
                : { question: formData.question, answer: formData.answer };
            res = await fetch('/api/admin/faq/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(faqData)
            });
        } else if (modalType === 'review') {
            res = await fetch('/api/admin/reviews/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData)
            });
        } else if (modalType === 'auction') {
            res = await fetch('/api/admin/auctions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData)
            });
        } else if (modalType === 'article') {
            res = await fetch('/api/admin/articles/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem ? { ...formData, id: editingItem.id } : formData)
            });
        }

        if (res && res.status === 401) return handleLogout();
        
        if (res && res.ok) {
            setIsModalOpen(false);
            fetchData();
            setToast({ 
                show: true, 
                message: modalType === 'product' ? 'Produk berhasil disimpan!' : modalType === 'faq' ? 'FAQ berhasil disimpan!' : modalType === 'article' ? 'Artikel berhasil disimpan!' : 'Data berhasil disimpan!', 
                type: 'success' 
            });
            setTimeout(() => setToast({ ...toast, show: false }), 3000);
        } else {
            alert('Gagal menyimpan data!');
        }
    };

    const deleteFaq = async (id) => {
        if (!confirm('Hapus FAQ ini?')) return;
        const res = await fetch(`/api/admin/faq/?id=${id}`, { method: 'DELETE' });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const deleteReview = async (id) => {
        if (!confirm('Hapus ulasan ini?')) return;
        const res = await fetch(`/api/admin/reviews/?id=${id}`, { method: 'DELETE' });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const updateReviewStatus = async (id, status) => {
        const r = reviews.find(item => item.id === id);
        if (!r) return;

        const res = await fetch('/api/admin/reviews/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...r, status })
        });
        
        if (res.status === 401) return handleLogout();
        if (res.ok) {
            fetchData();
            setToast({
                show: true,
                message: status === 'approved' ? 'Ulasan berhasil diupload!' : 'Ulasan berhasil disembunyikan!',
                type: 'success'
            });
            setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
        } else {
            alert('Gagal mengubah status ulasan!');
        }
    };

    const deleteAuction = async (id) => {
        if (!confirm('Hapus item lelang ini?')) return;
        const res = await fetch(`/api/admin/auctions/?id=${id}`, { method: 'DELETE' });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    const deleteArticle = async (id) => {
        if (!confirm('Hapus artikel ini?')) return;
        const res = await fetch(`/api/admin/articles/?id=${id}`, { method: 'DELETE' });
        if (res.status === 401) return handleLogout();
        if (res.ok) fetchData();
    };

    if (!isMounted) {
        return (
            <div className="admin-body" style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="/logo.png" alt="Logo" style={{ height: '30px', borderRadius: '4px' }} />
                    HQ Panel
                </div>
                <div className="sidebar-nav">
                    {['Produk', 'Lelang', 'Member', 'Pesanan', 'Promo', 'FAQ', 'Statistik', 'Ulasan', 'Blog'].map(tab => (
                        <div key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            <i className={`fas fa-${tab === 'Produk' ? 'box' : tab === 'Lelang' ? 'gavel' : tab === 'Member' ? 'users' : tab === 'Pesanan' ? 'shopping-cart' : tab === 'Promo' ? 'bullhorn' : tab === 'FAQ' ? 'question-circle' : tab === 'Statistik' ? 'chart-line' : tab === 'Ulasan' ? 'star' : 'newspaper'}`}></i>
                            {tab}
                        </div>
                    ))}
                </div>
            </aside>

            <main className="main-content">
                <header className="main-header">
                    <h2>{activeTab} Management</h2>
                    <div className="user-profile">
                        <span>Admin</span>
                        <button className="btn btn-outline" onClick={handleLogout} style={{ color: 'red', borderColor: 'red' }}>Logout</button>
                    </div>
                </header>

                <div className="content-body">
                    {activeTab === 'Produk' && (
                        <div className="tab-view">
                            <div className="dashboard-controls">
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setModalType('product'); setIsModalOpen(true); }}>
                                    <i className="fas fa-plus"></i> Tambah Ikan
                                </button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Pin</th>
                                            <th>Media</th>
                                            <th>Kode</th>
                                            <th>Kategori</th>
                                            <th>Harga</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(p => (
                                            <tr key={p.id}>
                                                <td data-label="Pin" style={{ textAlign: 'center' }}>
                                                    <button
                                                        className={`btn-icon ${p.is_pinned ? 'pinned' : ''}`}
                                                        onClick={() => togglePin(p)}
                                                        title={p.is_pinned ? 'Unpin dari Beranda' : 'Pin ke Beranda'}
                                                        style={{ color: p.is_pinned ? '#f59e0b' : '#cbd5e1', fontSize: '1.2rem' }}
                                                    >
                                                        <i className={`fas fa-star`}></i>
                                                    </button>
                                                </td>
                                                <td className="td-img" data-label="Media">
                                                    {p.is_video ? (
                                                        <video src={p.img?.startsWith('http') || p.img?.startsWith('data:') ? p.img : '/logo.png'} muted />
                                                    ) : (
                                                        <img src={p.img?.startsWith('http') || p.img?.startsWith('data:') ? p.img : '/logo.png'} alt="" />
                                                    )}
                                                </td>
                                                <td data-label="Kode">{p.code}</td>
                                                <td data-label="Kategori">{p.category}</td>
                                                <td data-label="Harga">Rp {p.price.toLocaleString()}</td>
                                                <td data-label="Status">
                                                    <div className="status-control" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                            <label className="switch">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={p.is_available && p.stock > 0}
                                                                    onChange={() => toggleStock(p)}
                                                                />
                                                                <span className="slider"></span>
                                                            </label>
                                                            <span className={`status-badge ${p.is_available && p.stock > 0 ? 'status-tersedia' : 'status-terjual'}`}>
                                                                {p.is_available && p.stock > 0 ? 'Ready' : 'Sold'}
                                                            </span>
                                                        </div>
                                                        <div className="qty-control">
                                                            <button className="qty-btn" onClick={() => updateStock(p, -1)}>-</button>
                                                            <input type="number" className="qty-input" value={p.stock} readOnly />
                                                            <button className="qty-btn" onClick={() => updateStock(p, 1)}>+</button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="action-btns" data-label="Aksi">
                                                    <button className="btn-icon" onClick={() => { setEditingItem(p); setFormData(p); setModalType('product'); setIsModalOpen(true); }}><i className="fas fa-edit"></i></button>
                                                    <button className="btn-icon delete" onClick={() => deleteProduct(p.id)}><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Lelang' && (
                        <div className="tab-view">
                            <div className="dashboard-controls">
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', image_url: '', start_price: 100000, min_bid_increment: 10000, start_time: '', end_time: '', status: 'draft' }); setModalType('auction'); setIsModalOpen(true); }}>
                                    <i className="fas fa-plus"></i> Buat Lelang
                                </button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Media</th>
                                            <th>Judul</th>
                                            <th>OB & Kelipatan</th>
                                            <th>Jadwal</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auctions.map(a => {
                                            const now = new Date();
                                            const end = new Date(a.end_time);
                                            const isEnded = now > end || a.status === 'ended';
                                            return (
                                                <tr key={a.id}>
                                                    <td className="td-img" data-label="Media">
                                                        {a.image_url ? <img src={a.image_url} alt="" /> : <div style={{width:'50px', height:'50px', background:'#eee', borderRadius:'8px'}}/>}
                                                    </td>
                                                    <td data-label="Judul" style={{fontWeight: 'bold', color: 'var(--primary-dark)'}}>{a.title}</td>
                                                    <td data-label="OB & Kelipatan">
                                                        <div>OB: <span style={{color: '#10b981', fontWeight: 'bold'}}>Rp {a.start_price.toLocaleString()}</span></div>
                                                        <div style={{fontSize: '0.8rem', color: '#718096'}}>Kel: Rp {a.min_bid_increment.toLocaleString()}</div>
                                                    </td>
                                                    <td data-label="Jadwal" style={{fontSize: '0.85rem'}}>
                                                        <div>Mulai: {new Date(a.start_time).toLocaleString('id-ID')}</div>
                                                        <div>Tutup: {new Date(a.end_time).toLocaleString('id-ID')}</div>
                                                    </td>
                                                    <td data-label="Status">
                                                        <span style={{
                                                            padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                                            backgroundColor: isEnded ? '#fee2e2' : a.status === 'active' ? '#dcfce7' : '#f1f5f9',
                                                            color: isEnded ? '#991b1b' : a.status === 'active' ? '#166534' : '#475569'
                                                        }}>
                                                            {isEnded ? 'ENDED' : a.status.toUpperCase()}
                                                        </span>
                                                        {isEnded && a.winner_name && a.payment_status !== 'paid' && (
                                                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>🏆 {a.winner_name}</div>
                                                                <div style={{ color: '#64748b' }}>Rp {Number(a.max_bid).toLocaleString('id-ID')}</div>
                                                                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                                                                    <a href={`https://wa.me/${a.winner_phone?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                        <i className="fab fa-whatsapp"></i> Hubungi
                                                                    </a>
                                                                    <span style={{ color: '#cbd5e1' }}>|</span>
                                                                    <button onClick={async () => {
                                                                        if (!confirm('Tandai lelang ini sudah dibayar LUNAS oleh pemenang?')) return;
                                                                        const res = await fetch('/api/admin/auctions/', {
                                                                            method: 'POST',
                                                                            headers: {'Content-Type': 'application/json'},
                                                                            body: JSON.stringify({ id: a.id, action: 'mark_paid' })
                                                                        });
                                                                        if (res.ok) fetchData();
                                                                    }} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}>
                                                                        <i className="fas fa-check-double"></i> Tandai Lunas
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {isEnded && a.payment_status === 'paid' && (
                                                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: '#ecfdf5', padding: '0.5rem', borderRadius: '8px', border: '1px solid #10b981', color: '#059669', fontWeight: 'bold', textAlign: 'center' }}>
                                                                <i className="fas fa-check-circle"></i> LUNAS TERBAYAR
                                                                <div style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#10b981' }}>{a.winner_name}</div>
                                                            </div>
                                                        )}
                                                        {isEnded && !a.winner_name && (
                                                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8' }}>Tidak ada pemenang</div>
                                                        )}
                                                    </td>
                                                    <td className="action-btns" data-label="Aksi">
                                                        <button className="btn-icon" onClick={() => { 
                                                            const sd = new Date(a.start_time);
                                                            const ed = new Date(a.end_time);
                                                            // Format to datetime-local YYYY-MM-DDThh:mm
                                                            const sdStr = new Date(sd.getTime() - (sd.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                                            const edStr = new Date(ed.getTime() - (ed.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                                            
                                                            setEditingItem(a); 
                                                            setFormData({...a, start_time: sdStr, end_time: edStr}); 
                                                            setModalType('auction'); 
                                                            setIsModalOpen(true); 
                                                        }}><i className="fas fa-edit"></i></button>
                                                        <button className="btn-icon delete" onClick={() => deleteAuction(a.id)}><i className="fas fa-trash"></i></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Member' && (
                        <div className="tab-view">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Nama & Email</th>
                                            <th>WhatsApp</th>
                                            <th>Alamat</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {members.map(m => (
                                            <tr key={m.id}>
                                                <td data-label="Nama & Email">
                                                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{m.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: '#718096' }}>{m.email}</div>
                                                </td>
                                                <td data-label="WhatsApp">
                                                    <a href={`https://wa.me/${m.phone?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 'bold', textDecoration: 'none' }}>
                                                        <i className="fab fa-whatsapp"></i> {m.phone || '-'}
                                                    </a>
                                                </td>
                                                <td data-label="Alamat" style={{ fontSize: '0.85rem', maxWidth: '200px' }}>{m.address || '-'}</td>
                                                <td data-label="Status">
                                                    <span style={{ 
                                                        padding: '0.3rem 0.8rem', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 'bold',
                                                        backgroundColor: m.status === 'approved' ? '#dcfce7' : m.status === 'rejected' ? '#fee2e2' : '#fef9c3',
                                                        color: m.status === 'approved' ? '#166534' : m.status === 'rejected' ? '#991b1b' : '#854d0e'
                                                    }}>
                                                        {m.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td data-label="Aksi" style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {m.status === 'pending' && (
                                                        <>
                                                            <button className="btn" onClick={() => updateMemberStatus(m.id, 'approved', m.phone, m.name)} style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>
                                                                <i className="fas fa-check"></i> Setujui
                                                            </button>
                                                            <button className="btn" onClick={() => updateMemberStatus(m.id, 'rejected')} style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}>
                                                                <i className="fas fa-times"></i> Tolak
                                                            </button>
                                                        </>
                                                    )}
                                                    {m.status === 'approved' && (
                                                        <button className="btn" onClick={() => updateMemberStatus(m.id, 'rejected')} style={{ padding: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px' }}>
                                                            Blokir
                                                        </button>
                                                    )}
                                                    {m.status === 'rejected' && (
                                                        <button className="btn" onClick={() => updateMemberStatus(m.id, 'approved', m.phone, m.name)} style={{ padding: '0.5rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px' }}>
                                                            Pulihkan
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Pesanan' && (
                        <div className="tab-view">
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Media</th>
                                            <th>Info Pesanan</th>
                                            <th>Detail Ikan</th>
                                            <th>Harga</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.filter(p => (!p.is_available || p.stock <= 0) && !p.is_archived).map(p => (
                                            <tr key={p.id}>
                                                <td className="td-img" data-label="Media">
                                                    {p.is_video ? <video src={p.img} muted /> : <img src={p.img} alt="" />}
                                                </td>
                                                <td data-label="Info Pesanan">
                                                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{p.code}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#718096' }}>
                                                        <i className="fas fa-clock"></i> Checkout: {p.sold_at ? new Date(p.sold_at).toLocaleDateString('id-ID') : '-'}
                                                    </div>
                                                </td>
                                                <td data-label="Detail Ikan">
                                                    <div style={{ fontWeight: '600' }}>{p.category}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.variant || '-'}</div>
                                                </td>
                                                <td style={{ fontWeight: '600', color: '#10b981' }} data-label="Harga">Rp {p.price.toLocaleString()}</td>
                                                <td data-label="Aksi">
                                                    <button className="btn btn-primary" onClick={() => archiveOrder(p.id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#6366f1' }}>
                                                        Selesai Pengiriman
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    
                    {activeTab === 'Promo' && (
                        <div className="tab-view">
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <button onClick={() => setPromoActiveTab('voucher')} style={{ padding: '0.8rem 1.5rem', background: promoActiveTab === 'voucher' ? 'var(--primary-cyan)' : 'transparent', color: promoActiveTab === 'voucher' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <i className="fas fa-ticket-alt"></i> Voucher Maps
                                </button>
                                <button onClick={() => setPromoActiveTab('general')} style={{ padding: '0.8rem 1.5rem', background: promoActiveTab === 'general' ? '#D4AF37' : 'transparent', color: promoActiveTab === 'general' ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    <i className="fas fa-bullhorn"></i> Promo Umum
                                </button>
                            </div>

                            {promoActiveTab === 'voucher' && (
                                <>
                                    
                                <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)' }}>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>Sisa Kuota Voucher Hari Ini</h3>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{promoStats.remainingLimit} <span style={{ fontSize: '1rem', fontWeight: 'normal', opacity: 0.8 }}>/ {promoStats.limit} Voucher</span></div>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{promoStats.claimedToday}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>Terklaim</div>
                                    </div>
                                </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-cog"></i> Pengaturan Voucher</h3>
                                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px' }}>
                                            <div>
                                                <div style={{ fontWeight: 'bold', color: 'var(--text-dark)' }}>Status Promo Maps</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Popup di halaman utama</div>
                                            </div>
                                            <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                                                <input type="checkbox" checked={promoActive} onChange={(e) => setPromoActive(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                                                <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: promoActive ? '#10b981' : '#cbd5e1', transition: '.4s', borderRadius: '34px' }}>
                                                    <span style={{ position: 'absolute', content: '""', height: '26px', width: '26px', left: promoActive ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                                                </span>
                                            </label>
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Limit Harian</label>
                                            <input type="number" value={dailyLimit} onChange={(e) => setDailyLimit(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                        </div>
                                        <button onClick={handleSaveSettings} disabled={isSavingSettings} style={{ width: '100%', padding: '1rem', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                            {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                        </button>
                                    </div>

                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
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

                                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Cek Kode Manual</label>
                                            <form onSubmit={handleManualCodeSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input 
                                                    type="text" 
                                                    value={manualCode} 
                                                    onChange={e => setManualCode(e.target.value.toUpperCase())} 
                                                    placeholder="Contoh: VOUCHER-XXXXXX" 
                                                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', textTransform: 'uppercase' }} 
                                                />
                                                <button type="submit" style={{ padding: '0.8rem 1.5rem', background: 'var(--primary-dark)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    Cek
                                                </button>
                                            </form>
                                        </div>
                                    </div>

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
                                                <div style={{ marginBottom: '1rem' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Dibuat</div>
                                                    <div style={{ fontSize: '1rem', color: '#111827' }}>
                                                        {scannedClaim.created_at ? new Date(scannedClaim.created_at).toLocaleString('id-ID') : '-'}
                                                        {scannedClaim.is_expired && (
                                                            <span style={{ marginLeft: '0.5rem', background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                                <i className="fas fa-exclamation-triangle"></i> HANGUS (lebih dari 2 hari)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '2rem' }}>
                                                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>Bukti Screenshot</div>
                                                    {scannedClaim.image_path ? (
                                                        <img src={scannedClaim.image_path} alt="Bukti" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                                    ) : (
                                                        <div style={{ padding: '2rem', background: '#f3f4f6', textAlign: 'center', color: '#9ca3af', borderRadius: '8px' }}>
                                                            <i className="fas fa-image" style={{ marginRight: '0.5rem' }}></i>Foto dihapus otomatis setelah diproses
                                                        </div>
                                                    )}
                                                </div>
                                                {scannedClaim.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => handleProcessClaim('approve')} disabled={isProcessingClaim} style={{ flex: 1, padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                            <i className="fas fa-check"></i> Approve
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
                                <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', marginTop: '2rem' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-list-alt"></i> Daftar Klaim Voucher</h3>
                                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Kode & Tanggal</th>
                                                    <th>Pelanggan</th>
                                                    <th>Status</th>
                                                    <th>Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allClaims.length === 0 ? (
                                                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada klaim voucher</td></tr>
                                                ) : allClaims.map(c => (
                                                    <tr key={c.id}>
                                                        <td>
                                                            <div style={{ fontWeight: 'bold' }}>{c.claim_code}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleDateString('id-ID')}</div>
                                                        </td>
                                                        <td>
                                                            <div style={{ fontWeight: 'bold' }}>{c.maps_name}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#10b981' }}><i className="fab fa-whatsapp"></i> {c.whatsapp_number}</div>
                                                        </td>
                                                        <td>
                                                            <span style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', background: c.status === 'pending' ? '#fef3c7' : (c.status === 'claimed' ? '#d1fae5' : '#fee2e2'), color: c.status === 'pending' ? '#d97706' : (c.status === 'claimed' ? '#059669' : '#dc2626') }}>
                                                                {c.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <button onClick={() => setScannedClaim(c)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', background: '#3b82f6' }}>
                                                                <i className="fas fa-eye"></i> Detail
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                </>
                            )}

                            {promoActiveTab === 'general' && (
                                <div>
                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', marginBottom: '2rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-plus-circle"></i> Buat Promo Umum</h3>
                                        <form onSubmit={handleCreatePromo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Judul Promo</label>
                                                <input required type="text" value={promoFormData.title} onChange={e=>setPromoFormData({...promoFormData, title: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Kategori Target</label>
                                                <input required type="text" value={promoFormData.targetCategory} onChange={e=>setPromoFormData({...promoFormData, targetCategory: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Deskripsi Singkat</label>
                                                <textarea required value={promoFormData.description} onChange={e=>setPromoFormData({...promoFormData, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Harga / Diskon</label>
                                                <input required type="text" value={promoFormData.priceOrDiscount} onChange={e=>setPromoFormData({...promoFormData, priceOrDiscount: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                            </div>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Mulai</label>
                                                    <input required type="datetime-local" value={promoFormData.startDate} onChange={e=>setPromoFormData({...promoFormData, startDate: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Berakhir</label>
                                                    <input required type="datetime-local" value={promoFormData.endDate} onChange={e=>setPromoFormData({...promoFormData, endDate: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }} />
                                                </div>
                                            </div>
                                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
                                                <button type="submit" disabled={isSubmittingPromo} style={{ padding: '1rem 3rem', background: '#D4AF37', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                                    {isSubmittingPromo ? 'Menyimpan...' : 'Terbitkan Promo'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>

                                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text-dark)' }}><i className="fas fa-list"></i> Daftar Promo</h3>
                                        <div className="table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Judul</th>
                                                        <th>Masa Berlaku</th>
                                                        <th>Status</th>
                                                        <th>Aksi</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {generalPromos.length === 0 ? (
                                                        <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Belum ada promo.</td></tr>
                                                    ) : generalPromos.map(promo => (
                                                        <tr key={promo.id}>
                                                            <td>
                                                                <div style={{ fontWeight: 'bold' }}>{promo.title}</div>
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{promo.price_or_discount}</div>
                                                            </td>
                                                            <td style={{ fontSize: '0.9rem' }}>
                                                                {new Date(promo.start_date).toLocaleDateString('id-ID')} s/d {new Date(promo.end_date).toLocaleDateString('id-ID')}
                                                            </td>
                                                            <td>
                                                                <button onClick={() => handleTogglePromoStatus(promo.id, promo.is_active)} style={{ padding: '0.3rem 0.8rem', borderRadius: '50px', border: 'none', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', background: promo.is_active ? '#d1fae5' : '#f1f5f9', color: promo.is_active ? '#059669' : '#64748b' }}>
                                                                    {promo.is_active ? 'AKTIF' : 'NONAKTIF'}
                                                                </button>
                                                            </td>
                                                            <td>
                                                                <button onClick={() => handleDeleteGeneralPromo(promo.id)} className="btn-icon delete"><i className="fas fa-trash"></i></button>
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
                    )}


                    {activeTab === 'FAQ' && (
                        <div className="tab-view">
                            <div className="dashboard-controls">
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setModalType('faq'); setFormData({ question: '', answer: '' }); setIsModalOpen(true); }}>
                                    <i className="fas fa-plus"></i> Tambah FAQ
                                </button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Pertanyaan</th>
                                            <th>Jawaban</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {faqs.map(f => (
                                            <tr key={f.id}>
                                                <td style={{ fontWeight: '600' }} data-label="Pertanyaan">{f.question}</td>
                                                <td style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }} data-label="Jawaban">{f.answer}</td>
                                                <td className="action-btns" data-label="Aksi">
                                                    <button className="btn-icon" onClick={() => { setEditingItem(f); setFormData(f); setModalType('faq'); setIsModalOpen(true); }}><i className="fas fa-edit"></i></button>
                                                    <button className="btn-icon delete" onClick={() => deleteFaq(f.id)}><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Statistik' && (
                        <div className="tab-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #00bcd4', boxShadow: 'var(--shadow-sm)' }}>
                                <small style={{ color: 'var(--text-muted)', fontWeight: '600' }}>READY STOK</small>
                                <h3 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{products.filter(p => p.is_available && p.stock > 0).length}</h3>
                            </div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #ff7043', boxShadow: 'var(--shadow-sm)' }}>
                                <small style={{ color: 'var(--text-muted)', fontWeight: '600' }}>TOTAL TERJUAL</small>
                                <h3 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{products.filter(p => !p.is_available || p.stock <= 0).length}</h3>
                            </div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid #6366f1', boxShadow: 'var(--shadow-sm)' }}>
                                <small style={{ color: 'var(--text-muted)', fontWeight: '600' }}>DIPROSES</small>
                                <h3 style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{products.filter(p => (!p.is_available || p.stock <= 0) && !p.is_archived).length}</h3>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Ulasan' && (
                        <div className="tab-view">
                            <div className="dashboard-controls">
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setFormData({ name: '', rating: 5, content: '', status: 'approved' }); setModalType('review'); setIsModalOpen(true); }}>
                                    <i className="fas fa-plus"></i> Tambah Ulasan Baru
                                </button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Media</th>
                                            <th>Nama</th>
                                            <th>Rating</th>
                                            <th>Komentar</th>
                                            <th>Status</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reviews.map(r => (
                                            <tr key={r.id}>
                                                <td className="td-img">
                                                    {r.img ? <img src={r.img} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><i className="fas fa-image"></i></div>}
                                                </td>
                                                <td style={{ fontWeight: '600' }} data-label="Nama">{r.name}</td>
                                                <td style={{ color: '#facc15' }} data-label="Rating">{'⭐'.repeat(r.rating)}</td>
                                                <td style={{ fontSize: '0.9rem', maxWidth: '300px' }} data-label="Komentar">{r.content}</td>
                                                <td data-label="Status">
                                                    <span style={{ 
                                                        padding: '0.3rem 0.8rem', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 'bold',
                                                        backgroundColor: r.status === 'approved' ? '#dcfce7' : '#fee2e2',
                                                        color: r.status === 'approved' ? '#166534' : '#991b1b'
                                                    }}>
                                                        {r.status === 'approved' ? 'TAMPIL' : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td className="action-btns" data-label="Aksi" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {r.status === 'pending' ? (
                                                        <button 
                                                            className="btn" 
                                                            onClick={() => updateReviewStatus(r.id, 'approved')} 
                                                            style={{ padding: '0.3rem 0.6rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                            title="Setujui dan Upload ke Beranda"
                                                        >
                                                            <i className="fas fa-upload"></i> Upload
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className="btn" 
                                                            onClick={() => updateReviewStatus(r.id, 'pending')} 
                                                            style={{ padding: '0.3rem 0.6rem', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                                                            title="Sembunyikan dari Beranda"
                                                        >
                                                            <i className="fas fa-eye-slash"></i> Sembunyikan
                                                        </button>
                                                    )}
                                                    <button className="btn-icon" onClick={() => { setEditingItem(r); setFormData(r); setModalType('review'); setIsModalOpen(true); }}><i className="fas fa-edit"></i></button>
                                                    <button className="btn-icon delete" onClick={() => deleteReview(r.id)}><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Blog' && (
                        <div className="tab-view">
                            <div className="dashboard-controls">
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setFormData({ title: '', slug: '', content: '', thumbnail: '', category: '', meta_title: '', meta_description: '' }); setModalType('article'); setIsModalOpen(true); }}>
                                    <i className="fas fa-plus"></i> Tambah Artikel
                                </button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Thumbnail</th>
                                            <th>Judul & Slug</th>
                                            <th>Kategori</th>
                                            <th>Tanggal</th>
                                            <th>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {articles.map(art => (
                                            <tr key={art.id}>
                                                <td className="td-img" data-label="Thumbnail">
                                                    {art.thumbnail ? <img src={art.thumbnail} alt="" style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} /> : <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><i className="fas fa-image"></i></div>}
                                                </td>
                                                <td data-label="Judul & Slug">
                                                    <div style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{art.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none' }}>/artikel/{art.slug}</div>
                                                </td>
                                                <td data-label="Kategori">
                                                    <span style={{ 
                                                        padding: '0.2rem 0.6rem', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: 'bold',
                                                        backgroundColor: '#f1f5f9',
                                                        color: '#475569'
                                                    }}>{art.category || 'Umum'}</span>
                                                </td>
                                                <td data-label="Tanggal" style={{ fontSize: '0.85rem' }}>
                                                    {new Date(art.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="action-btns" data-label="Aksi">
                                                    <button className="btn-icon" onClick={() => { setEditingItem(art); setFormData(art); setModalType('article'); setIsModalOpen(true); }}><i className="fas fa-edit"></i></button>
                                                    <button className="btn-icon delete" onClick={() => deleteArticle(art.id)}><i className="fas fa-trash"></i></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container" style={{ maxWidth: modalType === 'product' || modalType === 'auction' || modalType === 'article' ? '900px' : '600px' }}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editingItem ? 'Edit' : 'Tambah'} {modalType === 'product' ? 'Ikan' : modalType === 'faq' ? 'FAQ' : modalType === 'auction' ? 'Lelang' : modalType === 'article' ? 'Artikel' : 'Ulasan'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {modalType === 'article' ? (
                                <form onSubmit={saveProduct}>
                                    <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '700' }}>Gambar Thumbnail</label>
                                        <div style={{ width: '100px', height: '100px', background: '#fff', borderRadius: '12px', border: '2px dashed #cbd5e1', overflow: 'hidden', margin: '0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                            {uploadingField === 'thumbnail' ? (
                                                <div className="spinner"></div>
                                            ) : formData.thumbnail ? (
                                                <>
                                                    <img src={formData.thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setFormData({ ...formData, thumbnail: '' })}
                                                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', zIndex: 10 }}
                                                    >
                                                        <i className="fas fa-times"></i>
                                                    </button>
                                                </>
                                            ) : (
                                                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                    <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '0.2rem' }}></i>
                                                    <div style={{ fontSize: '0.65rem' }}>Klik Upload</div>
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail', false)} style={{ fontSize: '0.75rem' }} />
                                        <input type="text" value={formData.thumbnail || ''} onChange={e => setFormData({ ...formData, thumbnail: e.target.value })} placeholder="Atau paste URL gambar..." style={{ fontSize: '0.8rem', marginTop: '0.5rem' }} />
                                    </div>

                                    <div className="form-group">
                                        <label>Judul Artikel</label>
                                        <input 
                                            type="text" 
                                            value={formData.title} 
                                            onChange={e => {
                                                const title = e.target.value;
                                                const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                setFormData({ ...formData, title, slug });
                                            }} 
                                            placeholder="Contoh: Cara Merawat Ikan Cupang Hias..." 
                                            required 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Slug URL (Unik & SEO friendly)</label>
                                        <input 
                                            type="text" 
                                            value={formData.slug} 
                                            onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '') })} 
                                            placeholder="contoh-cara-merawat-ikan-cupang" 
                                            required 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Kategori Artikel</label>
                                        <input 
                                            type="text" 
                                            value={formData.category} 
                                            onChange={e => setFormData({ ...formData, category: e.target.value })} 
                                            placeholder="Contoh: Tips, Perawatan, Kontes..." 
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Isi Artikel (Mendukung HTML)</label>
                                        <textarea 
                                            value={formData.content} 
                                            onChange={e => setFormData({ ...formData, content: e.target.value })} 
                                            placeholder="Tulis artikel lengkap di sini... Anda bisa menggunakan tag HTML seperti <p>, <b>, <img> untuk memformat artikel." 
                                            required 
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '250px', fontFamily: 'inherit' }}
                                        />
                                    </div>

                                    <div className="form-group" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary-dark)', marginBottom: '0.8rem' }}><i className="fas fa-search-plus"></i> SEO Settings</h4>
                                        
                                        <div className="form-group">
                                            <label>Meta Title (Opsional)</label>
                                            <input 
                                                type="text" 
                                                value={formData.meta_title} 
                                                onChange={e => setFormData({ ...formData, meta_title: e.target.value })} 
                                                placeholder="Judul SEO untuk Google Search..." 
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label>Meta Description (Opsional)</label>
                                            <textarea 
                                                value={formData.meta_description} 
                                                onChange={e => setFormData({ ...formData, meta_description: e.target.value })} 
                                                placeholder="Deskripsi singkat yang tampil di Google Search (maksimal 160 karakter)..." 
                                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '60px' }}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary">Simpan Artikel Blog</button>
                                </form>
                            ) : modalType === 'auction' ? (
                                <form onSubmit={saveProduct}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                        {[
                                            { label: 'Gambar Utama (Wajib)', field: 'image_url', isPrimary: true },
                                            { label: 'Gambar 2', field: 'image2_url' },
                                            { label: 'Gambar 3', field: 'image3_url' },
                                            { label: 'Gambar 4', field: 'image4_url' }
                                        ].map((slot, index) => (
                                            <div key={slot.field} className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '0' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '700' }}>{slot.label}</label>
                                                
                                                {/* Preview Box */}
                                                <div style={{ width: '100%', aspectRatio: '1/1', background: '#fff', borderRadius: '8px', overflow: 'hidden', margin: '0.5rem 0', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    {uploadingField === slot.field ? (
                                                        <div className="spinner"></div>
                                                    ) : formData[slot.field] ? (
                                                        <>
                                                            {(slot.isPrimary && formData.is_video) ? (
                                                                <video src={formData[slot.field]} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <img src={formData[slot.field]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            )}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setFormData({ ...formData, [slot.field]: '', is_video: slot.isPrimary ? false : formData.is_video })}
                                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', zIndex: 10 }}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
                                                            <div style={{ fontSize: '0.7rem' }}>Klik Upload</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    disabled={uploadingField !== null}
                                                    accept={slot.isPrimary ? "image/*, video/mp4, video/webm" : "image/*"}
                                                    onChange={(e) => handleFileUpload(e, slot.field, slot.isPrimary)}
                                                    style={{ fontSize: '0.7rem', width: '100%' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="form-group">
                                        <label>Judul Lelang</label>
                                        <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Contoh: Plakat Blue Rim Super Grade" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Deskripsi (Opsional)</label>
                                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Deskripsi ikan..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px' }}></textarea>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Open Bid (Rp)</label>
                                            <input type="number" value={formData.start_price} onChange={e => setFormData({ ...formData, start_price: parseInt(e.target.value) || 0 })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Kelipatan Bid (Rp)</label>
                                            <input type="number" value={formData.min_bid_increment} onChange={e => setFormData({ ...formData, min_bid_increment: parseInt(e.target.value) || 0 })} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Waktu Mulai</label>
                                            <input type="datetime-local" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Waktu Berakhir</label>
                                            <input type="datetime-local" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="draft">Draft (Belum Tampil)</option>
                                            <option value="active">Active (Sedang Lelang)</option>
                                            <option value="ended">Ended (Sudah Berakhir)</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Simpan Lelang</button>
                                </form>
                            ) : modalType === 'product' ? (
                                <form onSubmit={saveProduct}>
                                    {/* Media Pickers Grid */}
                                    <div className="media-grid-admin">
                                        {[
                                            { label: 'Media Utama (Gambar/Video)', field: 'img', isPrimary: true },
                                            { label: 'Gambar 2', field: 'img2' },
                                            { label: 'Gambar 3', field: 'img3' },
                                            { label: 'Gambar 4', field: 'img4' }
                                        ].map((slot, index) => (
                                            <div key={slot.field} className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '0' }}>
                                                <label style={{ fontSize: '0.8rem', color: 'var(--primary-dark)', fontWeight: '700' }}>{slot.label}</label>
                                                
                                                {/* Preview Box */}
                                                <div style={{ width: '100%', aspectRatio: '1/1', background: '#fff', borderRadius: '8px', overflow: 'hidden', margin: '0.5rem 0', border: '2px dashed #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    {uploadingField === slot.field ? (
                                                        <div className="spinner"></div>
                                                    ) : formData[slot.field] ? (
                                                        <>
                                                            {(slot.isPrimary && formData.is_video) ? (
                                                                <video src={formData[slot.field]} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            ) : (
                                                                <img src={formData[slot.field]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            )}
                                                            <button 
                                                                type="button" 
                                                                onClick={() => setFormData({ ...formData, [slot.field]: '', is_video: slot.isPrimary ? false : formData.is_video })}
                                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', zIndex: 10 }}
                                                            >
                                                                <i className="fas fa-times"></i>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}></i>
                                                            <div style={{ fontSize: '0.7rem' }}>Klik Upload</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <input
                                                    type="file"
                                                    disabled={uploadingField !== null}
                                                    accept={slot.isPrimary ? "image/*, video/mp4, video/webm" : "image/*"}
                                                    onChange={(e) => handleFileUpload(e, slot.field, slot.isPrimary)}
                                                    style={{ fontSize: '0.7rem', width: '100%' }}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                        <label>Atau Input Manual Semua URL (Jika dibutuhkan)</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                                            <input type="text" value={formData.img && !formData.img.startsWith('data:') ? formData.img : ''} onChange={e => setFormData({ ...formData, img: e.target.value })} placeholder="URL Media 1..." style={{ fontSize: '0.8rem' }} />
                                            <input type="text" value={formData.img2 && !formData.img2.startsWith('data:') ? formData.img2 : ''} onChange={e => setFormData({ ...formData, img2: e.target.value })} placeholder="URL Media 2..." style={{ fontSize: '0.8rem' }} />
                                            <input type="text" value={formData.img3 && !formData.img3.startsWith('data:') ? formData.img3 : ''} onChange={e => setFormData({ ...formData, img3: e.target.value })} placeholder="URL Media 3..." style={{ fontSize: '0.8rem' }} />
                                            <input type="text" value={formData.img4 && !formData.img4.startsWith('data:') ? formData.img4 : ''} onChange={e => setFormData({ ...formData, img4: e.target.value })} placeholder="URL Media 4..." style={{ fontSize: '0.8rem' }} />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Kode Ikan</label>
                                            <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Contoh: PK-001" required />
                                        </div>
                                        <div className="form-group">
                                            <label>Kategori</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                                <option value="">Pilih...</option>
                                                <option value="Plakat">Plakat</option>
                                                <option value="Halfmoon">Halfmoon</option>
                                                <option value="HMPK">HMPK</option>
                                                <option value="Double Tail">Double Tail</option>
                                                <option value="Crowntail">Crowntail</option>
                                                <option value="Giant">Giant</option>
                                                <option value="Dumbo Ear">Dumbo Ear</option>
                                                <option value="Veiltail">Veiltail</option>
                                                <option value="Rosetail">Rosetail</option>
                                                <option value="Kebutuhan Ikan">Kebutuhan Ikan</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Varian (Warna/Jenis)</label>
                                            <input type="text" value={formData.variant} onChange={e => setFormData({ ...formData, variant: e.target.value })} placeholder="Contoh: Nemo, Galaxy" />
                                        </div>
                                        <div className="form-group">
                                            <label>Gender</label>
                                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required>
                                                <option value="Jantan">Jantan</option>
                                                <option value="Betina">Betina</option>
                                                <option value="-">- (Unisex/Peralatan)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Usia</label>
                                            <select value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} required>
                                                <option value="">Pilih...</option>
                                                {[...Array(12)].map((_, i) => (
                                                    <option key={i + 1} value={(i + 1).toString()}>{i + 1} Bulan</option>
                                                ))}
                                                <option value="Tidak Ada">Tidak Ada (Non-Living)</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Size</label>
                                            <select value={formData.size} onChange={e => setFormData({ ...formData, size: e.target.value })} required>
                                                <option value="S">S</option>
                                                <option value="S+">S+</option>
                                                <option value="M">M</option>
                                                <option value="M+">M+</option>
                                                <option value="L">L</option>
                                                <option value="XL">XL</option>
                                                <option value="-">- (Universal)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Harga (Rp)</label>
                                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Stok</label>
                                            <input type="number" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Link Shopee</label>
                                        <input type="url" value={formData.shopee} onChange={e => setFormData({ ...formData, shopee: e.target.value })} placeholder="https://shopee.co.id/..." required />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Simpan Data Produk</button>
                                </form>
                            ) : modalType === 'faq' ? (
                                <form onSubmit={saveProduct}>
                                    <div className="form-group">
                                        <label>Pertanyaan</label>
                                        <input type="text" value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Jawaban</label>
                                        <textarea
                                            value={formData.answer}
                                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px' }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Simpan FAQ</button>
                                </form>
                            ) : (
                                <form onSubmit={saveProduct}>
                                    <div className="form-group">
                                        <label>Foto Profil Pengulas (Opsional)</label>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ width: '80px', height: '80px', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #cbd5e1', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {uploadingField === 'review_img' ? <div className="spinner"></div> : formData.img ? <img src={formData.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <i className="fas fa-camera" style={{ color: '#94a3b8' }}></i>}
                                            </div>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'img', 'review_img')} />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Nama Pengulas</label>
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Rating (1-5 Bintang)</label>
                                        <select value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}>
                                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Bintang</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Komentar</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                                            required
                                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '100px' }}
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label>Status Tampilan</label>
                                        <select value={formData.status || 'approved'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="approved">Tampil (Approved)</option>
                                            <option value="pending">Tertunda (Pending)</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary">Simpan Ulasan</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Toast Notification */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
