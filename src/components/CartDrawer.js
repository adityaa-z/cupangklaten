'use client';

import React from 'react';
import { useCart } from './CartProvider';
import Link from 'next/link';

export default function CartDrawer() {
    const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    if (!isCartOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div 
                className="cart-overlay" 
                onClick={() => setIsCartOpen(false)}
                style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998,
                    animation: 'fadeIn 0.3s ease'
                }}
            />

            {/* Drawer */}
            <div 
                className="cart-drawer"
                style={{
                    position: 'fixed', top: 0, right: 0, width: '100%', maxWidth: '400px',
                    height: '100vh', backgroundColor: '#fff', zIndex: 9999,
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease'
                }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>
                        <i className="fas fa-shopping-cart"></i> Keranjang
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}>
                        &times;
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '3rem' }}>
                            <i className="fas fa-box-open" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#d1d5db' }}></i>
                            <p>Keranjang Anda masih kosong.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {cart.map((item) => (
                                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                                    <img src={item.img} alt={item.code} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#111827' }}>
                                            {item.category} {item.variant ? `- ${item.variant}` : ''}
                                        </h4>
                                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280' }}>Kode: {item.code}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{formatRupiah(item.price)}</span>
                                            
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '0.2rem' }}>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', color: '#4b5563' }}
                                                >-</button>
                                                <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0.5rem', color: '#4b5563' }}
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', alignSelf: 'flex-start', padding: '0.25rem' }}
                                        title="Hapus"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div style={{ padding: '1.5rem', borderTop: '1px solid #eee', background: '#f9fafb' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>
                            <span>Total</span>
                            <span>{formatRupiah(cartTotal)}</span>
                        </div>
                        <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                            <button style={{ width: '100%', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                Lanjut ke Pembayaran <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                            </button>
                        </Link>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </>
    );
}
