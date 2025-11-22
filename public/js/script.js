// ==================== GLOBAL STATE ====================
// ==================== GLOBAL STATE ====================
let currentUser = {
  email: "",
  username: "",
  balance: 0,
  totalInvestment: 0,
  totalEarnings: 0,
  availableBalance: 0,
  eusdt: 0,
  todayEarnings: 0,
};

let balanceVisible = false;
let selectedPackageAmount = 0;

// ==================== CONSTANTS ====================


// ==================== UNIVERSAL SAVE FUNCTION ====================



// ==================== LOAD USER ====================
function loadUserData() {
  const data = localStorage.getItem("royalEmpireUser");
  if (!data) return;

  const user = JSON.parse(data);

  currentUser.email = String(user.email || "").trim();
  currentUser.username = user.username || user.email;
  currentUser.balance = Number(user.balance || 0);

  updateUserDisplay();
}

// ==================== CAPTCHA ====================
function generateCaptcha() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/* auth.js - login + register (client-side) */
/* Drop this into your page or include as a module script. */

(() => {
  const API_BASE = "https://royal-empire-11.onrender.com";

  // Save canonical user object used by other scripts
  function saveRoyalUser(email, username = "", balance = 0) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const userObj = {
      email: normalizedEmail,
      username: username || (normalizedEmail.split ? normalizedEmail.split("@")[0] : "User"),
      balance: Number(balance || 0)
    };
    localStorage.setItem("royalEmpireUser", JSON.stringify(userObj));
    localStorage.setItem("royalEmpireEmail", normalizedEmail);
    localStorage.setItem("email", normalizedEmail); // some scripts expect this key
    localStorage.setItem("isLoggedIn", "true");
    return userObj;
  }

  // Basic contact validation (email or phone)
  function isValidContact(value) {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (emailRegex.test(value)) return true;
    if (phoneRegex.test(value.replace(/\s/g, ""))) return true;
    return false;
  }

  // Registration handler
  async function handleRegistration(e) {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const nameEl = document.getElementById("name");
      const usernameEl = document.getElementById("username");
      const emailEl = document.getElementById("email");
      const passwordEl = document.getElementById("password");
      const countryEl = document.getElementById("country");
      const referralEl = document.getElementById("referralCode");
      const captchaInputEl = document.getElementById("captchaInput");
      const captchaCodeEl = document.getElementById("captchaCode");

      const name = nameEl ? nameEl.value.trim() : "";
      const username = usernameEl ? usernameEl.value.trim() : "";
      const emailRaw = emailEl ? emailEl.value.trim() : "";
      const email = emailRaw.toLowerCase();
      const password = passwordEl ? passwordEl.value : "";
      const country = countryEl ? countryEl.value : "";
      const referralCode = referralEl ? referralEl.value || null : null;
      const captchaInput = captchaInputEl ? captchaInputEl.value : "";
      const captchaCode = captchaCodeEl ? captchaCodeEl.textContent : "";

      // Validation
      if (!name || !username || !email || !password || !country || !captchaInput) {
        alert("Please fill all required fields.");
        return;
      }
      if (!isValidContact(email)) {
        alert("Please enter a valid email or phone.");
        emailEl && emailEl.focus();
        return;
      }
      if (captchaInput.toUpperCase() !== (captchaCode || "").toUpperCase()) {
        alert("Invalid captcha code.");
        if (captchaCodeEl) captchaCodeEl.textContent = (window.generateCaptcha && generateCaptcha()) || "XXXX";
        if (captchaInputEl) captchaInputEl.value = "";
        return;
      }

      // Call backend
      const payload = { name, username, email, password, country, referralCode };
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Save canonical user and redirect
      saveRoyalUser(email, username || name, 0);
      alert("✅ Registration successful — redirecting to dashboard...");
      setTimeout(() => (window.location.href = "dashboard.html"), 700);

    } catch (err) {
      console.error("Registration error:", err);
      // Even on failure, store the typed email so other pages don't break
      try {
        const emailEl = document.getElementById("email");
        if (emailEl && emailEl.value) {
          // Save minimal user with email only
          saveRoyalUser(emailEl.value, emailEl.value.split ? emailEl.value.split("@")[0] : "");
        }
      } catch (e) {}
      alert("Registration failed: " + (err.message || err));
    }
  }

  // Login handler
  async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();

    try {
      const emailEl = document.getElementById("login-email");
      const passEl = document.getElementById("login-password");
      const captchaInputEl = document.getElementById("login-captcha-input");
      const captchaCodeEl = document.getElementById("loginCaptchaCode");

      const emailRaw = emailEl ? emailEl.value.trim() : "";
      const email = emailRaw.toLowerCase();
      const password = passEl ? passEl.value : "";
      const captchaInput = captchaInputEl ? captchaInputEl.value : "";
      const captchaCode = captchaCodeEl ? captchaCodeEl.textContent : "";

      // Force-save typed email immediately — prevents undefined fetch later
      if (emailRaw) {
        localStorage.setItem("royalEmpireEmail", email);
        localStorage.setItem("email", email);
      }

      if (!email || !password) {
        alert("Please enter email and password.");
        return;
      }

      if (!isValidContact(email)) {
        alert("Please enter a valid email or phone.");
        if (emailEl) emailEl.focus();
        return;
      }

      if (captchaCodeEl && captchaInputEl) {
        if ((captchaInput || "").toUpperCase() !== (captchaCode || "").toUpperCase()) {
          alert("Invalid captcha");
          captchaCodeEl.textContent = (window.generateCaptcha && generateCaptcha()) || "XXXX";
          captchaInputEl.value = "";
          return;
        }
      }

      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save complete user object used across app
      saveRoyalUser(data.email || email, data.username || (email.split ? email.split("@")[0] : ""), data.balance || 0);

      alert("✅ Login successful — redirecting to dashboard...");
      setTimeout(() => (window.location.href = "dashboard.html"), 400);

    } catch (err) {
      console.error("Login error:", err);
      // Keep the typed email stored so other pages can use it to avoid undefined
      const emailEl = document.getElementById("login-email");
      if (emailEl && emailEl.value) {
        localStorage.setItem("royalEmpireEmail", emailEl.value.trim().toLowerCase());
        localStorage.setItem("email", emailEl.value.trim().toLowerCase());
      }
      alert("Login failed: " + (err.message || err));
    }
  }

  // Attach handlers when DOM is ready
  function attachHandlers() {
    const regForm = document.getElementById("registration-form");
    if (regForm) regForm.addEventListener("submit", handleRegistration);

    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", handleLogin);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachHandlers);
  } else {
    attachHandlers();
  }

  // Expose functions for debugging if needed
  window.royalAuth = {
    handleLogin,
    handleRegistration,
    saveRoyalUser
  };
})();

// ==================== OTHER FEATURES ====================

function initializeSupportButtons() {
  const supportButtons = document.querySelectorAll('.btn-support');
  supportButtons.forEach(button => {
    button.addEventListener('click', function () {
      const text = this.textContent.trim();
      if (text.includes('Chat')) {
        alert('Live chat is now active!');
      } else if (text.includes('Email')) {
        window.location.href = 'mailto:support@royalempire.com';
      } else if (text.includes('Call')) {
        alert('Calling support...');
      }
    });
  });
}


// Enhanced social login functions
function signInWithGoogle() {
    console.log('Google sign-in initiated');
    
    // Show loading state
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        googleBtn.disabled = true;
    }
    
    // Simulate API call to Google
    setTimeout(function() {
        // For demo purposes, we'll generate a random user
        const randomNames = ['Royal-empire member'];
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        
        // Set user data
        currentUser.name = randomName;
        currentUser.username = randomName.toLowerCase().replace(' ', '');
        currentUser.balance = 0;
        currentUser.totalInvestment = 0;
        currentUser.totalEarnings = 0;
        currentUser.availableBalance = 0;
        currentUser.eusdt = 0;
        currentUser.todayEarnings = 0;
        
        // Save user data
        saveUserData();
        
        // Show success message
        alert('Successfully signed in with Google! Welcome ' + randomName);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 2000);
}

function signInWithApple() {
    console.log('Apple sign-in initiated');
    
    // Show loading state
    const appleBtn = document.querySelector('.btn-apple');
    if (appleBtn) {
        const originalText = appleBtn.innerHTML;
        appleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        appleBtn.disabled = true;
    }
    
    // Simulate API call to Apple
    setTimeout(function() {
        // For demo purposes, we'll generate a random user
        const randomNames = ['Chris Taylor', 'Lisa Anderson', 'David Wilson', 'Maria Garcia', 'Robert Lee'];
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        
        // Set user data
        currentUser.name = randomName;
        currentUser.username = randomName.toLowerCase().replace(' ', '');
        currentUser.balance = 0;
        currentUser.totalInvestment = 0;
        currentUser.totalEarnings = 0;
        currentUser.availableBalance = 0;
        currentUser.eusdt = 0;
        currentUser.todayEarnings = 0;
        
        // Save user data
        saveUserData();
        
        // Show success message
        alert('Successfully signed in with Apple! Welcome ' + randomName);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 2000);
}

// Validate if input is a phone number or email
function isValidContact(value) {
    if (!value) return false;
    
    // Check if it's an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
        return true;
    }
    
    // Check if it's a phone number (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    const cleanValue = value.replace(/\s/g, '');
    if (phoneRegex.test(cleanValue)) {
        return true;
    }
    
    return false;
}

// ==================== DASHBOARD FUNCTIONS ====================

// Menu functionality
function toggleMenu(show) {
    const menuOverlay = document.getElementById('menu-overlay');
    if (!menuOverlay) return;
    
    if (show === undefined) {
        // Toggle current state
        menuOverlay.classList.toggle('active');
    } else {
        // Set specific state
        if (show) {
            menuOverlay.classList.add('active');
        } else {
            menuOverlay.classList.remove('active');
        }
    }
}

// Navigate to dashboard section
function navigateToSection(section) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(`dashboard-${section}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update menu items
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Activate current menu item based on section
    let activeIndex = 0;
    if (section === 'main') activeIndex = 0;
    if (section === 'transactions') activeIndex = 1;
    
    if (menuItems[activeIndex]) {
        menuItems[activeIndex].classList.add('active');
    }
    
    // Close menu
    toggleMenu(false);
}

// Show dashboard section (for buttons)
function showDashboardSection(section) {
    navigateToSection(section);
}

// Toggle balance display
function toggleBalanceDisplay() {
    balanceVisible = !balanceVisible;
    
    const mainBalanceAmount = document.getElementById('mainBalanceAmount');
    const headerBalanceIcon = document.getElementById('headerBalanceIcon');
    const headerBalanceText = document.getElementById('headerBalanceText');
    
    if (mainBalanceAmount) {
        if (balanceVisible) {
            mainBalanceAmount.textContent = '$' + currentUser.balance.toFixed(2);
        } else {
            mainBalanceAmount.textContent = '****';
        }
    }
    
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

// Enhanced logout function
function logout() {
    console.log('Logging out...');
    
    // Clear user data
    currentUser = {
        name: '',
        username: '',
        balance: 0,
        totalInvestment: 0,
        totalEarnings: 0,
        availableBalance: 0,
        eusdt: 0,
        todayEarnings: 0
    };
    
    // Save empty user data
    saveUserData();
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// ==================== INVESTMENT PACKAGE FUNCTIONS ====================
// ==================== START EMPIRE FEATURE ====================

 

// ==================== REFERRAL FUNCTIONS ====================

// Copy referral code to clipboard
function copyReferralCode() {
    const referralCode = "ROYAL-58742";
    
    // Create a temporary textarea to copy from
    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = referralCode;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    tempTextArea.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert('Referral code copied to clipboard: ' + referralCode);
        } else {
            alert('Failed to copy referral code. Please try again.');
        }
    } catch (err) {
        alert('Failed to copy referral code: ' + err);
    }
    
    document.body.removeChild(tempTextArea);
}

// ==================== NEW FUNCTIONS FOR REQUESTED CHANGES ====================



// Function to make support buttons work
function initializeSupportButtons() {
    const supportButtons = document.querySelectorAll('.btn-support');
    supportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const buttonText = this.textContent.trim();
            
            if (buttonText.includes('Chat') || buttonText.includes('Start Chat')) {
                // Live Chat functionality
                alert('Live chat is now active! Our support team will assist you shortly.');
            } else if (buttonText.includes('Email') || buttonText.includes('Send Email')) {
                // Email functionality
                window.location.href = 'mailto:support@royalempire.com?subject=Royal Empire Support&body=Hello, I need assistance with:';
            } else if (buttonText.includes('Call') || buttonText.includes('Call Now')) {
                // Phone functionality
                alert('Call functionality activated! You would be connected to our support team at +1 (555) 123-4567.');
            }
        });
    });
}

// Support page specific functions
function startLiveChat() {
    alert('Live chat is now active! Our support team will assist you shortly.');
}

function sendEmail() {
    window.location.href = 'mailto:support@royalempire.com?subject=Royal Empire Support&body=Hello, I need assistance with:';
}

function makeCall() {
    alert('Call functionality activated! You would be connected to our support team at +1 (555) 123-4567.');
}
// ==================== GLOBAL STATE ===================
