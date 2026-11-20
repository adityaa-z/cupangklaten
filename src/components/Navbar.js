'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

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
        setMenuOpen(!menuOpen);
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
        <header>
            <div className="nav-container">
                <Link href="/" className="logo" style={{ gap: '0.65rem' }}>
                    <img
                        src="/logo-cansbetta.jpg"
                        alt="cans.betta cupangklaten"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid rgba(255,255,255,0.18)',
                        }}
                    />
                    <span
                        className="logo-text"
                        style={{
                            fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
                            fontWeight: 800,
                            letterSpacing: '-0.3px',
                            background: 'linear-gradient(90deg, #ff2e55 0%, #d926ff 48%, #00c8ff 100%)',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            lineHeight: 1.1,
                        }}
                    >
                        cans.betta cupangklaten
                    </span>
                </Link>

                <div className="nav-menu-container" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? 'Ubah ke Tema Terang' : 'Ubah ke Tema Gelap'}
                        title={theme === 'dark' ? 'Tema Terang' : 'Tema Gelap'}
                    >
                        <i className={theme === 'light' ? "fas fa-moon" : "fas fa-sun"}></i>
                    </button>

                    <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </button>

                    <div className={`nav-dropdown-menu ${menuOpen ? 'active' : ''}`} id="mainMenu">
                        <Link href="/game" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-gamepad"></i> Soliter Virtual
                        </Link>
                        <Link href="/stok" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-fish"></i> Stok & Harga Ikan
                        </Link>
                        <Link href="/tips-perawatan" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-book-open"></i> Tips & Edukasi
                        </Link>
                        <Link href="/artikel" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-newspaper"></i> Artikel Cupang
                        </Link>
                        <Link href="/claim-garansi" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-shield-alt"></i> Claim Garansi
                        </Link>
                        <Link href="/faq" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-question-circle"></i> FAQ
                        </Link>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />
                        {status === 'loading' ? (
                            <div className="menu-item" style={{ color: 'var(--text-muted)' }}><i className="fas fa-spinner fa-spin"></i> Memuat...</div>
                        ) : session ? (
                            <>
                                <Link href="/profil" className="menu-item" onClick={() => setMenuOpen(false)} style={{ fontWeight: 'bold' }}>
                                    <i className="fas fa-user-circle"></i> Halo, {session.user.name?.split(' ')[0] || 'Member'}
                                </Link>
                                {session.user?.email === 'zidanp13794@gmail.com' && (
                                    <>
                                        <Link href="/keuangan" className="menu-item" onClick={() => setMenuOpen(false)}>
                                            <i className="fas fa-wallet"></i> Menu Keuangan
                                        </Link>
                                        <Link href="/admin" className="menu-item" onClick={() => setMenuOpen(false)}>
                                            <i className="fas fa-user-shield"></i> Admin Panel
                                        </Link>
                                    </>
                                )}
                                <div className="menu-item" onClick={() => { setMenuOpen(false); signOut(); }} style={{ color: '#ef4444', cursor: 'pointer' }}>
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="menu-item" onClick={() => setMenuOpen(false)} style={{ fontWeight: 'bold' }}>
                                    <i className="fas fa-sign-in-alt"></i> Login
                                </Link>
                                <Link href="/register" className="menu-item" onClick={() => setMenuOpen(false)} style={{ color: '#10b981', fontWeight: 'bold' }}>
                                    <i className="fas fa-user-plus"></i> Daftar Member
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
