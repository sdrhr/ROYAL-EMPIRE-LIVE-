// menu.js - Common menu functionality for all pages
(() => {
  let balanceVisible = true;

let currentUser = null;





// Check if user is logged in
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('royalEmpireUser');
    
    if (!isLoggedIn || !savedUser) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    updateUserDisplay();
}

// Update user display
function updateUserDisplay() {
    // Always get fresh data from localStorage
    const savedUser = localStorage.getItem('royalEmpireUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    if (!currentUser) return;
    
    // Update user name in all elements
    const headerUserName = document.getElementById('headerUserName');
    const menuUserName = document.getElementById('menuUserName');
    if (headerUserName) headerUserName.textContent = currentUser.username || currentUser.email;
if (menuUserName) menuUserName.textContent = currentUser.username || currentUser.email;

    
    // Update balance if elements exist
    const mainBalanceAmount = document.getElementById('mainBalanceAmount');
    const mainEusdtAmount = document.getElementById('mainEusdtAmount');
    
    if (mainBalanceAmount) {
        if (balanceVisible) {
            mainBalanceAmount.textContent = '$' + (currentUser.balance || 0).toFixed(2);
        } else {
            mainBalanceAmount.textContent = '****';
        }
    }
    
    if (mainEusdtAmount) {
        mainEusdtAmount.textContent = (currentUser.eusdt || 0).toLocaleString();
    }
}

// Toggle balance display
function toggleBalanceDisplay() {
    balanceVisible = !balanceVisible;
    updateUserDisplay();
    
    const headerBalanceIcon = document.getElementById('headerBalanceIcon');
    const headerBalanceText = document.getElementById('headerBalanceText');
    
    if (headerBalanceIcon && headerBalanceText) {
        if (balanceVisible) {
            headerBalanceIcon.className = 'fas fa-eye';
            headerBalanceText.textContent = 'Hide Balance';
        } else {
            headerBalanceIcon.className = 'fas fa-eye-slash';
            headerBalanceText.textContent = 'Show Balance';
        }
    }
}

// Menu functionality
function toggleMenu(show) {
    const menuOverlay = document.getElementById('menu-overlay');
    if (!menuOverlay) return;
    
    if (show === undefined) {
        menuOverlay.classList.toggle('active');
    } else {
        if (show) {
            menuOverlay.classList.add('active');
        } else {
            menuOverlay.classList.remove('active');
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Initialize menu for all pages
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu system loaded');
    checkLogin();
    
    // Update user display every 5 seconds
    setInterval(updateUserDisplay, 5000);
})
})();
// menu.js - Common menu functionality for all pages
(() => {
  let balanceVisible = true;

let currentUser = null;





// Check if user is logged in
function checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const savedUser = localStorage.getItem('royalEmpireUser');
    
    if (!isLoggedIn || !savedUser) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(savedUser);
    updateUserDisplay();
}

// Update user display
function updateUserDisplay() {
    // Always get fresh data from localStorage
    const savedUser = localStorage.getItem('royalEmpireUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
    }
    
    if (!currentUser) return;
    
    // Update user name in all elements
    const headerUserName = document.getElementById('headerUserName');
    const menuUserName = document.getElementById('menuUserName');
    if (headerUserName) headerUserName.textContent = currentUser.username || currentUser.email;
if (menuUserName) menuUserName.textContent = currentUser.username || currentUser.email;

    
    // Update balance if elements exist
    const mainBalanceAmount = document.getElementById('mainBalanceAmount');
    const mainEusdtAmount = document.getElementById('mainEusdtAmount');
    
    if (mainBalanceAmount) {
        if (balanceVisible) {
            mainBalanceAmount.textContent = '$' + (currentUser.balance || 0).toFixed(2);
        } else {
            mainBalanceAmount.textContent = '****';
        }
    }
    
    if (mainEusdtAmount) {
        mainEusdtAmount.textContent = (currentUser.eusdt || 0).toLocaleString();
    }
}

// Toggle balance display
function toggleBalanceDisplay() {
    balanceVisible = !balanceVisible;
    updateUserDisplay();
    
    const headerBalanceIcon = document.getElementById('headerBalanceIcon');
    const headerBalanceText = document.getElementById('headerBalanceText');
    
    if (headerBalanceIcon && headerBalanceText) {
        if (balanceVisible) {
            headerBalanceIcon.className = 'fas fa-eye';
            headerBalanceText.textContent = 'Hide Balance';
        } else {
            headerBalanceIcon.className = 'fas fa-eye-slash';
            headerBalanceText.textContent = 'Show Balance';
        }
    }
}

// Menu functionality
function toggleMenu(show) {
    const menuOverlay = document.getElementById('menu-overlay');
    if (!menuOverlay) return;
    
    if (show === undefined) {
        menuOverlay.classList.toggle('active');
    } else {
        if (show) {
            menuOverlay.classList.add('active');
        } else {
            menuOverlay.classList.remove('active');
        }
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}

// Initialize menu for all pages
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu system loaded');
    checkLogin();
    
    // Update user display every 5 seconds
    setInterval(updateUserDisplay, 5000);
})
})();