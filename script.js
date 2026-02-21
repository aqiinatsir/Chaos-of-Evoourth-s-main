// ============================================
// PROFILE MANAGEMENT
// ============================================

/**
 * Load profile data dari localStorage dan tampilkan di modal
 */
function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile display
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').src = currentUser.avatar || getDefaultAvatar();
    
    // Format join date
    const joinDate = new Date(currentUser.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString('id-ID', options);

    // Fill edit form
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editEmail').value = currentUser.email;
}

/**
 * Get default avatar URL
 */
function getDefaultAvatar() {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%232dd4bf" width="200" height="200"/%3E%3Ctext x="50%" y="50%" font-size="100" fill="white" text-anchor="middle" dy=".3em"%3E👤%3C/text%3E%3C/svg%3E';
}

/**
 * Save profile changes
 */
function saveProfile(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newUsername = document.getElementById('editUsername').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();

    if (!newUsername || !newEmail) {
        alert('Username dan Email tidak boleh kosong!');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
        alert('User tidak ditemukan!');
        return;
    }

    currentUser.username = newUsername;
    currentUser.email = newEmail;

    users[userIndex] = currentUser;
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    loadProfile();
    closeModal('editProfileModal');
    showNotification('Profil berhasil diperbarui!', 'success');
}

/**
 * Upload avatar
 */
function handleAvatarUpload(e) {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Ukuran file tidak boleh lebih dari 5MB!', 'error');
        return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('File harus berupa gambar!', 'error');
        return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        currentUser.avatar = event.target.result;
        
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
        }
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        document.getElementById('profileAvatar').src = currentUser.avatar;
        showNotification('Avatar berhasil diperbarui!', 'success');
    };

    reader.onerror = () => {
        showNotification('Gagal membaca file!', 'error');
    };

    reader.readAsDataURL(file);
}

// ============================================
// MODAL MANAGEMENT
// ============================================

/**
 * Open modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// LOGOUT
// ============================================

/**
 * Logout user
 */
function handleLogout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 10px;
        background: ${type === 'success' ? '#2dd4bf' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// NAVIGATION MENU
// ============================================

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

// ============================================
// MODAL EVENT LISTENERS
// ============================================

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
    // Profile Modal
    const profileBtn = document.getElementById('profileBtn');
    const profileModal = document.getElementById('profileModal');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const editProfileBtn = document.getElementById('editProfileBtn');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => openModal('profileModal'));
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => closeModal('profileModal'));
    }

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            closeModal('profileModal');
            openModal('editProfileModal');
        });
    }

    // Edit Profile Modal
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => closeModal('editProfileModal'));
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => closeModal('editProfileModal'));
    }

    // Avatar Upload
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', handleAvatarUpload);
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const profileModal = document.getElementById('profileModal');
        const editModal = document.getElementById('editProfileModal');
        
        if (e.target === profileModal) {
            closeModal('profileModal');
        }
        if (e.target === editModal) {
            closeModal('editProfileModal');
        }
    });
}

// ============================================
// SMOOTH SCROLL OFFSET
// ============================================

/**
 * Adjust scroll offset untuk fixed header
 */
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const element = document.querySelector(href);
                if (element) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                    window.scrollTo({
                        top: elementPosition - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// ============================================
// ANIMATIONS ON SCROLL
// ============================================

/**
 * Setup intersection observer untuk fade-in animations
 */
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideUp 0.6s ease forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .p2w-card, .team-card').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all features when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize features
    setupMobileMenu();
    setupModalListeners();
    setupSmoothScroll();
    setupScrollAnimations();
    loadProfile();
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

/**
 * Close modal with ESC key
 */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('profileModal');
        closeModal('editProfileModal');
    }
});

// ============================================
// P2W SHOP SYSTEM
// ============================================

// ⚙️ KONFIGURASI WHATSAPP
const WHATSAPP_NUMBER = '6285880212494';

/**
 * Format nomor WhatsApp ke format yang readable
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
        const rest = cleaned.substring(2);
        return '+62 ' + rest.substring(0, 3) + '-' + rest.substring(3, 7) + '-' + rest.substring(7);
    }
    return '+' + cleaned;
}

/**
 * Validasi email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Beli Rank via WhatsApp
 */
function buyRank(rankName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli rank *${rankName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

/**
 * Beli Kit via WhatsApp
 */
function buyKit(kitName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli kit *${kitName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

/**
 * Kirim pesan ke WhatsApp
 */
function sendToWhatsApp(message) {
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    // Log pembelian
    logPurchase(message);
    showNotification('Terima kasih! Chat WhatsApp akan segera terbuka.', 'success');
}

/**
 * Log pembelian ke localStorage
 */
function logPurchase(message) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    const purchase = {
        id: generateId(),
        userId: currentUser.id,
        username: currentUser.username,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    purchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

/**
 * Format nomor WhatsApp di halaman jika ada
 */
function initializeWhatsApp() {
    const whatsappElement = document.getElementById('whatsappNumber');
    if (whatsappElement) {
        whatsappElement.textContent = formatPhoneNumber(WHATSAPP_NUMBER);
    }
}

// Call WhatsApp initialization saat DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhatsApp);
} else {
    initializeWhatsApp();
}

// ============================================
// P2W SHOP SYSTEM - CHAOS OF EVOOURTH'S
// ============================================

/**
 * KONFIGURASI WHATSAPP - EDIT NOMOR INI SESUAI SERVER ANDA
 */
const WHATSAPP_NUMBER = '6285880212494';

/**
 * Format nomor WhatsApp ke format readable (+62 XXX-XXXX-XXXX)
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
        const rest = cleaned.substring(2);
        return '+62 ' + rest.substring(0, 3) + '-' + rest.substring(3, 7) + '-' + rest.substring(7);
    }
    return '+' + cleaned;
}

/**
 * Validasi format email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Generate unique ID untuk tracking pembelian
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Beli Rank - Format pesan & kirim ke WhatsApp
 * @param {string} rankName - Nama rank yang dibeli
 * @param {number} price - Harga rank
 */
function buyRank(rankName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli rank *${rankName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

/**
 * Beli Kit - Format pesan & kirim ke WhatsApp
 * @param {string} kitName - Nama kit yang dibeli
 * @param {number} price - Harga kit
 */
function buyKit(kitName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli kit *${kitName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

/**
 * Kirim pesan ke WhatsApp dengan URL wa.me
 * @param {string} message - Pesan yang akan dikirim
 */
function sendToWhatsApp(message) {
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    // Log pembelian ke localStorage
    logPurchase(message);
    showNotification('Terima kasih! Chat WhatsApp akan segera terbuka.', 'success');
}

/**
 * Log semua pembelian ke localStorage untuk tracking & analytics
 * @param {string} message - Pesan pembelian
 */
function logPurchase(message) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    const purchase = {
        id: generateId(),
        userId: currentUser.id,
        username: currentUser.username,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'pending'  // pending -> processing -> completed
    };
    
    purchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));
}

/**
 * Initialize WhatsApp number di halaman jika ada element dengan id 'whatsappNumber'
 */
function initializeWhatsApp() {
    const whatsappElement = document.getElementById('whatsappNumber');
    if (whatsappElement) {
        whatsappElement.textContent = formatPhoneNumber(WHATSAPP_NUMBER);
    }
}

// Call WhatsApp initialization saat DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhatsApp);
} else {
    initializeWhatsApp();
}

// Export functions for global access
window.buyRank = buyRank;
window.buyKit = buyKit;
window.sendToWhatsApp = sendToWhatsApp;
window.logPurchase = logPurchase;

// ============================================
// 13. HAMBURGER MENU MOBILE
// ============================================

/**
 * Setup hamburger menu untuk mobile navigation
 */
function setupHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (!hamburger || !navMenu) return;
    
    /**
     * Toggle hamburger menu active state
     */
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    /**
     * Close menu ketika klik link navigasi
     */
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
    
    /**
     * Close menu ketika klik outside navbar
     */
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.navbar')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
    
    /**
     * Close menu saat resize ke desktop
     */
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
}

/**
 * Initialize hamburger menu saat DOM ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHamburgerMenu);
} else {
    setupHamburgerMenu();
}

// ============================================
// Export hamburger menu function
// ============================================

window.setupHamburgerMenu = setupHamburgerMenu;
