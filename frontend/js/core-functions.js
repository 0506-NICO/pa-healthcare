// ============================================
// CORE FUNCTIONS - P&A Institute
// Essential utilities and helpers
// ============================================

// ============================================
// LOCALSTORAGE HELPERS
// ============================================
function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.error('Error reading from localStorage:', e);
        return null;
    }
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

// ============================================
// VALIDATION
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
}

// ============================================
// FORMATTING
// ============================================
function formatCurrency(amount) {
    return '₦' + Number(amount || 0).toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function generateId() {
    return 'ID_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ============================================
// UI HELPERS
// ============================================
function showLoading(button) {
    if (!button) return { hide: () => {} };
    
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Please wait...';
    
    return {
        hide: () => {
            button.disabled = false;
            button.innerHTML = originalText;
        }
    };
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existing = document.querySelector('.notification-toast.show');
    if (existing) {
        existing.classList.remove('show');
    }
    
    let notification = document.getElementById('notification');
    
    // Create notification if it doesn't exist
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification-toast';
        notification.innerHTML = `
            <div class="notification-icon"><i class="fas fa-check"></i></div>
            <div class="notification-content">
                <div class="notification-title" id="notificationTitle">Success!</div>
                <div class="notification-text" id="notificationText"></div>
            </div>
        `;
        document.body.appendChild(notification);
    }
    
    const notifTitle = document.getElementById('notificationTitle');
    const notifText = document.getElementById('notificationText');
    const notifIcon = notification.querySelector('.notification-icon i');
    
    // Set type class
    notification.className = 'notification-toast ' + type;
    
    // Set content based on type
    const config = {
        success: { title: 'Success!', icon: 'fa-check-circle' },
        error: { title: 'Error!', icon: 'fa-exclamation-circle' },
        warning: { title: 'Warning!', icon: 'fa-exclamation-triangle' },
        info: { title: 'Info', icon: 'fa-info-circle' }
    };
    
    const settings = config[type] || config.success;
    
    if (notifTitle) notifTitle.textContent = settings.title;
    if (notifText) notifText.textContent = message;
    if (notifIcon) notifIcon.className = 'fas ' + settings.icon;
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ============================================
// MODAL SYSTEM
// ============================================
function showLogin() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Show login form, hide register form
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const modalTitle = document.getElementById('authModalTitle');
        
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (modalTitle) modalTitle.textContent = 'Login';
    }
}

function showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');
    
    if (loginForm) loginForm.style.display = 'block';
    if (registerForm) registerForm.style.display = 'none';
    if (modalTitle) modalTitle.textContent = 'Login';
}

function showRegisterForm() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const modalTitle = document.getElementById('authModalTitle');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'block';
    if (modalTitle) modalTitle.textContent = 'Create Account';
}

function closeModal(modalId) {
    // If modalId is provided, close that specific modal
    if (modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.classList.remove('show');
            modal.style.display = 'none';
        }
    } else {
        // Close authModal by default
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.remove('active');
            authModal.classList.remove('show');
            authModal.style.display = 'none';
        }
    }
    document.body.style.overflow = '';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// ============================================
// MAKE FUNCTIONS GLOBAL
// ============================================
window.getFromLocalStorage = getFromLocalStorage;
window.saveToLocalStorage = saveToLocalStorage;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.generateId = generateId;
window.showLoading = showLoading;
window.showNotification = showNotification;
window.showLogin = showLogin;
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.closeModal = closeModal;
window.openModal = openModal;

console.log('✅ Core functions loaded');