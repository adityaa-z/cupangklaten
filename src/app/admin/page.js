'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import './admin.css';

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminPage() {
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
        const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
        if (loggedIn) fetchData();
    }, []);

    const fetchData = async () => {
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
                                    <label>URL Gambar/Video</label>
                                    <input type="text" value={formData.img} onChange={e => setFormData({...formData, img: e.target.result || e.target.value})} placeholder="https://..." />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Kode</label>
                                        <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required />
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
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Harga (Rp)</label>
                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: parseInt(e.target.value)})} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Stok</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Link Shopee</label>
                                    <input type="url" value={formData.shopee} onChange={e => setFormData({...formData, shopee: e.target.value})} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
