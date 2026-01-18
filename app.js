/* ============================================
   DROPFLOW - Dropshipping Dashboard
   Application Logic
   ============================================ */

// State Management
const state = {
    products: [],
    suppliers: [],
    orders: [],
    currentPage: 'dashboard',
    currentFilter: 'all',
    deleteTarget: null
};

// DOM Elements
const elements = {
    // Navigation
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),
    pageTitle: document.getElementById('pageTitle'),
    pageSubtitle: document.getElementById('pageSubtitle'),
    primaryAction: document.getElementById('primaryAction'),
    globalSearch: document.getElementById('globalSearch'),
    
    // Dashboard
    totalRevenue: document.getElementById('totalRevenue'),
    totalProducts: document.getElementById('totalProducts'),
    totalProfit: document.getElementById('totalProfit'),
    profitMargin: document.getElementById('profitMargin'),
    totalOrders: document.getElementById('totalOrders'),
    pendingOrders: document.getElementById('pendingOrders'),
    recentOrdersList: document.getElementById('recentOrdersList'),
    topProductsList: document.getElementById('topProductsList'),
    
    // Tables
    productsTableBody: document.getElementById('productsTableBody'),
    productsEmpty: document.getElementById('productsEmpty'),
    ordersTableBody: document.getElementById('ordersTableBody'),
    ordersEmpty: document.getElementById('ordersEmpty'),
    suppliersGrid: document.getElementById('suppliersGrid'),
    suppliersEmpty: document.getElementById('suppliersEmpty'),
    
    // Order Filters
    filterBtns: document.querySelectorAll('.filter-btn'),
    
    // Calculator
    calcCost: document.getElementById('calcCost'),
    calcSell: document.getElementById('calcSell'),
    calcShipping: document.getElementById('calcShipping'),
    calcFees: document.getElementById('calcFees'),
    grossProfit: document.getElementById('grossProfit'),
    platformFees: document.getElementById('platformFees'),
    shippingCost: document.getElementById('shippingCost'),
    netProfit: document.getElementById('netProfit'),
    calcMargin: document.getElementById('calcMargin'),
    markupCost: document.getElementById('markupCost'),
    desiredMargin: document.getElementById('desiredMargin'),
    suggestedPrice: document.getElementById('suggestedPrice'),
    expectedProfit: document.getElementById('expectedProfit'),
    
    // Modals
    productModal: document.getElementById('productModal'),
    supplierModal: document.getElementById('supplierModal'),
    orderModal: document.getElementById('orderModal'),
    deleteModal: document.getElementById('deleteModal'),
    
    // Forms
    productForm: document.getElementById('productForm'),
    supplierForm: document.getElementById('supplierForm'),
    orderForm: document.getElementById('orderForm'),
    
    // Toast
    toastContainer: document.getElementById('toastContainer')
};

// Page Configuration
const pageConfig = {
    dashboard: {
        title: 'Dashboard',
        subtitle: 'Welcome back! Here\'s your business overview.',
        action: null
    },
    products: {
        title: 'Products',
        subtitle: 'Manage your product catalog.',
        action: 'Add Product'
    },
    suppliers: {
        title: 'Suppliers',
        subtitle: 'Manage your supplier network.',
        action: 'Add Supplier'
    },
    orders: {
        title: 'Orders',
        subtitle: 'Track and manage customer orders.',
        action: 'Add Order'
    },
    calculator: {
        title: 'Profit Calculator',
        subtitle: 'Calculate margins and markup for your products.',
        action: null
    }
};

// Initialize Application
function init() {
    loadData();
    setupEventListeners();
    updateDashboard();
    renderAll();
}

// Load Data from LocalStorage
function loadData() {
    const savedProducts = localStorage.getItem('dropflow_products');
    const savedSuppliers = localStorage.getItem('dropflow_suppliers');
    const savedOrders = localStorage.getItem('dropflow_orders');
    
    if (savedProducts) state.products = JSON.parse(savedProducts);
    if (savedSuppliers) state.suppliers = JSON.parse(savedSuppliers);
    if (savedOrders) state.orders = JSON.parse(savedOrders);
}

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('dropflow_products', JSON.stringify(state.products));
    localStorage.setItem('dropflow_suppliers', JSON.stringify(state.suppliers));
    localStorage.setItem('dropflow_orders', JSON.stringify(state.orders));
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(item.dataset.page);
        });
    });
    
    // View All Links
    document.querySelectorAll('.view-all').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });
    
    // Primary Action Button
    elements.primaryAction.addEventListener('click', handlePrimaryAction);
    
    // Modal Close Buttons
    document.getElementById('closeProductModal').addEventListener('click', () => closeModal('productModal'));
    document.getElementById('closeSupplierModal').addEventListener('click', () => closeModal('supplierModal'));
    document.getElementById('closeOrderModal').addEventListener('click', () => closeModal('orderModal'));
    document.getElementById('closeDeleteModal').addEventListener('click', () => closeModal('deleteModal'));
    
    document.getElementById('cancelProduct').addEventListener('click', () => closeModal('productModal'));
    document.getElementById('cancelSupplier').addEventListener('click', () => closeModal('supplierModal'));
    document.getElementById('cancelOrder').addEventListener('click', () => closeModal('orderModal'));
    document.getElementById('cancelDelete').addEventListener('click', () => closeModal('deleteModal'));
    document.getElementById('confirmDelete').addEventListener('click', confirmDelete);
    
    // Modal Overlays
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Forms
    elements.productForm.addEventListener('submit', handleProductSubmit);
    elements.supplierForm.addEventListener('submit', handleSupplierSubmit);
    elements.orderForm.addEventListener('submit', handleOrderSubmit);
    
    // Order Filters
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentFilter = btn.dataset.filter;
            renderOrders();
        });
    });
    
    // Calculator Inputs
    [elements.calcCost, elements.calcSell, elements.calcShipping, elements.calcFees].forEach(input => {
        input.addEventListener('input', calculateProfit);
    });
    
    [elements.markupCost, elements.desiredMargin].forEach(input => {
        input.addEventListener('input', calculateMarkup);
    });
    
    // Global Search
    elements.globalSearch.addEventListener('input', handleSearch);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Navigation
function navigateTo(page) {
    state.currentPage = page;
    
    // Update nav
    elements.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });
    
    // Update pages
    elements.pages.forEach(p => {
        p.classList.toggle('active', p.id === `${page}Page`);
    });
    
    // Update header
    const config = pageConfig[page];
    elements.pageTitle.textContent = config.title;
    elements.pageSubtitle.textContent = config.subtitle;
    
    // Update action button
    if (config.action) {
        elements.primaryAction.style.display = 'inline-flex';
        elements.primaryAction.querySelector('span').textContent = config.action;
    } else {
        elements.primaryAction.style.display = 'none';
    }
}

// Handle Primary Action
function handlePrimaryAction() {
    switch (state.currentPage) {
        case 'products':
            openProductModal();
            break;
        case 'suppliers':
            openSupplierModal();
            break;
        case 'orders':
            openOrderModal();
            break;
    }
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = '';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Product Functions
function openProductModal(productId = null) {
    const form = elements.productForm;
    form.reset();
    document.getElementById('productId').value = '';
    document.getElementById('productModalTitle').textContent = 'Add Product';
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('productSupplier');
    supplierSelect.innerHTML = '<option value="">Select Supplier</option>';
    state.suppliers.forEach(s => {
        supplierSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
    
    if (productId) {
        const product = state.products.find(p => p.id === productId);
        if (product) {
            document.getElementById('productModalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCost').value = product.cost;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productSupplier').value = product.supplierId || '';
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productDescription').value = product.description || '';
        }
    }
    
    openModal('productModal');
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('productId').value;
    const productData = {
        id: id || generateId(),
        name: document.getElementById('productName').value,
        cost: parseFloat(document.getElementById('productCost').value),
        price: parseFloat(document.getElementById('productPrice').value),
        supplierId: document.getElementById('productSupplier').value,
        stock: document.getElementById('productStock').value,
        description: document.getElementById('productDescription').value,
        createdAt: id ? state.products.find(p => p.id === id)?.createdAt : new Date().toISOString()
    };
    
    if (id) {
        const index = state.products.findIndex(p => p.id === id);
        state.products[index] = productData;
        showToast('Product updated successfully', 'success');
    } else {
        state.products.push(productData);
        showToast('Product created successfully', 'success');
    }
    
    saveData();
    renderAll();
    updateDashboard();
    closeModal('productModal');
}

function deleteProduct(id) {
    state.deleteTarget = { type: 'product', id };
    document.getElementById('deleteMessage').textContent = 'Are you sure you want to delete this product?';
    openModal('deleteModal');
}

// Supplier Functions
function openSupplierModal(supplierId = null) {
    const form = elements.supplierForm;
    form.reset();
    document.getElementById('supplierId').value = '';
    document.getElementById('supplierModalTitle').textContent = 'Add Supplier';
    
    if (supplierId) {
        const supplier = state.suppliers.find(s => s.id === supplierId);
        if (supplier) {
            document.getElementById('supplierModalTitle').textContent = 'Edit Supplier';
            document.getElementById('supplierId').value = supplier.id;
            document.getElementById('supplierName').value = supplier.name;
            document.getElementById('supplierContact').value = supplier.email || '';
            document.getElementById('supplierPhone').value = supplier.phone || '';
            document.getElementById('supplierRating').value = supplier.rating || '5';
            document.getElementById('supplierShipping').value = supplier.shippingDays || '';
            document.getElementById('supplierNotes').value = supplier.notes || '';
        }
    }
    
    openModal('supplierModal');
}

function handleSupplierSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('supplierId').value;
    const supplierData = {
        id: id || generateId(),
        name: document.getElementById('supplierName').value,
        email: document.getElementById('supplierContact').value,
        phone: document.getElementById('supplierPhone').value,
        rating: parseInt(document.getElementById('supplierRating').value),
        shippingDays: parseInt(document.getElementById('supplierShipping').value) || null,
        notes: document.getElementById('supplierNotes').value,
        createdAt: id ? state.suppliers.find(s => s.id === id)?.createdAt : new Date().toISOString()
    };
    
    if (id) {
        const index = state.suppliers.findIndex(s => s.id === id);
        state.suppliers[index] = supplierData;
        showToast('Supplier updated successfully', 'success');
    } else {
        state.suppliers.push(supplierData);
        showToast('Supplier added successfully', 'success');
    }
    
    saveData();
    renderAll();
    closeModal('supplierModal');
}

function deleteSupplier(id) {
    state.deleteTarget = { type: 'supplier', id };
    document.getElementById('deleteMessage').textContent = 'Are you sure you want to delete this supplier?';
    openModal('deleteModal');
}

// Order Functions
function openOrderModal(orderId = null) {
    const form = elements.orderForm;
    form.reset();
    document.getElementById('orderId').value = '';
    document.getElementById('orderModalTitle').textContent = 'Add Order';
    
    // Populate product dropdown
    const productSelect = document.getElementById('orderProduct');
    productSelect.innerHTML = '<option value="">Select Product</option>';
    state.products.forEach(p => {
        productSelect.innerHTML += `<option value="${p.id}">${p.name} - $${p.price.toFixed(2)}</option>`;
    });
    
    if (orderId) {
        const order = state.orders.find(o => o.id === orderId);
        if (order) {
            document.getElementById('orderModalTitle').textContent = 'Edit Order';
            document.getElementById('orderId').value = order.id;
            document.getElementById('orderCustomer').value = order.customer;
            document.getElementById('orderEmail').value = order.email || '';
            document.getElementById('orderProduct').value = order.productId;
            document.getElementById('orderQuantity').value = order.quantity;
            document.getElementById('orderStatus').value = order.status;
            document.getElementById('orderAddress').value = order.address || '';
        }
    }
    
    openModal('orderModal');
}

function handleOrderSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('orderId').value;
    const productId = document.getElementById('orderProduct').value;
    const product = state.products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById('orderQuantity').value);
    
    const orderData = {
        id: id || generateId(),
        customer: document.getElementById('orderCustomer').value,
        email: document.getElementById('orderEmail').value,
        productId: productId,
        productName: product?.name || 'Unknown',
        quantity: quantity,
        amount: (product?.price || 0) * quantity,
        profit: ((product?.price || 0) - (product?.cost || 0)) * quantity,
        status: document.getElementById('orderStatus').value,
        address: document.getElementById('orderAddress').value,
        createdAt: id ? state.orders.find(o => o.id === id)?.createdAt : new Date().toISOString()
    };
    
    if (id) {
        const index = state.orders.findIndex(o => o.id === id);
        state.orders[index] = orderData;
        showToast('Order updated successfully', 'success');
    } else {
        state.orders.push(orderData);
        showToast('Order created successfully', 'success');
    }
    
    saveData();
    renderAll();
    updateDashboard();
    closeModal('orderModal');
}

function deleteOrder(id) {
    state.deleteTarget = { type: 'order', id };
    document.getElementById('deleteMessage').textContent = 'Are you sure you want to delete this order?';
    openModal('deleteModal');
}

function updateOrderStatus(orderId, newStatus) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        saveData();
        renderOrders();
        updateDashboard();
        showToast('Order status updated', 'success');
    }
}

// Confirm Delete
function confirmDelete() {
    if (!state.deleteTarget) return;
    
    const { type, id } = state.deleteTarget;
    
    switch (type) {
        case 'product':
            state.products = state.products.filter(p => p.id !== id);
            showToast('Product deleted', 'success');
            break;
        case 'supplier':
            state.suppliers = state.suppliers.filter(s => s.id !== id);
            showToast('Supplier deleted', 'success');
            break;
        case 'order':
            state.orders = state.orders.filter(o => o.id !== id);
            showToast('Order deleted', 'success');
            break;
    }
    
    state.deleteTarget = null;
    saveData();
    renderAll();
    updateDashboard();
    closeModal('deleteModal');
}

// Dashboard Update
function updateDashboard() {
    // Calculate totals
    const totalRevenue = state.orders.reduce((sum, o) => sum + o.amount, 0);
    const totalProfit = state.orders.reduce((sum, o) => sum + o.profit, 0);
    const pendingCount = state.orders.filter(o => o.status === 'pending').length;
    
    // Update stats
    elements.totalRevenue.textContent = formatCurrency(totalRevenue);
    elements.totalProducts.textContent = state.products.length;
    elements.totalProfit.textContent = formatCurrency(totalProfit);
    elements.profitMargin.textContent = totalRevenue > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% margin` : '0% margin';
    elements.totalOrders.textContent = state.orders.length;
    elements.pendingOrders.textContent = `${pendingCount} pending`;
    
    // Recent Orders
    const recentOrders = [...state.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    
    if (recentOrders.length === 0) {
        elements.recentOrdersList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                </svg>
                <p>No orders yet</p>
                <span>Orders will appear here</span>
            </div>
        `;
    } else {
        elements.recentOrdersList.innerHTML = recentOrders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <span class="order-id">#${order.id.slice(-6).toUpperCase()}</span>
                    <span class="order-customer">${order.customer}</span>
                </div>
                <span class="status-badge ${order.status}">${order.status}</span>
                <span class="order-amount">${formatCurrency(order.amount)}</span>
            </div>
        `).join('');
    }
    
    // Top Products (by profit margin)
    const topProducts = [...state.products]
        .map(p => ({
            ...p,
            margin: ((p.price - p.cost) / p.price) * 100
        }))
        .sort((a, b) => b.margin - a.margin)
        .slice(0, 5);
    
    if (topProducts.length === 0) {
        elements.topProductsList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                <p>No products yet</p>
                <span>Add your first product</span>
            </div>
        `;
    } else {
        elements.topProductsList.innerHTML = topProducts.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <span class="product-name">${product.name}</span>
                    <span class="product-profit">Profit: ${formatCurrency(product.price - product.cost)}</span>
                </div>
                <div>
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <div class="product-margin">${product.margin.toFixed(1)}% margin</div>
                </div>
            </div>
        `).join('');
    }
}

// Render Functions
function renderAll() {
    renderProducts();
    renderSuppliers();
    renderOrders();
}

function renderProducts() {
    if (state.products.length === 0) {
        elements.productsTableBody.innerHTML = '';
        elements.productsEmpty.style.display = 'flex';
        return;
    }
    
    elements.productsEmpty.style.display = 'none';
    elements.productsTableBody.innerHTML = state.products.map(product => {
        const supplier = state.suppliers.find(s => s.id === product.supplierId);
        const profit = product.price - product.cost;
        const margin = ((profit / product.price) * 100).toFixed(1);
        
        return `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${formatCurrency(product.cost)}</td>
                <td>${formatCurrency(product.price)}</td>
                <td style="color: var(--accent-green); font-weight: 600;">${formatCurrency(profit)}</td>
                <td>${margin}%</td>
                <td>${supplier?.name || '-'}</td>
                <td><span class="status-badge ${product.stock}">${formatStock(product.stock)}</span></td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="openProductModal('${product.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon delete" onclick="deleteProduct('${product.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderSuppliers() {
    if (state.suppliers.length === 0) {
        elements.suppliersGrid.innerHTML = '';
        elements.suppliersEmpty.style.display = 'flex';
        return;
    }
    
    elements.suppliersEmpty.style.display = 'none';
    elements.suppliersGrid.innerHTML = state.suppliers.map(supplier => {
        const productCount = state.products.filter(p => p.supplierId === supplier.id).length;
        const stars = '⭐'.repeat(supplier.rating);
        
        return `
            <div class="supplier-card">
                <div class="supplier-header">
                    <div class="supplier-info">
                        <h4>${supplier.name}</h4>
                        <span class="supplier-rating">${stars}</span>
                    </div>
                </div>
                <div class="supplier-meta">
                    ${supplier.email ? `
                        <div class="supplier-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                            <span>${supplier.email}</span>
                        </div>
                    ` : ''}
                    ${supplier.phone ? `
                        <div class="supplier-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                            </svg>
                            <span>${supplier.phone}</span>
                        </div>
                    ` : ''}
                    ${supplier.shippingDays ? `
                        <div class="supplier-meta-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>${supplier.shippingDays} days shipping</span>
                        </div>
                    ` : ''}
                </div>
                <div class="supplier-stats">
                    <div class="supplier-stat">
                        <span class="supplier-stat-label">Products</span>
                        <span class="supplier-stat-value">${productCount}</span>
                    </div>
                </div>
                <div class="supplier-actions">
                    <button class="btn-icon edit" onclick="openSupplierModal('${supplier.id}')" title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="btn-icon delete" onclick="deleteSupplier('${supplier.id}')" title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderOrders() {
    let filteredOrders = [...state.orders];
    
    if (state.currentFilter !== 'all') {
        filteredOrders = filteredOrders.filter(o => o.status === state.currentFilter);
    }
    
    // Sort by date descending
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (filteredOrders.length === 0) {
        elements.ordersTableBody.innerHTML = '';
        elements.ordersEmpty.style.display = 'flex';
        return;
    }
    
    elements.ordersEmpty.style.display = 'none';
    elements.ordersTableBody.innerHTML = filteredOrders.map(order => {
        const statusOptions = ['pending', 'processing', 'shipped', 'delivered'];
        const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <tr>
                <td><strong>#${order.id.slice(-6).toUpperCase()}</strong></td>
                <td>${order.customer}</td>
                <td>${order.productName} (x${order.quantity})</td>
                <td>${formatCurrency(order.amount)}</td>
                <td style="color: var(--accent-green); font-weight: 600;">${formatCurrency(order.profit)}</td>
                <td>
                    <select class="status-select" onchange="updateOrderStatus('${order.id}', this.value)">
                        ${statusOptions.map(s => `
                            <option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        `).join('')}
                    </select>
                </td>
                <td>${date}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn-icon edit" onclick="openOrderModal('${order.id}')" title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon delete" onclick="deleteOrder('${order.id}')" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Calculator Functions
function calculateProfit() {
    const cost = parseFloat(elements.calcCost.value) || 0;
    const sell = parseFloat(elements.calcSell.value) || 0;
    const shipping = parseFloat(elements.calcShipping.value) || 0;
    const feesPercent = parseFloat(elements.calcFees.value) || 0;
    
    const grossProfit = sell - cost;
    const fees = (sell * feesPercent) / 100;
    const netProfit = grossProfit - shipping - fees;
    const margin = sell > 0 ? (netProfit / sell) * 100 : 0;
    
    elements.grossProfit.textContent = formatCurrency(grossProfit);
    elements.platformFees.textContent = `-${formatCurrency(fees)}`;
    elements.shippingCost.textContent = `-${formatCurrency(shipping)}`;
    elements.netProfit.textContent = formatCurrency(netProfit);
    elements.netProfit.className = `result-value ${netProfit >= 0 ? '' : 'negative'}`;
    elements.calcMargin.textContent = `${margin.toFixed(1)}%`;
    elements.calcMargin.className = `result-value ${margin >= 0 ? '' : 'negative'}`;
}

function calculateMarkup() {
    const cost = parseFloat(elements.markupCost.value) || 0;
    const margin = parseFloat(elements.desiredMargin.value) || 0;
    
    if (margin >= 100) {
        elements.suggestedPrice.textContent = 'Invalid';
        elements.expectedProfit.textContent = '-';
        return;
    }
    
    const suggestedPrice = cost / (1 - margin / 100);
    const expectedProfit = suggestedPrice - cost;
    
    elements.suggestedPrice.textContent = formatCurrency(suggestedPrice);
    elements.expectedProfit.textContent = formatCurrency(expectedProfit);
}

// Search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    
    if (!query) {
        renderAll();
        return;
    }
    
    // Filter based on current page
    switch (state.currentPage) {
        case 'products':
            const filteredProducts = state.products.filter(p => 
                p.name.toLowerCase().includes(query)
            );
            renderFilteredProducts(filteredProducts);
            break;
        case 'orders':
            const filteredOrders = state.orders.filter(o => 
                o.customer.toLowerCase().includes(query) ||
                o.productName.toLowerCase().includes(query) ||
                o.id.toLowerCase().includes(query)
            );
            renderFilteredOrders(filteredOrders);
            break;
        case 'suppliers':
            const filteredSuppliers = state.suppliers.filter(s => 
                s.name.toLowerCase().includes(query) ||
                (s.email && s.email.toLowerCase().includes(query))
            );
            renderFilteredSuppliers(filteredSuppliers);
            break;
    }
}

function renderFilteredProducts(products) {
    if (products.length === 0) {
        elements.productsTableBody.innerHTML = '';
        elements.productsEmpty.style.display = 'flex';
        return;
    }
    
    elements.productsEmpty.style.display = 'none';
    const temp = state.products;
    state.products = products;
    renderProducts();
    state.products = temp;
}

function renderFilteredOrders(orders) {
    if (orders.length === 0) {
        elements.ordersTableBody.innerHTML = '';
        elements.ordersEmpty.style.display = 'flex';
        return;
    }
    
    elements.ordersEmpty.style.display = 'none';
    const temp = state.orders;
    state.orders = orders;
    renderOrders();
    state.orders = temp;
}

function renderFilteredSuppliers(suppliers) {
    if (suppliers.length === 0) {
        elements.suppliersGrid.innerHTML = '';
        elements.suppliersEmpty.style.display = 'flex';
        return;
    }
    
    elements.suppliersEmpty.style.display = 'none';
    const temp = state.suppliers;
    state.suppliers = suppliers;
    renderSuppliers();
    state.suppliers = temp;
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Utility Functions
function generateId() {
    return 'id_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatStock(stock) {
    const labels = {
        'in_stock': 'In Stock',
        'low_stock': 'Low Stock',
        'out_of_stock': 'Out of Stock'
    };
    return labels[stock] || stock;
}

// Add some CSS for status select
const style = document.createElement('style');
style.textContent = `
    .status-select {
        padding: 6px 12px;
        background: var(--bg-tertiary);
        border: 1px solid var(--glass-border);
        border-radius: 20px;
        color: var(--text-primary);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-normal);
    }
    
    .status-select:focus {
        outline: none;
        border-color: var(--accent-purple);
    }
`;
document.head.appendChild(style);

// Initialize App
document.addEventListener('DOMContentLoaded', init);
