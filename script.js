document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('productSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryOptions = document.querySelectorAll('.filter-option');

    // 1. Unified Database Layer (Single Source of Truth)
    function initDatabase() {
        let db = localStorage.getItem('productsData');
        if (!db) {
            // Default Dummy Data
            const defaultProducts = [
                { id: 1, img: 'assets/pk-001.png', code: 'CK-001', category: 'Plakat', variant: 'Multicolour', gender: 'Jantan', age: '4', size: 'M', price: 150000, shopee: 'https://shopee.co.id/product/dummy/1', isAvailable: true, stock: 1 },
                { id: 2, img: 'assets/hm-012.png', code: 'CK-002', category: 'Halfmoon', variant: 'Blue Rim', gender: 'Betina', age: '3', size: 'S+', price: 100000, shopee: 'https://shopee.co.id/product/dummy/2', isAvailable: true, stock: 1 },
                { id: 3, img: 'assets/hm-012.png', code: 'CK-003', category: 'HMPK', variant: 'Galaxy', gender: 'Jantan', age: '4.5', size: 'M', price: 200000, shopee: 'https://shopee.co.id/product/dummy/3', isAvailable: false, stock: 0 },
                { id: 4, img: 'assets/pk-001.png', code: 'CK-004', category: 'Crowntail', variant: 'Black Orchid', gender: 'Jantan', age: '5', size: 'L', price: 175000, shopee: 'https://shopee.co.id/product/dummy/4', isAvailable: true, stock: 1 },
                { id: 5, img: 'assets/gt-005.png', code: 'CK-005', category: 'Giant', variant: 'Yellow Koi', gender: 'Betina', age: '4', size: 'XL', price: 350000, shopee: 'https://shopee.co.id/product/dummy/5', isAvailable: true, stock: 8 }
            ];
            localStorage.setItem('productsData', JSON.stringify(defaultProducts));
            return defaultProducts;
        }
        return JSON.parse(db);
    }

    let products = initDatabase();
    let currentCategoryFilter = 'all';

    // 2. Format Currency
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    // 3. Render Engine
    function renderProducts(searchTerm = '') {
        // Filter By Category
        let filtered = products.filter(p => currentCategoryFilter === 'all' || p.category.toLowerCase() === currentCategoryFilter.toLowerCase());

        // Filter By Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.code.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term) ||
                (p.variant && p.variant.toLowerCase().includes(term))
            );
        }

        // Sort: Tersedia (Ready) at the top, Terjual (Sold Out) at the bottom
        filtered.sort((a, b) => {
            let aSold = (!a.isAvailable || a.stock <= 0) ? 1 : 0;
            let bSold = (!b.isAvailable || b.stock <= 0) ? 1 : 0;
            return aSold - bSold;
        });

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Ikan tidak ditemukan.</p>';
            return;
        }

        filtered.forEach(product => {
            const isSoldOut = (!product.isAvailable || product.stock <= 0);
            const cardClass = isSoldOut ? 'product-card sold-out' : 'product-card';
            const ribbon = isSoldOut ? '<div class="sold-ribbon">SOLD OUT</div>' : '';
            const btnText = isSoldOut ? 'Habis Terjual' : 'Beli di Sini <i class="fas fa-external-link-alt"></i>';
            const btnLink = isSoldOut ? '#' : product.shopee;
            const targetAttr = isSoldOut ? '' : 'target="_blank"';

            const variantDisplay = product.variant ? ` - ${product.variant}` : '';
            const titleDisplay = `${product.category}${variantDisplay}`;

            const cardHTML = `
                <div class="${cardClass}" data-category="${product.category.toLowerCase()}">
                    ${ribbon}
                    <div class="product-img-container">
                        <img src="${product.img}" alt="${product.code}">
                    </div>
                    <div class="product-info">
                        <span class="product-code">${titleDisplay} - ${product.code}</span>
                        <div class="product-meta">
                            <span><i class="fas fa-${product.gender === 'Jantan' ? 'mars' : 'venus'}"></i> ${product.gender}</span>
                            <span class="separator">|</span>
                            <span>Usia: ${product.age} Bulan</span>
                            <span class="separator">|</span>
                            <span>Size: ${product.size}</span>
                        </div>
                        <div class="product-price">${formatRupiah(product.price)}</div>
                        <a href="${btnLink}" ${targetAttr} class="buy-btn">
                            ${btnText}
                        </a>
                    </div>
                </div>
            `;
            productGrid.innerHTML += cardHTML;
        });
    }

    // --- Events binding ---

    // Initial render
    renderProducts();

    // Search bar listener
    searchInput.addEventListener('input', (e) => {
        renderProducts(e.target.value);
    });

    // Handle Tabs
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategoryFilter = btn.getAttribute('data-filter');
            renderProducts(searchInput.value);
        });
    });

    // Dropdown Toggles and clicks
    categoryBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        categoryDropdown.style.display = categoryDropdown.style.display === 'block' ? 'none' : 'block';
    });
    window.addEventListener('click', () => {
        categoryDropdown.style.display = 'none';
    });

    categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = option.getAttribute('data-category');

            // Auto click corresponding tab for visual sync
            const targetBtn = Array.from(filterBtns).find(b => b.getAttribute('data-filter') === filter);
            if (targetBtn) {
                targetBtn.click();
            } else {
                // Failsafe
                currentCategoryFilter = filter;
                renderProducts(searchInput.value);
            }
            categoryDropdown.style.display = 'none';
        });
    });

    // Read real-time updates (if Admin changes it in another tab, this refreshes the frontend automatically if focus returns)
    window.addEventListener('storage', (e) => {
        if (e.key === 'productsData') {
            products = JSON.parse(e.newValue);
            renderProducts(searchInput.value);
        }
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
