document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('productSearch');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const categoryBtn = document.getElementById('categoryBtn');
    const categoryDropdown = document.getElementById('categoryDropdown');
    const categoryOptions = document.querySelectorAll('.filter-option');

    // 1. Unified Database Layer (Supabase)
    async function fetchProducts() {
        try {
            console.log('Fetching products from Supabase...');
            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            console.log('Successfully fetched:', data.length, 'products');
            return data || [];
        } catch (err) {
            console.error('Error fetching products:', err);
            // Tampilkan pesan error di UI jika gagal
            if(productGrid) productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #ef4444;">Gagal mengambil data dari database. Pastikan koneksi dan RLS Supabase sudah benar.</p>`;
            return [];
        }
    }

    let products = [];
    let currentCategoryFilter = 'all';

    // 2. Format Currency
    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    // 3. Render Engine
    function renderProducts(searchTerm = '') {
        if (!productGrid) return;

        // Filter By Category
        let filtered = products.filter(p => {
            if (!p.category) return false;
            return currentCategoryFilter === 'all' || p.category.toLowerCase() === currentCategoryFilter.toLowerCase();
        });

        // Filter By Search Term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                (p.code && p.code.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.variant && p.variant.toLowerCase().includes(term))
            );
        }

        // Sort: Tersedia (Ready) at the top, Terjual (Sold Out) at the bottom
        filtered.sort((a, b) => {
            let aSold = (!a.is_available || a.stock <= 0) ? 1 : 0;
            let bSold = (!b.is_available || b.stock <= 0) ? 1 : 0;
            return aSold - bSold;
        });

        productGrid.innerHTML = '';

        if (filtered.length === 0) {
            productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Ikan tidak ditemukan.</p>';
            return;
        }

        filtered.forEach(product => {
            const isSoldOut = (!product.is_available || product.stock <= 0);
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
                        ${product.is_video 
                            ? `<video src="${product.img}" autoplay loop muted playsinline style="width:100%; height:100%; object-fit:cover;"></video>` 
                            : `<img src="${product.img}" alt="${product.code}">`
                        }
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
    async function init() {
        products = await fetchProducts();
        renderProducts();
    }
    init();

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
        if(categoryDropdown) categoryDropdown.style.display = 'none';
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
                currentCategoryFilter = filter;
                renderProducts(searchInput.value);
            }
            categoryDropdown.style.display = 'none';
        });
    });

    // Sinkronisasi otomatis saat halaman difokuskan kembali
    window.addEventListener('focus', async () => {
        products = await fetchProducts();
        renderProducts(searchInput.value);
    });

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
