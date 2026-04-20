'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
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
                    <img src="/logo.png" alt="cupangklaten.id" />
                    <span className="logo-text">CUPANGKLATEN.ID</span>
                </Link>

                <div className="nav-menu-container" style={{ display: 'flex', gap: '0.8rem' }}>
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                        <i className={theme === 'light' ? "fas fa-moon" : "fas fa-sun"}></i>
                    </button>

                    <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Menu">
                        <i className={menuOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </button>
                    
                    <div className={`nav-dropdown-menu ${menuOpen ? 'active' : ''}`} id="mainMenu">
                        <Link href="/stok" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-fish"></i> Semua Stok
                        </Link>
                        <Link href="/tips-perawatan" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-book-open"></i> Tips & Edukasi
                        </Link>
                        <Link href="/#reviews" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-star"></i> Testimoni
                        </Link>
                        <Link href="/faq" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-shield-alt"></i> Claim Garansi
                        </Link>
                        <Link href="/faq" className="menu-item" onClick={() => setMenuOpen(false)}>
                            <i className="fas fa-question-circle"></i> FAQ
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
