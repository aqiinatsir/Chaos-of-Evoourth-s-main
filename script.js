// ============================================
// SCRIPT.JS - P2W SHOP SYSTEM
// Chaos of Evoourth's Server
// ============================================

// ⚙️ KONFIGURASI WHATSAPP
const WHATSAPP_NUMBER = '6285880212494';

// ============================================
// 1. INISIALISASI HALAMAN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupEventListeners();
    loadProfile();
});

function initializePage() {
    // Format nomor WhatsApp di halaman
    const whatsappElement = document.getElementById('whatsappNumber');
    if (whatsappElement) {
        whatsappElement.textContent = formatPhoneNumber(WHATSAPP_NUMBER);
    }
    
    // Cek apakah user sudah login
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
    }
}

// ============================================
// 2. PROFILE MANAGEMENT
// ============================================

function loadProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile view
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileAvatar').src = currentUser.avatar || 'default-avatar.png';
    
    // Format join date
    const joinDate = new Date(currentUser.createdAt);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString('id-ID', options);

    // Update edit form fields
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editEmail').value = currentUser.email;
}

function updateProfileInLocalStorage(updatedUser) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
    }
    
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
}

function saveProfile(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const newUsername = document.getElementById('editUsername').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();

    // Validasi input
    if (!newUsername || !newEmail) {
        showAlert('Username dan email tidak boleh kosong!', 'error');
        return;
    }

    if (!isValidEmail(newEmail)) {
        showAlert('Email tidak valid!', 'error');
        return;
    }

    // Update user data
    currentUser.username = newUsername;
    currentUser.email = newEmail;

    updateProfileInLocalStorage(currentUser);
    
    loadProfile();
    closeModal('editProfileModal');
    showAlert('Profil berhasil diperbarui!', 'success');
}

// ============================================
// 3. AVATAR UPLOAD
// ============================================

function setupAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    
    if (!avatarInput) return;
    
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (!file) return;
        
        // Validasi file
        if (!file.type.startsWith('image/')) {
            showAlert('Pilih file gambar yang valid!', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            showAlert('Ukuran gambar tidak boleh lebih dari 5MB!', 'error');
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            currentUser.avatar = event.target.result;
            
            updateProfileInLocalStorage(currentUser);
            document.getElementById('profileAvatar').src = currentUser.avatar;
            showAlert('Avatar berhasil diubah!', 'success');
        };

        reader.onerror = () => {
            showAlert('Gagal membaca file!', 'error');
        };

        reader.readAsDataURL(file);
    });
}

// ============================================
// 4. MODAL MANAGEMENT
// ============================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
    }
}

function setupModalEventListeners() {
    // Profile modal
    const profileBtn = document.getElementById('profileBtn');
    const closeProfileModal = document.getElementById('closeProfileModal');
    const profileModal = document.getElementById('profileModal');

    if (profileBtn) {
        profileBtn.addEventListener('click', () => openModal('profileModal'));
    }

    if (closeProfileModal) {
        closeProfileModal.addEventListener('click', () => closeModal('profileModal'));
    }

    // Edit profile modal
    const editProfileBtn = document.getElementById('editProfileBtn');
    const closeEditModal = document.getElementById('closeEditModal');
    const editModal = document.getElementById('editProfileModal');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            closeModal('profileModal');
            openModal('editProfileModal');
        });
    }

    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => closeModal('editProfileModal'));
    }

    // Cancel edit button
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', () => closeModal('editProfileModal'));
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            closeModal('profileModal');
        }
        if (e.target === editModal) {
            closeModal('editProfileModal');
        }
    });

    // Prevent modal close when clicking inside
    const profileContent = document.querySelector('.profile-modal');
    const editContent = document.querySelector('.edit-modal');

    if (profileContent) {
        profileContent.addEventListener('click', (e) => e.stopPropagation());
    }
    if (editContent) {
        editContent.addEventListener('click', (e) => e.stopPropagation());
    }
}

// ============================================
// 5. RANK & KIT PURCHASE
// ============================================

function buyRank(rankName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showAlert('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli rank *${rankName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

function buyKit(kitName, price) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showAlert('Silakan login terlebih dahulu!', 'error');
        return;
    }

    const message = `Halo, saya ingin membeli kit *${kitName}* seharga *Rp ${price.toLocaleString('id-ID')}*.\n\nUsername Minecraft saya: ${currentUser.username}\nEmail: ${currentUser.email}`;
    
    sendToWhatsApp(message);
}

function sendToWhatsApp(message) {
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    // Log pembelian
    logPurchase(message);
}

function logPurchase(message) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
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

// ============================================
// 6. LOGOUT
// ============================================

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!logoutBtn) return;
    
    logoutBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin logout?')) {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        }
    });
}

// ============================================
// 7. UTILITY FUNCTIONS
// ============================================

function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
        const rest = cleaned.substring(2);
        return '+62 ' + rest.substring(0, 3) + '-' + rest.substring(3, 7) + '-' + rest.substring(7);
    }
    return '+' + cleaned;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showAlert(message, type = 'info') {
    // Buat elemen alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background-color: ${getAlertColor(type)};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideIn 0.3s ease-in-out;
        font-weight: 500;
        max-width: 300px;
    `;
    
    document.body.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease-in-out';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

function getAlertColor(type) {
    const colors = {
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#3B82F6'
    };
    return colors[type] || colors['info'];
}

// ============================================
// 8. FORM HANDLING
// ============================================

function setupFormHandling() {
    const editProfileForm = document.getElementById('editProfileForm');
    
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', saveProfile);
    }
}

// ============================================
// 9. SETUP EVENT LISTENERS
// ============================================

function setupEventListeners() {
    setupModalEventListeners();
    setupAvatarUpload();
    setupLogout();
    setupFormHandling();
    setupBuyButtons();
}

function setupBuyButtons() {
    // Buy buttons sudah menggunakan onclick inline, tapi kita bisa tambahkan validasi tambahan
    const buyButtons = document.querySelectorAll('.buy-btn');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Cek apakah user sudah login
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                e.preventDefault();
                showAlert('Silakan login terlebih dahulu!', 'error');
            }
        });
    });
}

// ============================================
// 10. ANIMASI CSS (Tambahan)
// ============================================

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

    .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }

    .btn-primary:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// ============================================
// 11. RESPONSIVE ADJUSTMENTS
// ============================================

function setupResponsive() {
    const handleResize = () => {
        // Tambahkan logic responsive jika diperlukan
    };
    
    window.addEventListener('resize', handleResize);
}

setupResponsive();

// ============================================
// 12. ERROR HANDLING
// ============================================

window.addEventListener('error', (e) => {
    console.error('Error:', e.error);
    // Bisa tambahkan error tracking ke server jika diperlukan
});

// ============================================
// EXPORT FUNCTIONS (untuk global access)
// ============================================

window.buyRank = buyRank;
window.buyKit = buyKit;
window.saveProfile = saveProfile;
window.loadProfile = loadProfile;
window.openModal = openModal;
window.closeModal = closeModal;
