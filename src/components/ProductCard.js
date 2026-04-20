import React, { useState, useEffect } from 'react';

const ProductCard = ({ product }) => {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Filter available images
    const images = [product.img, product.img2, product.img3, product.img4].filter(img => img && img.trim() !== '');

    const isSoldOut = (!product.is_available || product.stock <= 0);
    const cardClass = isSoldOut ? 'product-card sold-out' : 'product-card';
    const btnText = isSoldOut ? 'Habis Terjual' : 'Beli di Sini';
    const btnLink = isSoldOut ? '#' : product.shopee;
    
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

    return (
        <>
            <div className={cardClass}>
                {isSoldOut && <div className="sold-ribbon">SOLD OUT</div>}
                <div className="product-img-container" onClick={() => { setIsLightboxOpen(true); setCurrentImgIndex(0); }}>
                    {product.is_video ? (
                        <video src={product.img} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <img src={product.img} alt={product.code} loading="lazy" decoding="async" />
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
                        {!isSoldOut && <span className="ready-badge-inline">Ready</span>}
                    </div>
                    <button className="buy-btn" onClick={() => setIsLightboxOpen(true)}>
                        {isSoldOut ? 'Detail Produk' : 'Beli di Sini'} <i className="fas fa-search-plus" style={{ marginLeft: '0.5rem' }}></i>
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
                                
                                <div className="lightbox-img-wrapper">
                                    <img src={images[currentImgIndex]} alt={`Product ${currentImgIndex}`} />
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
                                    <div className="checkout-bar">
                                        <a href={product.shopee} target="_blank" rel="noopener noreferrer" className="checkout-shopee">
                                            <i className="fas fa-shopping-bag"></i> Checkout Shopee
                                        </a>
                                        <a href={`https://wa.me/6285700846152?text=Halo%20Admin%20Cupang%20Klaten,%20saya%20tertarik%20dengan%20ikan%20ini:%0A%0A*%20Kode:%20${product.code}%0A*%20Varian:%20${titleDisplay}%0A*%20Harga:%20${formatRupiah(product.price)}%0A%0AApakah%20produk%20ini%20masih%20tersedia?`} 
                                           target="_blank" rel="noopener noreferrer" className="checkout-wa">
                                            <i className="fab fa-whatsapp"></i> Konfirmasi WA
                                        </a>
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
