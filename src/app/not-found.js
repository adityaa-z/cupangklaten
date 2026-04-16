import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary-dark)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Halaman tidak ditemukan</h2>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>Maaf, halaman yang Anda cari telah dipindahkan atau tidak ada.</p>
      <Link href="/" className="nav-btn" style={{ textDecoration: 'none', padding: '1rem 2rem', background: 'var(--primary-cyan)', color: 'white', borderRadius: '50px' }}>
        Kembali ke Beranda
      </Link>
    </div>
  );
}
