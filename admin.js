document.addEventListener('DOMContentLoaded', async () => {
    
    // --- 1. Authenticaton Logic ---
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    if (localStorage.getItem('adminLoggedIn') === 'true') {
        document.body.classList.add('logged-in');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value;
        const pass = document.getElementById('password').value;
        if (user === env.ADMIN_USERNAME && pass === env.ADMIN_PASSWORD) {
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

    // --- 2. Database (Supabase) ---
    let products = [];
    let faqs = [];

    async function fetchData() {
        try {
            const { data: pData, error: pError } = await supabaseClient.from('products').select('*').order('created_at', { ascending: false });
            const { data: fData, error: fError } = await supabaseClient.from('faqs').select('*').order('created_at', { ascending: true });
            
            if (pError) throw pError;
            if (fError) throw fError;

            products = pData || [];
            faqs = fData || [];
            
            renderTable();
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    // --- 3. Rendering Logic ---
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    }

    function renderTable(searchTerm = '') {
        if (!tableBody) return;
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
            const isSoldOut = (!product.is_available || product.stock <= 0);
            
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

            const mediaTag = product.is_video 
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
        
        let filteredProducts = products.filter(p => {
            const isSold = (!p.is_available || p.stock <= 0);
            return isSold && (isShowingArchive ? p.is_archived : !p.is_archived);
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
            const mediaTag = product.is_video 
                ? `<video src="${product.img}" autoplay loop muted playsinline style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;"></video>`
                : `<img src="${product.img}" alt="${product.code}">`;

            const dateToUse = isShowingArchive ? product.archived_at : product.sold_at;
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
                <td>${actionBtn}</td>
            `;
            tbodyPesanan.appendChild(tr);
        });
    }

    const btnToggleArchive = document.getElementById('btnToggleArchive');
    if (btnToggleArchive) {
        btnToggleArchive.onclick = () => { isShowingArchive = !isShowingArchive; renderPesananTable(); };
    }

    window.archiveOrder = async function(id) {
        const { error } = await supabaseClient.from('products').update({ is_archived: true, archived_at: new Date().toISOString() }).eq('id', id);
        if (error) alert('Gagal mengarsipkan: ' + error.message);
        else fetchData();
    };

    window.renderFAQTable = function(searchTerm = '') {
        const tbody = document.getElementById('faqTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        let filteredFaqs = searchTerm ? faqs.filter(f => f.question.toLowerCase().includes(searchTerm.toLowerCase())) : faqs;
        filteredFaqs.forEach(faq => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600;">${faq.question}</td>
                <td style="color:var(--text-muted); font-size:0.9rem;">${faq.answer}</td>
                <td>
                    <button class="btn-icon" onclick="openFAQModal(${faq.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteFAQ(${faq.id})" title="Hapus"><i class="fas fa-trash-alt"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    const searchFAQInput = document.getElementById('searchFAQInput');
    if(searchFAQInput) searchFAQInput.addEventListener('input', (e) => renderFAQTable(e.target.value));

    window.openFAQModal = function(id = null) {
        document.getElementById('faqModal').style.display = 'flex';
        if (id) {
            const faq = faqs.find(f => f.id === id);
            document.getElementById('faqModalTitle').innerText = "Edit FAQ";
            document.getElementById('editFaqId').value = id;
            document.getElementById('inputQuestion').value = faq.question;
            document.getElementById('inputAnswer').value = faq.answer;
        } else {
            document.getElementById('faqModalTitle').innerText = "Tambah FAQ Baru";
            document.getElementById('faqForm').reset();
            document.getElementById('editFaqId').value = '';
        }
    };

    window.deleteFAQ = async function(id) {
        if(confirm('Hapus FAQ ini?')) {
            const { error } = await supabaseClient.from('faqs').delete().eq('id', id);
            if (error) alert('Gagal hapus FAQ: ' + error.message);
            else fetchData();
        }
    };

    document.getElementById('btnAddFAQ').onclick = () => openFAQModal();
    document.getElementById('closeFAQModal').onclick = () => document.getElementById('faqModal').style.display = 'none';
    document.getElementById('btnCancelFAQ').onclick = () => document.getElementById('faqModal').style.display = 'none';
    
    document.getElementById('btnSaveFAQ').onclick = async function() {
        const id = document.getElementById('editFaqId').value;
        const q = document.getElementById('inputQuestion').value;
        const a = document.getElementById('inputAnswer').value;
        if (!q || !a) return alert('Lengkapi data FAQ!');
        
        let result;
        if (id) {
            result = await supabaseClient.from('faqs').update({ question: q, answer: a }).eq('id', id);
        } else {
            result = await supabaseClient.from('faqs').insert([{ question: q, answer: a }]);
        }
        
        if (result.error) alert('Gagal simpan FAQ: ' + result.error.message);
        else { fetchData(); document.getElementById('faqModal').style.display = 'none'; }
    };

    window.updateStockQty = async function(id, delta) {
        const product = products.find(p => p.id === id);
        if (product) {
            let newStock = Math.max(0, product.stock + delta);
            let updateData = { stock: newStock };
            if (newStock === 0) {
                updateData.is_available = false;
                if (!product.sold_at) updateData.sold_at = new Date().toISOString();
            } else {
                updateData.is_available = true;
                updateData.sold_at = null;
                updateData.is_archived = false;
                updateData.archived_at = null;
            }
            const { error } = await supabaseClient.from('products').update(updateData).eq('id', id);
            if (error) console.error(error); else fetchData();
        }
    };

    window.toggleStock = async function(id) {
        const product = products.find(p => p.id === id);
        if (product) {
            let updateData = { is_available: !product.is_available };
            if (!updateData.is_available) {
                if (!product.sold_at) updateData.sold_at = new Date().toISOString();
            } else {
                updateData.sold_at = null;
                updateData.is_archived = false;
                updateData.archived_at = null;
                if (product.stock <= 0) updateData.stock = 1;
            }
            const { error } = await supabaseClient.from('products').update(updateData).eq('id', id);
            if (error) console.error(error); else fetchData();
        }
    };

    window.setStockQty = async function(id, val) {
        const product = products.find(p => p.id === id);
        if (product) {
            let newStock = Math.max(0, parseInt(val) || 0);
            let updateData = { stock: newStock };
            if (newStock === 0) {
                updateData.is_available = false;
                if (!product.sold_at) updateData.sold_at = new Date().toISOString();
            } else {
                updateData.is_available = true;
                updateData.sold_at = null;
                updateData.is_archived = false;
            }
            const { error } = await supabaseClient.from('products').update(updateData).eq('id', id);
            if (error) console.error(error); else fetchData();
        }
    };

    window.deleteProduct = async function(id) {
        if(confirm('Apakah Anda yakin ingin menghapus data ikan ini?')) {
            const { error } = await supabaseClient.from('products').delete().eq('id', id);
            if (error) alert('Gagal hapus: ' + error.message); else fetchData();
        }
    };

    if(searchInput) searchInput.addEventListener('input', (e) => renderTable(e.target.value));

    // --- 4. Modal Logic (Add/Edit) ---
    const modal = document.getElementById('productModal');
    const fId = document.getElementById('editId');
    const fFile = document.getElementById('inputFile');
    const fImg = document.getElementById('inputGambar');
    const fIsVideo = document.getElementById('inputIsVideo');
    const mediaPreview = document.getElementById('mediaPreview');
    
    fFile.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            if(file.size > 2 * 1024 * 1024) { alert('Ukuran file maksimal 2 MB!'); this.value = ''; return; }
            const isVid = file.type.startsWith('video/');
            fIsVideo.value = isVid ? 'true' : 'false';
            const reader = new FileReader();
            reader.onload = function(e) {
                fImg.value = e.target.result; 
                mediaPreview.style.display = 'block';
                mediaPreview.innerHTML = isVid ? `<video src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;" autoplay loop muted></video>` : `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            }
            reader.readAsDataURL(file);
        }
    });

    window.openEditModal = function(id) {
        const product = products.find(p => p.id === id);
        if(!product) return;
        document.getElementById('modalTitle').innerText = "Edit Data Ikan";
        document.getElementById('productForm').reset();
        fId.value = product.id;
        fImg.value = product.img;
        fIsVideo.value = product.is_video ? 'true' : 'false';
        if(product.img) {
            mediaPreview.style.display = 'block';
            mediaPreview.innerHTML = product.is_video ? `<video src="${product.img}" style="width:100%; height:100%; object-fit:cover;" autoplay loop muted></video>` : `<img src="${product.img}" style="width:100%; height:100%; object-fit:cover;">`;
        } else mediaPreview.style.display = 'none';
        
        document.getElementById('inputKode').value = product.code;
        document.getElementById('inputKategori').value = product.category;
        document.getElementById('inputVarian').value = product.variant || '';
        document.getElementById('inputGender').value = product.gender;
        document.getElementById('inputUsia').value = product.age;
        document.getElementById('inputSize').value = product.size;
        document.getElementById('inputStok').value = product.stock;
        document.getElementById('inputHarga').value = product.price;
        document.getElementById('inputShopee').value = product.shopee;
        modal.style.display = 'flex';
    };

    document.getElementById('btnAddProduct').onclick = () => {
        document.getElementById('modalTitle').innerText = "Tambah Data Ikan";
        fId.value = ''; document.getElementById('productForm').reset();
        mediaPreview.style.display = 'none'; fImg.value = '';
        modal.style.display = 'flex';
    };

    const closeFormModal = () => modal.style.display = 'none';
    document.getElementById('closeModal').onclick = closeFormModal;
    document.getElementById('btnCancel').onclick = closeFormModal;

    document.getElementById('btnSave').onclick = async () => {
        const fields = ['inputKode', 'inputKategori', 'inputGender', 'inputUsia', 'inputSize', 'inputHarga', 'inputShopee'];
        if(!fImg.value || fields.some(f => !document.getElementById(f).value)) return alert('Harap isi semua field yang wajib!');

        const id = fId.value;
        const pData = {
            img: fImg.value,
            is_video: fIsVideo.value === 'true',
            code: document.getElementById('inputKode').value,
            category: document.getElementById('inputKategori').value,
            variant: document.getElementById('inputVarian').value,
            gender: document.getElementById('inputGender').value,
            age: document.getElementById('inputUsia').value,
            size: document.getElementById('inputSize').value,
            stock: parseInt(document.getElementById('inputStok').value) || 0,
            price: parseInt(document.getElementById('inputHarga').value),
            shopee: document.getElementById('inputShopee').value,
            is_available: parseInt(document.getElementById('inputStok').value) > 0
        };

        let res;
        if (id) res = await supabaseClient.from('products').update(pData).eq('id', id);
        else res = await supabaseClient.from('products').insert([pData]);

        if (res.error) alert('Gagal simpan: ' + res.error.message);
        else { fetchData(); closeFormModal(); }
    };

    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-view').forEach(el => el.style.display = 'none');
        document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
        document.getElementById('view' + tabName).style.display = 'block';
        document.getElementById('nav' + tabName).classList.add('active');
        if (tabName === 'Statistik') updateStatistics();
        else if (tabName === 'Pesanan') renderPesananTable();
        else if (tabName === 'FAQ') renderFAQTable();
    };

    function updateStatistics() {
        let countTersedia = 0, countTerjual = 0, totalHarga = 0, pendapatanKotor = 0;
        products.forEach(p => {
            if(!p.is_available || p.stock <= 0) { countTerjual++; pendapatanKotor += p.price; }
            else countTersedia++;
            totalHarga += p.price;
        });
        const avgHarga = products.length > 0 ? (totalHarga / products.length) : 0;
        document.getElementById('statTersedia').innerText = countTersedia;
        document.getElementById('statTerjual').innerText = countTerjual;
        document.getElementById('statHarga').innerText = formatRupiah(avgHarga);
        document.getElementById('statPendapatan').innerText = formatRupiah(pendapatanKotor);
    }

    fetchData();
});
