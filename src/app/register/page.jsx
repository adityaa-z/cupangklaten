'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mendaftar');
      }

      setSuccess(true);
      // Tunggu 3 detik lalu arahkan ke halaman login
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-light)', padding: '2rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '500px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Daftar Member</h1>
            <p style={{ color: 'var(--text-muted)' }}>Gabung sekarang untuk ikut lelang Cupang Klaten</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
              <strong>Pendaftaran Berhasil!</strong><br />
              Akun Anda sedang menunggu persetujuan admin. Mengalihkan ke halaman login...
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Nama Lengkap</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                placeholder="Masukkan nama lengkap" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                placeholder="nama@email.com" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Nomor WhatsApp</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                placeholder="Contoh: 08123456789" />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Alamat Pengiriman</label>
              <textarea name="address" value={formData.address} onChange={handleChange} required rows="3"
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none', resize: 'vertical' }} 
                placeholder="Alamat lengkap untuk pengiriman ikan"></textarea>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', fontSize: '0.9rem' }}>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6"
                style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e5e7eb', outline: 'none' }} 
                placeholder="Minimal 6 karakter" />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary-cyan)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
            <span style={{ padding: '0 10px', color: '#6b7280', fontSize: '0.9rem' }}>ATAU</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb' }}></div>
          </div>

          <button onClick={() => signIn('google', { callbackUrl: '/' })}
            style={{ width: '100%', padding: '0.8rem', backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '10px', fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '24px', height: '24px' }} />
            Daftar dengan Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' }}>
            Sudah punya akun? <Link href="/login" style={{ color: 'var(--primary-cyan)', fontWeight: '600', textDecoration: 'none' }}>Masuk di sini</Link>
          </p>

        </div>
      </div>
      <Footer />
    </>
  );
}
