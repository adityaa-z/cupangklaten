import React from 'react';

const ProductCard = ({ product }) => {
    const isSoldOut = (!product.is_available || product.stock <= 0);
    const cardClass = isSoldOut ? 'product-card sold-out' : 'product-card';
    const btnText = isSoldOut ? 'Habis Terjual' : 'Beli di Sini';
    const btnLink = isSoldOut ? '#' : product.shopee;
    
    const variantDisplay = product.variant ? ` - ${product.variant}` : '';
    const titleDisplay = `${product.category}${variantDisplay}`;
    const isNonLiving = product.age === '-';

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    return (
        <div className={cardClass}>
            {isSoldOut && <div className="sold-ribbon">SOLD OUT</div>}
            <div className="product-img-container">
                {product.is_video ? (
                    <video src={product.img} autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <img src={product.img} alt={product.code} />
                )}
            </div>
            <div className="product-info">
                <span className="product-code">{titleDisplay} - {product.code}</span>
                {!isNonLiving && (
                    <div className="product-meta">
                        <span><i className={`fas fa-${product.gender === 'Jantan' ? 'mars' : 'venus'}`}></i> {product.gender}</span>
                        <span className="separator">|</span>
                        <span>Usia: {product.age} Bulan</span>
                        <span className="separator">|</span>
                        <span>Size: {product.size}</span>
                    </div>
                )}
                <div className="product-price">{formatRupiah(product.price)}</div>
                <a href={btnLink} target={isSoldOut ? '' : '_blank'} rel="noopener noreferrer" className="buy-btn">
                    {btnText} {!isSoldOut && <i className="fas fa-external-link-alt" style={{ marginLeft: '0.5rem' }}></i>}
                </a>
            </div>
        </div>
    );
};

export default ProductCard;
