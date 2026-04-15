document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Authenticaton Logic ---
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Check session
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.body.classList.add('logged-in');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        
        // Hardcoded simple auth for demo purposes
        if (user === 'admin' && pass === 'admin') {
            localStorage.setItem('adminLoggedIn', 'true');
            document.body.classList.add('logged-in');
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        document.body.classList.remove('logged-in');
    });

    // --- 2. Database (Simulated) ---
    // Initial Dummy Data based on instructions
    let products = JSON.parse(localStorage.getItem('productsData')) || [
        { id: 1, img: 'assets/pk-001.png', code: 'CK-001', category: 'Plakat', variant: 'Multicolour', gender: 'Jantan', age: '4', size: 'M', price: 150000, shopee: 'https://shopee.co.id/product/dummy/1', isAvailable: true, stock: 1 },
        { id: 2, img: 'assets/hm-012.png', code: 'CK-002', category: 'Halfmoon', variant: 'Blue Rim', gender: 'Betina', age: '3', size: 'S+', price: 100000, shopee: 'https://shopee.co.id/product/dummy/2', isAvailable: true, stock: 1 },
        { id: 3, img: 'assets/hm-012.png', code: 'CK-003', category: 'HMPK', variant: 'Galaxy', gender: 'Jantan', age: '4.5', size: 'M', price: 200000, shopee: 'https://shopee.co.id/product/dummy/3', isAvailable: false, stock: 0 },
        { id: 4, img: 'assets/pk-001.png', code: 'CK-004', category: 'Crowntail', variant: 'Black Orchid', gender: 'Jantan', age: '5', size: 'L', price: 175000, shopee: 'https://shopee.co.id/product/dummy/4', isAvailable: true, stock: 1 },
        { id: 5, img: 'assets/gt-005.png', code: 'CK-005', category: 'Giant', variant: 'Yellow Koi', gender: 'Betina', age: '4', size: 'XL', price: 350000, shopee: 'https://shopee.co.id/product/dummy/5', isAvailable: true, stock: 8 }
    ];

    let faqs = JSON.parse(localStorage.getItem('faqData')) || [
        { id: 1, q: "Apakah ikan yang dikirim Real Picture?", a: "Iya, 100% ikan yang Anda terima sama persis dengan kode dan foto yang dipajang." },
        { id: 2, q: "Bagaimana jika ikan mati dalam perjalanan?", a: "Kami memberikan garansi DOA (Death on Arrival) 100% uang kembali dengan syarat video unboxing." }
    ];

    function saveToStorage() {
        localStorage.setItem('productsData', JSON.stringify(products));
        localStorage.setItem('faqData', JSON.stringify(faqs));
        if (typeof renderTable === 'function') renderTable();
    }

    // --- 3. Rendering Logic ---
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function renderTable(searchTerm = '') {
        tableBody.innerHTML = '';
        
        let filteredProducts = products;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = products.filter(p => 
                p.code.toLowerCase().includes(term) || 
                p.category.toLowerCase().includes(term) ||
                (p.variant && p.variant.toLowerCase().includes(term))
            );
        }

        if (filteredProducts.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#718096;">Data tidak ditemukan.</td></tr>`;
            return;
        }

        filteredProducts.forEach(product => {
            const tr = document.createElement('tr');
            
            // Computed status based on stock and manual toggle
            const isSoldOut = (!product.isAvailable || product.stock <= 0);
            
            // Stock Toggle HTML
            const stockHTML = `
                <div class="stock-controls">
                    <div class="toggle-section">
                        <label class="switch">
                            <input type="checkbox" onchange="toggleStock(${product.id})" ${!isSoldOut ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span class="status-badge ${!isSoldOut ? 'status-tersedia' : 'status-terjual'}">
                            ${!isSoldOut ? 'Tersedia' : 'Terjual'}
                        </span>
                    </div>
                    <div class="qty-control">
                        <button class="qty-btn" onclick="updateStockQty(${product.id}, -1)">-</button>
                        <input type="number" class="qty-input" value="${product.stock}" min="0" onchange="setStockQty(${product.id}, this.value)">
                        <button class="qty-btn" onclick="updateStockQty(${product.id}, 1)">+</button>
                    </div>
                </div>
            `;

            const mediaTag = product.isVideo 
                ? `<video src="${product.img}" autoplay loop muted playsinline style="width:50px; height:50px; border-radius:8px; object-fit:cover;"></video>` 
                : `<img src="${product.img}" alt="${product.code}">`;

            tr.innerHTML = `
                <td class="td-img">${mediaTag}</td>
                <td>
                    <div style="font-weight:600; color:var(--text-dark);">${product.code}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted);">${product.category} ${product.variant ? '- ' + product.variant : ''}</div>
                </td>
                <td>
                    <div style="font-size:0.85rem;">
                        <i class="fas fa-${product.gender === 'Jantan' ? 'mars' : 'venus'}"></i> ${product.gender} | 
                        Usia: ${product.age} Bln | 
                        Size: ${product.size}
                    </div>
                </td>
                <td style="font-weight:700; color:var(--text-dark);">${formatRupiah(product.price)}</td>
                <td>${stockHTML}</td>
                <td class="action-btns">
                    <button class="btn-icon" onclick="openEditModal(${product.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteProduct(${product.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        if(typeof renderPesananTable === 'function') {
            renderPesananTable();
        }
    }

    let isShowingArchive = false;

    // --- RENDER TABLE PESANAN ---
    window.renderPesananTable = function(searchTerm = '') {
        const tbodyPesanan = document.getElementById('tablePesananBody');
        const pesananTitle = document.getElementById('pesananTitle');
        const toggleText = document.getElementById('toggleText');
        
        if (!tbodyPesanan) return;
        
        tbodyPesanan.innerHTML = '';

        if (isShowingArchive) {
            pesananTitle.innerHTML = `<i class="fas fa-rocket" style="color: #6366f1; margin-right: 0.5rem;"></i> Sejarah Pengiriman (Arsip)`;
            toggleText.innerText = "Lihat Antrean Kemas";
        } else {
            pesananTitle.innerHTML = `<i class="fas fa-clipboard-list" style="color: var(--primary-cyan); margin-right: 0.5rem;"></i> Antrean Kemas & Kirim`;
            toggleText.innerText = "Lihat Sudah Kirim";
        }
        
        // Filter based on state
        let filteredProducts = products.filter(p => {
            const isSold = (!p.isAvailable || p.stock <= 0);
            return isSold && (isShowingArchive ? p.isArchived : !p.isArchived);
        });
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(p => 
                p.code.toLowerCase().includes(term) || 
                p.category.toLowerCase().includes(term) ||
                (p.variant && p.variant.toLowerCase().includes(term))
            );
        }

        if (filteredProducts.length === 0) {
            const msg = isShowingArchive ? "Belum ada sejarah pengiriman." : "Belum ada antrean yang masuk.";
            tbodyPesanan.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:#718096; font-style:italic;">${msg}</td></tr>`;
            return;
        }

        filteredProducts.forEach(product => {
            const tr = document.createElement('tr');
            
            const mediaTag = product.isVideo 
                ? `<video src="${product.img}" autoplay loop muted playsinline style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"></video>`
                : `<img src="${product.img}" alt="${product.code}">`;

            const dateToUse = isShowingArchive ? product.archivedAt : product.soldAt;
            const dateObj = dateToUse ? new Date(dateToUse) : new Date();
            const dateStr = dateObj.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });

            const actionBtn = isShowingArchive 
                ? `<span style="color: #10b981; font-weight: 600;"><i class="fas fa-shipping-fast"></i> Dikirim pada ${dateStr}</span>`
                : `<button class="btn btn-primary" onclick="archiveOrder(${product.id})" style="padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.85rem; background: #6366f1;"><i class="fas fa-check-circle" style="margin-right: 0.4rem;"></i> Selesai Kemas</button>`;

            tr.innerHTML = `
                <td class="td-img">${mediaTag}</td>
                <td>
                    <div style="font-weight: 700; color: var(--primary-dark); font-size: 1.1rem;">${product.code}</div>
                    <div style="font-size: 0.75rem; color: #718096; margin-top: 4px;"><i class="fas fa-clock"></i> ${isShowingArchive ? 'Kirim:' : 'Checkout:'} ${dateStr} ${timeStr}</div>
                </td>
                <td>
                    <div style="font-weight: 600;">${product.category}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${product.variant || '-'}</div>
                </td>
                <td style="font-weight: 600; color: #10b981;">${formatRupiah(product.price)}</td>
                <td>
                    ${actionBtn}
                </td>
            `;
            tbodyPesanan.appendChild(tr);
        });
    }

    const btnToggleArchive = document.getElementById('btnToggleArchive');
    if (btnToggleArchive) {
        btnToggleArchive.onclick = function() {
            isShowingArchive = !isShowingArchive;
            renderPesananTable();
        };
    }

    window.archiveOrder = function(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            product.isArchived = true;
            product.archivedAt = new Date().toISOString();
            saveToStorage();
            renderPesananTable();
            alert(`Pesanan ${product.code} dipindahkan ke arsip sampah dan akan dihapus otomatis dalam 30 hari.`);
        }
    };

    function cleanupTrash() {
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        
        let originalLength = products.length;
        products = products.filter(p => {
            if (p.isArchived && p.archivedAt) {
                const archiveTime = new Date(p.archivedAt).getTime();
                if (now - archiveTime > thirtyDaysInMs) {
                    return false; // Hapus
                }
            }
            return true;
        });

        if (products.length !== originalLength) {
            saveToStorage();
        }
    }
    
    // Run cleanup on load
    cleanupTrash();

    const searchPesananInput = document.getElementById('searchPesananInput');
    if(searchPesananInput) {
        searchPesananInput.addEventListener('input', (e) => {
            renderPesananTable(e.target.value);
        });
    }

    // --- RENDER FAQ TABLE ---
    window.renderFAQTable = function(searchTerm = '') {
        const tbody = document.getElementById('faqTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let filteredFaqs = faqs;
        if (searchTerm) {
            filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        filteredFaqs.forEach(faq => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600;">${faq.q}</td>
                <td style="color:var(--text-muted); font-size:0.9rem;">${faq.a}</td>
                <td>
                    <button class="btn-icon" onclick="openFAQModal(${faq.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteFAQ(${faq.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('searchFAQInput').addEventListener('input', (e) => {
        renderFAQTable(e.target.value);
    });

    // FAQ CRUD
    const faqModal = document.getElementById('faqModal');
    const faqForm = document.getElementById('faqForm');

    window.openFAQModal = function(id = null) {
        document.getElementById('faqModal').style.display = 'flex';
        if (id) {
            const faq = faqs.find(f => f.id === id);
            document.getElementById('faqModalTitle').innerText = "Edit FAQ";
            document.getElementById('editFaqId').value = id;
            document.getElementById('inputQuestion').value = faq.q;
            document.getElementById('inputAnswer').value = faq.a;
        } else {
            document.getElementById('faqModalTitle').innerText = "Tambah FAQ Baru";
            faqForm.reset();
            document.getElementById('editFaqId').value = '';
        }
    };

    window.deleteFAQ = function(id) {
        if(confirm('Hapus FAQ ini?')) {
            faqs = faqs.filter(f => f.id !== id);
            saveToStorage();
            renderFAQTable();
        }
    };

    document.getElementById('btnAddFAQ').onclick = () => openFAQModal();
    document.getElementById('closeFAQModal').onclick = () => faqModal.style.display = 'none';
    document.getElementById('btnCancelFAQ').onclick = () => faqModal.style.display = 'none';
    
    document.getElementById('btnSaveFAQ').onclick = function() {
        const id = document.getElementById('editFaqId').value;
        const q = document.getElementById('inputQuestion').value;
        const a = document.getElementById('inputAnswer').value;
        
        if (!q || !a) return alert('Lengkapi data FAQ!');
        
        if (id) {
            faqs = faqs.map(f => f.id === parseInt(id) ? { id: parseInt(id), q, a } : f);
        } else {
            faqs.push({ id: Date.now(), q, a });
        }
        
        saveToStorage();
        renderFAQTable();
        faqModal.style.display = 'none';
    };

    // Include function to global context so inline onclick works
    window.updateStockQty = function(id, delta) {
        const product = products.find(p => p.id === id);
        if (product) {
            let newStock = product.stock + delta;
            product.stock = Math.max(0, newStock);
            // If stock becomes 0, automatically set isAvailable false and set soldAt
            if (product.stock === 0) {
                product.isAvailable = false;
                if (!product.soldAt) product.soldAt = new Date().toISOString();
            } else {
                product.isAvailable = true;
                product.soldAt = null;
                product.isArchived = false;
                product.archivedAt = null;
            }
            saveToStorage();
        }
    };

    window.toggleStock = function(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            product.isAvailable = !product.isAvailable;
            if (!product.isAvailable) {
                if (!product.soldAt) product.soldAt = new Date().toISOString();
            } else {
                product.soldAt = null;
                product.isArchived = false;
                product.archivedAt = null;
                if (product.stock <= 0) product.stock = 1;
            }
            saveToStorage();
        }
    };

    window.setStockQty = function(id, val) {
        const product = products.find(p => p.id === id);
        if (product) {
            let newStock = parseInt(val) || 0;
            product.stock = Math.max(0, newStock);
            if (product.stock === 0) {
                product.isAvailable = false;
                if (!product.soldAt) product.soldAt = new Date().toISOString();
            } else {
                product.isAvailable = true;
                product.soldAt = null;
                product.isArchived = false;
            }
            saveToStorage();
        }
    };

    window.deleteProduct = function(id) {
        if(confirm('Apakah Anda yakin ingin menghapus data ikan ini?')) {
            products = products.filter(p => p.id !== id);
            saveToStorage();
        }
    };

    // Global Search
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });

    // --- 4. Modal Logic (Add/Edit) ---
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const btnAddProduct = document.getElementById('btnAddProduct');
    const closeModal = document.getElementById('closeModal');
    const btnCancel = document.getElementById('btnCancel');
    const btnSave = document.getElementById('btnSave');

    // Form inputs
    const fId = document.getElementById('editId');
    const fFile = document.getElementById('inputFile');
    const fImg = document.getElementById('inputGambar');
    const fIsVideo = document.getElementById('inputIsVideo');
    const mediaPreview = document.getElementById('mediaPreview');
    const fCode = document.getElementById('inputKode');
    const fCategory = document.getElementById('inputKategori');
    const fVariant = document.getElementById('inputVarian');
    const fGender = document.getElementById('inputGender');
    const fAge = document.getElementById('inputUsia');
    const fSize = document.getElementById('inputSize');
    const fStock = document.getElementById('inputStok');
    const fPrice = document.getElementById('inputHarga');
    const fShopee = document.getElementById('inputShopee');

    // FileReader Logic for Media
    fFile.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            // Max 2MB to fit in LocalStorage comfortably
            if(file.size > 2 * 1024 * 1024) {
                alert('Ukuran file maksimal 2 MB!');
                this.value = '';
                return;
            }

            const isVid = file.type.startsWith('video/');
            fIsVideo.value = isVid ? 'true' : 'false';

            const reader = new FileReader();
            reader.onload = function(e) {
                fImg.value = e.target.result; 
                mediaPreview.style.display = 'block';
                if(isVid) {
                    mediaPreview.innerHTML = `<video src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;" autoplay loop muted></video>`;
                } else {
                    mediaPreview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
                }
            }
            reader.readAsDataURL(file);
        }
    });

    function openModalForAdd() {
        modalTitle.innerText = "Tambah Data Ikan";
        fId.value = ''; 
        document.getElementById('productForm').reset();
        mediaPreview.style.display = 'none';
        fImg.value = ''; // Force empty initially
        modal.style.display = 'flex';
    }

    window.openEditModal = function(id) {
        const product = products.find(p => p.id === id);
        if(!product) return;

        modalTitle.innerText = "Edit Data Ikan";
        document.getElementById('productForm').reset();

        fId.value = product.id;
        fImg.value = product.img;
        fIsVideo.value = product.isVideo ? 'true' : 'false';

        // Render preview if exists
        if(product.img) {
            mediaPreview.style.display = 'block';
            if(product.isVideo) {
                mediaPreview.innerHTML = `<video src="${product.img}" style="width:100%; height:100%; object-fit:cover;" autoplay loop muted></video>`;
            } else {
                mediaPreview.innerHTML = `<img src="${product.img}" style="width:100%; height:100%; object-fit:cover;">`;
            }
        } else {
            mediaPreview.style.display = 'none';
        }

        fCode.value = product.code;
        fCategory.value = product.category;
        fVariant.value = product.variant || '';
        fGender.value = product.gender;
        fAge.value = product.age;
        fSize.value = product.size;
        fStock.value = product.stock !== undefined ? product.stock : 1;
        fPrice.value = product.price;
        fShopee.value = product.shopee;

        modal.style.display = 'flex';
    };

    function closeFormModal() {
        modal.style.display = 'none';
    }

    btnAddProduct.addEventListener('click', openModalForAdd);
    closeModal.addEventListener('click', closeFormModal);
    btnCancel.addEventListener('click', closeFormModal);

    btnSave.addEventListener('click', () => {
        // Basic validation
        if(!fImg.value || !fCode.value || !fCategory.value || !fGender.value || !fAge.value || !fSize.value || !fPrice.value || !fShopee.value) {
            alert('Harap isi semua field yang wajib!');
            return;
        }

        const id = fId.value;
        const newProduct = {
            id: id ? parseInt(id) : Date.now(), 
            img: fImg.value,
            isVideo: fIsVideo.value === 'true',
            code: fCode.value,
            category: fCategory.value,
            variant: fVariant.value,
            gender: fGender.value,
            age: fAge.value,
            size: fSize.value,
            stock: parseInt(fStock.value) || 0,
            price: parseInt(fPrice.value),
            shopee: fShopee.value,
            isAvailable: true // Default true
        };

        if (newProduct.stock <= 0) newProduct.isAvailable = false;

        if (id) {
            // Update retain old toggle state unless overridden by stock=0
            if (newProduct.stock > 0) {
                newProduct.isAvailable = products.find(p => p.id === parseInt(id)).isAvailable;
            }
            products = products.map(p => p.id === parseInt(id) ? newProduct : p);
        } else {
            // Create
            products.unshift(newProduct);
        }

        saveToStorage();
        closeFormModal();
    });

    // --- 5. Dashboard Routing (SPA) ---
    window.switchTab = function(tabName) {
        // Hide all views
        document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
        // Remove active class from all links
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));

        // Show targets
        document.getElementById('view' + tabName).style.display = 'block';
        document.getElementById('nav' + tabName).classList.add('active');

        // Execute tab-specific logic
        if (tabName === 'Statistik') {
            updateStatistics();
        } else if (tabName === 'Pesanan') {
            renderPesananTable();
        } else if (tabName === 'FAQ') {
            renderFAQTable();
        }
    };

    function updateStatistics() {
        let countTersedia = 0;
        let countTerjual = 0;
        let totalHarga = 0;
        let pendapatanKotor = 0;

        products.forEach(p => {
            const isSoldOut = (!p.isAvailable || p.stock <= 0);
            if(isSoldOut) {
                countTerjual++;
                pendapatanKotor += p.price;
            } else {
                countTersedia++;
            }
            totalHarga += p.price;
        });

        const avgHarga = products.length > 0 ? (totalHarga / products.length) : 0;

        document.getElementById('statTersedia').innerText = countTersedia;
        document.getElementById('statTerjual').innerText = countTerjual;
        document.getElementById('statHarga').innerText = formatRupiah(avgHarga);
        document.getElementById('statPendapatan').innerText = formatRupiah(pendapatanKotor);
    }

    // Initial Render
    renderTable();

});
