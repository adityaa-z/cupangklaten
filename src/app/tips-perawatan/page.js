import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function TipsPerawatanPage() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Tips <span style={{ color: 'var(--primary-cyan)' }}>Perawatan</span></h1>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: 'var(--card-shadow)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Menjaga Kualitas Air</h3>
                    <p style={{ marginBottom: '2rem' }}>Gunakan air yang sudah diendapkan minimal 24 jam. Tambahkan sedikit garam ikan dan ekstrak ketapang untuk menjaga pH air tetap stabil.</p>
                    
                    <h3 style={{ marginBottom: '1rem' }}>Pakan Terbaik</h3>
                    <p style={{ marginBottom: '2rem' }}>Berikan pakan hidup seperti jentik nyamuk atau kutu air (Moina/Daphnia) untuk meningkatkan warna dan agresivitas ikan.</p>
                    
                    <h3 style={{ marginBottom: '1rem' }}>Pembersihan Wadah</h3>
                    <p>Ganti air secara rutin minimal 3 hari sekali sebanyak 50% untuk mencegah timbulnya jamur dan penyakit pada sirip ikan.</p>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
