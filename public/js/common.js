// ✅ js/common.js
export async function fetchUserData() {
  const email = localStorage.getItem("email") || "demo@user.com";

  try {
   const res = await fetch(`http://localhost:5000/api/user/${email}`);

    if (!res.ok) throw new Error("Failed to fetch user data");

    const data = await res.json();

    // 🟢 Username fallback system
    const username =
      data.username ||
      data.name ||
      (data.email ? data.email.split("@")[0] : "User");

    // 🟢 Update header + profile name immediately if elements exist
    const headerName = document.getElementById("menuUserName");
    const profileName = document.getElementById("menuUserName");
    if (headerName) headerName.textContent = username;
    if (profileName) profileName.textContent = username;

    // 🟢 Save for reuse across pages
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
    name: localStorage.getItem("profileUserName") || "User",
  };

  if (elements.totalBalance) elements.totalBalance.textContent = values.total;
  if (elements.eusdt) elements.eusdt.textContent = values.eusdt;
  if (elements.totalEarning) elements.totalEarning.textContent = values.totalEarning;
  if (elements.referralEarning) elements.referralEarning.textContent = values.referralEarning;
  if (elements.totalInvestment) elements.totalInvestment.textContent = values.totalInvestment;
  if (elements.profileUserName) elements.profileUserName.textContent = values.name;
  if (elements.headerUserName) elements.headerUserName.textContent = values.name;
}

export function startAutoRefresh() {
  fetchUserData().then(updateBalancesDOM);

  // Refresh every 10 seconds
  setInterval(async () => {
    await fetchUserData();
    updateBalancesDOM();
  }, 10000);
}

// ✅ js/common.js
export async function fetchUserData() {
  const email = localStorage.getItem("email") || "demo@user.com";

  try {
   const res = await fetch(`http://localhost:5000/api/user/${email}`);

    if (!res.ok) throw new Error("Failed to fetch user data");

    const data = await res.json();

    // 🟢 Username fallback system
    const username =
      data.username ||
      data.name ||
      (data.email ? data.email.split("@")[0] : "User");

    // 🟢 Update header + profile name immediately if elements exist
    const headerName = document.getElementById("menuUserName");
    const profileName = document.getElementById("menuUserName");
    if (headerName) headerName.textContent = username;
    if (profileName) profileName.textContent = username;

    // 🟢 Save for reuse across pages
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
    name: localStorage.getItem("profileUserName") || "User",
  };

  if (elements.totalBalance) elements.totalBalance.textContent = values.total;
  if (elements.eusdt) elements.eusdt.textContent = values.eusdt;
  if (elements.totalEarning) elements.totalEarning.textContent = values.totalEarning;
  if (elements.referralEarning) elements.referralEarning.textContent = values.referralEarning;
  if (elements.totalInvestment) elements.totalInvestment.textContent = values.totalInvestment;
  if (elements.profileUserName) elements.profileUserName.textContent = values.name;
  if (elements.headerUserName) elements.headerUserName.textContent = values.name;
}

export function startAutoRefresh() {
  fetchUserData().then(updateBalancesDOM);

  // Refresh every 10 seconds
  setInterval(async () => {
    await fetchUserData();
    updateBalancesDOM();
  }, 10000);
}
