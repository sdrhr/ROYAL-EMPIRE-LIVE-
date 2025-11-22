// ====================== ✅ common.js ======================
// ✅ Base URL for API
// ----------------------------------------------------------
// CORRECT BACKEND URL
// ----------------------------------------------------------
const API_BASE = "https://royal-empire-11.onrender.com";

// ----------------------------------------------------------
// SAFE USER LOADER (FIXES [object Object] ERRORS)
// ----------------------------------------------------------
export async function fetchUserData() {
  let raw = localStorage.getItem("royalEmpireUser");

  if (!raw) {
    console.error("❌ royalEmpireUser missing in localStorage");
    return null;
  }

  // Parse safely
  let userObj;
  try {
    userObj = JSON.parse(raw);
  } catch (e) {
    console.error("❌ royalEmpireUser contains invalid JSON");
    return null;
  }

  // FIX: sometimes email is inside userObj.email.email
  let email = userObj?.email;

  // If email is an object → extract real string
  if (typeof email === "object" && email !== null) {
    email = email.email;
  }

  // If still not a string → reject
  if (typeof email !== "string") {
    console.error("❌ userData.email is not a string:", email);
    return null;
  }

  // ALWAYS lowercase email
  email = email.toLowerCase().trim();

  console.log("📩 Fetching user:", email);

  try {
    const res = await fetch(`${API_BASE}/api/user/${email}`);

    if (!res.ok) throw new Error("User fetch error");

    const data = await res.json();

    // Username fallback
    const username =
      data.username ||
      data.name ||
      (data.email ? data.email.split("@")[0] : "User");

    // Update UI names
    const headerName = document.getElementById("menuUserName");
    if (headerName) headerName.textContent = username;

    // Save for usage
    localStorage.setItem("menuUserName", username);
    localStorage.setItem("totalBalance", (data.balance || 0).toFixed(2));
    localStorage.setItem("eusdtBalance", ((data.balance || 0) * 10).toFixed(2));
    localStorage.setItem("totalEarning", (data.totalEarning || 0).toFixed(2));
    localStorage.setItem(
      "referralEarning",
      (data.referralEarning || 0).toFixed(2)
    );
    localStorage.setItem(
      "totalInvestment",
      (data.totalInvestment || 0).toFixed(2)
    );

    return data;
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
    return null;
  }
}

// ----------------------------------------------------------
// AUTO REFRESH EVERY 30 SECONDS
// ----------------------------------------------------------
export function startAutoRefresh() {
  fetchUserData();
  setInterval(fetchUserData, 30000);
}


// ----------------------------------------------------------
// LOAD USER DATA (from localStorage, fallback to API)
export async function loadUserData() {
  let userData = localStorage.getItem("royalEmpireUser");
  if (!userData) return null;

  userData = JSON.parse(userData);

  try {
    // Always lowercase email
    const email = userData.email?.toLowerCase().trim();
    if (!email) return null;

    const data = await fetchUserData(); // fetches from backend
    return data;
  } catch (err) {
    console.error("❌ loadUserData error:", err);
    return null;
  }
}

// ----------------------------------------------------------
// UPDATE BALANCE IN DOM
// ----------------------------------------------------------
export function updateBalancesDOM() {
  const elements = {
    totalBalance: document.getElementById("total-balance"),
    eusdt: document.getElementById("eusdt-balance"),
    totalEarning: document.getElementById("totalEarning"),
    referralEarning: document.getElementById("referralEarning"),
    totalInvestment: document.getElementById("totalInvestment"),
    profileUserName: document.getElementById("menuUserName"),
    headerUserName: document.getElementById("menuUserName"),
  };

  const values = {
    total: localStorage.getItem("totalBalance") || "0.00",
    eusdt: localStorage.getItem("eusdtBalance") || "0",
    totalEarning: localStorage.getItem("totalEarning") || "0",
    referralEarning: localStorage.getItem("referralEarning") || "0",
    totalInvestment: localStorage.getItem("totalInvestment") || "0",
    name: localStorage.getItem("menuUserName") || "User", // FIXED!!
  };

  if (elements.totalBalance) elements.totalBalance.textContent = values.total;
  if (elements.eusdt) elements.eusdt.textContent = values.eusdt;
  if (elements.totalEarning) elements.totalEarning.textContent = values.totalEarning;
  if (elements.referralEarning) elements.referralEarning.textContent = values.referralEarning;
  if (elements.totalInvestment) elements.totalInvestment.textContent = values.totalInvestment;
  if (elements.profileUserName) elements.profileUserName.textContent = values.name;
  if (elements.headerUserName) elements.headerUserName.textContent = values.name;
}

// ----------------------------------------------------------
// AUTO REFRESH EVERY 10 SECONDS
// ----------------------------------------------------------
export function startAutoRefresh() {
  fetchUserData().then(updateBalancesDOM);

  setInterval(async () => {
    await fetchUserData();
    updateBalancesDOM();
  }, 10000);
}
