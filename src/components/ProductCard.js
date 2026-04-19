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
                        <img src={product.img} alt={product.code} />
                    )}
                    {images.length > 1 && <div className="img-count-badge"><i className="fas fa-images"></i> {images.length}</div>}
                </div>
                <div className="product-info">
                    <span className="product-code">{titleDisplay} - {product.code}</span>
                    {(product.age && product.age !== '-' && product.age.toLowerCase() !== 'tidak ada') && (
                        <div className="product-meta">
                            <span><i className={`fas fa-${product.gender === 'Jantan' ? 'mars' : 'venus'}`}></i> {product.gender}</span>
                            {isFishBreed && (
                                <>
                                    <span className="separator">|</span>
                                    <span>{product.category}</span>
                                </>
                            )}
                            <span className="separator">|</span>
                            <span>{product.age} Bln</span>
                            <span className="separator">|</span>
                            <span>Size {product.size}</span>
                        </div>
                    )}
                    <div className="product-price">{formatRupiah(product.price)}</div>
                    <a href={btnLink} target={isSoldOut ? '' : '_blank'} rel="noopener noreferrer" className="buy-btn">
                        {btnText} {!isSoldOut && <i className="fas fa-external-link-alt" style={{ marginLeft: '0.5rem' }}></i>}
                    </a>
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <button className="lightbox-close" onClick={() => setIsLightboxOpen(false)}><i className="fas fa-times"></i></button>
                    
                    <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
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
                </div>
            )}
        </>
    );
};

export default ProductCard;
