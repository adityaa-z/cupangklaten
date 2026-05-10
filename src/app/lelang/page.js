'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import './lelang.css';

export default function LelangPage() {
    const { data: session, status } = useSession();
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAuctions();
        // Polling setiap 10 detik untuk update status lelang
        const interval = setInterval(fetchAuctions, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuctions = async () => {
        try {
            const res = await fetch('/api/auctions/');
            if (res.ok) {
                const data = await res.json();
                setAuctions(data);
            }
        } catch (err) {
            console.error('Failed to fetch auctions:', err);
        } finally {
            setLoading(false);
        }
    };

    const calculateTimeLeft = (endTime) => {
        const difference = new Date(endTime) - new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hari: Math.floor(difference / (1000 * 60 * 60 * 24)),
                jam: Math.floor((difference / (1000 * 60 * 60)) % 24),
                menit: Math.floor((difference / 1000 / 60) % 60),
                detik: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const formatNumber = (num) => {
        return num < 10 ? `0${num}` : num;
    };

    const Timer = ({ endTime }) => {
        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endTime));

        useEffect(() => {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft(endTime));
            }, 1000);
            return () => clearInterval(timer);
        }, [endTime]);

        if (Object.keys(timeLeft).length === 0) {
            return <span>Berakhir</span>;
        }

        return (
            <>
                {timeLeft.hari > 0 && (
                    <div className="time-unit">
                        <span className="time-val">{formatNumber(timeLeft.hari)}</span>
                        <span className="time-label">Hari</span>
                    </div>
                )}
                {timeLeft.hari > 0 && <span className="time-val" style={{ margin: '0 -0.5rem' }}>:</span>}
                <div className="time-unit">
                    <span className="time-val">{formatNumber(timeLeft.jam)}</span>
                    <span className="time-label">Jam</span>
                </div>
                <span className="time-val" style={{ margin: '0 -0.5rem' }}>:</span>
                <div className="time-unit">
                    <span className="time-val">{formatNumber(timeLeft.menit)}</span>
                    <span className="time-label">Mnt</span>
                </div>
                <span className="time-val" style={{ margin: '0 -0.5rem' }}>:</span>
                <div className="time-unit">
                    <span className="time-val">{formatNumber(timeLeft.detik)}</span>
                    <span className="time-label">Dtk</span>
                </div>
            </>
        );
    };

    return (
        <div className="lelang-container">
            <div className="lelang-header">
                <h1>Arena Lelang Cupang</h1>
                <p>Temukan ikan cupang kualitas kontes dan menangkan tawarannya!</p>
            </div>

            {/* Auth Warning */}
            {status !== 'loading' && (!session || session.user?.status !== 'approved') && (
                <div className="auth-warning">
                    <i className="fas fa-lock"></i>
                    <h3>Akses Bidding Terkunci</h3>
                    <p>
                        {!session 
                            ? 'Anda harus login untuk bisa mengikuti lelang.' 
                            : 'Akun Anda sedang menunggu persetujuan Admin. Anda baru bisa menawar setelah akun diverifikasi.'}
                    </p>
                    {!session && (
                        <Link href="/?login=true" className="btn btn-primary" style={{ display: 'inline-block', width: 'auto' }}>
                            Login Sekarang
                        </Link>
                    )}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Memuat arena lelang...</p>
                </div>
            ) : auctions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                    <i className="fas fa-gavel" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                    <h3>Belum ada jadwal lelang</h3>
                    <p>Silakan pantau terus website kami untuk update selanjutnya.</p>
                </div>
            ) : (
                <div className="lelang-grid">
                    {auctions.map(auction => {
                        const isUpcoming = new Date(auction.start_time) > new Date();
                        
                        return (
                            <div key={auction.id} className="lelang-card">
                                <div className="lelang-media">
                                    <span className={`status-badge ${isUpcoming ? 'status-upcoming' : 'status-active'}`}>
                                        {isUpcoming ? 'Akan Datang' : 'Live Bidding'}
                                    </span>
                                    {auction.is_video ? (
                                        <video src={auction.image_url} autoPlay loop muted playsInline />
                                    ) : (
                                        <img src={auction.image_url || '/logo.png'} alt={auction.title} />
                                    )}
                                    <div className="countdown-box">
                                        <Timer endTime={isUpcoming ? auction.start_time : auction.end_time} />
                                    </div>
                                </div>
                                
                                <div className="lelang-info">
                                    <h3 className="lelang-title">{auction.title}</h3>
                                    
                                    <div className="price-box">
                                        <div>
                                            <div className="price-label">Open Bid (OB)</div>
                                            <div className="price-val">Rp {auction.start_price.toLocaleString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="price-label">Kelipatan</div>
                                            <div className="price-val" style={{ color: '#38bdf8' }}>Rp {auction.min_bid_increment.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    
                                    {isUpcoming ? (
                                        <div className="btn-bid upcoming">
                                            Lelang Belum Dimulai
                                        </div>
                                    ) : (
                                        <Link href={`/lelang/${auction.id}`} className="btn-bid active">
                                            Masuk Room & Bid
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
