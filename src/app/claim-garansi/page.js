'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function ClaimGaransiPage() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '800' }}>
                    Kebijakan <span style={{ color: 'var(--primary-cyan)' }}>Garansi Ikan Hidap</span>
                </h1>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                    Kami memastikan setiap ikan dikirim dalam kondisi prima. Namun jika terjadi hal yang tidak diinginkan, silakan ikuti prosedur klaim berikut.
                </p>
                
                <div style={{ background: 'var(--bg-white)', padding: '2.5rem', borderRadius: '20px', boxShadow: 'var(--card-shadow)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', background: '#fee2e2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca' }}>
                        <i className="fas fa-exclamation-triangle" style={{ color: '#dc2626', fontSize: '1.5rem' }}></i>
                        <span style={{ color: '#991b1b', fontWeight: '700' }}>PENTING: Garansi Hanya Berlaku Jika Syarat Berikut Terpenuhi</span>
                    </div>

                    <div className="warranty-steps">
                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dark)' }}>
                                <span style={{ background: 'var(--primary-cyan)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.9rem', justifyContent: 'center' }}>1</span>
                                Wajib Video Unboxing
                            </h3>
                            <p style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem', lineHeight: '1.6' }}>
                                Menyertakan rekaman **Video Unboxing** dari awal paket masih tersegel rapat tanpa jeda, tanpa edit, dan memperlihatkan kondisi ikan dengan jelas.
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dark)' }}>
                                <span style={{ background: 'var(--primary-cyan)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.9rem', justifyContent: 'center' }}>2</span>
                                Ikan Masih Dalam Plastik
                            </h3>
                            <p style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem', lineHeight: '1.6' }}>
                                Kondisi ikan yang mati harus masih berada di dalam **plastik kemasan asli** dari Cupang Klaten. Garansi tidak berlaku jika ikan sudah dikeluarkan atau dimasukkan ke wadah lain.
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dark)' }}>
                                <span style={{ background: 'var(--primary-cyan)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.9rem', justifyContent: 'center' }}>3</span>
                                Batas Waktu Klaim
                            </h3>
                            <p style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem', lineHeight: '1.6' }}>
                                Laporan klaim maksimal **1x24 jam** setelah paket dinyatakan diterima berdasarkan data resi ekspedisi resmi.
                            </p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-dark)' }}>
                                <span style={{ background: 'var(--primary-cyan)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.9rem', justifyContent: 'center' }}>4</span>
                                Jangkauan Garansi
                            </h3>
                            <p style={{ color: 'var(--text-muted)', paddingLeft: '2.5rem', lineHeight: '1.6' }}>
                                Kami memberikan **Garansi 100% untuk Semua Jenis Pengiriman**, baik Express maupun Reguler. Kami berkomitmen menjaga keamanan ikan Anda hingga sampai di tujuan.
                            </p>
                        </div>

                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-dark)' }}>Kebijakan Penggantian & Refund:</h3>
                            <ul style={{ color: 'var(--text-muted)', paddingLeft: '3.5rem', lineHeight: '1.8' }}>
                                <li><strong>Uang Kembali 100%:</strong> Kami memberikan garansi uang kembali senilai harga ikan (tidak termasuk ongkos kirim) jika ikan mati saat diterima.</li>
                                <li><strong>Ganti Ikan Baru:</strong> Ikan dapat diganti dengan jenis yang setara (biaya ongkos kirim ikan baru ditanggung pembeli).</li>
                                <li>Semua klaim wajib menyertakan video unboxing sesuai poin nomor 1.</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <a href="https://wa.me/6285700846152?text=Halo%20Admin%20Cupang%20Klaten,%20saya%20ingin%20mengajukan%20klaim%20garansi%20ikan." 
                           className="checkout-wa" 
                           style={{ textDecoration: 'none', display: 'inline-flex', padding: '1rem 2rem' }}>
                            <i className="fab fa-whatsapp" style={{ marginRight: '0.8rem' }}></i> Hubungi Admin untuk Klaim
                        </a>
                    </div>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
