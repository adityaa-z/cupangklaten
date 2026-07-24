import React, { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { useRouter } from 'next/navigation';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const router = useRouter();
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [lightboxImgLoaded, setLightboxImgLoaded] = useState(false);

    // Filter available images
    const images = [product.img, product.img2, product.img3, product.img4].filter(img => img && img.trim() !== '');

    const isSoldOut = (!product.is_available || product.stock <= 0);
    const cardClass = isSoldOut ? 'product-card sold-out' : 'product-card';
    
    const isKebutuhanIkan = product.category?.toLowerCase() === 'kebutuhan ikan';
    const fishBreeds = ['plakat', 'halfmoon', 'hmpk', 'crowntail', 'giant', 'double tail', 'dumbo ear', 'veiltail', 'rosetail'];
    const isFishBreed = fishBreeds.includes(product.category?.toLowerCase());
    
    const variantDisplay = product.variant ? ` - ${product.variant}` : '';
    const titleDisplay = (isKebutuhanIkan || isFishBreed)
        ? (product.variant || 'Koleksi Terbaik') 
        : `${product.category}${variantDisplay}`;

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    // Body scroll lock
    useEffect(() => {
        if (isLightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isLightboxOpen]);

    const handleNextImg = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImg = (e) => {
        e.stopPropagation();
        setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product);
        setIsLightboxOpen(false);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation();
        addToCart(product);
        router.push('/checkout');
    };

    useEffect(() => {
        setLightboxImgLoaded(false);
    }, [currentImgIndex]);

    return (
        <>
            <div className={cardClass}>
                {isSoldOut && <div className="sold-ribbon">SOLD OUT</div>}
                <div className="product-img-container" onClick={() => { setIsLightboxOpen(true); setCurrentImgIndex(0); }}>
                    {product.is_video ? (
                        <video src={product.img} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <>
                            {!imgLoaded && (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'loading-shimmer 1.5s infinite', zIndex: 1 }} />
                            )}
                            <img src={product.img} alt={product.code} loading="lazy" decoding="async" onLoad={() => setImgLoaded(true)} style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.3s' }} />
                        </>
                    )}
                    <div className="img-overlay">
                        <i className="fas fa-search-plus"></i>
                        <span>Lihat Foto</span>
                    </div>
                    {images.length > 1 && <div className="img-count-badge"><i className="fas fa-images"></i> {images.length}</div>}
                </div>
                <div className="product-info">
                    <span className="product-code">{titleDisplay}</span>
                    <div className="product-price-row">
                        <div className="product-price">{formatRupiah(product.price)}</div>
                        {!isSoldOut && <span className="ready-badge-inline">Stock: {product.stock}</span>}
                    </div>

                    <button className="buy-btn" onClick={() => setIsLightboxOpen(true)}>
                        {isSoldOut ? 'Detail Produk' : 'Beli Sekarang'} <i className="fas fa-shopping-cart" style={{ marginLeft: '0.5rem' }}></i>
                    </button>
                </div>
            </div>

            {/* Detail Modal (Enhanced Lightbox) */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}><i className="fas fa-times"></i></button>
                    
                    <div className="lightbox-container detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content-wrapper">
                            <div className="modal-image-section">
                                {images.length > 1 && (
                                    <button className="lightbox-arrow left" onClick={handlePrevImg}>
                                        <i className="fas fa-chevron-left"></i>
                                    </button>
                                )}
                                
                                <div className="lightbox-img-wrapper" style={{ position: 'relative' }}>
                                    {!lightboxImgLoaded && (
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(90deg, #111827 25%, #1f2937 50%, #111827 75%)', backgroundSize: '200% 100%', animation: 'loading-shimmer 1.5s infinite' }} />
                                    )}
                                    <img key={currentImgIndex} src={images[currentImgIndex]} alt={`Product ${currentImgIndex}`} onLoad={() => setLightboxImgLoaded(true)} style={{ opacity: lightboxImgLoaded ? 1 : 0, transition: 'opacity 0.3s' }} />
                                    <div className="lightbox-counter">{currentImgIndex + 1} / {images.length}</div>
                                </div>

                                {images.length > 1 && (
                                    <button className="lightbox-arrow right" onClick={handleNextImg}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>

                            <div className="modal-info-section">
                                <h3 className="modal-title">{titleDisplay}</h3>
                                <div className="modal-price">{formatRupiah(product.price)}</div>
                                
                                <div className="modal-details">
                                    <div className="detail-item">
                                        <i className="fas fa-fingerprint"></i>
                                        <span>Kode Produk: <strong>{product.code}</strong></span>
                                    </div>
                                    <div className="detail-item">
                                        <i className={`fas fa-${product.gender === 'Jantan' ? 'mars' : 'venus'}`}></i>
                                        <span>Jenis Kelamin: <strong>{product.gender}</strong></span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fas fa-tag"></i>
                                        <span>Kategori: <strong>{product.category}</strong></span>
                                    </div>
                                    {(product.age && product.age !== '-' && product.age.toLowerCase() !== 'tidak ada') && (
                                        <div className="detail-item">
                                            <i className="fas fa-calendar-alt"></i>
                                            <span>Umur: <strong>{product.age} Bulan</strong></span>
                                        </div>
                                    )}
                                    <div className="detail-item">
                                        <i className="fas fa-ruler-combined"></i>
                                        <span>Ukuran: <strong>{product.size}</strong></span>
                                    </div>
                                    <div className="detail-item">
                                        <i className="fas fa-check-circle"></i>
                                        <span>Status: <strong style={{ color: isSoldOut ? 'var(--secondary-coral)' : '#10b981' }}>{isSoldOut ? 'Sudah Terjual' : 'Sangat Terbatas (Ready)'}</strong></span>
                                    </div>
                                </div>

                                {!isSoldOut && (
                                    <div className="checkout-bar" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button onClick={handleAddToCart} style={{ flex: 1, padding: '0.8rem', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            <i className="fas fa-cart-plus"></i> Tambah Keranjang
                                        </button>
                                        <button onClick={handleBuyNow} style={{ flex: 1, padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                            <i className="fas fa-bolt"></i> Beli Sekarang
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
};

export default ProductCard;
