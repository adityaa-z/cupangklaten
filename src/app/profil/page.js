'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import './profil.css';

export default function ProfilPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState(null);
    const [wonAuctions, setWonAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            fetchProfilData();
        }
    }, [status, router]);

    const fetchProfilData = async () => {
        try {
            const res = await fetch('/api/profil/');
            if (res.ok) {
                const data = await res.json();
                setUserData(data.user);
                setWonAuctions(data.wonAuctions);
                setEditForm({ 
                    name: data.user.name || '', 
                    phone: data.user.phone || '', 
                    address: data.user.address || '' 
                });
            }
        } catch (err) {
            console.error('Failed to fetch profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfil = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await fetch('/api/profil/edit/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                setIsEditing(false);
                fetchProfilData(); // Refresh data
                alert('Profil berhasil diperbarui!');
            } else {
                alert('Gagal memperbarui profil.');
            }
        } catch (err) {
            alert('Terjadi kesalahan jaringan.');
        } finally {
            setIsSaving(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                </div>
            </>
        );
    }

    if (!userData) return null;

    return (
        <>
            <Navbar />
            <div className="profil-container">
                <div className="profil-wrapper">
                    
                    {/* Kartu Profil */}
                    <div className="profil-card">
                        <div className="profil-header" style={{ position: 'relative' }}>
                            <div className="profil-avatar">
                                {userData.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="profil-info">
                                <h2>{userData.name}</h2>
                                <span className={`profil-badge ${userData.status === 'approved' ? 'badge-approved' : 'badge-pending'}`}>
                                    {userData.status === 'approved' ? 'MEMBER AKTIF' : 'MENUNGGU PERSETUJUAN'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setIsEditing(true)}
                                style={{ position: 'absolute', right: 0, top: '10px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                <i className="fas fa-edit"></i> Edit Profil
                            </button>
                        </div>

                        <div className="profil-details">
                            <div>
                                <div className="detail-item">
                                    <div className="detail-label">Email</div>
                                    <div className="detail-val">{userData.email}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">WhatsApp</div>
                                    <div className="detail-val">{userData.phone || '-'}</div>
                                </div>
                            </div>
                            <div>
                                <div className="detail-item">
                                    <div className="detail-label">Alamat Pengiriman</div>
                                    <div className="detail-val">{userData.address || 'Belum diisi'}</div>
                                </div>
                                <div className="detail-item">
                                    <div className="detail-label">Bergabung Sejak</div>
                                    <div className="detail-val">{new Date(userData.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Riwayat Kemenangan Lelang */}
                    <div className="profil-card">
                        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
                            <i className="fas fa-trophy" style={{ color: '#fbbf24', marginRight: '0.5rem' }}></i> 
                            Riwayat Kemenangan Lelang
                        </h3>
                        
                        {wonAuctions.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0' }}>
                                <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                                <p>Belum ada lelang yang dimenangkan.</p>
                                <button onClick={() => router.push('/lelang')} className="btn btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>Mulai Bidding</button>
                            </div>
                        ) : (
                            <div className="won-list">
                                {wonAuctions.map(a => (
                                    <div key={a.id} className="won-card">
                                        {a.image_url?.includes('.mp4') ? (
                                            <video src={a.image_url} className="won-img" muted />
                                        ) : (
                                            <img src={a.image_url || '/logo.png'} alt="" className="won-img" />
                                        )}
                                        
                                        <div className="won-info">
                                            <div className="won-title">{a.title}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                Lelang Ditutup: {new Date(a.end_time).toLocaleDateString('id-ID')}
                                            </div>
                                            <div className="won-price">Bid Anda: Rp {Number(a.win_bid).toLocaleString('id-ID')}</div>
                                        </div>

                                        <a 
                                            href={`https://wa.me/6285700846152?text=Halo%20Admin,%20saya%20*${userData.name}*%20adalah%20pemenang%20lelang%20*${encodeURIComponent(a.title)}*%20dengan%20bid%20*Rp%20${Number(a.win_bid).toLocaleString('id-ID')}*.%20Mohon%20info%20pembayaran%20dan%20pengirimannya.`} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="btn-wa"
                                        >
                                            <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Konfirmasi
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Modal Edit Profil */}
            {isEditing && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: '#1e293b' }}>Edit Profil</h3>
                        <form onSubmit={handleSaveProfil}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    required 
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>No WhatsApp</label>
                                <input 
                                    type="text" 
                                    value={editForm.phone} 
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    placeholder="Contoh: 08123456789"
                                    required 
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>Alamat Lengkap Pengiriman</label>
                                <textarea 
                                    value={editForm.address} 
                                    onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight: '80px' }}
                                    placeholder="Jalan, RT/RW, Desa, Kecamatan, Kota, Kode Pos"
                                    required 
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#f1f5f9', color: '#475569', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Batal</button>
                                <button type="submit" disabled={isSaving} style={{ background: '#3b82f6', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
