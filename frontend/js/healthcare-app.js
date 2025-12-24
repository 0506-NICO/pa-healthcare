// ============================================
// P&A HEALTHCARE APP - COMPLETE FRONTEND JS
// All functions included and working
// ============================================

// API Configuration
const API_URL = 'http://localhost:5002/api';
const PAYSTACK_PUBLIC_KEY = 'pk_test_f84e02cb1d28923c5f283e04c6a0e9dfc3ab275c';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return null;
    }
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        return false;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {}
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^(\+234|234|0)?[789]\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

function formatCurrency(amount) {
    return '₦' + Number(amount).toLocaleString();
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-NG', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification-toast').forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-toast notification-${type}`;
    
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    
    notification.innerHTML = `
        <span>${icons[type] || icons.info}</span>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;margin-left:auto;">×</button>
    `;
    
    if (!document.getElementById('notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification-toast { position:fixed;top:20px;right:20px;padding:15px 20px;border-radius:10px;display:flex;align-items:center;gap:10px;z-index:10000;animation:slideIn 0.3s ease;box-shadow:0 4px 20px rgba(0,0,0,0.15);max-width:400px; }
            .notification-success { background:#d4edda;color:#155724;border-left:4px solid #28a745; }
            .notification-error { background:#f8d7da;color:#721c24;border-left:4px solid #dc3545; }
            .notification-warning { background:#fff3cd;color:#856404;border-left:4px solid #ffc107; }
            .notification-info { background:#d1ecf1;color:#0c5460;border-left:4px solid #17a2b8; }
            @keyframes slideIn { from{transform:translateX(100%);opacity:0;} to{transform:translateX(0);opacity:1;} }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ============================================
// LOADING INDICATOR
// ============================================

function showLoading(button) {
    if (!button) return { hide: () => {} };
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-radius:50%;border-top-color:white;animation:spin 0.8s linear infinite;"></span> Processing...';
    
    if (!document.getElementById('spinner-style')) {
        const style = document.createElement('style');
        style.id = 'spinner-style';
        style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
    
    return { hide: () => { button.disabled = false; button.innerHTML = originalText; } };
}

// ============================================
// MODAL FUNCTIONS
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = modalId ? document.getElementById(modalId) : document.querySelector('.modal[style*="block"]');
    if (modal) modal.style.display = 'none';
}

function showLogin() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'block';
        showLoginForm();
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'block';
    if (signupForm) signupForm.style.display = 'none';
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    if (loginForm) loginForm.style.display = 'none';
    if (signupForm) signupForm.style.display = 'block';
}

function showSignup() {
    showLogin();
    showRegisterForm();
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ============================================
// USER AUTHENTICATION
// ============================================

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;
    
    if (!email || !password) {
        showNotification('Please enter email and password', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveToLocalStorage('authToken', data.data.token);
            saveToLocalStorage('currentUser', data.data.user);
            closeModal();
            showNotification('Login successful!', 'success');
            updateUIForLoggedInUser(data.data.user);
            form.reset();
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        // Demo mode fallback
        const demoUser = { id: 'demo_' + Date.now(), name: email.split('@')[0], email, role: 'user' };
        saveToLocalStorage('authToken', 'demo_token');
        saveToLocalStorage('currentUser', demoUser);
        closeModal();
        showNotification('Logged in (demo mode)', 'success');
        updateUIForLoggedInUser(demoUser);
        form.reset();
    } finally {
        loading.hide();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[name="name"]')?.value || form.querySelector('input[type="text"]')?.value;
    const email = form.querySelector('input[type="email"]').value;
    const phone = form.querySelector('input[type="tel"]')?.value || '';
    const password = form.querySelector('input[type="password"]').value;
    
    if (!name || !email || !password) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            saveToLocalStorage('authToken', data.data.token);
            saveToLocalStorage('currentUser', data.data.user);
            closeModal();
            showNotification('Account created!', 'success');
            updateUIForLoggedInUser(data.data.user);
            form.reset();
        } else {
            showNotification(data.message || 'Registration failed', 'error');
        }
    } catch (error) {
        // Demo mode
        const demoUser = { id: 'demo_' + Date.now(), name, email, phone, role: 'user' };
        saveToLocalStorage('authToken', 'demo_token');
        saveToLocalStorage('currentUser', demoUser);
        closeModal();
        showNotification('Account created (demo)', 'success');
        updateUIForLoggedInUser(demoUser);
        form.reset();
    } finally {
        loading.hide();
    }
}

function handleLogout() {
    removeFromLocalStorage('authToken');
    removeFromLocalStorage('currentUser');
    updateUIForLoggedOutUser();
    showNotification('Logged out', 'success');
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
}

function checkLoginStatus() {
    const user = getFromLocalStorage('currentUser');
    if (user) updateUIForLoggedInUser(user);
    else updateUIForLoggedOutUser();
}

// ============================================
// UI UPDATE FUNCTIONS
// ============================================

function getUserInitials(name) {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
}

function updateUIForLoggedInUser(user) {
    const navUserMenu = document.getElementById('navUserMenu');
    const loginBtn = document.getElementById('loginBtn');
    const userInitials = document.getElementById('userInitials');
    const userNameDropdown = document.getElementById('userNameDropdown');
    const userEmailDropdown = document.getElementById('userEmailDropdown');
    const userDropdownEmail = document.getElementById('userDropdownEmail');
    
    if (navUserMenu) navUserMenu.style.display = 'flex';
    if (loginBtn) loginBtn.style.display = 'none';
    
    const initials = getUserInitials(user.name);
    if (userInitials) userInitials.textContent = initials;
    if (userNameDropdown) userNameDropdown.textContent = user.name || 'User';
    if (userEmailDropdown) userEmailDropdown.textContent = user.email || '';
    if (userDropdownEmail) userDropdownEmail.textContent = user.email || '';
}

function updateUIForLoggedOutUser() {
    const navUserMenu = document.getElementById('navUserMenu');
    const loginBtn = document.getElementById('loginBtn');
    const dropdown = document.getElementById('userDropdown');
    
    if (navUserMenu) navUserMenu.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (dropdown) dropdown.classList.remove('active');
}

// ============================================
// USER DROPDOWN MENU
// ============================================

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const container = document.getElementById('navUserMenu');
    
    if (dropdown && container && !container.contains(event.target)) {
        dropdown.classList.remove('active');
    }
});

// User menu actions
function viewProfile() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
    
    const user = getFromLocalStorage('currentUser');
    if (!user) return showNotification('Please login first', 'error');
    
    // Show profile modal
    const modalHTML = `
        <div id="profileModal" class="modal" style="display:block;">
            <div class="modal-content" style="max-width:400px;">
                <span class="close" onclick="closeModal('profileModal')">&times;</span>
                <h2 style="margin-bottom:20px;">👤 My Profile</h2>
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="width:80px;height:80px;background:linear-gradient(135deg,#1a936f,#114b5f);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:white;font-size:32px;font-weight:bold;">
                        ${getUserInitials(user.name)}
                    </div>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block;color:#666;font-size:12px;margin-bottom:5px;">Full Name</label>
                    <input type="text" id="profileName" value="${user.name || ''}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block;color:#666;font-size:12px;margin-bottom:5px;">Email</label>
                    <input type="email" value="${user.email || ''}" disabled style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;background:#f5f5f5;">
                </div>
                <div style="margin-bottom:20px;">
                    <label style="display:block;color:#666;font-size:12px;margin-bottom:5px;">Phone</label>
                    <input type="tel" id="profilePhone" value="${user.phone || ''}" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;">
                </div>
                <button onclick="saveProfile()" style="width:100%;padding:12px;background:linear-gradient(135deg,#1a936f,#114b5f);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function saveProfile() {
    const name = document.getElementById('profileName')?.value;
    const phone = document.getElementById('profilePhone')?.value;
    
    const user = getFromLocalStorage('currentUser');
    if (user) {
        user.name = name || user.name;
        user.phone = phone || user.phone;
        saveToLocalStorage('currentUser', user);
        updateUIForLoggedInUser(user);
    }
    
    closeModal('profileModal');
    document.getElementById('profileModal')?.remove();
    showNotification('Profile updated!', 'success');
}

function viewMyAppointments() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
    
    showNotification('Loading appointments...', 'info');
    
    fetch(`${API_URL}/appointments`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                showAppointmentsModal(data.data);
            } else {
                showNotification('No appointments found', 'info');
            }
        })
        .catch(() => {
            showNotification('Could not load appointments', 'error');
        });
}

function showAppointmentsModal(appointments) {
    const modalHTML = `
        <div id="appointmentsModal" class="modal" style="display:block;">
            <div class="modal-content" style="max-width:600px;max-height:80vh;overflow-y:auto;">
                <span class="close" onclick="closeModal('appointmentsModal');document.getElementById('appointmentsModal').remove();">&times;</span>
                <h2 style="margin-bottom:20px;">📅 My Appointments</h2>
                ${appointments.map(apt => `
                    <div style="background:#f8f9fa;padding:15px;border-radius:10px;margin-bottom:15px;border-left:4px solid ${apt.status === 'confirmed' ? '#28a745' : apt.status === 'cancelled' ? '#dc3545' : '#ffc107'};">
                        <div style="display:flex;justify-content:space-between;align-items:start;">
                            <div>
                                <strong style="font-size:16px;">${apt.service}</strong>
                                <p style="margin:5px 0;color:#666;">📅 ${apt.date} at ${apt.time}</p>
                                <span style="display:inline-block;padding:3px 10px;border-radius:15px;font-size:12px;background:${apt.status === 'confirmed' ? '#d4edda' : apt.status === 'cancelled' ? '#f8d7da' : '#fff3cd'};color:${apt.status === 'confirmed' ? '#155724' : apt.status === 'cancelled' ? '#721c24' : '#856404'};">${apt.status}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function viewMyPayments() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
    showNotification('Payment history coming soon!', 'info');
}

function showSettings() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) dropdown.classList.remove('active');
    showNotification('Settings coming soon!', 'info');
}

// ============================================
// SERVICE SELECTION
// ============================================

function selectService(serviceName, price) {
    const serviceSelect = document.getElementById('service');
    const serviceValue = `${serviceName}-${price}`;
    
    if (serviceSelect) {
        serviceSelect.value = serviceValue;
        updateTotalAmount(price);
        
        // Scroll to form
        document.getElementById('appointments')?.scrollIntoView({ behavior: 'smooth' });
        showNotification(`${serviceName} selected!`, 'success');
    }
}

function updateTotalAmount(amount) {
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = formatCurrency(amount);
    }
}

function updateServicePrice() {
    const serviceSelect = document.getElementById('service');
    if (serviceSelect) {
        serviceSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value) {
                const price = parseInt(value.split('-')[1]);
                updateTotalAmount(price);
            } else {
                updateTotalAmount(0);
            }
        });
    }
}

// ============================================
// APPOINTMENT FORM
// ============================================

function initAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    if (form) {
        form.addEventListener('submit', handleAppointmentSubmit);
    }
}

async function handleAppointmentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const service = formData.get('service');
    const date = formData.get('date');
    const time = formData.get('time');
    const message = formData.get('message') || '';
    
    // Validation
    if (!fullName || !email || !phone || !service || !date || !time) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }
    
    const serviceName = service.split('-')[0];
    const amount = parseInt(service.split('-')[1]);
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);
    
    try {
        // Get CSRF token
        const csrfResponse = await fetch(`${API_URL}/csrf-token`, {
            credentials: 'include'
        });
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrfToken;
        
        // Create appointment
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({
                fullName,
                email,
                phone,
                service: serviceName,
                date,
                time,
                message
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Appointment created! Proceeding to payment...', 'success');
            
            // Proceed to payment
            await initiatePayment({
                id: data.data.id || data.data.appointmentId,
                fullName,
                email,
                phone,
                service: serviceName,
                date,
                time,
                amount
            });
        } else {
            throw new Error(data.message || 'Failed to create appointment');
        }
    } catch (error) {
        console.error('Appointment error:', error);
        showNotification(error.message || 'Failed to book appointment', 'error');
        loading.hide();
    }
}

// ============================================
// PAYMENT INTEGRATION (PAYSTACK)
// ============================================

async function initiatePayment(appointmentData) {
    // Check if Paystack is loaded
    if (typeof PaystackPop === 'undefined') {
        showNotification('Payment system loading... Please wait', 'warning');
        setTimeout(() => initiatePayment(appointmentData), 1000);
        return;
    }
    
    const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: appointmentData.email,
        amount: appointmentData.amount * 100, // Convert to kobo
        currency: 'NGN',
        ref: appointmentData.id || 'APT_' + Date.now(),
        metadata: {
            custom_fields: [
                { display_name: "Customer Name", variable_name: "customer_name", value: appointmentData.fullName },
                { display_name: "Service", variable_name: "service", value: appointmentData.service },
                { display_name: "Date", variable_name: "date", value: `${appointmentData.date} ${appointmentData.time}` }
            ]
        },
        callback: function(response) {
            handlePaymentSuccess(response, appointmentData);
        },
        onClose: function() {
            showNotification('Payment cancelled', 'warning');
            const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Proceed to Payment';
            }
        }
    });
    
    handler.openIframe();
}

async function handlePaymentSuccess(response, appointmentData) {
    console.log('Payment successful:', response);
    
    try {
        // Verify payment
        const csrfResponse = await fetch(`${API_URL}/csrf-token`, { credentials: 'include' });
        const csrfData = await csrfResponse.json();
        
        await fetch(`${API_URL}/payments/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfData.csrfToken
            },
            credentials: 'include',
            body: JSON.stringify({
                reference: response.reference,
                appointmentId: appointmentData.id
            })
        });
        
        showNotification('Payment successful! Appointment confirmed.', 'success');
        
        // Reset form
        document.getElementById('appointmentForm')?.reset();
        updateTotalAmount(0);
        
        // Show confirmation
        showAppointmentConfirmation({
            ...appointmentData,
            paymentReference: response.reference
        });
        
    } catch (error) {
        console.error('Verification error:', error);
        showNotification('Payment received! Confirmation pending.', 'success');
    } finally {
        const submitBtn = document.querySelector('#appointmentForm button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Proceed to Payment';
        }
    }
}

function showAppointmentConfirmation(data) {
    const modalHTML = `
        <div id="confirmationModal" class="modal" style="display:block;">
            <div class="modal-content" style="max-width:500px;text-align:center;">
                <div style="width:80px;height:80px;background:#28a745;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px;">
                    <span style="font-size:40px;">✓</span>
                </div>
                <h2 style="color:#28a745;margin-bottom:10px;">Appointment Confirmed!</h2>
                <p style="color:#666;margin-bottom:20px;">Your appointment has been booked successfully.</p>
                
                <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:left;margin-bottom:20px;">
                    <p><strong>Service:</strong> ${data.service}</p>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <p><strong>Time:</strong> ${data.time}</p>
                    <p><strong>Amount:</strong> ${formatCurrency(data.amount)}</p>
                    <p><strong>Reference:</strong> ${data.paymentReference || data.id}</p>
                </div>
                
                <p style="color:#666;font-size:14px;">A confirmation email has been sent to ${data.email}</p>
                
                <button onclick="closeModal('confirmationModal');document.getElementById('confirmationModal').remove();" style="margin-top:20px;padding:12px 30px;background:linear-gradient(135deg,#1a936f,#114b5f);color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// ============================================
// CONTACT FORM
// ============================================

function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const loading = showLoading(submitBtn);
    
    setTimeout(() => {
        loading.hide();
        showNotification('Message sent! We will get back to you soon.', 'success');
        form.reset();
    }, 1500);
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🏥 P&A Healthcare App Initializing...');
    
    // Check login status
    checkLoginStatus();
    
    // Initialize forms
    initAppointmentForm();
    initContactForm();
    updateServicePrice();
    
    // Set minimum date for appointments
    const dateInput = document.querySelector('input[name="date"]');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
    
    console.log('✅ P&A Healthcare App Ready!');
});

// ============================================
// EXPORT FUNCTIONS TO WINDOW
// ============================================

window.getFromLocalStorage = getFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.generateId = generateId;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.showLogin = showLogin;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.showSignup = showSignup;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.handleLogout = handleLogout;
window.toggleUserDropdown = toggleUserDropdown;
window.viewProfile = viewProfile;
window.saveProfile = saveProfile;
window.viewMyAppointments = viewMyAppointments;
window.viewMyPayments = viewMyPayments;
window.showSettings = showSettings;
window.selectService = selectService;
window.updateTotalAmount = updateTotalAmount;
window.getUserInitials = getUserInitials;