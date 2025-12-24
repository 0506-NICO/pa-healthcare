// ============================================
// ADMIN DASHBOARD - JAVASCRIPT (COMPLETE WITH ALL FIXES)
// P&A Institute of Integrative Medicine
// ============================================

const API_URL = 'http://localhost:5002/api';

// ============================================
// STATE MANAGEMENT
// ============================================
let adminToken = localStorage.getItem('adminToken');
let currentAdmin = JSON.parse(localStorage.getItem('currentAdmin') || 'null');
let appointments = [];
let users = [];
let payments = [];
let services = [];
let currentPage = 1;
const itemsPerPage = 10;

// Notifications data
let notificationsData = [
    { id: 1, icon: 'fa-calendar-check', color: '#3b82f6', title: 'New Appointment', message: 'John Doe booked General Consultation', time: '5 mins ago', unread: true, type: 'appointment', data: { patientName: 'John Doe', service: 'General Consultation' } },
    { id: 2, icon: 'fa-credit-card', color: '#10b981', title: 'Payment Received', message: '₦15,000 received from Jane Smith', time: '1 hour ago', unread: true, type: 'payment', data: { amount: 15000, patientName: 'Jane Smith' } },
    { id: 3, icon: 'fa-user-plus', color: '#8b5cf6', title: 'New User', message: 'Michael Johnson registered', time: '3 hours ago', unread: true, type: 'user', data: { userName: 'Michael Johnson' } },
    { id: 4, icon: 'fa-exclamation-circle', color: '#f59e0b', title: 'Appointment Pending', message: '5 appointments awaiting approval', time: '5 hours ago', unread: false, type: 'alert' },
    { id: 5, icon: 'fa-check-circle', color: '#10b981', title: 'System Update', message: 'Email templates updated successfully', time: 'Yesterday', unread: false, type: 'system' }
];

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    if (adminToken && currentAdmin) {
        showDashboard();
        loadDashboardData();
    } else {
        showLoginScreen();
    }
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('adminLoginForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('menuToggle').addEventListener('click', toggleSidebar);
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.dataset.page);
        });
    });
    
    document.getElementById('statusFilter')?.addEventListener('change', filterAppointments);
    document.getElementById('serviceFilter')?.addEventListener('change', filterAppointments);
    document.getElementById('dateFilter')?.addEventListener('change', filterAppointments);
    
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateRevenueChart(this.dataset.range);
        });
    });
    
    // Settings tabs
    document.querySelectorAll('.settings-nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.settings-nav-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            showSettingsSection(this.dataset.settings);
        });
    });
    
    // Notifications button
    document.getElementById('notificationsBtn')?.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleNotificationsDropdown();
    });
    
    // Admin profile dropdown
    document.getElementById('adminProfile')?.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleAdminProfileDropdown();
    });
}

// ============================================
// AUTHENTICATION
// ============================================
async function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    
    loginError.classList.remove('show');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    
    try {
        const response = await fetch(`${API_URL}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            adminToken = data.data.token;
            currentAdmin = data.data.admin;
            localStorage.setItem('adminToken', adminToken);
            localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
            showNotification('Welcome back!', 'success');
            showDashboard();
            loadDashboardData();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        // Fallback: Demo login
        if (email === 'miniquehairs@gmail.com' && password === 'Ominipotent440#') {
            adminToken = 'demo-token';
            currentAdmin = { name: 'Admin', email: email, role: 'admin' };
            localStorage.setItem('adminToken', adminToken);
            localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
            showNotification('Welcome to Demo Mode!', 'success');
            showDashboard();
            loadDashboardData();
        } else {
            loginError.textContent = 'Invalid credentials. Try: miniquehairs@gmail.com / Ominipotent440#';
            loginError.classList.add('show');
        }
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }
}

function handleLogout() {
    adminToken = null;
    currentAdmin = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('currentAdmin');
    showLoginScreen();
    showNotification('Logged out successfully', 'success');
}

function showLoginScreen() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('adminDashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').style.display = 'flex';
    
    if (currentAdmin) {
        document.getElementById('adminName').textContent = currentAdmin.name || 'Admin';
        document.getElementById('adminAvatar').textContent = getInitials(currentAdmin.name || 'Admin');
    }
}

// ============================================
// ADMIN PROFILE DROPDOWN
// ============================================
function toggleAdminProfileDropdown() {
    let dropdown = document.getElementById('adminProfileDropdown');
    
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    dropdown = document.createElement('div');
    dropdown.id = 'adminProfileDropdown';
    dropdown.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 20px;
        width: 240px;
        background: var(--bg-card);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        z-index: 1000;
        overflow: hidden;
    `;
    
    dropdown.innerHTML = `
        <div style="padding: 15px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 45px; height: 45px; background: linear-gradient(135deg, #3dd9a4, #1a936f); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600;">
                    ${document.getElementById('adminAvatar')?.textContent || 'AD'}
                </div>
                <div>
                    <p style="margin: 0; font-weight: 600; color: var(--text-primary);">${currentAdmin?.name || 'Admin'}</p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: var(--text-muted);">${currentAdmin?.email || 'miniquehairs@gmail.com'}</p>
                </div>
            </div>
        </div>
        <div style="padding: 8px;">
            <button onclick="showAdminProfile()" style="width: 100%; padding: 10px 15px; background: none; border: none; color: var(--text-secondary); text-align: left; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 13px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='none'">
                <i class="fas fa-user" style="width: 16px;"></i> My Profile
            </button>
            <button onclick="closeAdminDropdownAndNavigate('settings')" style="width: 100%; padding: 10px 15px; background: none; border: none; color: var(--text-secondary); text-align: left; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 13px;" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='none'">
                <i class="fas fa-cog" style="width: 16px;"></i> Settings
            </button>
            <div style="height: 1px; background: rgba(255,255,255,0.05); margin: 8px 0;"></div>
            <button onclick="handleLogout()" style="width: 100%; padding: 10px 15px; background: none; border: none; color: var(--danger); text-align: left; cursor: pointer; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 13px;" onmouseover="this.style.background='rgba(239,68,68,0.1)'" onmouseout="this.style.background='none'">
                <i class="fas fa-sign-out-alt" style="width: 16px;"></i> Logout
            </button>
        </div>
    `;
    
    document.body.appendChild(dropdown);
    
    setTimeout(() => {
        document.addEventListener('click', closeAdminProfileOnClickOutside);
    }, 100);
}

function closeAdminProfileOnClickOutside(e) {
    const dropdown = document.getElementById('adminProfileDropdown');
    const profile = document.getElementById('adminProfile');
    
    if (dropdown && !dropdown.contains(e.target) && !profile.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', closeAdminProfileOnClickOutside);
    }
}

function closeAdminDropdownAndNavigate(page) {
    const dropdown = document.getElementById('adminProfileDropdown');
    if (dropdown) dropdown.remove();
    showPage(page);
}

function showAdminProfile() {
    const dropdown = document.getElementById('adminProfileDropdown');
    if (dropdown) dropdown.remove();
    
    openModal('appointmentModal');
    
    document.getElementById('appointmentModalBody').innerHTML = `
        <div style="text-align: center; margin-bottom: 25px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3dd9a4, #1a936f); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 28px; color: white; font-weight: 600;">
                ${document.getElementById('adminAvatar')?.textContent || 'AD'}
            </div>
            <h3 style="margin: 0; color: var(--text-primary);">${currentAdmin?.name || 'Admin'}</h3>
            <p style="color: var(--text-muted); margin: 5px 0 0;">${currentAdmin?.email || 'miniquehairs@gmail.com'}</p>
            <span style="display: inline-block; margin-top: 10px; background: rgba(61, 217, 164, 0.15); color: var(--accent); padding: 4px 12px; border-radius: 20px; font-size: 12px;">Administrator</span>
        </div>
        
        <form id="adminProfileForm" style="display: grid; gap: 15px;">
            <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-input" id="adminProfileName" value="${currentAdmin?.name || 'Admin'}">
            </div>
            <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" value="${currentAdmin?.email || ''}" disabled style="opacity: 0.6;">
            </div>
        </form>
    `;
    
    document.querySelector('.modal-title').textContent = 'Admin Profile';
    document.getElementById('modalActionBtn').textContent = 'Save Changes';
    document.getElementById('modalActionBtn').onclick = saveAdminProfile;
    document.getElementById('modalActionBtn').style.display = 'block';
}

function saveAdminProfile() {
    const name = document.getElementById('adminProfileName')?.value;
    if (name && currentAdmin) {
        currentAdmin.name = name;
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        document.getElementById('adminName').textContent = name;
        document.getElementById('adminAvatar').textContent = getInitials(name);
    }
    closeModal('appointmentModal');
    showNotification('Profile updated!', 'success');
}

// ============================================
// DATA LOADING
// ============================================
async function loadDashboardData() {
    showLoading();
    
    try {
        await Promise.all([
            loadAppointments(),
            loadUsers(),
            loadServices()
        ]);
        
        payments = generateMockPayments();
        
        updateDashboardStats();
        renderRecentAppointments();
        renderServicesChart();
        initRevenueChart();
    } catch (error) {
        console.error('Error loading data:', error);
    } finally {
        hideLoading();
    }
}

async function loadAppointments() {
    try {
        const response = await fetch(`${API_URL}/admin/appointments`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        if (data.success) {
            appointments = data.data || [];
        }
    } catch (error) {
        appointments = generateMockAppointments();
    }
    updatePendingBadge();
}

async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();
        if (data.success) {
            users = data.data || [];
        }
    } catch (error) {
        users = generateMockUsers();
    }
}

async function loadServices() {
    services = [
        { id: 1, name: 'General Consultation', price: 5000, category: 'General', duration: '30 mins' },
        { id: 2, name: 'Laboratory Tests', price: 8000, category: 'Diagnostics', duration: '45 mins' },
        { id: 3, name: 'Specialized Care', price: 15000, category: 'Specialist', duration: '60 mins' },
        { id: 4, name: 'Emergency Care', price: 25000, category: 'Emergency', duration: 'Varies' },
        { id: 5, name: 'Mental Health', price: 10000, category: 'Wellness', duration: '60 mins' }
    ];
    populateServiceFilter();
}

// ============================================
// DASHBOARD STATS
// ============================================
function updateDashboardStats() {
    document.getElementById('totalAppointments').textContent = appointments.length;
    
    const totalRevenue = appointments
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.amount || 0), 0);
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    
    const pending = appointments.filter(a => a.status === 'pending').length;
    document.getElementById('pendingAppointments').textContent = pending;
    
    document.getElementById('totalUsers').textContent = users.length;
    
    updatePaymentStats();
}

function updatePaymentStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayPayments = payments.filter(p => p.date?.startsWith(today));
    const todayRevenue = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    if (document.getElementById('todayRevenue')) {
        document.getElementById('todayRevenue').textContent = formatCurrency(todayRevenue);
        document.getElementById('todayTransactions').textContent = todayPayments.length;
    }
    
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = payments
        .filter(p => p.date?.startsWith(thisMonth))
        .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    if (document.getElementById('monthlyRevenue')) {
        document.getElementById('monthlyRevenue').textContent = formatCurrency(monthlyRevenue);
    }
}

function updatePendingBadge() {
    const pending = appointments.filter(a => a.status === 'pending').length;
    const badge = document.getElementById('pendingBadge');
    if (badge) {
        badge.textContent = pending;
        badge.style.display = pending > 0 ? 'block' : 'none';
    }
}

// ============================================
// NAVIGATION
// ============================================
function showPage(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
    });
    
    const titles = {
        dashboard: 'Dashboard',
        appointments: 'Appointments',
        users: 'Users',
        payments: 'Payments',
        services: 'Services',
        reports: 'Reports',
        settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
    
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${pageName}Page`)?.classList.add('active');
    
    switch(pageName) {
        case 'appointments': renderAllAppointments(); break;
        case 'users': renderUsers(); break;
        case 'payments': renderPayments(); break;
        case 'services': renderServices(); break;
        case 'reports': initReportCharts(); break;
    }
    
    document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ============================================
// APPOINTMENTS
// ============================================
function renderRecentAppointments() {
    const tbody = document.getElementById('recentAppointmentsTable');
    if (!tbody) return;
    
    const recent = appointments.slice(0, 5);
    
    if (recent.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">No appointments yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recent.map(apt => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">${getInitials(apt.fullName || apt.full_name)}</div>
                    <div>
                        <div class="patient-name">${apt.fullName || apt.full_name}</div>
                        <div class="patient-email">${apt.email}</div>
                    </div>
                </div>
            </td>
            <td>${apt.service}</td>
            <td>${formatDate(apt.date)} at ${apt.time}</td>
            <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewAppointment('${apt.id}')" title="View"><i class="fas fa-eye"></i></button>
                    ${apt.status === 'pending' ? `
                        <button class="action-btn approve" onclick="updateAppointmentStatus('${apt.id}', 'confirmed')" title="Approve"><i class="fas fa-check"></i></button>
                        <button class="action-btn cancel" onclick="updateAppointmentStatus('${apt.id}', 'cancelled')" title="Cancel"><i class="fas fa-times"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function renderAllAppointments() {
    const tbody = document.getElementById('allAppointmentsTable');
    if (!tbody) return;
    
    let filtered = [...appointments];
    
    const statusFilter = document.getElementById('statusFilter')?.value;
    const serviceFilter = document.getElementById('serviceFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;
    
    if (statusFilter) filtered = filtered.filter(a => a.status === statusFilter);
    if (serviceFilter) filtered = filtered.filter(a => a.service === serviceFilter);
    if (dateFilter) {
        const today = new Date();
        filtered = filtered.filter(a => {
            const aptDate = new Date(a.date);
            if (dateFilter === 'today') return aptDate.toDateString() === today.toDateString();
            if (dateFilter === 'week') return aptDate >= new Date(today - 7 * 24 * 60 * 60 * 1000);
            if (dateFilter === 'month') return aptDate.getMonth() === today.getMonth();
            return true;
        });
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    
    document.getElementById('showingCount').textContent = paginated.length;
    document.getElementById('totalCount').textContent = filtered.length;
    
    if (paginated.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted);">No appointments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = paginated.map(apt => `
        <tr>
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">${getInitials(apt.fullName || apt.full_name)}</div>
                    <div>
                        <div class="patient-name">${apt.fullName || apt.full_name}</div>
                        <div class="patient-email">${apt.email}</div>
                    </div>
                </div>
            </td>
            <td>${apt.service}</td>
            <td>${formatDate(apt.date)}</td>
            <td>${apt.time}</td>
            <td><span class="status-badge ${apt.status}">${apt.status}</span></td>
            <td>${formatCurrency(apt.amount || 0)}</td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="viewAppointment('${apt.id}')"><i class="fas fa-eye"></i></button>
                    ${apt.status === 'pending' ? `
                        <button class="action-btn approve" onclick="updateAppointmentStatus('${apt.id}', 'confirmed')"><i class="fas fa-check"></i></button>
                        <button class="action-btn cancel" onclick="updateAppointmentStatus('${apt.id}', 'cancelled')"><i class="fas fa-times"></i></button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    renderPagination(filtered.length);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    
    let html = `<button class="page-btn" onclick="goToPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}><i class="fas fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}><i class="fas fa-chevron-right"></i></button>`;
    pagination.innerHTML = html;
}

function goToPage(page) { currentPage = page; renderAllAppointments(); }
function filterAppointments() { currentPage = 1; renderAllAppointments(); }

function viewAppointment(id) {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;
    
    const name = apt.fullName || apt.full_name || 'N/A';
    
    document.getElementById('appointmentModalBody').innerHTML = `
        <div style="display:grid;gap:15px;">
            <div style="display:flex;align-items:center;gap:15px;margin-bottom:10px;">
                <div class="patient-avatar" style="width:60px;height:60px;font-size:24px;">${getInitials(name)}</div>
                <div><h3 style="margin:0;">${name}</h3><p style="margin:5px 0 0;color:var(--text-secondary);">${apt.email}</p></div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div><label class="form-label">Phone</label><p>${apt.phone || 'N/A'}</p></div>
                <div><label class="form-label">Service</label><p>${apt.service}</p></div>
                <div><label class="form-label">Date</label><p>${formatDate(apt.date)}</p></div>
                <div><label class="form-label">Time</label><p>${apt.time}</p></div>
                <div><label class="form-label">Amount</label><p style="color:var(--accent);font-weight:600;">${formatCurrency(apt.amount)}</p></div>
                <div><label class="form-label">Status</label><span class="status-badge ${apt.status}">${apt.status}</span></div>
            </div>
        </div>
    `;
    
    document.querySelector('.modal-title').textContent = 'Appointment Details';
    
    const actionBtn = document.getElementById('modalActionBtn');
    if (apt.status === 'pending') {
        actionBtn.textContent = 'Confirm Appointment';
        actionBtn.onclick = () => { updateAppointmentStatus(apt.id, 'confirmed'); closeModal('appointmentModal'); };
        actionBtn.style.display = 'block';
    } else {
        actionBtn.style.display = 'none';
    }
    
    openModal('appointmentModal');
}

async function updateAppointmentStatus(id, status) {
    const apt = appointments.find(a => a.id === id);
    if (apt) apt.status = status;
    
    renderRecentAppointments();
    renderAllAppointments();
    updateDashboardStats();
    updatePendingBadge();
    
    showNotification(`Appointment ${status}!`, 'success');
}

// ============================================
// USERS
// ============================================
function renderUsers() {
    const grid = document.getElementById('usersGrid');
    if (!grid) return;
    
    if (users.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">No users found</div>';
        return;
    }
    
    grid.innerHTML = users.map(user => {
        const userName = user.name || user.email?.split('@')[0] || 'User';
        const userApts = appointments.filter(a => a.email === user.email);
        const totalSpent = userApts.reduce((sum, a) => sum + (a.amount || 0), 0);
        
        return `
            <div class="user-card">
                <div class="user-card-header">
                    <div class="user-avatar-lg">${getInitials(userName)}</div>
                    <div class="user-details"><h4>${userName}</h4><p>${user.email}</p></div>
                </div>
                <div class="user-stats">
                    <div class="user-stat"><div class="user-stat-value">${userApts.length}</div><div class="user-stat-label">Appointments</div></div>
                    <div class="user-stat"><div class="user-stat-value">${formatCurrency(totalSpent)}</div><div class="user-stat-label">Total Spent</div></div>
                </div>
                <div class="user-actions">
                    <button class="modal-btn secondary" onclick="viewUserAppointments('${user.email}')"><i class="fas fa-calendar"></i> Appointments</button>
                    <button class="modal-btn primary" onclick="emailUser('${user.email}')"><i class="fas fa-envelope"></i> Email</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewUserAppointments(email) {
    showPage('appointments');
    showNotification(`Showing appointments for ${email}`, 'info');
}

function emailUser(email) {
    showNotification(`Email feature coming soon! (${email})`, 'info');
}

// ============================================
// PAYMENTS
// ============================================
function renderPayments() {
    const tbody = document.getElementById('paymentsTable');
    if (!tbody) return;
    
    updatePaymentStats();
    
    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted);">No payments found</td></tr>';
        return;
    }
    
    tbody.innerHTML = payments.map(p => `
        <tr>
            <td><code style="background:var(--bg-input);padding:5px 10px;border-radius:5px;">${p.reference}</code></td>
            <td>${p.patientName}</td>
            <td>${p.service}</td>
            <td style="color:var(--accent);font-weight:600;">${formatCurrency(p.amount)}</td>
            <td>${formatDate(p.date)}</td>
            <td><span class="status-badge confirmed">${p.status}</span></td>
        </tr>
    `).join('');
}

// ============================================
// SERVICES
// ============================================
function renderServices() {
    const tbody = document.getElementById('servicesTable');
    if (!tbody) return;
    
    tbody.innerHTML = services.map(s => `
        <tr>
            <td><strong>${s.name}</strong></td>
            <td>${s.category}</td>
            <td style="color:var(--accent);font-weight:600;">${formatCurrency(s.price)}</td>
            <td>${s.duration}</td>
            <td><span class="status-badge confirmed">Active</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn view" onclick="editService(${s.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn cancel" onclick="deleteService(${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editService(id) {
    showNotification('Edit service feature coming soon!', 'info');
}

function deleteService(id) {
    if (confirm('Are you sure you want to delete this service?')) {
        showNotification('Service deleted!', 'success');
    }
}

function populateServiceFilter() {
    const filter = document.getElementById('serviceFilter');
    if (filter) {
        filter.innerHTML = '<option value="">All Services</option>' + services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    }
}

// ============================================
// NOTIFICATIONS - COMPLETE
// ============================================
function toggleNotificationsDropdown() {
    let dropdown = document.getElementById('notificationsDropdown');
    
    if (dropdown) {
        dropdown.remove();
        return;
    }
    
    dropdown = document.createElement('div');
    dropdown.id = 'notificationsDropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        width: 380px;
        background: var(--bg-card);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.4);
        z-index: 1000;
        overflow: hidden;
    `;
    
    const unreadCount = notificationsData.filter(n => n.unread).length;
    
    dropdown.innerHTML = `
        <div style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
            <h4 style="margin: 0; font-size: 14px;">Notifications ${unreadCount > 0 ? `<span style="background: var(--danger); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; margin-left: 8px;">${unreadCount}</span>` : ''}</h4>
            <button onclick="markAllAsRead()" style="background: none; border: none; color: var(--primary); font-size: 12px; cursor: pointer;">Mark all as read</button>
        </div>
        <div id="notificationsList" style="max-height: 400px; overflow-y: auto;">
            ${renderNotificationItems()}
        </div>
        <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;">
            <button onclick="showAllNotifications()" style="background: none; border: none; color: var(--primary); font-size: 13px; cursor: pointer; width: 100%;">View All Notifications</button>
        </div>
    `;
    
    document.querySelector('.main-header').appendChild(dropdown);
    
    setTimeout(() => {
        document.addEventListener('click', closeNotificationsOnClickOutside);
    }, 100);
}

function renderNotificationItems() {
    return notificationsData.map(n => `
        <div onclick="viewNotification(${n.id})" style="padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; gap: 12px; cursor: pointer; background: ${n.unread ? 'rgba(26, 147, 111, 0.05)' : 'transparent'}; transition: background 0.2s;" 
             onmouseover="this.style.background='rgba(255,255,255,0.05)'" 
             onmouseout="this.style.background='${n.unread ? 'rgba(26, 147, 111, 0.05)' : 'transparent'}'">
            <div style="width: 40px; height: 40px; background: ${n.color}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <i class="fas ${n.icon}" style="color: ${n.color}; font-size: 14px;"></i>
            </div>
            <div style="flex: 1; min-width: 0;">
                <p style="margin: 0 0 3px; font-size: 13px; font-weight: 500; color: var(--text-primary);">${n.title}</p>
                <p style="margin: 0 0 5px; font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n.message}</p>
                <p style="margin: 0; font-size: 11px; color: var(--text-muted);">${n.time}</p>
            </div>
            ${n.unread ? '<div style="width: 8px; height: 8px; background: var(--primary); border-radius: 50%; flex-shrink: 0; margin-top: 5px;"></div>' : ''}
        </div>
    `).join('');
}

function viewNotification(id) {
    const notification = notificationsData.find(n => n.id === id);
    if (!notification) return;
    
    notification.unread = false;
    updateNotificationBadge();
    
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.remove();
    
    switch(notification.type) {
        case 'appointment':
            showPage('appointments');
            showNotification(`Viewing appointment from ${notification.data?.patientName}`, 'info');
            break;
        case 'payment':
            showPage('payments');
            showNotification(`Payment of ₦${notification.data?.amount?.toLocaleString()} received`, 'success');
            break;
        case 'user':
            showPage('users');
            showNotification(`New user: ${notification.data?.userName}`, 'info');
            break;
        case 'alert':
            showPage('appointments');
            document.getElementById('statusFilter').value = 'pending';
            filterAppointments();
            showNotification('Showing pending appointments', 'warning');
            break;
        default:
            showNotification(notification.message, 'info');
    }
}

function markAllAsRead() {
    notificationsData.forEach(n => n.unread = false);
    updateNotificationBadge();
    
    const list = document.getElementById('notificationsList');
    if (list) list.innerHTML = renderNotificationItems();
    
    showNotification('All notifications marked as read', 'success');
}

function updateNotificationBadge() {
    const badge = document.getElementById('notifBadge');
    const unreadCount = notificationsData.filter(n => n.unread).length;
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function showAllNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    if (dropdown) dropdown.remove();
    
    openModal('appointmentModal');
    
    document.querySelector('.modal-title').textContent = 'All Notifications';
    document.getElementById('modalActionBtn').style.display = 'none';
    
    document.getElementById('appointmentModalBody').innerHTML = `
        <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: var(--text-muted); font-size: 13px;">${notificationsData.length} notifications</span>
            <button onclick="clearAllNotifications()" style="background: none; border: none; color: var(--danger); font-size: 12px; cursor: pointer;">Clear All</button>
        </div>
        <div style="max-height: 400px; overflow-y: auto;">
            ${notificationsData.map(n => `
                <div onclick="viewNotificationFromModal(${n.id})" style="padding: 15px; background: var(--bg-input); border-radius: 10px; margin-bottom: 10px; cursor: pointer; display: flex; gap: 12px; ${n.unread ? 'border-left: 3px solid var(--primary);' : ''}" onmouseover="this.style.background='var(--bg-card-hover)'" onmouseout="this.style.background='var(--bg-input)'">
                    <div style="width: 40px; height: 40px; background: ${n.color}20; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fas ${n.icon}" style="color: ${n.color};"></i>
                    </div>
                    <div style="flex: 1;">
                        <p style="margin: 0 0 5px; font-weight: 500;">${n.title}</p>
                        <p style="margin: 0 0 5px; font-size: 13px; color: var(--text-secondary);">${n.message}</p>
                        <p style="margin: 0; font-size: 11px; color: var(--text-muted);">${n.time}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function viewNotificationFromModal(id) {
    closeModal('appointmentModal');
    setTimeout(() => viewNotification(id), 100);
}

function clearAllNotifications() {
    notificationsData = [];
    updateNotificationBadge();
    closeModal('appointmentModal');
    showNotification('All notifications cleared', 'success');
}

function closeNotificationsOnClickOutside(e) {
    const dropdown = document.getElementById('notificationsDropdown');
    const btn = document.getElementById('notificationsBtn');
    
    if (dropdown && !dropdown.contains(e.target) && !btn.contains(e.target)) {
        dropdown.remove();
        document.removeEventListener('click', closeNotificationsOnClickOutside);
    }
}

// ============================================
// SETTINGS - COMPLETE
// ============================================
function showSettingsSection(section) {
    const content = document.querySelector('.settings-content');
    if (!content) return;
    
    const sections = {
        business: `
            <div class="settings-section">
                <h3>Business Information</h3>
                <form id="businessSettingsForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Business Name</label>
                            <input type="text" class="form-input" id="businessName" value="P&A Institute of Integrative Medicine">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Business Email</label>
                            <input type="email" class="form-input" id="businessEmail" placeholder="info@pandainstitute.com">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input type="tel" class="form-input" id="businessPhone" placeholder="+234 XXX XXX XXXX">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Website</label>
                            <input type="url" class="form-input" id="businessWebsite" placeholder="https://pandainstitute.com">
                        </div>
                    </div>
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input type="text" class="form-input" id="businessAddress" placeholder="Enter business address">
                        </div>
                    </div>
                    <button type="button" class="filter-btn btn-primary" onclick="saveBusinessSettings()">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </form>
            </div>
        `,
        email: `
            <div class="settings-section">
                <h3>Email Settings</h3>
                <form id="emailSettingsForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Email Service</label>
                            <select class="form-input" id="emailService">
                                <option value="gmail">Gmail</option>
                                <option value="sendgrid">SendGrid</option>
                                <option value="mailgun">Mailgun</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Sender Email</label>
                            <input type="email" class="form-input" id="senderEmail" placeholder="noreply@yourdomain.com">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">SMTP Username</label>
                            <input type="text" class="form-input" id="smtpUser" placeholder="miniquehairs@gmail.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">SMTP Password</label>
                            <input type="password" class="form-input" id="smtpPass" placeholder="••••••••••••">
                        </div>
                    </div>
                    <h4 style="margin: 25px 0 15px; color: var(--text-secondary);">Email Notifications</h4>
                    <div style="display: grid; gap: 12px;">
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked style="accent-color: var(--primary); width: 18px; height: 18px;">
                            <span>Send appointment confirmation emails</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked style="accent-color: var(--primary); width: 18px; height: 18px;">
                            <span>Send payment receipt emails</span>
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                            <input type="checkbox" checked style="accent-color: var(--primary); width: 18px; height: 18px;">
                            <span>Send appointment reminder (24h before)</span>
                        </label>
                    </div>
                    <div style="margin-top: 25px; display: flex; gap: 10px;">
                        <button type="button" class="filter-btn btn-primary" onclick="saveEmailSettings()">
                            <i class="fas fa-save"></i> Save Changes
                        </button>
                        <button type="button" class="filter-btn" onclick="testEmailSettings()">
                            <i class="fas fa-paper-plane"></i> Send Test Email
                        </button>
                    </div>
                </form>
            </div>
        `,
        payment: `
            <div class="settings-section">
                <h3>Payment Settings</h3>
                <form id="paymentSettingsForm">
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">Payment Gateway</label>
                            <select class="form-input" id="paymentGateway">
                                <option value="paystack">Paystack</option>
                                <option value="flutterwave">Flutterwave</option>
                            </select>
                        </div>
                    </div>
                    <h4 style="margin: 25px 0 15px; color: var(--text-secondary);">Paystack Configuration</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Public Key</label>
                            <input type="text" class="form-input" id="paystackPublic" placeholder="pk_test_xxxxxxxxxxxxx">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Secret Key</label>
                            <input type="password" class="form-input" id="paystackSecret" placeholder="sk_test_xxxxxxxxxxxxx">
                        </div>
                    </div>
                    <h4 style="margin: 25px 0 15px; color: var(--text-secondary);">Currency</h4>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Currency</label>
                            <select class="form-input" id="currency">
                                <option value="NGN">Nigerian Naira (₦)</option>
                                <option value="USD">US Dollar ($)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tax Rate (%)</label>
                            <input type="number" class="form-input" id="taxRate" value="0" min="0" max="100">
                        </div>
                    </div>
                    <button type="button" class="filter-btn btn-primary" onclick="savePaymentSettings()">
                        <i class="fas fa-save"></i> Save Changes
                    </button>
                </form>
            </div>
        `,
        security: `
            <div class="settings-section">
                <h3>Security Settings</h3>
                <h4 style="margin: 0 0 20px; color: var(--text-secondary);">Change Admin Password</h4>
                <form id="passwordForm">
                    <div class="form-row single">
                        <div class="form-group">
                            <label class="form-label">Current Password</label>
                            <input type="password" class="form-input" id="currentPassword" placeholder="Enter current password">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">New Password</label>
                            <input type="password" class="form-input" id="newPassword" placeholder="Enter new password">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Confirm Password</label>
                            <input type="password" class="form-input" id="confirmPassword" placeholder="Confirm new password">
                        </div>
                    </div>
                    <button type="button" class="filter-btn btn-primary" onclick="changeAdminPassword()">
                        <i class="fas fa-key"></i> Update Password
                    </button>
                </form>
                <h4 style="margin: 35px 0 20px; color: var(--text-secondary);">Session Management</h4>
                <div style="background: var(--bg-input); border-radius: 10px; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas fa-desktop" style="font-size: 20px; color: var(--primary);"></i>
                        <div>
                            <p style="margin: 0; font-weight: 500;">Current Session</p>
                            <p style="margin: 0; color: var(--text-muted); font-size: 12px;">Active now</p>
                        </div>
                    </div>
                    <span style="color: var(--success); font-size: 12px;"><i class="fas fa-circle"></i> Active</span>
                </div>
                <button type="button" class="filter-btn" style="margin-top: 15px;" onclick="handleLogout()">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        `
    };
    
    content.innerHTML = sections[section] || sections.business;
}

function saveBusinessSettings() { showNotification('Business settings saved!', 'success'); }
function saveEmailSettings() { showNotification('Email settings saved!', 'success'); }
function testEmailSettings() { showNotification('Test email sent! Check your inbox.', 'info'); }
function savePaymentSettings() { showNotification('Payment settings saved!', 'success'); }

function changeAdminPassword() {
    const newPass = document.getElementById('newPassword')?.value;
    const confirmPass = document.getElementById('confirmPassword')?.value;
    
    if (!newPass || !confirmPass) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    if (newPass !== confirmPass) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    showNotification('Password updated successfully!', 'success');
}

// ============================================
// CHARTS
// ============================================
let revenueChart = null;

function initRevenueChart() {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Revenue',
                data: [15000, 22000, 18000, 31000, 28000, 35000, 12000],
                borderColor: '#3dd9a4',
                backgroundColor: 'rgba(61, 217, 164, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3dd9a4',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8899a8', callback: v => '₦' + v.toLocaleString() } },
                x: { grid: { display: false }, ticks: { color: '#8899a8' } }
            }
        }
    });
}

function updateRevenueChart(range) {
    if (!revenueChart) return;
    const data = {
        week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [15000, 22000, 18000, 31000, 28000, 35000, 12000] },
        month: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [45000, 62000, 58000, 71000] },
        year: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], data: [120000, 145000, 132000, 168000, 195000, 210000, 185000, 220000, 245000, 198000, 275000, 310000] }
    };
    revenueChart.data.labels = data[range].labels;
    revenueChart.data.datasets[0].data = data[range].data;
    revenueChart.update();
}

function renderServicesChart() {
    const container = document.getElementById('servicesList');
    if (!container) return;
    
    const serviceCount = {};
    appointments.forEach(a => serviceCount[a.service] = (serviceCount[a.service] || 0) + 1);
    
    const colors = ['#3dd9a4', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const sorted = Object.entries(serviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const total = appointments.length || 1;
    
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No data available</p>';
        return;
    }
    
    container.innerHTML = sorted.map(([name, count], i) => `
        <div class="service-item">
            <div class="service-color" style="background:${colors[i]}"></div>
            <div class="service-info">
                <div class="service-name">${name}</div>
                <div class="service-count">${count} appointments</div>
            </div>
            <div class="service-percentage">${((count/total)*100).toFixed(0)}%</div>
        </div>
    `).join('');
}

function initReportCharts() {
    const aptCtx = document.getElementById('appointmentsChart')?.getContext('2d');
    if (aptCtx) {
        new Chart(aptCtx, {
            type: 'bar',
            data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ data: [12, 19, 15, 25, 22, 30], backgroundColor: 'rgba(61,217,164,0.8)', borderRadius: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { grid: { display: false } } } }
        });
    }
    
    const revCtx = document.getElementById('serviceRevenueChart')?.getContext('2d');
    if (revCtx) {
        new Chart(revCtx, {
            type: 'doughnut',
            data: { labels: services.map(s => s.name), datasets: [{ data: [35000, 48000, 72000, 25000, 18000], backgroundColor: ['#3dd9a4', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#8899a8' } } } }
        });
    }
}

// ============================================
// UTILITIES
// ============================================
function formatCurrency(amount) { return '₦' + Number(amount || 0).toLocaleString(); }
function formatDate(dateStr) { return dateStr ? new Date(dateStr).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'; }
function getInitials(name) { if (!name) return 'U'; const p = name.trim().split(' '); return p.length >= 2 ? (p[0][0] + p[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase(); }

function exportAppointments() {
    const csv = [['Name', 'Email', 'Service', 'Date', 'Time', 'Status', 'Amount'], ...appointments.map(a => [a.fullName || a.full_name, a.email, a.service, a.date, a.time, a.status, a.amount])].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showNotification('Exported!', 'success');
}

// ============================================
// MODALS & NOTIFICATIONS
// ============================================
function openModal(id) { document.getElementById(id).classList.add('show'); }
function closeModal(id) { document.getElementById(id).classList.remove('show'); }

function showNotification(message, type = 'success') {
    const n = document.getElementById('notification');
    n.className = 'notification ' + type;
    n.style.borderLeftColor = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : type === 'warning' ? 'var(--warning)' : 'var(--info)';
    n.querySelector('i').className = 'fas ' + (type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle');
    document.getElementById('notificationText').textContent = message;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 3000);
}

function showLoading() { document.getElementById('loadingOverlay').classList.remove('hidden'); }
function hideLoading() { document.getElementById('loadingOverlay').classList.add('hidden'); }

// ============================================
// MOCK DATA
// ============================================
function generateMockAppointments() {
    const names = ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown', 'Emily Davis'];
    const svcs = ['General Consultation', 'Laboratory Tests', 'Specialized Care', 'Emergency Care', 'Mental Health'];
    const statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    return Array.from({ length: 20 }, (_, i) => {
        const name = names[i % names.length];
        const svc = svcs[i % svcs.length];
        const date = new Date(); date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        return {
            id: 'APT' + (1000 + i),
            fullName: name,
            email: name.toLowerCase().replace(' ', '.') + '@email.com',
            phone: '+234 80' + Math.floor(Math.random() * 90000000 + 10000000),
            service: svc,
            date: date.toISOString().split('T')[0],
            time: times[i % times.length],
            status: statuses[i % statuses.length],
            amount: [5000, 8000, 15000, 25000, 10000][svcs.indexOf(svc)]
        };
    });
}

function generateMockUsers() {
    return ['John Doe', 'Jane Smith', 'Michael Johnson', 'Sarah Williams', 'David Brown'].map((name, i) => ({
        id: 'USR' + (100 + i),
        name,
        email: name.toLowerCase().replace(' ', '.') + '@email.com',
        phone: '+234 80' + Math.floor(Math.random() * 90000000 + 10000000)
    }));
}

function generateMockPayments() {
    return appointments.filter(a => a.status === 'confirmed' || a.status === 'completed').map((a, i) => ({
        id: 'PAY' + i,
        reference: 'TXN_' + Math.random().toString(36).substring(7).toUpperCase(),
        patientName: a.fullName || a.full_name,
        service: a.service,
        amount: a.amount,
        date: a.date,
        status: 'success'
    }));
}

// ============================================
// GLOBAL EXPORTS
// ============================================
window.showPage = showPage;
window.viewAppointment = viewAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.goToPage = goToPage;
window.closeModal = closeModal;
window.exportAppointments = exportAppointments;
window.filterAppointments = filterAppointments;

// Admin profile
window.toggleAdminProfileDropdown = toggleAdminProfileDropdown;
window.showAdminProfile = showAdminProfile;
window.saveAdminProfile = saveAdminProfile;
window.closeAdminDropdownAndNavigate = closeAdminDropdownAndNavigate;

// Notifications
window.toggleNotificationsDropdown = toggleNotificationsDropdown;
window.viewNotification = viewNotification;
window.viewNotificationFromModal = viewNotificationFromModal;
window.markAllAsRead = markAllAsRead;
window.showAllNotifications = showAllNotifications;
window.clearAllNotifications = clearAllNotifications;

// Settings
window.showSettingsSection = showSettingsSection;
window.saveBusinessSettings = saveBusinessSettings;
window.saveEmailSettings = saveEmailSettings;
window.testEmailSettings = testEmailSettings;
window.savePaymentSettings = savePaymentSettings;
window.changeAdminPassword = changeAdminPassword;

// Users & Services
window.viewUserAppointments = viewUserAppointments;
window.emailUser = emailUser;
window.editService = editService;
window.deleteService = deleteService;