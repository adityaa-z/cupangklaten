'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { submitClaim } from '@/app/actions/promo';
import Link from 'next/link';

export default function ClaimVoucherPage() {
    const [mapsName, setMapsName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [screenshot, setScreenshot] = useState(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successCode, setSuccessCode] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('mapsName', mapsName);
        formData.append('whatsappNumber', whatsappNumber);
        formData.append('screenshot', screenshot);

        const res = await submitClaim(formData);
        
        if (res.success) {
            setSuccessCode(res.claimCode);
        } else {
            setError(res.error || 'Terjadi kesalahan saat submit klaim.');
        }
        setIsLoading(false);
    };

    return (
        <div style={{ minHeight: '80vh', padding: '4rem 2rem', background: 'var(--bg-light)', display: 'flex', justifyContent: 'center' }}>
            <div style={{ background: 'var(--bg-white)', maxWidth: '500px', width: '100%', borderRadius: '20px', boxShadow: 'var(--card-shadow)', padding: '2.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Claim Voucher Promo</h1>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Dapatkan voucher ikan cupang 5000an gratis dengan memberikan rating Bintang 5 di Google Maps kami!</p>
                </div>

                {!successCode && (
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-dark)', marginBottom: '1rem' }}><i className="fas fa-info-circle" style={{ color: '#3b82f6', marginRight: '8px' }}></i>Cara Mendapatkan Voucher:</h3>
                        <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Klik tombol <strong>Beri Rating Maps</strong> di bawah ini.</li>
                            <li style={{ marginBottom: '0.5rem' }}>Berikan ulasan positif dan rating <strong>Bintang 5</strong> di Google Maps Cupang Klaten.</li>
                            <li style={{ marginBottom: '0.5rem' }}><strong>Screenshot</strong> bukti ulasan Anda.</li>
                            <li>Isi form di bawah dan upload screenshot tersebut.</li>
                        </ol>
                        <a 
                            href="https://maps.app.goo.gl/mkFP6BYoa9MmM4UM8" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '0.8rem', background: '#ffffff', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}
                        >
                            <i className="fas fa-map-marker-alt"></i> Beri Rating Maps Cupang Klaten
                        </a>
                    </div>
                )}

                {successCode ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#047857', marginBottom: '0.5rem', fontSize: '1.2rem' }}><i className="fas fa-check-circle"></i> Klaim Berhasil!</h3>
                            <p style={{ color: '#065f46', fontSize: '0.9rem' }}>Tunjukkan QR Code ini ke Admin saat berada di toko.</p>
                        </div>
                        
                        <div style={{ display: 'inline-block', padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', marginBottom: '1.5rem' }}>
                            <QRCodeSVG value={successCode} size={200} />
                        </div>
                        
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', color: 'var(--text-dark)', marginBottom: '2rem' }}>
                            {successCode}
                        </div>

                        <a 
                            href={`https://wa.me/6285700846152?text=Halo%20Admin,%20saya%20sudah%20Claim%20Voucher%20dan%20mendapatkan%20tiket%20QR%20Code%20Promo%20Maps%20(${successCode}).%20Apakah%20toko%20sedang%20buka%20untuk%20penukaran%20hari%20ini?`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'block', width: '100%', padding: '1rem', background: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem' }}
                        >
                            <i className="fab fa-whatsapp" style={{ marginRight: '8px' }}></i> Hubungi Admin di WA
                        </a>
                        <Link href="/" style={{ display: 'block', marginTop: '1rem', color: 'var(--text-muted)', textDecoration: 'none' }}>
                            Kembali ke Beranda
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #ef4444', color: '#b91c1c', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Nama Profil di Google Maps</label>
                            <input 
                                type="text" 
                                required 
                                value={mapsName}
                                onChange={(e) => setMapsName(e.target.value)}
                                placeholder="Contoh: Budi Santoso"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Nomor WhatsApp Aktif</label>
                            <input 
                                type="text" 
                                required 
                                value={whatsappNumber}
                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                placeholder="Contoh: 081234567890"
                                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text-dark)' }}>Upload Bukti Screenshot Bintang 5</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                required 
                                onChange={(e) => setScreenshot(e.target.files[0])}
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-light)', color: 'var(--text-dark)' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Pastikan screenshot menunjukkan ulasan Bintang 5 yang Anda berikan.</p>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            style={{ width: '100%', padding: '1.2rem', background: 'var(--primary-cyan)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'Memproses Klaim...' : 'Klaim Voucher Sekarang'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
