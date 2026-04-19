'use client';

import React, { useState, useEffect } from 'react';
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

    // Form States (Product)
    const [formData, setFormData] = useState({
        code: '', category: '', variant: '', gender: 'Jantan',
        age: '', size: 'M', stock: 1, price: 0, shopee: '',
        img: '', img2: '', img3: '', img4: '', is_video: false
    });

    useEffect(() => {
        setIsMounted(true);
        checkSession();
    }, []);

    const checkSession = async () => {
        setAuthLoading(true);
        try {
            const res = await fetch('/api/auth/check/');
            const data = await res.json();
            if (data.isLoggedIn) {
                setIsLoggedIn(true);
                fetchData();
            }
        } catch (err) {
            console.error('Session check failed:', err);
        } finally {
            setAuthLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, fRes, rRes] = await Promise.all([
                fetch('/api/admin/products/'),
                fetch('/api/admin/faq/'),
                fetch('/api/admin/reviews/')
            ]);

            if (pRes.ok) setProducts(await pRes.json());
            if (fRes.ok) setFaqs(await fRes.json());
            if (rRes.ok) setReviews(await rRes.json());
        } catch (err) {
            console.error('Unexpected error fetching data:', err);
        }
        setLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(false);
        try {
            const res = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                setIsLoggedIn(true);
                fetchData();
            } else {
                setLoginError(true);
            }
        } catch (err) {
            setLoginError(true);
        }
    };

    const handleLogout = async () => {
        await fetch('/api/logout/', { method: 'POST' });
        setIsLoggedIn(false);
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

        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran file maksimal 2 MB!');
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
            const isVid = isPrimary && file.type.startsWith('video/');
            
            setFormData(prev => ({ 
                ...prev, 
                [field]: url, 
                is_video: isPrimary ? isVid : prev.is_video 
            }));
        } catch (err) {
            console.error('Upload error:', err);
            alert('Gagal mengupload gambar. Pastikan Bucket "produk" sudah ada di Supabase dan diatur ke Public.');
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
        }

        if (res && res.status === 401) return handleLogout();
        
        if (res && res.ok) {
            setIsModalOpen(false);
            fetchData();
            setToast({ 
                show: true, 
                message: modalType === 'product' ? 'Produk berhasil disimpan!' : 'FAQ berhasil disimpan!', 
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

    if (!isMounted || authLoading) {
        return (
            <div className="admin-body" style={{ minHeight: '100vh', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ marginBottom: '1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Memeriksa Sesi...</p>
                </div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <img src="/logo.png" alt="Logo" style={{ height: '50px', marginBottom: '1rem', borderRadius: '8px' }} />
                    <h1>Admin Access</h1>
                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <label>Username</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ position: 'relative' }}>
                            <label>Password</label>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                required 
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{ 
                                    position: 'absolute', 
                                    right: '10px', 
                                    top: '35px', 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--text-muted)', 
                                    cursor: 'pointer' 
                                }}
                            >
                                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                            </button>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                        {loginError && <p style={{ color: 'red', marginTop: '1rem' }}>Username atau password salah!</p>}
                    </form>
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
                    {['Produk', 'Pesanan', 'FAQ', 'Statistik', 'Ulasan'].map(tab => (
                        <div key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            <i className={`fas fa-${tab === 'Produk' ? 'box' : tab === 'Pesanan' ? 'shopping-cart' : tab === 'FAQ' ? 'question-circle' : tab === 'Statistik' ? 'chart-line' : 'star'}`}></i>
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
                                <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => { setEditingItem(null); setFormData({ name: '', rating: 5, content: '' }); setModalType('review'); setIsModalOpen(true); }}>
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
                                                <td className="action-btns" data-label="Aksi">
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
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingItem ? 'Edit' : 'Tambah'} {modalType === 'product' ? 'Ikan' : modalType === 'faq' ? 'FAQ' : 'Ulasan'}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {modalType === 'product' ? (
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
                                                    accept={slot.isPrimary ? "image/*,video/*" : "image/*"}
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
                                        <label>Foto Ulasan (Opsional)</label>
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
