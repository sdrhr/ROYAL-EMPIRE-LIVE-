// ====================== ✅ common.js ======================

// ----------------------------------------------------------
// CORRECT BACKEND URL
// ----------------------------------------------------------
export const API_BASE = "https://royal-empire-11.onrender.com";

// ----------------------------------------------------------
// SAFE EMAIL LOADER (NEVER RETURNS {} or undefined)
// ----------------------------------------------------------
function getSafeEmail() {
  let email = null;

  // 1) Try from royalEmpireUser
  const raw = localStorage.getItem("royalEmpireUser");
  if (raw) {
    try {
      const obj = JSON.parse(raw);

      if (typeof obj.email === "string") {
        email = obj.email;
      }

      // FIX: some broken data stored email as an object → extract real one
      if (typeof obj.email === "object" && obj.email !== null) {
        if (typeof obj.email.email === "string") {
          email = obj.email.email;
        }
      }
    } catch (e) {
      console.warn("⚠️ Bad royalEmpireUser JSON");
    }
  }

  // 2) Fallbacks (very important!)
  if (!email) email = localStorage.getItem("royalEmpireEmail");
  if (!email) email = localStorage.getItem("email");

  if (!email || typeof email !== "string") {
    console.error("❌ No valid email found anywhere.");
    return null;
  }

  return email.toLowerCase().trim();
}

// ----------------------------------------------------------
// FETCH USER DATA FROM BACKEND
// ----------------------------------------------------------
export async function fetchUserData() {
  const email = getSafeEmail();

  if (!email) {
    console.error("❌ Cannot fetch: Email missing");
    return null;
  }

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

    // SAVE updated values
    localStorage.setItem("menuUserName", username);
    localStorage.setItem("totalBalance", (data.balance || 0).toFixed(2));
    localStorage.setItem("eusdtBalance", ((data.balance || 0) * 10).toFixed(2));
    localStorage.setItem("totalEarning", (data.totalEarning || 0).toFixed(2));
    localStorage.setItem("referralEarning", (data.referralEarning || 0).toFixed(2));
    localStorage.setItem("totalInvestment", (data.totalInvestment || 0).toFixed(2));

    return data;
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
    return null;
  }
}

// ----------------------------------------------------------
// UPDATE BALANCE ON SCREEN
// ----------------------------------------------------------
export function updateBalancesDOM() {
  const id = (x) => document.getElementById(x);

  const values = {
    total: localStorage.getItem("totalBalance") || "0.00",
    eusdt: localStorage.getItem("eusdtBalance") || "0",
    totalEarning: localStorage.getItem("totalEarning") || "0",
    referralEarning: localStorage.getItem("referralEarning") || "0",
    totalInvestment: localStorage.getItem("totalInvestment") || "0",
    name: localStorage.getItem("menuUserName") || "User",
  };

  if (id("total-balance")) id("total-balance").textContent = values.total;
  if (id("eusdt-balance")) id("eusdt-balance").textContent = values.eusdt;
  if (id("totalEarning")) id("totalEarning").textContent = values.totalEarning;
  if (id("referralEarning")) id("referralEarning").textContent = values.referralEarning;
  if (id("totalInvestment")) id("totalInvestment").textContent = values.totalInvestment;

  if (id("menuUserName")) id("menuUserName").textContent = values.name;
  if (id("profileUserName")) id("profileUserName").textContent = values.name;
}

// ----------------------------------------------------------

  // Then periodic load
  setInterval(async () => {
    const data = await fetchUserData();
    if (data) updateBalancesDOM();
  }, 10000);
}
