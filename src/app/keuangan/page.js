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

export default function KeuanganPage() {
    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    const [keuangan, setKeuangan] = useState([]);
    const [stok, setStok] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeInputTab, setActiveInputTab] = useState('pengeluaran');
    const [filterDate, setFilterDate] = useState(getToday());
    const [editingCell, setEditingCell] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // Form states
    const [formPengeluaran, setFormPengeluaran] = useState({ tanggal: getToday(), pengeluaran: '', harga: '', keterangan: '' });
    const [formPemasukan, setFormPemasukan] = useState({ tanggal: getToday(), keterangan: '', pendapatan_kotor: '' });
    const [formStok, setFormStok] = useState({ tanggal: getToday(), jenis_ikan: '', jumlah: '', harga_satuan: '', omah: '', online: '', ekspor: '', keterangan: '' });

    // Auth guard
    useEffect(() => {
        if (authStatus === 'unauthenticated') { router.push('/'); return; }
        if (session && session.user?.email !== 'zidanp13794@gmail.com') { router.push('/'); return; }
        if (session) fetchData();
    }, [session, authStatus]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/finance');
            if (res.ok) {
                const data = await res.json();
                setKeuangan(data.keuangan || []);
                setStok(data.stok || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
    };

    const handleSubmit = async (type) => {
        let data;
        if (type === 'pengeluaran') {
            if (!formPengeluaran.pengeluaran || !formPengeluaran.harga) return showToast('Nama pengeluaran dan harga wajib diisi!', 'error');
            data = { ...formPengeluaran };
        } else if (type === 'pemasukan') {
            if (!formPemasukan.keterangan || !formPemasukan.pendapatan_kotor) return showToast('Keterangan dan nominal wajib diisi!', 'error');
            data = { ...formPemasukan };
        } else {
            if (!formStok.jenis_ikan || !formStok.jumlah) return showToast('Jenis ikan dan jumlah wajib diisi!', 'error');
            data = { ...formStok };
        }

        setSaving(true);
        try {
            const res = await fetch('/api/finance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            showToast('Data berhasil disimpan!');
            if (type === 'pengeluaran') setFormPengeluaran(p => ({ tanggal: p.tanggal, pengeluaran: '', harga: '', keterangan: '' }));
            else if (type === 'pemasukan') setFormPemasukan(p => ({ tanggal: p.tanggal, keterangan: '', pendapatan_kotor: '' }));
            else setFormStok(p => ({ tanggal: p.tanggal, jenis_ikan: '', jumlah: '', harga_satuan: '', omah: '', online: '', ekspor: '', keterangan: '' }));
            fetchData();
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
            fetchData();
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
            fetchData();
        } catch (err) { showToast('Error: ' + err.message, 'error'); }
        finally { setSaving(false); setEditingCell(null); }
    };

    // Filter data
    const filteredKeuangan = filterDate === 'all' 
        ? keuangan 
        : keuangan.filter(k => new Date(k.tanggal).toLocaleDateString('en-CA') === filterDate);
    const filteredStok = filterDate === 'all' 
        ? stok 
        : stok.filter(s => new Date(s.tanggal).toLocaleDateString('en-CA') === filterDate);

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
                                <i className="fas fa-plus-circle"></i> Catat Data Baru
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
                        {activeInputTab === 'pengeluaran' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                    <input className="form-control" type="date" max={getToday()} value={formPengeluaran.tanggal} onChange={e => setFormPengeluaran(p => ({ ...p, tanggal: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Nama Pengeluaran *</label>
                                    <input className="form-control" type="text" placeholder="Contoh: Beli Pakan, Akuarium..." value={formPengeluaran.pengeluaran} onChange={e => setFormPengeluaran(p => ({ ...p, pengeluaran: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Nominal Harga (Rp) *</label>
                                    <input className="form-control" type="number" placeholder="Contoh: 50000" value={formPengeluaran.harga} onChange={e => setFormPengeluaran(p => ({ ...p, harga: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Keterangan (Opsional)</label>
                                    <input className="form-control" type="text" placeholder="Catatan tambahan..." value={formPengeluaran.keterangan} onChange={e => setFormPengeluaran(p => ({ ...p, keterangan: e.target.value }))} />
                                </div>
                                <button className="btn-submit" style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', boxShadow: '0 4px 15px rgba(239,68,68,0.2)' }} onClick={() => handleSubmit('pengeluaran')} disabled={saving}>
                                    <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                                </button>
                            </div>
                        )}

                        {/* --- Form Pemasukan --- */}
                        {activeInputTab === 'pemasukan' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                    <input className="form-control" type="date" max={getToday()} value={formPemasukan.tanggal} onChange={e => setFormPemasukan(p => ({ ...p, tanggal: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Keterangan / Sumber Pemasukan *</label>
                                    <input className="form-control" type="text" placeholder="Contoh: Jual HM, Jual Plakat..." value={formPemasukan.keterangan} onChange={e => setFormPemasukan(p => ({ ...p, keterangan: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Pendapatan Kotor (Rp) *</label>
                                    <input className="form-control" type="number" placeholder="Contoh: 150000" value={formPemasukan.pendapatan_kotor} onChange={e => setFormPemasukan(p => ({ ...p, pendapatan_kotor: e.target.value }))} />
                                </div>
                                <button className="btn-submit" style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }} onClick={() => handleSubmit('pemasukan')} disabled={saving}>
                                    <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Pemasukan'}
                                </button>
                            </div>
                        )}

                        {/* --- Form Stok Ikan --- */}
                        {activeInputTab === 'stok' && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', alignItems: 'end' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Tanggal <span style={{fontWeight:400,color:'#94a3b8'}}>(bisa isi hari terlewat)</span></label>
                                    <input className="form-control" type="date" max={getToday()} value={formStok.tanggal} onChange={e => setFormStok(p => ({ ...p, tanggal: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Jenis Ikan *</label>
                                    <input className="form-control" type="text" placeholder="Plakat, HM, HMPK..." value={formStok.jenis_ikan} onChange={e => setFormStok(p => ({ ...p, jenis_ikan: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Jumlah Ekor *</label>
                                    <input className="form-control" type="number" placeholder="Contoh: 10" value={formStok.jumlah} onChange={e => setFormStok(p => ({ ...p, jumlah: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Harga Satuan (Rp)</label>
                                    <input className="form-control" type="number" placeholder="Untuk hitung aset" value={formStok.harga_satuan} onChange={e => setFormStok(p => ({ ...p, harga_satuan: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Omah (Rp)</label>
                                    <input className="form-control" type="number" placeholder="0" value={formStok.omah} onChange={e => setFormStok(p => ({ ...p, omah: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Online (Rp)</label>
                                    <input className="form-control" type="number" placeholder="0" value={formStok.online} onChange={e => setFormStok(p => ({ ...p, online: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Ekspor (Rp)</label>
                                    <input className="form-control" type="number" placeholder="0" value={formStok.ekspor} onChange={e => setFormStok(p => ({ ...p, ekspor: e.target.value }))} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Keterangan</label>
                                    <input className="form-control" type="text" placeholder="Catatan..." value={formStok.keterangan} onChange={e => setFormStok(p => ({ ...p, keterangan: e.target.value }))} />
                                </div>
                                <button className="btn-submit" onClick={() => handleSubmit('stok')} disabled={saving}>
                                    <i className="fas fa-save"></i> {saving ? 'Menyimpan...' : 'Simpan Stok'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ============ FILTER & TABEL KEUANGAN ============ */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>📋 Riwayat Data</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-white)', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tampilkan:</label>
                            <select 
                                value={filterDate} 
                                onChange={e => setFilterDate(e.target.value)}
                                style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 700, color: 'var(--text-dark)' }}
                            >
                                <option value={getToday()}>Hari Ini Saja</option>
                                <option value="all">Semua Waktu</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-panel" style={{ marginBottom: '2rem' }}>
                        <h3 className="panel-title">
                            <i className="fas fa-table"></i> Riwayat Keuangan
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
                                            {items.map((row, i) => (
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

                    {/* ============ TABEL STOK IKAN ============ */}
                    <div className="table-panel">
                        <h3 className="panel-title">
                            <i className="fas fa-fish"></i> Riwayat Stok Ikan
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
                                            {items.map((row, i) => (
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
