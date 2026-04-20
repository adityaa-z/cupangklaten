import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAB from '@/components/FAB';

export default function CaraOrderPage() {
    return (
        <>
            <Navbar />
            <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Cara <span style={{ color: 'var(--primary-cyan)' }}>Order</span></h1>
                <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '15px', boxShadow: 'var(--card-shadow)' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>1. Pilih Ikan</h3>
                        <p>Cek katalog stok kami di menu "Stok". Pilih ikan yang Anda sukai.</p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>2. Klik Link Shopee</h3>
                        <p>Setiap produk memiliki tombol "Beli di Shopee". Klik tombol tersebut untuk diarahkan ke toko kami di Shopee.</p>
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <h3>3. Selesaikan Pembayaran</h3>
                        <p>Lakukan checkout dan pembayaran di aplikasi Shopee seperti biasa.</p>
                    </div>
                    <div>
                        <h3>4. Konfirmasi via WhatsApp</h3>
                        <p>Setelah pembayaran, klik tombol WhatsApp di pojok kanan bawah untuk mengonfirmasi pesanan Anda agar segera kami proses kemas.</p>
                    </div>
                </div>
            </div>
            <Footer />
            <FAB />
        </>
    );
}
