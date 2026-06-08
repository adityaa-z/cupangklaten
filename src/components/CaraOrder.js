import React from 'react';

export default function CaraOrder() {
    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>Cara <span style={{ color: 'var(--primary-cyan)' }}>Order</span></h2>
            <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '15px', boxShadow: 'var(--card-shadow)' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <h3>1. Pilih Ikan</h3>
                    <p>Cek katalog stok kami di menu "Stok". Pilih ikan yang Anda sukai.</p>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h3>2. Lakukan Pembayaran</h3>
                    <p>Transfer pembayaran via:</p>
                    <ul style={{ listStyleType: 'none', paddingLeft: 0, marginTop: '0.5rem' }}>
                        <li style={{ marginBottom: '0.5rem' }}><strong>Shopee / DANA:</strong> 085700846152 <br/><span style={{ fontSize: '0.9em', color: '#666' }}>(a.n. Aditya Bintang Zidan Pratama)</span></li>
                        <li style={{ marginBottom: '0.5rem' }}><strong>SeaBank:</strong> 901709292959 <br/><span style={{ fontSize: '0.9em', color: '#666' }}>(a.n. Aditya Bintang Zidan Pratama)</span></li>
                        <li><strong>QRIS:</strong> Nama Toko: Cupang Depo <br/><span style={{ fontSize: '0.9em', color: '#666' }}>(gunakan logo/gambar QRIS yang sudah ada)</span></li>
                    </ul>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h3>3. Screenshot Bukti Pembayaran</h3>
                    <p>Ambil screenshot bukti pembayaran dari aplikasi yang Anda gunakan.</p>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h3>4. Checkout di Shopee</h3>
                    <p>Lakukan checkout di Shopee untuk proses pengiriman dan perhitungan ongkir. Pilih produk sesuai kode ikan yang Anda inginkan.</p>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <h3>5. Konfirmasi via WhatsApp</h3>
                    <p>Kirim screenshot bukti pembayaran dan kode ikan ke WhatsApp kami melalui tombol di pojok kanan bawah untuk konfirmasi pesanan agar segera kami proses kemas.</p>
                </div>
                <div>
                    <h3>6. Wajib Video Unboxing</h3>
                    <p>Rekam video unboxing saat paket tiba sebagai syarat klaim garansi.</p>
                </div>
            </div>
        </div>
    );
}
