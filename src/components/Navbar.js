'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import '@/app/homepage.css';

const Navbar = () => {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.body.setAttribute('data-theme', savedTheme);

    const handleClickOutside = () => setMenuOpen(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const toggleTheme = (e) => {
    e.stopPropagation();
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="ed-header">
      <div className="ed-nav-inner">
        <Link href="/" className="ed-brand-link">
          <img
            src="/logo-cansbetta.jpg"
            alt="cans.betta x cupangklaten"
            className="ed-brand-avatar"
          />
          <span className="ed-brand-wordmark">
            <span className="ed-brand-name">
              cans.betta <span className="ed-brand-cross">x</span> cupangklaten
            </span>
          </span>
        </Link>

        <div className="ed-nav-controls">
          <button
            type="button"
            className="ed-nav-icon-btn"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Ubah ke Tema Terang' : 'Ubah ke Tema Gelap'}
            title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
          >
            <i className={theme === 'light' ? 'fas fa-moon' : 'fas fa-sun'} />
          </button>

          <button
            type="button"
            className="ed-nav-icon-btn"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            aria-expanded={menuOpen}
          >
            <i className={menuOpen ? 'fas fa-times' : 'fas fa-bars'} />
          </button>

          <div
            className={`ed-nav-dropdown ${menuOpen ? 'active' : ''}`}
            id="mainMenu"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="ed-dropdown-group-label">Galeri &amp; Menu</span>
            <Link href="/prestasi" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-trophy" /> Prestasi Kontes
            </Link>
            <Link href="/stok" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-fish" /> Stok &amp; Harga Ikan
            </Link>
            <Link href="/game" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-gamepad" /> Mini-Game Arena
            </Link>
            <Link href="/tips-perawatan" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-book-open" /> Tips &amp; Edukasi
            </Link>
            <Link href="/artikel" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-newspaper" /> Artikel Cupang
            </Link>
            <Link href="/claim-garansi" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-shield-alt" /> Claim Garansi
            </Link>
            <Link href="/faq" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
              <i className="fas fa-question-circle" /> FAQ
            </Link>

            <hr className="ed-dropdown-divider" />
            <span className="ed-dropdown-group-label">Akun</span>

            {status === 'loading' ? (
              <div className="ed-dropdown-item" style={{ color: 'var(--ed-ink-muted)', cursor: 'default' }}>
                <i className="fas fa-spinner fa-spin" /> Memuat...
              </div>
            ) : session ? (
              <>
                <Link
                  href="/profil"
                  className="ed-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                  style={{ fontWeight: 600 }}
                >
                  <i className="fas fa-user-circle" /> Halo, {session.user.name?.split(' ')[0] || 'Member'}
                </Link>
                {session.user?.email === 'zidanp13794@gmail.com' && (
                  <>
                    <Link href="/keuangan" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
                      <i className="fas fa-wallet" /> Menu Keuangan
                    </Link>
                    <Link href="/admin" className="ed-dropdown-item" onClick={() => setMenuOpen(false)}>
                      <i className="fas fa-user-shield" /> Admin Panel
                    </Link>
                  </>
                )}
                <div
                  className="ed-dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  style={{ color: '#ef4444' }}
                >
                  <i className="fas fa-sign-out-alt" style={{ color: '#ef4444' }} /> Logout
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="ed-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                  style={{ fontWeight: 600 }}
                >
                  <i className="fas fa-sign-in-alt" /> Login
                </Link>
                <Link
                  href="/register"
                  className="ed-dropdown-item"
                  onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--ed-ok)', fontWeight: 600 }}
                >
                  <i className="fas fa-user-plus" style={{ color: 'var(--ed-ok)' }} /> Daftar Member
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
