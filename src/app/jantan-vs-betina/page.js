import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function JantanVsBetinaPage() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Jantan vs <span style={{ color: 'var(--secondary-coral)' }}>Betina</span></h1>
                <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <h3 style={{ color: 'var(--primary-dark)', marginBottom: '1rem' }}>Cupang Jantan</h3>
                            <ul style={{ paddingLeft: '1.2rem' }}>
                                <li>Sirip lebih panjang dan lebar.</li>
                                <li>Warna lebih cerah dan tajam.</li>
                                <li>Agresivitas tinggi (suka membusungkan insang).</li>
                                <li>Tubuh lebih ramping.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--secondary-coral)', marginBottom: '1rem' }}>Cupang Betina</h3>
                            <ul style={{ paddingLeft: '1.2rem' }}>
                                <li>Sirip cenderung pendek.</li>
                                <li>Warna lebih kusam (kecuali varian tertentu).</li>
                                <li>Terdapat titik putih (telur) di bagian perut.</li>
                                <li>Tubuh lebih bulat/gemuk.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
