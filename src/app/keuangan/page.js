'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import './keuangan.css';

export const dynamic = 'force-dynamic';

const formatRp = (n) => {
    const num = Number(n) || 0;
    return 'Rp ' + num.toLocaleString('id-ID');
};

const getNow = () => {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

const getToday = () => new Date().toISOString().split('T')[0];

const emptyFormPengeluaran = () => ({ tanggal: getToday(), pengeluaran: '', harga: '', keterangan: '' });
const emptyFormPemasukan = () => ({ tanggal: getToday(), keterangan: '', pendapatan_kotor: '' });
const emptyFormStok = () => ({ tanggal: getToday(), jenis_ikan: '', jumlah: '', harga_satuan: '', omah: '', online: '', ekspor: '', keterangan: '' });

export default function KeuanganPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    // Segmen utama: showroom | grosir
    const [activeSegmen, setActiveSegmen] = useState('showroom');

    // Data per segmen
    const [dataShowroom, setDataShowroom] = useState({ keuangan: [], stok: [] });
    const [dataGrosir, setDataGrosir] = useState({ keuangan: [], stok: [] });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeInputTab, setActiveInputTab] = useState('pengeluaran');
    const [filterDate, setFilterDate] = useState(getToday());
    const [editingCell, setEditingCell] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form states — per segmen (showroom & grosir punya form masing-masing)
    const [forms, setForms] = useState({
        showroom: {
            pengeluaran: emptyFormPengeluaran(),
            pemasukan: emptyFormPemasukan(),
            stok: emptyFormStok(),
        },
        grosir: {
            pengeluaran: emptyFormPengeluaran(),
            pemasukan: emptyFormPemasukan(),
            stok: emptyFormStok(),
        }
    });

    // Auth guard
    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/'); return; }
        if (session && session.user?.email !== 'zidanp13794@gmail.com') { router.push('/'); return; }
        if (session) fetchAllData();
    }, [session, authStatus]);

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [resShowroom, resGrosir] = await Promise.all([
                fetch('/api/finance?segmen=showroom'),
                fetch('/api/finance?segmen=grosir'),
            ]);
            if (resShowroom.ok) {
                const d = await resShowroom.json();
                setDataShowroom({ keuangan: d.keuangan || [], stok: d.stok || [] });
            }
            if (resGrosir.ok) {
                const d = await resGrosir.json();
                setDataGrosir({ keuangan: d.keuangan || [], stok: d.stok || [] });
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    };

    // Helper: get & set form value for current segmen
    const getForm = (type) => forms[activeSegmen][type];
    const setForm = (type, updater) => {
        setForms(prev => ({
            ...prev,
            [activeSegmen]: {
                ...prev[activeSegmen],
                [type]: typeof updater === 'function' ? updater(prev[activeSegmen][type]) : updater
            }
        }));
    };

    const handleSubmit = async (type) => {
        const form = getForm(type);
        let data;
        if (type === 'pengeluaran') {
            if (!form.pengeluaran || !form.harga) return showToast('Nama pengeluaran dan harga wajib diisi!', 'error');
            data = { ...form };
        } else if (type === 'pemasukan') {
            if (!form.keterangan || !form.pendapatan_kotor) return showToast('Keterangan dan nominal wajib diisi!', 'error');
            data = { ...form };
        } else {
            if (!form.jenis_ikan || !form.jumlah) return showToast('Jenis ikan dan jumlah wajib diisi!', 'error');
            data = { ...form };
        }

        setSaving(true);
        try {
            const res = await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data, segmen: activeSegmen })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            showToast('Data berhasil disimpan!');
            if (type === 'pengeluaran') setForm('pengeluaran', p => ({ ...emptyFormPengeluaran(), tanggal: p.tanggal }));
            else if (type === 'pemasukan') setForm('pemasukan', p => ({ ...emptyFormPemasukan(), tanggal: p.tanggal }));
            else setForm('stok', p => ({ ...emptyFormStok(), tanggal: p.tanggal }));
            fetchAllData();
        } catch (err) {
            showToast('Error: ' + err.message, 'error');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id, table) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/finance?id=${id}&table=${table}`, { method: 'DELETE' });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            showToast('Data berhasil dihapus.');
            fetchAllData();
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
        finally { setSaving(false); }
    };

    const handleEditSave = async () => {
        if (!editingCell) return;
        setSaving(true);
        try {
            const res = await fetch('/api/finance', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCell)
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
            showToast('Data berhasil diperbarui.');
            fetchAllData();
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
        finally { setSaving(false); setEditingCell(null); }
    };

    // Data aktif berdasarkan segmen
    const activeData = activeSegmen === 'showroom' ? dataShowroom : dataGrosir;

    // Filter data
    const getLast30Days = () => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toLocaleDateString('en-CA');
    };

    const filteredKeuangan = (() => {
        if (filterDate === 'all') return activeData.keuangan;
        if (filterDate === '1bulan') return activeData.keuangan.filter(k => new Date(k.tanggal).toLocaleDateString('en-CA') >= getLast30Days());
        return activeData.keuangan.filter(k => new Date(k.tanggal).toLocaleDateString('en-CA') === filterDate);
    })();
    const filteredStok = (() => {
        if (filterDate === 'all') return activeData.stok;
        if (filterDate === '1bulan') return activeData.stok.filter(s => new Date(s.tanggal).toLocaleDateString('en-CA') >= getLast30Days());
        return activeData.stok.filter(s => new Date(s.tanggal).toLocaleDateString('en-CA') === filterDate);
    })();

    // Summary calculations
    const totalPengeluaran = filteredKeuangan.reduce((s, r) => s + Number(r.harga || 0), 0);
    const totalPemasukan = filteredKeuangan.reduce((s, r) => s + Number(r.pendapatan_kotor || 0), 0);
    const saldo = totalPemasukan - totalPengeluaran;
    const totalAsetIkan = filteredStok.reduce((s, r) => s + (Number(r.jumlah || 0) * Number(r.harga_satuan || 0)), 0);
    const totalStokIkan = filteredStok.reduce((s, r) => s + Number(r.jumlah || 0), 0);

    const groupDataByDate = (data) => {
        return data.reduce((acc, curr) => {
            const dateStr = new Date(curr.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
            if (!acc[dateStr]) acc[dateStr] = [];
            acc[dateStr].push(curr);
            return acc;
        }, {});
    };

    const segmenConfig = {
        showroom: { label: 'Showroom', icon: 'fa-store', color: '#10b981', colorBg: 'rgba(16,185,129,0.1)', colorBorder: 'rgba(16,185,129,0.3)' },
        grosir:   { label: 'Grosir',   icon: 'fa-truck', color: '#f59e0b', colorBg: 'rgba(245,158,11,0.1)', colorBorder: 'rgba(245,158,11,0.3)' },
    };
    const seg = segmenConfig[activeSegmen];

    if (authStatus === 'loading' || loading) {
        return (
            <div className="finance-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner-mini" style={{ width: '40px', height: '40px', margin: '0 auto 1rem', borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#D4AF37' }}></div>
                    <p style={{ color: '#94a3b8' }}>Memuat Keuangan Cupang Klaten...</p>
                </div>
            </div>
        );
    }

    const EditableCell = ({ row, table, field, val, type="text", children }) => {
        const isEditing = editingCell?.id === row.id && editingCell?.table === table && editingCell?.field === field;
        if (isEditing) {
            return (
                <input
                    type={type}
                    value={editingCell.value}
                    autoFocus
                    onChange={e => setEditingCell({ ...editingCell, value: e.target.value })}
                    onBlur={handleEditSave}
                    onKeyDown={e => e.key === 'Enter' && handleEditSave()}
                    style={{ width: '100%', padding: '0.4rem', border: '1px solid #D4AF37', borderRadius: '6px', background: 'var(--bg-white)', color: 'var(--text-dark)' }}
                />
            );
        }
        return (
            <div onClick={() => setEditingCell({ id: row.id, table, field, value: val })} style={{ cursor: 'pointer', minHeight: '1.5rem', display: 'flex', alignItems: 'center' }} title="Klik untuk edit">
                {children}
            </div>
        );
    };

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
                                <h1 className="finance-title">KEUANGAN CUPANG KLATEN</h1>
                                <p className="finance-subtitle">Sistem Terintegrasi Cupang Klaten</p>
                            </div>
                        </div>
                        <div className="finance-header-actions">
                            <Link href="/admin" className="btn-home">
                                <i className="fas fa-arrow-left"></i> Dashboard Admin
                            </Link>
                        </div>
                    </div>

                    {/* ============ SEGMEN TABS UTAMA ============ */}
                    <div className="segmen-tabs">
                        {Object.entries(segmenConfig).map(([key, cfg]) => (
                            <button
                                key={key}
                                className={`segmen-tab-btn ${activeSegmen === key ? 'active' : ''}`}
                                onClick={() => { setActiveSegmen(key); setActiveInputTab('pengeluaran'); setFilterDate(getToday()); }}
                                style={activeSegmen === key ? {
                                    background: cfg.colorBg,
                                    borderColor: cfg.color,
                                    color: cfg.color,
                                } : {}}
                                id={`segmen-tab-${key}`}
                            >
                                <i className={`fas ${cfg.icon}`}></i>
                                <span>{cfg.label}</span>
                                <span className="segmen-tab-badge" style={activeSegmen === key ? { background: cfg.color } : {}}>
                                    {(activeSegmen === key ? activeData : (key === 'showroom' ? dataShowroom : dataGrosir)).keuangan.length +
                                     (activeSegmen === key ? activeData : (key === 'showroom' ? dataShowroom : dataGrosir)).stok.length} data
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Segmen Indicator */}
                    <div className="segmen-indicator" style={{ borderColor: seg.color, background: seg.colorBg }}>
                        <i className={`fas ${seg.icon}`} style={{ color: seg.color }}></i>
                        <span style={{ color: seg.color, fontWeight: 700 }}>Mode: {seg.label}</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>— semua input dan riwayat di bawah adalah untuk bagian {seg.label}</span>
                    </div>

                    {/* ============ SUMMARY CARDS ============ */}
                    <section className="finance-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
                        <div className="finance-card">
                            <span className="card-label">Total Pemasukan</span>
                            <h2 className="card-value" style={{ fontSize: '1.6rem', color: '#10b981' }}>{formatRp(totalPemasukan)}</h2>
                            <i className="fas fa-arrow-up card-icon" style={{ color: '#10b981' }}></i>
                        </div>
                        <div className="finance-card">
                            <span className="card-label">Total Pengeluaran</span>
                            <h2 className="card-value" style={{ fontSize: '1.6rem', color: '#ef4444' }}>{formatRp(totalPengeluaran)}</h2>
                            <i className="fas fa-arrow-down card-icon" style={{ color: '#ef4444' }}></i>
                        </div>
                        <div className="finance-card">
                            <span className="card-label">Saldo / Keuntungan</span>
                            <h2 className="card-value" style={{ fontSize: '1.6rem', color: saldo >= 0 ? '#10b981' : '#ef4444' }}>{formatRp(saldo)}</h2>
                            <i className="fas fa-wallet card-icon"></i>
                        </div>
                        <div className="finance-card">
                            <span className="card-label">Total Stok Ikan</span>
                            <h2 className="card-value" style={{ fontSize: '1.6rem', color: '#D4AF37' }}>{totalStokIkan} Ekor</h2>
                            <i className="fas fa-fish card-icon" style={{ color: '#D4AF37' }}></i>
                        </div>
                        <div className="finance-card">
                            <span className="card-label">Estimasi Aset Ikan</span>
                            <h2 className="card-value" style={{ fontSize: '1.6rem', color: '#D4AF37' }}>{formatRp(totalAsetIkan)}</h2>
                            <i className="fas fa-gem card-icon" style={{ color: '#D4AF37' }}></i>
                        </div>
                    </section>

                    {/* ============ INPUT SECTION ============ */}
                    <div className="form-panel" style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h3 className="panel-title" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                                <i className="fas fa-plus-circle"></i> Catat Data Baru —&nbsp;
                                <span style={{ color: seg.color }}>{seg.label}</span>
                            </h3>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <i className="fas fa-clock"></i> {getNow()} (WIB)
                            </span>
                        </div>

                        {/* Tab buttons */}
                        <div className="tab-header" style={{ flexWrap: 'wrap' }}>
                            {[
                                { id: 'pengeluaran', icon: 'fa-arrow-down', label: 'Pengeluaran', color: '#ef4444' },
                                { id: 'pemasukan', icon: 'fa-arrow-up', label: 'Pemasukan', color: '#10b981' },
                                { id: 'stok', icon: 'fa-fish', label: 'Stok Ikan', color: '#D4AF37' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeInputTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveInputTab(tab.id)}
                                    style={activeInputTab === tab.id ? { color: tab.color } : {}}
                                >
                                    <i className={`fas ${tab.icon}`} style={{ marginRight: '0.4rem' }}></i>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* --- Form Pengeluaran --- */}
                        {activeInputTab === 'pengeluaran' && (() => {
                            const form = getForm('pengeluaran');
                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                        <input className="form-control" type="date" max={getToday()} value={form.tanggal} onChange={e => setForm('pengeluaran', p => ({ ...p, tanggal: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Nama Pengeluaran *</label>
                                        <input className="form-control" type="text" placeholder="Contoh: Beli Pakan, Akuarium..." value={form.pengeluaran} onChange={e => setForm('pengeluaran', p => ({ ...p, pengeluaran: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Nominal Harga (Rp) *</label>
                                        <input className="form-control" type="number" placeholder="Contoh: 50000" value={form.harga} onChange={e => setForm('pengeluaran', p => ({ ...p, harga: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Keterangan (Opsional)</label>
                                        <input className="form-control" type="text" placeholder="Catatan tambahan..." value={form.keterangan} onChange={e => setForm('pengeluaran', p => ({ ...p, keterangan: e.target.value }))} />
                                    </div>
                                    <button className="btn-submit" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' }} onClick={() => handleSubmit('pengeluaran')} disabled={saving}>
                                        <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                                    </button>
                                </div>
                            );
                        })()}

                        {/* --- Form Pemasukan --- */}
                        {activeInputTab === 'pemasukan' && (() => {
                            const form = getForm('pemasukan');
                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                        <input className="form-control" type="date" max={getToday()} value={form.tanggal} onChange={e => setForm('pemasukan', p => ({ ...p, tanggal: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Keterangan / Sumber Pemasukan *</label>
                                        <input className="form-control" type="text" placeholder="Contoh: Jual HM, Jual Plakat..." value={form.keterangan} onChange={e => setForm('pemasukan', p => ({ ...p, keterangan: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Pendapatan Kotor (Rp) *</label>
                                        <input className="form-control" type="number" placeholder="Contoh: 150000" value={form.pendapatan_kotor} onChange={e => setForm('pemasukan', p => ({ ...p, pendapatan_kotor: e.target.value }))} />
                                    </div>
                                    <button className="btn-submit" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }} onClick={() => handleSubmit('pemasukan')} disabled={saving}>
                                        <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Pemasukan'}
                                    </button>
                                </div>
                            );
                        })()}

                        {/* --- Form Stok Ikan --- */}
                        {activeInputTab === 'stok' && (() => {
                            const form = getForm('stok');
                            return (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                        <input className="form-control" type="date" max={getToday()} value={form.tanggal} onChange={e => setForm('stok', p => ({ ...p, tanggal: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Jenis Ikan *</label>
                                        <input className="form-control" type="text" placeholder="Plakat, HM, HMPK..." value={form.jenis_ikan} onChange={e => setForm('stok', p => ({ ...p, jenis_ikan: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Jumlah Ekor *</label>
                                        <input className="form-control" type="number" placeholder="Contoh: 10" value={form.jumlah} onChange={e => setForm('stok', p => ({ ...p, jumlah: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Harga Satuan (Rp)</label>
                                        <input className="form-control" type="number" placeholder="Untuk hitung aset" value={form.harga_satuan} onChange={e => setForm('stok', p => ({ ...p, harga_satuan: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Omah (Rp)</label>
                                        <input className="form-control" type="number" placeholder="0" value={form.omah} onChange={e => setForm('stok', p => ({ ...p, omah: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Online (Rp)</label>
                                        <input className="form-control" type="number" placeholder="0" value={form.online} onChange={e => setForm('stok', p => ({ ...p, online: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Ekspor (Rp)</label>
                                        <input className="form-control" type="number" placeholder="0" value={form.ekspor} onChange={e => setForm('stok', p => ({ ...p, ekspor: e.target.value }))} />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                        <label>Keterangan</label>
                                        <input className="form-control" type="text" placeholder="Catatan..." value={form.keterangan} onChange={e => setForm('stok', p => ({ ...p, keterangan: e.target.value }))} />
                                    </div>
                                    <button className="btn-submit" onClick={() => handleSubmit('stok')} disabled={saving}>
                                        <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Stok'}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {/* ============ FILTER & TABEL ============ */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                            📋 Riwayat Data —&nbsp;
                            <span style={{ color: seg.color }}>{seg.label}</span>
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-white)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tampilkan:</label>
                            <select
                                value={filterDate}
                                onChange={e => setFilterDate(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, color: 'var(--text-dark)' }}
                            >
                                <option value={getToday()} style={{ color: '#0f172a', background: '#ffffff' }}>Hari Ini Saja</option>
                                <option value="1bulan" style={{ color: '#0f172a', background: '#ffffff' }}>1 Bulan Terakhir</option>
                                <option value="all" style={{ color: '#0f172a', background: '#ffffff' }}>Semua Waktu</option>
                            </select>
                        </div>
                    </div>

                    {/* Tabel Keuangan */}
                    <div className="table-panel" style={{ marginBottom: '2rem' }}>
                        <h3 className="panel-title">
                            <i className="fas fa-table"></i> Riwayat Keuangan — {seg.label}
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{filteredKeuangan.length} data</span>
                        </h3>
                        <div className="table-responsive">
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Waktu</th>
                                        <th>Pengeluaran / Keterangan</th>
                                        <th>Harga Keluar</th>
                                        <th>Pendapatan Kotor</th>
                                        <th>Jenis</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredKeuangan.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Belum ada data di periode ini.</td></tr>
                                    ) : Object.entries(groupDataByDate(filteredKeuangan)).map(([date, items]) => (
                                        <React.Fragment key={date}>
                                            <tr style={{ background: 'var(--bg-light)' }}>
                                                <td colSpan={7} style={{ fontWeight: 800, color: 'var(--primary-dark)', padding: '0.8rem', borderBottom: '2px solid var(--border-color)' }}>
                                                    <i className="fas fa-calendar-day" style={{ marginRight: '0.5rem', color: '#D4AF37' }}></i> {date}
                                                </td>
                                            </tr>
                                            {items.map((row) => (
                                                <tr key={row.id}>
                                                    <td data-label="No">{row.id}</td>
                                                    <td data-label="Waktu" style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                        {new Date(row.tanggal).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </td>
                                                    <td data-label="Keterangan">
                                                        <EditableCell row={row} table="keuangan" field={row.pengeluaran ? 'pengeluaran' : 'keterangan'} val={row.pengeluaran || row.keterangan}>
                                                            <div>
                                                                <strong>{row.pengeluaran || row.keterangan || '-'}</strong>
                                                                {row.keterangan && row.pengeluaran && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.keterangan}</div>}
                                                            </div>
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Harga Keluar" style={{ color: '#ef4444', fontWeight: 700 }}>
                                                        <EditableCell row={row} table="keuangan" field="harga" type="number" val={row.harga}>
                                                            {Number(row.harga) > 0 ? formatRp(row.harga) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Pendapatan" style={{ color: '#10b981', fontWeight: 700 }}>
                                                        <EditableCell row={row} table="keuangan" field="pendapatan_kotor" type="number" val={row.pendapatan_kotor}>
                                                            {Number(row.pendapatan_kotor) > 0 ? formatRp(row.pendapatan_kotor) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Jenis">
                                                        {Number(row.pendapatan_kotor) > 0
                                                            ? <span className="finance-badge masuk"><i className="fas fa-arrow-up"></i> Masuk</span>
                                                            : <span className="finance-badge keluar"><i className="fas fa-arrow-down"></i> Keluar</span>
                                                        }
                                                    </td>
                                                    <td data-label="Aksi">
                                                        <button onClick={() => handleDelete(row.id, 'keuangan')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                                {filteredKeuangan.length > 0 && (
                                    <tfoot>
                                        <tr style={{ fontWeight: 700, background: 'var(--bg-light)' }}>
                                            <td colSpan={3} style={{ fontWeight: 700, textAlign: 'right' }}>TOTAL</td>
                                            <td style={{ color: '#ef4444', fontWeight: 800 }}>{formatRp(totalPengeluaran)}</td>
                                            <td style={{ color: '#10b981', fontWeight: 800 }}>{formatRp(totalPemasukan)}</td>
                                            <td colSpan={2} style={{ color: saldo >= 0 ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                                                Saldo: {formatRp(saldo)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                    {/* Tabel Stok Ikan */}
                    <div className="table-panel">
                        <h3 className="panel-title">
                            <i className="fas fa-fish"></i> Riwayat Stok Ikan — {seg.label}
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{filteredStok.length} data · Total {totalStokIkan} ekor</span>
                        </h3>
                        <div className="table-responsive">
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Waktu</th>
                                        <th>Jenis Ikan</th>
                                        <th>Jumlah</th>
                                        <th>Harga Satuan</th>
                                        <th>Omah</th>
                                        <th>Online</th>
                                        <th>Ekspor</th>
                                        <th>Keterangan</th>
                                        <th>Est. Nilai</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStok.length === 0 ? (
                                        <tr><td colSpan={11} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Belum ada data di periode ini.</td></tr>
                                    ) : Object.entries(groupDataByDate(filteredStok)).map(([date, items]) => (
                                        <React.Fragment key={date}>
                                            <tr style={{ background: 'var(--bg-light)' }}>
                                                <td colSpan={11} style={{ fontWeight: 800, color: 'var(--primary-dark)', padding: '0.8rem', borderBottom: '2px solid var(--border-color)' }}>
                                                    <i className="fas fa-calendar-day" style={{ marginRight: '0.5rem', color: '#D4AF37' }}></i> {date}
                                                </td>
                                            </tr>
                                            {items.map((row) => (
                                                <tr key={row.id}>
                                                    <td data-label="No">{row.id}</td>
                                                    <td data-label="Waktu" style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                        {new Date(row.tanggal).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </td>
                                                    <td data-label="Jenis Ikan">
                                                        <EditableCell row={row} table="stok" field="jenis_ikan" val={row.jenis_ikan}>
                                                            <strong>{row.jenis_ikan}</strong>
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Jumlah" style={{ fontWeight: 700, color: '#D4AF37' }}>
                                                        <EditableCell row={row} table="stok" field="jumlah" type="number" val={row.jumlah}>
                                                            {row.jumlah} ekor
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Harga Satuan">
                                                        <EditableCell row={row} table="stok" field="harga_satuan" type="number" val={row.harga_satuan}>
                                                            {Number(row.harga_satuan) > 0 ? formatRp(row.harga_satuan) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Omah">
                                                        <EditableCell row={row} table="stok" field="omah" type="number" val={row.omah}>
                                                            {Number(row.omah) > 0 ? formatRp(row.omah) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Online">
                                                        <EditableCell row={row} table="stok" field="online" type="number" val={row.online}>
                                                            {Number(row.online) > 0 ? formatRp(row.online) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Ekspor">
                                                        <EditableCell row={row} table="stok" field="ekspor" type="number" val={row.ekspor}>
                                                            {Number(row.ekspor) > 0 ? formatRp(row.ekspor) : '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Keterangan" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                                        <EditableCell row={row} table="stok" field="keterangan" val={row.keterangan}>
                                                            {row.keterangan || '-'}
                                                        </EditableCell>
                                                    </td>
                                                    <td data-label="Est. Nilai" style={{ fontWeight: 700, color: '#D4AF37' }}>
                                                        {formatRp(Number(row.jumlah || 0) * Number(row.harga_satuan || 0))}
                                                    </td>
                                                    <td data-label="Aksi">
                                                        <button onClick={() => handleDelete(row.id, 'stok')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                                {filteredStok.length > 0 && (
                                    <tfoot>
                                        <tr style={{ fontWeight: 700, background: 'var(--bg-light)' }}>
                                            <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>TOTAL</td>
                                            <td style={{ color: '#D4AF37', fontWeight: 800 }}>{totalStokIkan} ekor</td>
                                            <td colSpan={5}></td>
                                            <td style={{ color: '#D4AF37', fontWeight: 800 }}>{formatRp(totalAsetIkan)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    background: toast.type === 'error' ? '#1e1e2e' : '#0f172a',
                    color: '#fff', padding: '1rem 1.5rem', borderRadius: '14px',
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    borderLeft: `4px solid ${toast.type === 'error' ? '#ef4444' : '#10b981'}`,
                    animation: 'slideUp 0.3s ease'
                }}>
                    <i className={`fas ${toast.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}`}
                        style={{ color: toast.type === 'error' ? '#ef4444' : '#10b981', fontSize: '1.2rem' }}></i>
                    <span style={{ fontWeight: 500 }}>{toast.message}</span>
                </div>
            )}

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    );
}
