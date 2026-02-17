// ============================================
// KONFIGURASI PEMBAYARAN
// ============================================
const PAYMENT_CONFIG = {
    dana: {
        number: '085880212494',
        name: 'DANA',
        displayNumber: '0858 8021 2494'
    },
    ovo: {
        number: '085880212494',
        name: 'OVO',
        displayNumber: '0858 8021 2494'
    },
    gopay: {
        number: '085880212494',
        name: 'GoPay',
        displayNumber: '0858 8021 2494'
    },
    qris: {
        number: '085880212494',
        name: 'QRIS (DANA)',
        displayNumber: '0858 8021 2494'
    }
};

const WHATSAPP_NUMBER = '6285880212494';

let currentItem = {
    type: '',
    name: '',
    price: 0
};

let selectedPaymentMethod = '';
let qrisQRCode = null;

// ============================================
// PAYMENT FUNCTIONS
// ============================================

// Open Payment Modal
function openPaymentModal(type, name, price) {
    currentItem = { type, name, price };
    selectedPaymentMethod = '';
    
    const itemNameEl = document.getElementById('paymentItemName');
    const itemPriceEl = document.getElementById('paymentItemPrice');
    
    if (itemNameEl) itemNameEl.textContent = type === 'rank' ? `Rank ${name}` : name;
    if (itemPriceEl) itemPriceEl.textContent = `Rp ${price.toLocaleString('id-ID')}`;
    
    // Reset payment selection
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    document.querySelectorAll('.payment-details').forEach(details => details.classList.remove('active'));
    
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) confirmBtn.disabled = true;
    
    openModal('paymentModal');
}

// Select Payment Method
function selectPayment(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-option').forEach(opt => opt.classList.remove('selected'));
    const selectedOpt = document.querySelector(`[data-method="${method}"]`);
    if (selectedOpt) selectedOpt.classList.add('selected');
    
    // Hide all details first
    document.querySelectorAll('.payment-details').forEach(details => details.classList.remove('active'));
    
    // Show selected payment details
    const detailsEl = document.getElementById(`${method}Details`);
    if (detailsEl) detailsEl.classList.add('active');
    
    // Enable confirm button
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    if (confirmBtn) confirmBtn.disabled = false;
    
    // Generate QRIS if selected
    if (method === 'qris') {
        setTimeout(generateQRIS, 100);
    }
}

// Generate QRIS Code
function generateQRIS() {
    const canvas = document.getElementById('qrisCanvas');
    if (!canvas) return;
    
    canvas.innerHTML = '';
    
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        // Load QRCode library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        script.onload = () => createQRCode(canvas);
        document.head.appendChild(script);
    } else {
        createQRCode(canvas);
    }
}

function createQRCode(canvas) {
    try {
        new QRCode(canvas, {
            text: PAYMENT_CONFIG.qris.number,
            width: 180,
            height: 180,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (e) {
        console.error('QR Code generation failed:', e);
        canvas.innerHTML = '<p style="color: #666; font-size: 12px;">QR Code tidak dapat dibuat</p>';
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('✅ Nomor berhasil disalin!');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('✅ Nomor berhasil disalin!');
    } catch (err) {
        showToast('❌ Gagal menyalin nomor');
    }
    
    document.body.removeChild(textArea);
}

// Show Toast Notification
function showToast(message) {
    let toast = document.getElementById('toast');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #28a745;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// Confirm Payment
function confirmPayment() {
    if (!selectedPaymentMethod) {
        showToast('❌ Silakan pilih metode pembayaran!');
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const paymentInfo = PAYMENT_CONFIG[selectedPaymentMethod];
    
    const itemType = currentItem.type === 'rank' ? 'Rank' : 'Kit';
    const username = currentUser ? currentUser.username : 'Guest';
    
    const message = `Halo Admin Chaos of Evoourth's! 👋

Saya ingin membeli:
📦 *${itemType}*: ${currentItem.name}
💰 *Harga*: Rp ${currentItem.price.toLocaleString('id-ID')}
💳 *Metode Pembayaran*: ${paymentInfo.name}
👤 *Username Minecraft*: ${username}

Saya sudah melakukan pembayaran ke nomor ${paymentInfo.name}: ${paymentInfo.displayNumber}

Mohon konfirmasi dan proses pembelian saya. Terima kasih! 🙏`;

    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappURL, '_blank');
    
    // Close modal
    closeModal('paymentModal');
}

// ============================================
// HAMBURGER MENU RESPONSIVE
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger if it doesn't exist
    if (!document.querySelector('.hamburger')) {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            const hamburger = document.createElement('div');
            hamburger.className = 'hamburger';
            hamburger.innerHTML = '<span></span><span></span><span></span>';
            const userSection = document.querySelector('.user-section');
            if (userSection) {
                navbar.insertBefore(hamburger, userSection);
            } else {
                navbar.appendChild(hamburger);
            }
        }
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Toggle menu on hamburger click
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (hamburger) hamburger.classList.remove('active');
            if (navMenu) navMenu.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        const isClickInsideNav = navbar.contains(event.target);
        
        if (!isClickInsideNav && navMenu && navMenu.classList.contains('active')) {
            if (hamburger) hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    // Handle window resize
    let isDesktop = window.innerWidth > 768;
    
    window.addEventListener('resize', function() {
        const currentSize = window.innerWidth > 768;
        
        if (currentSize !== isDesktop) {
            isDesktop = currentSize;
            
            if (isDesktop) {
                // Remove mobile menu
                if (hamburger) hamburger.classList.remove('active');
                if (navMenu) navMenu.classList.remove('active');
            }
        }
    });

    // Initialize payment modal close handlers
    initPaymentModalHandlers();
});

// Initialize Payment Modal Handlers
function initPaymentModalHandlers() {
    const closePaymentModal = document.getElementById('closePaymentModal');
    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', () => {
            closeModal('paymentModal');
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const paymentModal = document.getElementById('paymentModal');
        if (e.target === paymentModal) {
            closeModal('paymentModal');
        }
    });
}

// ============================================
// MODAL HANDLING
// ============================================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// ============================================
// FORM VALIDATION
// ============================================
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// ============================================
// LOADING ANIMATION
// ============================================
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

// ============================================
// MOBILE MENU HEIGHT ADJUSTMENT
// ============================================
function adjustMenuHeight() {
    const navMenu = document.querySelector('.nav-menu');
    if (navMenu && navMenu.classList.contains('active')) {
        const menuItems = navMenu.querySelectorAll('li').length;
        const itemHeight = 60; // approximate height per item
        navMenu.style.maxHeight = (menuItems * itemHeight) + 'px';
    }
}

window.addEventListener('resize', adjustMenuHeight);

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// ============================================
// ANALYTICS & TRACKING
// ============================================
function trackEvent(eventName, details = {}) {
    console.log(`Event: ${eventName}`, details);
    // Add your analytics code here
}

// ============================================
// INITIALIZATION
// ============================================
(function init() {
    console.log('Chaos of Evoourth\'s initialized');
    adjustMenuHeight();
})();

// ============================================
// CSS ANIMATIONS (Injected dynamically)
// ============================================
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
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
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal.show {
            opacity: 1;
        }
        
        .modal-content {
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .modal.show .modal-content {
            transform: scale(1);
        }
        
        .close {
            position: absolute;
            top: 15px;
            right: 20px;
            font-size: 28px;
            cursor: pointer;
            color: #666;
            transition: color 0.3s ease;
        }
        
        .close:hover {
            color: #333;
        }
    `;
    document.head.appendChild(style);
})();
