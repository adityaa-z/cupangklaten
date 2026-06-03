'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const Navbar = () => {
    const { data: session, status } = useSession();
    const [menuOpen, setMenuOpen] = useState(false);
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);

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
    };

    return (
        <header>
            <div className="nav-container">
                <Link href="/" className="logo">
                    <img src="/logo.png" alt="cupangklaten" />
                    <span className="logo-text">CUPANGKLATEN</span>
                </Link>

                <div className="nav-menu-container" style={{ display: 'flex', gap: '0.8rem' }}>
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                        <i className={theme === 'light' ? "fas fa-moon" : "fas fa-sun"}></i>
                    </button>

                    <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </button>
                    
                    <div className={`nav-dropdown-menu ${menuOpen ? 'active' : ''}`} id="mainMenu">
                        <Link href="/lelang" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-gavel"></i> Area Lelang
                        </Link>
                        <Link href="/stok" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-fish"></i> Semua Stok
                        </Link>
                        <Link href="/tips-perawatan" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-book-open"></i> Tips & Edukasi
                        </Link>
                        <Link href="/artikel" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-newspaper"></i> Artikel Cupang
                        </Link>
                        <Link href="/#reviews" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-star"></i> Testimoni
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
                                <Link href="/profil" className="menu-item" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
                                    <i className="fas fa-user-circle"></i> Halo, {session.user.name?.split(' ')[0] || 'Member'}
                                </Link>
                                {session.user?.email === 'zidanp13794@gmail.com' && (
                                    <>
                                        <Link href="/keuangan" className="menu-item" onClick={() => setMenuOpen(false)}>
                                            <i className="fas fa-wallet" style={{ color: '#D4AF37' }}></i> Menu Keuangan
                                        </Link>
                                        <Link href="/admin" className="menu-item" onClick={() => setMenuOpen(false)}>
                                            <i className="fas fa-user-shield" style={{ color: '#3b82f6' }}></i> Admin Panel
                                        </Link>
                                    </>
                                )}
                                <div className="menu-item" onClick={() => { setMenuOpen(false); signOut(); }} style={{ color: '#ef4444', cursor: 'pointer' }}>
                                    <i className="fas fa-sign-out-alt"></i> Logout
                                </div>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="menu-item" onClick={() => setMenuOpen(false)} style={{ color: 'var(--primary-dark)', fontWeight: 'bold' }}>
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
