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

    // Summary calculations
    const totalPengeluaran = keuangan.reduce((s, r) => s + Number(r.harga || 0), 0);
    const totalPemasukan = keuangan.reduce((s, r) => s + Number(r.pendapatan_kotor || 0), 0);
    const saldo = totalPemasukan - totalPengeluaran;
    const totalAsetIkan = stok.reduce((s, r) => s + (Number(r.jumlah || 0) * Number(r.harga_satuan || 0)), 0);
    const totalStokIkan = stok.reduce((s, r) => s + Number(r.jumlah || 0), 0);

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

                    {/* ============ TABEL KEUANGAN ============ */}
                    <div className="table-panel" style={{ marginBottom: '2rem' }}>
                        <h3 className="panel-title">
                            <i className="fas fa-table"></i> Riwayat Keuangan
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{keuangan.length} data</span>
                        </h3>
                        <div className="table-responsive">
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal</th>
                                        <th>Pengeluaran / Keterangan</th>
                                        <th>Harga Keluar</th>
                                        <th>Pendapatan Kotor</th>
                                        <th>Jenis</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {keuangan.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Belum ada data. Isi formulir di atas untuk mulai mencatat.</td></tr>
                                    ) : keuangan.map((row, i) => (
                                        <tr key={row.id}>
                                            <td data-label="No">{i + 1}</td>
                                            <td data-label="Tanggal" style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(row.tanggal).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td data-label="Keterangan">
                                                <strong>{row.pengeluaran || row.keterangan || '-'}</strong>
                                                {row.keterangan && row.pengeluaran && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.keterangan}</div>}
                                            </td>
                                            <td data-label="Harga Keluar" style={{ color: '#ef4444', fontWeight: 700 }}>
                                                {Number(row.harga) > 0 ? formatRp(row.harga) : '-'}
                                            </td>
                                            <td data-label="Pendapatan" style={{ color: '#10b981', fontWeight: 700 }}>
                                                {Number(row.pendapatan_kotor) > 0 ? formatRp(row.pendapatan_kotor) : '-'}
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
                                </tbody>
                                {keuangan.length > 0 && (
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
                            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>{stok.length} data · Total {totalStokIkan} ekor</span>
                        </h3>
                        <div className="table-responsive">
                            <table className="finance-table">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal</th>
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
                                    {stok.length === 0 ? (
                                        <tr><td colSpan={11} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Belum ada data stok ikan.</td></tr>
                                    ) : stok.map((row, i) => (
                                        <tr key={row.id}>
                                            <td data-label="No">{i + 1}</td>
                                            <td data-label="Tanggal" style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(row.tanggal).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td data-label="Jenis Ikan"><strong>{row.jenis_ikan}</strong></td>
                                            <td data-label="Jumlah" style={{ fontWeight: 700, color: '#D4AF37' }}>{row.jumlah} ekor</td>
                                            <td data-label="Harga Satuan">{Number(row.harga_satuan) > 0 ? formatRp(row.harga_satuan) : '-'}</td>
                                            <td data-label="Omah">{Number(row.omah) > 0 ? formatRp(row.omah) : '-'}</td>
                                            <td data-label="Online">{Number(row.online) > 0 ? formatRp(row.online) : '-'}</td>
                                            <td data-label="Ekspor">{Number(row.ekspor) > 0 ? formatRp(row.ekspor) : '-'}</td>
                                            <td data-label="Keterangan" style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{row.keterangan || '-'}</td>
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
                                </tbody>
                                {stok.length > 0 && (
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
