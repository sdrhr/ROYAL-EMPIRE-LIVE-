// ====================== ✅ common.js ======================

  // ✅ Your correct backend URL
  const API_BASE = "https://royal-empire-11.onrender.com";

// ----------------------------------------------------------
// FETCH USER DATA
// ----------------------------------------------------------
export async function fetchUserData() {
  const email = localStorage.getItem("email");
  if (!email) {
    console.error("❌ Email not found in localStorage");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/${email}`);
    if (!res.ok) throw new Error("User fetch error");

    const data = await res.json();
    console.log("User data:", data);

    // update DOM...
  } catch (err) {
    console.error("❌ Error fetching user data:", err);
  }
}

    // 🟢 Username fallback
    const username =
      data.username ||
      data.name ||
      (data.email ? data.email.split("@")[0] : "User");

    // 🟢 Update visible names (header + profile)
    const headerName = document.getElementById("menuUserName");
    const profileName = document.getElementById("menuUserName");
    if (headerName) headerName.textContent = username;
    if (profileName) profileName.textContent = username;

    // 🟢 Save for other pages
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
