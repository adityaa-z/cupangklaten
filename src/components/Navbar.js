'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Navbar = () => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setDropdownOpen(false);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleDropdown = (e) => {
        e.stopPropagation();
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <header>
            <div className="nav-container">
                <Link href="/" className="logo">
                    <img src="/logo.png" alt="cupangklaten.id" />
                    <span className="logo-text">CUPANGKLATEN.ID</span>
                </Link>

                <div className="nav-links" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div className="dropdown" style={{ position: 'relative', cursor: 'pointer' }}>
                        <span id="categoryBtn" onClick={toggleDropdown}>
                            Kategori <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`}></i>
                        </span>
                        <div className="dropdown-content" id="categoryDropdown" style={{ display: dropdownOpen ? 'block' : 'none' }}>
                            <Link href="/stok?category=all" className="filter-option">Semua</Link>
                            <Link href="/stok?category=plakat" className="filter-option">Plakat</Link>
                            <Link href="/stok?category=halfmoon" className="filter-option">Halfmoon</Link>
                            <Link href="/stok?category=hmpk" className="filter-option">HMPK</Link>
                            <Link href="/stok?category=crowntail" className="filter-option">Crowntail (Serit)</Link>
                            <Link href="/stok?category=giant" className="filter-option">Giant</Link>
                            <Link href="/stok?category=kebutuhan%20ikan" className="filter-option">Kebutuhan Ikan</Link>
                        </div>
                    </div>
                    <Link href="/stok" className="nav-btn" style={{ textDecoration: 'none', padding: '0.6rem 1.5rem', background: 'var(--primary-cyan)', color: 'white', borderRadius: '50px', fontWeight: '600' }}>
                        Cek Semua Stok
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
