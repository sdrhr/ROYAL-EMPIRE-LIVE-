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

// ==================== CONTACT VALIDATION ====================
function isValidContact(value) {
  if (!value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;

  return emailRegex.test(value) || phoneRegex.test(value.replace(/\s/g, ""));
}

// ==================== UI UPDATE ====================
function updateUserDisplay() {
  document.getElementById("headerUserName").textContent =
    currentUser.username || "";
  document.getElementById("profileUserName").textContent =
    currentUser.username || "";
  document.getElementById("menuUserName").textContent =
    currentUser.username || "";

  const balEl = document.getElementById("mainBalanceAmount");
  if (balEl) {
    balEl.textContent = balanceVisible
      ? "$" + currentUser.balance.toFixed(2)
      : "****";
  }

  const eusdtEl = document.getElementById("mainEusdtAmount");
  if (eusdtEl) {
    currentUser.eusdt = Math.floor(currentUser.balance * 10);
    eusdtEl.textContent = currentUser.eusdt.toLocaleString();
  }
}

// ==================== TOGGLE BALANCE ====================
function toggleBalanceDisplay() {
  balanceVisible = !balanceVisible;
  updateUserDisplay();

  const icon = document.getElementById("headerBalanceIcon");
  const text = document.getElementById("headerBalanceText");

  if (balanceVisible) {
    icon.className = "fas fa-eye";
    text.textContent = "Hide Balance";
  } else {
    icon.className = "fas fa-eye-slash";
    text.textContent = "Show Balance";
  }
}

// ==================== REGISTRATION ====================
async function handleRegistration(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const referralCode =
    document.getElementById("referralCode")?.value || null;
  const country = document.getElementById("country").value;

  const captchaInput = document.getElementById("captchaInput").value;
  const captchaCode = document.getElementById("captchaCode").textContent;

  if (
    !name ||
    !username ||
    !email ||
    !password ||
    !country ||
    !captchaInput
  ) {
    alert("Please fill all required fields.");
    return;
  }

  if (!isValidContact(email)) {
    alert("Invalid email or phone number.");
    return;
  }

  if (captchaInput.toUpperCase() !== captchaCode) {
    alert("Invalid captcha.");
    document.getElementById("captchaCode").textContent = generateCaptcha();
    return;
  }

  try {
    const res = await fetch("https://royal-empire-11.onrender.com/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        username,
        email,
        password,
        country,
        referralCode,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

   if (!res.ok) throw new Error(data.message);

// SAVE FULL USER OBJECT
localStorage.setItem(
  "royalEmpireUser",
  JSON.stringify({
    _id: data.user._id,
    email: data.user.email,
    username: data.user.username,
    balance: data.user.balance || 0
  })
);

alert("Login successful!");
window.location.href = "dashboard.html";


    alert("Registration successful!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Registration failed: " + err.message);
  }
}

// ==================== LOGIN ====================
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Enter email & password.");
    return;
  }

  try {
    const res = await fetch("https://royal-empire-11.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact: email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

   if (!res.ok) throw new Error(data.message);

// SAVE FULL USER OBJECT
localStorage.setItem(
  "royalEmpireUser",
  JSON.stringify({
    _id: data.user._id,
    email: data.user.email,
    username: data.user.username,
    balance: data.user.balance || 0
  })
);

alert("Login successful!");
window.location.href = "dashboard.html";

    alert("Login successful!");
    window.location.href = "dashboard.html";
  } catch (err) {
    alert("Login failed: " + err.message);
  }
}

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
