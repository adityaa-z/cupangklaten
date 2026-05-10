'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import '../lelang.css'; // Kita re-use CSS dari /lelang

export default function LelangRoomPage({ params }) {
    const resolvedParams = React.use(params);
    const id = resolvedParams.id;
    const { data: session, status } = useSession();
    const [auction, setAuction] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [isBidding, setIsBidding] = useState(false);
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

    // Polling setiap 3 detik agar realtime
    useEffect(() => {
        fetchAuctionData();
        const interval = setInterval(fetchAuctionData, 3000);
        return () => clearInterval(interval);
    }, [id]);

    const fetchAuctionData = async () => {
        try {
            const res = await fetch(`/api/auctions/${id}/`);
            if (res.ok) {
                const data = await res.json();
                setAuction(data.auction);
                setBids(data.bids);
                
                // Set default bid input to Minimum Required Bid if user hasn't typed
                const currentMax = data.bids.length > 0 ? Number(data.bids[0].amount) : 0;
                const minReq = currentMax > 0 
                    ? currentMax + Number(data.auction.min_bid_increment) 
                    : Number(data.auction.start_price);
                
                setBidAmount(prev => prev === '' ? minReq : prev);
                setLoading(false);
            } else {
                setError('Lelang tidak ditemukan.');
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleBid = async (e) => {
        e.preventDefault();
        
        if (status !== 'authenticated' || session?.user?.status !== 'approved') {
            alert('Akses Bidding Terkunci! Pastikan Anda sudah Login & akun berstatus Approved.');
            return;
        }

        const amountNum = parseInt(bidAmount);
        
        setIsBidding(true);
        try {
            const res = await fetch('/api/bid/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auction_id: id,
                    amount: amountNum
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                if (data.antiSnipeTriggered) {
                    showToast('🔥 ANTI-SNIPE AKTIF! Waktu diperpanjang 2 Menit!', 'warning');
                } else {
                    showToast('Tawaran Berhasil Masuk!', 'success');
                }
                setBidAmount(''); // Reset
                fetchAuctionData(); // Refresh data langsung
            } else {
                showToast(data.error || 'Gagal melakukan bid', 'error');
            }
        } catch (err) {
            showToast('Terjadi kesalahan jaringan', 'error');
        } finally {
            setIsBidding(false);
        }
    };

    const showToast = (msg, type) => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
    };

    // Komponen Timer Internal
    const Timer = ({ endTime }) => {
        const [timeLeft, setTimeLeft] = useState({});
        const [isEnded, setIsEnded] = useState(false);

        useEffect(() => {
            const timer = setInterval(() => {
                const diff = new Date(endTime) - new Date();
                if (diff <= 0) {
                    setIsEnded(true);
                    clearInterval(timer);
                } else {
                    setTimeLeft({
                        hari: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        jam: Math.floor((diff / (1000 * 60 * 60)) % 24),
                        menit: Math.floor((diff / 1000 / 60) % 60),
                        detik: Math.floor((diff / 1000) % 60)
                    });
                }
            }, 1000);
            return () => clearInterval(timer);
        }, [endTime]);

        if (isEnded) return <span style={{color: '#ef4444', fontWeight: 'bold'}}>LELANG BERAKHIR</span>;

        return (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <i className="fas fa-stopwatch" style={{ color: '#38bdf8', fontSize: '1.2rem' }}></i>
                {timeLeft.hari > 0 && <span>{timeLeft.hari}h </span>}
                <span>{timeLeft.jam}j : {timeLeft.menit}m : <span style={{ color: timeLeft.menit === 0 && timeLeft.detik <= 30 ? '#ef4444' : 'inherit' }}>{timeLeft.detik}s</span></span>
            </div>
        );
    };


    if (loading) return <div className="lelang-container" style={{display:'flex',justifyContent:'center',alignItems:'center'}}><div className="spinner"></div></div>;
    if (error) return <div className="lelang-container" style={{padding:'4rem',textAlign:'center'}}><h2>{error}</h2><Link href="/lelang" className="btn btn-primary" style={{marginTop:'1rem', display:'inline-block'}}>Kembali</Link></div>;

    const currentMaxBid = bids.length > 0 ? Number(bids[0].amount) : 0;
    const isLeading = bids.length > 0 && session && bids[0].user_id.toString() === session.user.id.toString();
    const isEnded = new Date() > new Date(auction.end_time) || auction.status === 'ended';
    const isUpcoming = new Date() < new Date(auction.start_time);
    
    const startPrice = Number(auction.start_price);
    const minIncrement = Number(auction.min_bid_increment);
    const minRequired = currentMaxBid > 0 ? currentMaxBid + minIncrement : startPrice;

    return (
        <div className="lelang-container" style={{ padding: '2rem 1rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                
                <Link href="/lelang" style={{ color: '#94a3b8', textDecoration: 'none', marginBottom: '1rem', display: 'inline-block' }}>
                    <i className="fas fa-arrow-left"></i> Kembali ke Galeri
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1rem' }} className="lelang-room-grid">
                    
                    {/* Kiri: Media & Info */}
                    <div>
                        <div style={{ background: '#1e293b', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                            {auction.image_url?.includes('.mp4') ? (
                                <video src={auction.image_url} autoPlay loop muted playsInline style={{ width: '100%', objectFit: 'cover' }} />
                            ) : (
                                <img src={auction.image_url || '/logo.png'} alt={auction.title} style={{ width: '100%', objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '1.5rem' }}>
                                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#f8fafc' }}>{auction.title}</h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5' }}>{auction.description || 'Tidak ada deskripsi tambahan.'}</p>
                            </div>
                        </div>

                        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '1.5rem', marginTop: '1rem', border: '1px solid #334155' }}>
                            <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>Riwayat Bid ({bids.length})</h3>
                            <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {bids.length === 0 ? (
                                    <p style={{ color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>Belum ada yang menawar. Jadilah yang pertama!</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {bids.map((b, idx) => (
                                            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: idx === 0 ? 'rgba(16, 185, 129, 0.1)' : '#0f172a', padding: '0.8rem 1rem', borderRadius: '8px', border: idx === 0 ? '1px solid #10b981' : 'none' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: idx === 0 ? '#10b981' : '#f8fafc' }}>
                                                        {b.name} {idx === 0 && <i className="fas fa-crown" style={{ color: '#fbbf24', marginLeft: '0.5rem' }}></i>}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(b.created_at).toLocaleString('id-ID')}</div>
                                                </div>
                                                <div style={{ fontWeight: 'bold', color: idx === 0 ? '#10b981' : '#cbd5e1' }}>
                                                    Rp {Number(b.amount).toLocaleString('id-ID')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Kanan: Bidding Console */}
                    <div>
                        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '2rem', border: '1px solid #38bdf8', position: 'sticky', top: '2rem' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <Timer endTime={auction.end_time} />
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Berakhir: {new Date(auction.end_time).toLocaleString('id-ID')}</div>
                            </div>

                            <div style={{ background: '#0f172a', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>Current Highest Bid</div>
                                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: currentMaxBid > 0 ? '#10b981' : '#f8fafc' }}>
                                    Rp {currentMaxBid > 0 ? currentMaxBid.toLocaleString('id-ID') : startPrice.toLocaleString('id-ID')}
                                </div>
                                {isLeading && !isEnded && (
                                    <div style={{ marginTop: '0.5rem', color: '#38bdf8', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        <i className="fas fa-star"></i> Anda memimpin lelang ini!
                                    </div>
                                )}
                                {isEnded && isLeading && (
                                    <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3)' }}>
                                        <h4 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>🎉 ANDA PEMENANGNYA! 🎉</h4>
                                        <p style={{ fontSize: '0.85rem', marginBottom: '1rem', opacity: '0.9' }}>Selamat! Silakan hubungi Admin untuk konfirmasi pembayaran dan pengiriman ikan.</p>
                                        <a href={`https://wa.me/6285700846152?text=Halo%20Admin,%20saya%20*${session.user.name}*%20adalah%20pemenang%20lelang%20*${encodeURIComponent(auction.title)}*%20dengan%20bid%20*Rp%20${currentMaxBid.toLocaleString('id-ID')}*.%20Mohon%20info%20pembayarannya.`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: '#059669', padding: '0.8rem 1.5rem', borderRadius: '30px', fontWeight: 'bold', textDecoration: 'none' }}>
                                            <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i> Konfirmasi Sekarang
                                        </a>
                                    </div>
                                )}
                            </div>

                            {!isEnded && !isUpcoming && (
                                <form onSubmit={handleBid}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Masukkan Nominal Bid (Min. Rp {minRequired.toLocaleString('id-ID')})</label>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ background: '#334155', display: 'flex', alignItems: 'center', padding: '0 1rem', borderRadius: '8px', fontWeight: 'bold' }}>Rp</span>
                                            <input 
                                                type="number" 
                                                value={bidAmount}
                                                onChange={e => setBidAmount(e.target.value)}
                                                min={minRequired}
                                                step={auction.min_bid_increment}
                                                style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid #334155', background: '#0f172a', color: 'white', fontSize: '1.2rem', fontWeight: 'bold' }}
                                                required
                                            />
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                                            <button 
                                                type="button" 
                                                onClick={() => setBidAmount(minRequired)}
                                                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                                            >
                                                Isi dengan nilai minimum (Rp {minRequired.toLocaleString('id-ID')})
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {(!session || session.user?.status !== 'approved') ? (
                                        <button type="button" className="btn btn-bid upcoming" disabled>
                                            <i className="fas fa-lock"></i> {session ? 'Akun Anda Belum Disetujui' : 'Login untuk Menawar'}
                                        </button>
                                    ) : (
                                        <button type="submit" className="btn btn-bid active" disabled={isBidding} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                            {isBidding ? <div className="spinner" style={{width:'20px', height:'20px'}}></div> : <i className="fas fa-gavel"></i>}
                                            {isBidding ? 'Memproses...' : 'KIRIM BID SEKARANG'}
                                        </button>
                                    )}
                                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
                                        <i className="fas fa-shield-alt"></i> Sistem Anti-Snipe Aktif: +2 Menit jika bid di sisa 30 detik.
                                    </div>
                                </form>
                            )}

                            {isUpcoming && (
                                <div style={{ background: '#334155', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: '#cbd5e1' }}>
                                    <i className="fas fa-calendar-alt" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                                    <h4>Lelang Belum Dimulai</h4>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Siapkan saldo Anda dan tunggu aba-aba!</p>
                                </div>
                            )}

                            {isEnded && !isLeading && (
                                <div style={{ background: '#ef4444', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: 'white' }}>
                                    <i className="fas fa-times-circle" style={{ fontSize: '2rem', marginBottom: '1rem' }}></i>
                                    <h4>Lelang Ditutup</h4>
                                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Pemenang: {bids[0]?.name || 'Tidak ada pemenang'}</p>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>

            {/* Custom Toast/Alert for Bidding */}
            {toast.show && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.type === 'error' ? '#ef4444' : toast.type === 'warning' ? '#f59e0b' : '#10b981',
                    color: 'white', padding: '1rem 2rem', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 'bold', animation: 'slideIn 0.3s ease'
                }}>
                    <i className={`fas fa-${toast.type === 'error' ? 'exclamation-circle' : toast.type === 'warning' ? 'fire' : 'check-circle'}`} style={{ fontSize: '1.5rem' }}></i>
                    {toast.msg}
                </div>
            )}
            
            <style jsx global>{`
                @media (max-width: 768px) {
                    .lelang-room-grid { grid-template-columns: 1fr !important; }
                }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
        </div>
    );
}
