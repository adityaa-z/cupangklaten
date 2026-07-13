'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { cart, cartTotal, cartCount, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [addressDetail, setAddressDetail] = useState('');
    
    // Location State
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedProv, setSelectedProv] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    
    // Shipping State
    const [courier, setCourier] = useState('tiki');
    const [shippingCost, setShippingCost] = useState(0);
    const [shippingLoading, setShippingLoading] = useState(false);
    
    // Calculation
    // Asumsi 1 ikan / item = 250 gram. Minimal berat 1000g untuk ongkir.
    const rawWeight = cartCount * 250;
    const weight = rawWeight < 1000 ? 1000 : rawWeight;
    const weightInKg = Math.ceil(weight / 1000);
    const packingFee = weightInKg * 10000;

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login?callbackUrl=/checkout');
        } else if (session?.user) {
            setName(session.user.name || '');
        }
    }, [status, session, router]);

    // Fetch Provinces
    useEffect(() => {
        async function fetchProvinces() {
            try {
                const res = await fetch('/api/rajaongkir?type=province');
                const data = await res.json();
                if (Array.isArray(data)) setProvinces(data);
            } catch (err) {
                console.error('Gagal memuat provinsi', err);
            }
        }
        fetchProvinces();
    }, []);

    // Fetch Cities when Province changes
    useEffect(() => {
        if (!selectedProv) {
            setCities([]);
            return;
        }
        async function fetchCities() {
            try {
                const res = await fetch(`/api/rajaongkir?type=city&province=${selectedProv}`);
                const data = await res.json();
                if (Array.isArray(data)) setCities(data);
            } catch (err) {
                console.error('Gagal memuat kota', err);
            }
        }
        fetchCities();
    }, [selectedProv]);

    // Calculate Shipping when City or Courier changes
    useEffect(() => {
        if (!selectedCity || cartCount === 0) {
            setShippingCost(0);
            return;
        }
        async function calcShipping() {
            setShippingLoading(true);
            try {
                const res = await fetch('/api/rajaongkir', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        destination: selectedCity,
                        weight,
                        courier
                    })
                });
                const data = await res.json();
                if (data && data.costs && data.costs.length > 0) {
                    setShippingCost(data.costs[0].cost[0].value);
                } else {
                    setShippingCost(0);
                }
            } catch (err) {
                console.error('Gagal hitung ongkir', err);
                setShippingCost(0);
            } finally {
                setShippingLoading(false);
            }
        }
        calcShipping();
    }, [selectedCity, courier, weight, cartCount]);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (!selectedCity || !addressDetail || !phone) {
            alert('Harap lengkapi semua data pengiriman');
            return;
        }

        const selectedCityName = cities.find(c => c.city_id === selectedCity)?.city_name || '';
        const selectedProvName = provinces.find(p => p.province_id === selectedProv)?.province_name || '';
        const fullAddress = `${addressDetail}, ${selectedCityName}, ${selectedProvName}`;

        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    shipping_name: name,
                    shipping_phone: phone,
                    shipping_address: fullAddress,
                    courier,
                    shipping_cost: shippingCost + packingFee, // Ongkir digabung biaya packing di DB
                    total_amount: cartTotal + shippingCost + packingFee
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Gagal membuat pesanan');

            clearCart();
            router.push(`/order/${data.order_id}`);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Memuat...</div>;
    if (cart.length === 0) return (
        <>
            <Navbar />
            <div style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
                <h2>Keranjang Kosong</h2>
                <p>Silakan pilih ikan terlebih dahulu.</p>
                <button onClick={() => router.push('/')} className="btn-primary" style={{ marginTop: '20px' }}>Kembali Belanja</button>
            </div>
            <Footer />
        </>
    );

    const grandTotal = cartTotal + shippingCost + packingFee;

    return (
        <>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '100px auto', padding: '0 20px', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                
                {/* Form Section */}
                <div style={{ flex: '1 1 600px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Alamat Pengiriman</h2>
                    <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nama Penerima</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>No WhatsApp</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Contoh: 08123456789" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Provinsi</label>
                                <select value={selectedProv} onChange={e => setSelectedProv(e.target.value)} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                    <option value="">Pilih Provinsi...</option>
                                    {provinces.map(p => (
                                        <option key={p.province_id} value={p.province_id}>{p.province_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Kota/Kabupaten</label>
                                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} required disabled={!selectedProv} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                    <option value="">Pilih Kota...</option>
                                    {cities.map(c => (
                                        <option key={c.city_id} value={c.city_id}>{c.type} {c.city_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Alamat Lengkap (Jalan, RT/RW, Patokan)</label>
                            <textarea value={addressDetail} onChange={e => setAddressDetail(e.target.value)} required rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}></textarea>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Pilih Ekspedisi</label>
                            <select value={courier} onChange={e => setCourier(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                                <option value="tiki">TIKI</option>
                                <option value="jne">JNE</option>
                                <option value="pos">POS Indonesia</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading || shippingLoading} style={{ marginTop: '1rem', padding: '1rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: (loading || shippingLoading) ? 'not-allowed' : 'pointer', opacity: (loading || shippingLoading) ? 0.7 : 1 }}>
                            {loading ? 'Memproses...' : 'Buat Pesanan'}
                        </button>
                    </form>
                </div>

                {/* Summary Section */}
                <div style={{ flex: '1 1 350px', background: '#f9fafb', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: '#111827' }}>Ringkasan Belanja</h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                <span>{item.quantity}x {item.category} {item.variant ? `- ${item.variant}` : ''}</span>
                                <span style={{ fontWeight: 'bold' }}>{formatRupiah(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#4b5563' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total Harga ({cartCount} Ikan)</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>{formatRupiah(cartTotal)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Biaya Packing ({weightInKg} kg)</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>{formatRupiah(packingFee)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Ongkos Kirim ({courier.toUpperCase()})</span>
                            <span style={{ fontWeight: 'bold', color: '#111827' }}>
                                {shippingLoading ? 'Menghitung...' : (shippingCost > 0 ? formatRupiah(shippingCost) : '-')}
                            </span>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#e5e7eb', margin: '1.5rem 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                        <span>Total Tagihan</span>
                        <span>{formatRupiah(grandTotal)}</span>
                    </div>
                </div>

            </div>
            <Footer />
        </>
    );
}
