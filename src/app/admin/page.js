'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

export const dynamic = 'force-dynamic';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('Produk');
    const [products, setProducts] = useState([]);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Auth State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('product'); // 'product' or 'faq'
    const [editingItem, setEditingItem] = useState(null);

    // Form States (Product)
    const [formData, setFormData] = useState({
        code: '', category: '', variant: '', gender: 'Jantan',
        age: '', size: 'M', stock: 1, price: 0, shopee: '',
        img: '', is_video: false
    });

    useEffect(() => {
        setIsMounted(true);
        const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) fetchData();
    }, []);

    const fetchData = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        const { data: fData } = await supabase.from('faqs').select('*').order('created_at', { ascending: true });
        setProducts(pData || []);
        setFaqs(fData || []);
        setLoading(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            setIsLoggedIn(true);
            fetchData();
        } else {
            setLoginError(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminLoggedIn');
        setIsLoggedIn(false);
    };

    // Product Functions
    const deleteProduct = async (id) => {
        if (!confirm('Hapus produk ini?')) return;
        await supabase.from('products').delete().eq('id', id);
        fetchData();
    };

    const toggleStock = async (product) => {
        const update = { 
            is_available: !product.is_available,
            sold_at: !product.is_available ? null : new Date().toISOString()
        };
        await supabase.from('products').update(update).eq('id', product.id);
        fetchData();
    };

    const saveProduct = async (e) => {
        e.preventDefault();
        if (editingItem) {
            await supabase.from('products').update(formData).eq('id', editingItem.id);
        } else {
            await supabase.from('products').insert([{ ...formData, is_available: formData.stock > 0 }]);
        }
        setIsModalOpen(false);
        fetchData();
    };

    if (!isMounted) return <div className="admin-body" style={{ minHeight: '100vh', background: 'var(--bg-light)' }}></div>;

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
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
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
                    {['Produk', 'Pesanan', 'FAQ', 'Statistik'].map(tab => (
                        <div key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                            <i className={`fas fa-${tab === 'Produk' ? 'box' : tab === 'Pesanan' ? 'shopping-cart' : tab === 'FAQ' ? 'question-circle' : 'chart-line'}`}></i>
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
                                                <td className="td-img">
                                                    {p.is_video ? <video src={p.img} muted /> : <img src={p.img} alt="" />}
                                                </td>
                                                <td>{p.code}</td>
                                                <td>{p.category}</td>
                                                <td>Rp {p.price.toLocaleString()}</td>
                                                <td>
                                                    <span className={`status-badge ${p.is_available && p.stock > 0 ? 'status-tersedia' : 'status-terjual'}`}>
                                                        {p.is_available && p.stock > 0 ? 'Ready' : 'Sold'}
                                                    </span>
                                                </td>
                                                <td className="action-btns">
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

                    {activeTab === 'Statistik' && (
                        <div className="tab-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid cyan' }}>
                                <small>Tersedia</small>
                                <h3>{products.filter(p => p.is_available && p.stock > 0).length}</h3>
                            </div>
                            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid coral' }}>
                                <small>Terjual</small>
                                <h3>{products.filter(p => !p.is_available || p.stock <= 0).length}</h3>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3 className="modal-title">{editingItem ? 'Edit' : 'Tambah'} {modalType}</h3>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={saveProduct}>
                                <div className="form-group">
                                    <label>Upload Media (Gambar/Video)</label>
                                    <input 
                                        type="file" 
                                        accept="image/*,video/*" 
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    alert('Ukuran file maksimal 2 MB!');
                                                    return;
                                                }
                                                const isVid = file.type.startsWith('video/');
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setFormData({ ...formData, img: event.target.result, is_video: isVid });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }} 
                                    />
                                    <small style={{ display: 'block', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                                        Maksimal 2 MB. File akan dikonversi ke Base64.
                                    </small>
                                </div>

                                {formData.img && (
                                    <div style={{ width: '100%', height: '200px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {formData.is_video ? (
                                            <video src={formData.img} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <img src={formData.img} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        )}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Atau Gunakan URL Media (Opsional)</label>
                                    <input 
                                        type="text" 
                                        value={formData.img && !formData.img.startsWith('data:') ? formData.img : ''} 
                                        onChange={e => setFormData({...formData, img: e.target.value, is_video: e.target.value.match(/\.(mp4|webm|ogg)$/i) !== null})} 
                                        placeholder="https://..." 
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Kode Ikan</label>
                                        <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Contoh: PK-001" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Kategori</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                                            <option value="">Pilih...</option>
                                            <option value="Plakat">Plakat</option>
                                            <option value="Halfmoon">Halfmoon</option>
                                            <option value="HMPK">HMPK</option>
                                            <option value="Crowntail">Crowntail</option>
                                            <option value="Giant">Giant</option>
                                            <option value="Kebutuhan Ikan">Kebutuhan Ikan</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Varian (Warna/Jenis)</label>
                                        <input type="text" value={formData.variant} onChange={e => setFormData({...formData, variant: e.target.value})} placeholder="Contoh: Nemo, Galaxy" />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} required>
                                            <option value="Jantan">Jantan</option>
                                            <option value="Betina">Betina</option>
                                            <option value="-">- (Unisex/Peralatan)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Usia</label>
                                        <select value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required>
                                            <option value="">Pilih...</option>
                                            {[...Array(12)].map((_, i) => (
                                                <option key={i+1} value={(i+1).toString()}>{i+1} Bulan</option>
                                            ))}
                                            <option value="Tidak Ada">Tidak Ada (Non-Living)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Size</label>
                                        <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required>
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
                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Stok</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Link Shopee</label>
                                    <input type="url" value={formData.shopee} onChange={e => setFormData({...formData, shopee: e.target.value})} placeholder="https://shopee.co.id/..." required />
                                </div>
                                <button type="submit" className="btn btn-primary">Simpan Data Produk</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
