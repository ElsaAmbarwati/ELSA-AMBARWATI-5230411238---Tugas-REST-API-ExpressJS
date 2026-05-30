// Elsa Logistics App Frontend Controller - Simplified Single-Screen Engine

// State Management
let state = {
  products: [],
  filteredProducts: [],
  categories: new Set(['Makanan', 'Minuman', 'Alat Tulis']),
  gaugeChartInstance: null
};

// DOM Elements Cache
const DOM = {
  // Stats Counters
  valTotalItems: document.getElementById('val-total-items'),
  valTotalStock: document.getElementById('val-total-stock'),
  valTotalValuation: document.getElementById('val-total-valuation'),
  valLowStock: document.getElementById('val-low-stock'),
  lowStockTimeline: document.getElementById('low-stock-timeline'),
  gaugeValuationText: document.getElementById('gauge-valuation-text'),
  currentDateVal: document.getElementById('current-date-val'),

  // Inventory Controls
  inputSearch: document.getElementById('input-search'),
  selectCategoryFilter: document.getElementById('select-category-filter'),
  selectSort: document.getElementById('select-sort'),
  btnAddProduct: document.getElementById('btn-add-product'),
  inventoryTableBody: document.getElementById('inventory-table-body'),
  tableEmptyState: document.getElementById('table-empty-state'),
  tableEntriesCount: document.getElementById('table-entries-count'),
  selectAllCb: document.getElementById('select-all-cb'),

  // Modal Dialog Form
  productModal: document.getElementById('product-modal'),
  productForm: document.getElementById('product-form'),
  modalTitle: document.getElementById('modal-title'),
  modalProductId: document.getElementById('modal-product-id'),
  modalInputName: document.getElementById('modal-input-name'),
  modalInputPrice: document.getElementById('modal-input-price'),
  modalInputStock: document.getElementById('modal-input-stock'),
  modalInputCategory: document.getElementById('modal-input-category'),
  customCategoryGroup: document.getElementById('custom-category-group'),
  modalInputCustomCategory: document.getElementById('modal-input-custom-category'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  btnSubmitModal: document.getElementById('btn-submit-modal'),

  // Toast System
  toastContainer: document.getElementById('toast-container')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupTimeframeDate();
  setupEventListeners();
  loadData();
});

// Setup current date in timeframe pill
function setupTimeframeDate() {
  const options = { month: 'short', year: 'numeric' };
  const formatted = new Date().toLocaleDateString('en-US', options);
  if (DOM.currentDateVal) {
    DOM.currentDateVal.textContent = formatted;
  }
}

// Config Event Listeners
function setupEventListeners() {
  // Filtering & Sorting Inputs
  DOM.inputSearch.addEventListener('input', applyFilters);
  DOM.selectCategoryFilter.addEventListener('change', applyFilters);
  DOM.selectSort.addEventListener('change', applyFilters);

  // Table header select-all checkbox
  if (DOM.selectAllCb) {
    DOM.selectAllCb.addEventListener('change', (e) => {
      const cbs = DOM.inventoryTableBody.querySelectorAll('input[type="checkbox"]');
      cbs.forEach(cb => cb.checked = e.target.checked);
    });
  }

  // Modal controls
  DOM.btnAddProduct.addEventListener('click', () => openProductModal());
  DOM.btnCloseModal.addEventListener('click', closeProductModal);
  DOM.btnCancelModal.addEventListener('click', closeProductModal);
  DOM.productForm.addEventListener('submit', handleFormSubmit);

  // Custom Category trigger in form select
  DOM.modalInputCategory.addEventListener('change', (e) => {
    if (e.target.value === 'NEW_CATEGORY') {
      DOM.customCategoryGroup.style.display = 'flex';
      DOM.modalInputCustomCategory.required = true;
    } else {
      DOM.customCategoryGroup.style.display = 'none';
      DOM.modalInputCustomCategory.required = false;
      DOM.modalInputCustomCategory.value = '';
    }
  });

}

// Fetch all database records and refresh all components at once
async function loadData() {
  try {
    const products = await api.getProducts();
    state.products = products;
    
    // Dynamically compile active categories
    state.categories = new Set(['Makanan', 'Minuman', 'Alat Tulis']);
    products.forEach(p => {
      if (p.category) {
        state.categories.add(p.category);
      }
    });

    // Populate filters and modal selectors
    updateCategoryFiltersDropdowns();
    updateModalCategoryDropdown();
    
    // Refresh stats cards, warning list and charts
    renderDashboardStats();
    
    // Apply filters and populate the main table
    applyFilters();
  } catch (error) {
    showToast('Koneksi Gagal', 'Gagal memuat database dari server.', 'error');
  }
}

// Synchronize category select fields dynamically
function updateCategoryFiltersDropdowns() {
  const currentFilterValue = DOM.selectCategoryFilter.value;
  
  DOM.selectCategoryFilter.innerHTML = '<option value="ALL">Semua Kategori</option>';

  Array.from(state.categories).sort().forEach(cat => {
    const optionFilter = document.createElement('option');
    optionFilter.value = cat;
    optionFilter.textContent = cat;
    DOM.selectCategoryFilter.appendChild(optionFilter);
  });

  // Restore active selected filter
  if (Array.from(state.categories).includes(currentFilterValue)) {
    DOM.selectCategoryFilter.value = currentFilterValue;
  } else {
    DOM.selectCategoryFilter.value = 'ALL';
  }
}

// Update Modal Form category option dropdowns
function updateModalCategoryDropdown() {
  if (!DOM.modalInputCategory) return;

  DOM.modalInputCategory.innerHTML = `
    <option value="">-- Pilih Kategori --</option>
    <option value="Makanan">Makanan</option>
    <option value="Minuman">Minuman</option>
    <option value="Alat Tulis">Alat Tulis</option>
    <option value="Lainnya">Lainnya</option>
  `;

  Array.from(state.categories).sort().forEach(cat => {
    if (!['Makanan', 'Minuman', 'Alat Tulis', 'Lainnya'].includes(cat)) {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      DOM.modalInputCategory.appendChild(option);
    }
  });

  const addCategoryOpt = document.createElement('option');
  addCategoryOpt.value = 'NEW_CATEGORY';
  addCategoryOpt.textContent = '+ Tambah Kategori Baru';
  DOM.modalInputCategory.appendChild(addCategoryOpt);
}

// Calculations and statistics rendering for stats cards, charts, and warnings list
function renderDashboardStats() {
  const products = state.products;

  const totalItems = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValuation = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  
  const lowStockThreshold = 10;
  const lowStockItems = products.filter(p => p.stock < lowStockThreshold);
  const totalLowStock = lowStockItems.length;

  // Render values
  DOM.valTotalItems.textContent = totalItems;
  DOM.valTotalStock.textContent = formatNumber(totalStock);
  DOM.valTotalValuation.textContent = formatRupiah(totalValuation);
  DOM.valLowStock.textContent = totalLowStock;
  
  if (DOM.gaugeValuationText) DOM.gaugeValuationText.textContent = formatRupiah(totalValuation);

  // Render warnings timeline
  renderWarningsTimeline(lowStockItems);

  // Render Category Distribution Gauge Chart
  renderGaugeChart(products);
}

// Render vertical warnings timeline
function renderWarningsTimeline(lowStockItems) {
  if (!DOM.lowStockTimeline) return;

  DOM.lowStockTimeline.innerHTML = '';
  
  if (lowStockItems.length === 0) {
    DOM.lowStockTimeline.innerHTML = `<div class="alert-placeholder">Tidak ada barang dengan stok kritis 🎉</div>`;
    return;
  }

  // Slice maximum 2 items to fit sidebar dimensions cleanly
  const displayItems = lowStockItems.slice(0, 2);

  displayItems.forEach((p, idx) => {
    const isOutOfStock = p.stock === 0;
    const nodeClass = isOutOfStock ? 'critical' : 'warning';
    const statusText = isOutOfStock ? 'Habis' : 'Kritis';
    const statusClass = isOutOfStock ? 'status-critical' : 'status-warning';
    
    // Simulate timestamps for warnings
    const times = ["08:24 AM", "02:40 PM"];
    const dates = ["Hari Ini", "Kemarin"];
    const timeVal = times[idx] || "10:00 AM";
    const dateVal = dates[idx] || "Aktif";

    const node = document.createElement('div');
    node.className = `timeline-node ${nodeClass}`;
    node.innerHTML = `
      <div class="timeline-line"></div>
      <div class="timeline-indicator"></div>
      <div class="timeline-content-row">
        <div class="timeline-meta">
          <span class="timeline-date">${dateVal} • ${timeVal}</span>
          <span class="timeline-product">${escapeHTML(p.name)}</span>
          <span class="timeline-stock">${p.stock} unit tersisa</span>
        </div>
        <span class="timeline-status-badge ${statusClass}">${statusText}</span>
      </div>
    `;
    DOM.lowStockTimeline.appendChild(node);
  });

  // Append officer contact card at the bottom
  const clerkCard = document.createElement('div');
  clerkCard.className = 'clerk-contact-card';
  clerkCard.innerHTML = `
    <div class="clerk-profile">
      <div class="clerk-avatar">👷‍♂️</div>
      <div class="clerk-info">
        <span class="clerk-role-title">Petugas Gudang</span>
        <span class="clerk-name">Adam Schleifer</span>
      </div>
    </div>
    <div class="clerk-actions">
      <button class="clerk-btn" onclick="showToast('Pesan Terkirim', 'Mengirim notifikasi ke Adam Schleifer...', 'warning')" title="Kirim Pesan">💬</button>
      <button class="clerk-btn" onclick="showToast('Panggilan', 'Menghubungi petugas gudang...', 'success')" title="Hubungi Petugas">📞</button>
    </div>
  `;
  DOM.lowStockTimeline.appendChild(clerkCard);
}

// Render circular gauge representing category stock distributions (mockup style)
function renderGaugeChart(products) {
  const ctx = document.getElementById('valuationGaugeChart').getContext('2d');

  // Group stock data by category
  const categoriesList = Array.from(state.categories);
  const stockData = categoriesList.map(cat => {
    return products.filter(p => p.category === cat).reduce((sum, p) => sum + p.stock, 0);
  });

  if (state.gaugeChartInstance) {
    state.gaugeChartInstance.destroy();
  }

  // Soft modern pastel colors matching stylesheet variables
  const chartColors = [
    '#818cf8', // Indigo
    '#60a5fa', // Blue
    '#34d399', // Emerald
    '#fbbf24', // Amber
    '#a78bfa', // Purple
    '#f472b6', // Pink
    '#94a3b8'  // Slate
  ];

  state.gaugeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categoriesList,
      datasets: [{
        data: stockData,
        backgroundColor: chartColors.slice(0, categoriesList.length),
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          display: true,
          position: 'right',
          labels: {
            color: '#475569',
            font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600', size: 10.5 },
            padding: 8,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return ` ${context.label}: ${context.raw} Unit (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Apply searches, filters, and sortings
function applyFilters() {
  const query = DOM.inputSearch.value.toLowerCase().trim();
  const category = DOM.selectCategoryFilter.value;
  const sort = DOM.selectSort.value;

  let filtered = [...state.products];

  // Search filter
  if (query !== '') {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
  }

  // Category filter dropdown
  if (category !== 'ALL') {
    filtered = filtered.filter(p => p.category === category);
  }

  // Sort logic
  filtered.sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  state.filteredProducts = filtered;
  renderInventoryTable();
}

// Render dynamic stock table rows
function renderInventoryTable() {
  DOM.inventoryTableBody.innerHTML = '';
  
  const totalFilteredCount = state.filteredProducts.length;
  
  // Update count info
  if (DOM.tableEntriesCount) {
    DOM.tableEntriesCount.textContent = `Menampilkan 1-${totalFilteredCount} dari ${totalFilteredCount} barang`;
  }

  if (totalFilteredCount === 0) {
    DOM.tableEmptyState.style.display = 'flex';
    return;
  }

  DOM.tableEmptyState.style.display = 'none';

  state.filteredProducts.forEach(p => {
    const tr = document.createElement('tr');
    
    // Choose category badge colors
    let catClass = 'badge-default';
    if (p.category === 'Makanan') catClass = 'badge-makanan';
    else if (p.category === 'Minuman') catClass = 'badge-minuman';
    else if (p.category === 'Alat Tulis') catClass = 'badge-alat-tulis';

    // Status pill style (Delivered, Pending, Processing mockup equivalents)
    let statusHTML = '';
    if (p.stock === 0) {
      statusHTML = `<span class="table-status-pill status-empty">Habis</span>`;
    } else if (p.stock < 10) {
      statusHTML = `<span class="table-status-pill status-warning">Kritis</span>`;
    } else {
      statusHTML = `<span class="table-status-pill status-available">Tersedia</span>`;
    }

    tr.innerHTML = `
      <td><input type="checkbox" class="row-checkbox"></td>
      <td><span class="order-id-label">#ET-0${p.id}</span></td>
      <td><span class="product-title-bold">${escapeHTML(p.name)}</span></td>
      <td><span class="category-badge ${catClass}">${escapeHTML(p.category)}</span></td>
      <td>${formatRupiah(p.price)}</td>
      <td><strong>${p.stock} Unit</strong></td>
      <td>
        <div class="quick-adjust">
          <button class="table-adjust-btn minus" onclick="quickAdjustStock(${p.id}, -1)">−</button>
          <button class="table-adjust-btn plus" onclick="quickAdjustStock(${p.id}, 1)">＋</button>
        </div>
      </td>
      <td>${statusHTML}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-action-edit" onclick="editProduct(${p.id})" title="Edit Detail">✏️</button>
          <button class="btn-action btn-action-delete" onclick="deleteProduct(${p.id})" title="Hapus Barang">🗑️</button>
        </div>
      </td>
    `;
    DOM.inventoryTableBody.appendChild(tr);
  });
}

// Inline increment/decrement stock value modifier
async function quickAdjustStock(id, diff) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  const newStock = product.stock + diff;
  if (newStock < 0) {
    showToast('Kesalahan', 'Stok minimum tidak boleh kurang dari 0!', 'error');
    return;
  }

  try {
    const updated = await api.updateProduct(id, { stock: newStock });
    product.stock = updated.stock;
    
    // Refresh stats, warning alerts, charts, and table rows
    renderDashboardStats();
    applyFilters();
    showToast('Stok Diubah', `Stok ${product.name} diperbarui menjadi ${updated.stock}`, 'success');
  } catch (error) {
    showToast('Penyesuaian Gagal', error.message, 'error');
  }
}

// Form addition trigger
function openProductModal(product = null) {
  DOM.productForm.reset();
  DOM.customCategoryGroup.style.display = 'none';
  DOM.modalInputCustomCategory.required = false;

  if (product) {
    DOM.modalTitle.textContent = 'Edit Data Produk';
    DOM.modalProductId.value = product.id;
    DOM.modalInputName.value = product.name;
    DOM.modalInputPrice.value = product.price;
    DOM.modalInputStock.value = product.stock;
    DOM.modalInputCategory.value = product.category;
    DOM.btnSubmitModal.textContent = 'Update Produk';
  } else {
    DOM.modalTitle.textContent = 'Tambah Produk Baru';
    DOM.modalProductId.value = '';
    DOM.btnSubmitModal.textContent = 'Simpan Produk';
  }

  DOM.productModal.classList.add('active');
}

// Close Modal
function closeProductModal() {
  DOM.productModal.classList.remove('active');
  DOM.productForm.reset();
}

// Handle Form submits
async function handleFormSubmit(e) {
  e.preventDefault();

  const id = DOM.modalProductId.value;
  const name = DOM.modalInputName.value.trim();
  const price = parseInt(DOM.modalInputPrice.value);
  const stock = parseInt(DOM.modalInputStock.value);
  
  let category = DOM.modalInputCategory.value;
  if (category === 'NEW_CATEGORY') {
    category = DOM.modalInputCustomCategory.value.trim();
  }

  if (!category) {
    showToast('Validasi Gagal', 'Tentukan kategori barang.', 'warning');
    return;
  }

  const payload = { name, price, stock, category };

  try {
    if (id) {
      await api.updateProduct(id, payload);
      showToast('Berhasil Diupdate', `Barang '${name}' berhasil diperbarui.`, 'success');
    } else {
      await api.createProduct(payload);
      showToast('Berhasil Ditambahkan', `Barang '${name}' berhasil didaftarkan.`, 'success');
    }

    closeProductModal();
    loadData();
  } catch (error) {
    showToast('Gagal Menyimpan', error.message, 'error');
  }
}

// Fetch details for editor
function editProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (product) {
    openProductModal(product);
  }
}

// Handle deletions
async function deleteProduct(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;

  const confirmation = confirm(`Apakah Anda yakin ingin menghapus produk "${product.name}"?`);
  if (!confirmation) return;

  try {
    await api.deleteProduct(id);
    showToast('Produk Dihapus', `Produk "${product.name}" telah dihapus permanen.`, 'success');
    loadData();
  } catch (error) {
    showToast('Hapus Gagal', error.message, 'error');
  }
}

// Toast alerts popup engine
function showToast(title, message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let emoji = '🔔';
  if (type === 'success') emoji = '✅';
  else if (type === 'error') emoji = '❌';
  else if (type === 'warning') emoji = '⚠️';

  toast.innerHTML = `
    <div class="toast-icon">${emoji}</div>
    <div class="toast-content">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
    <div class="toast-progress"></div>
  `;

  DOM.toastContainer.appendChild(toast);

  const progress = toast.querySelector('.toast-progress');
  progress.style.transition = 'width 4000ms linear';
  setTimeout(() => {
    progress.style.width = '0%';
  }, 50);

  setTimeout(() => {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

// Export database records into CSV
function exportToCSV() {
  if (state.products.length === 0) {
    showToast('Ekspor Batal', 'Tidak ada data produk yang dapat diekspor.', 'warning');
    return;
  }

  let csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'id,nama,kategori,harga,stok\n';

  state.products.forEach(p => {
    const escapedName = `"${p.name.replace(/"/g, '""')}"`;
    const escapedCategory = `"${p.category.replace(/"/g, '""')}"`;
    csvContent += `${p.id},${escapedName},${escapedCategory},${p.price},${p.stock}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `inventori_stok_elsa_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Ekspor Berhasil', 'Data produk diekspor dalam format CSV.', 'success');
}

// Import CSV file
async function handleImportCSV(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function(evt) {
    const text = evt.target.result;
    const lines = text.split('\n');
    
    if (lines.length <= 1) {
      showToast('Impor Gagal', 'File CSV kosong.', 'error');
      return;
    }

    let importedCount = 0;
    let failedCount = 0;
    const dataLines = lines.slice(1);

    for (let line of dataLines) {
      if (line.trim() === '') continue;
      const columns = parseCSVRow(line);
      
      if (columns.length < 4) {
        failedCount++;
        continue;
      }

      const name = columns[1] ? columns[1].trim() : '';
      const category = columns[2] ? columns[2].trim() : '';
      const price = parseInt(columns[3]);
      const stock = parseInt(columns[4]);

      if (name && category && !isNaN(price) && !isNaN(stock)) {
        try {
          await api.createProduct({ name, category, price, stock });
          importedCount++;
        } catch (err) {
          failedCount++;
        }
      } else {
        failedCount++;
      }
    }

    loadData();
    DOM.btnImportCsv.value = '';

    if (importedCount > 0) {
      showToast('Impor Selesai', `${importedCount} produk diimpor.${failedCount > 0 ? ` (${failedCount} gagal)` : ''}`, 'success');
    } else {
      showToast('Impor Gagal', 'Data CSV tidak valid.', 'error');
    }
  };

  reader.readAsText(file);
}

// CSV row string parser
function parseCSVRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Number formatter helper
function formatNumber(num) {
  return new Intl.NumberFormat('id-ID').format(num);
}

// Rupiah formatter helper
function formatRupiah(amount) {
  return 'Rp ' + new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0
  }).format(amount);
}

// Escape HTML script tags
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
