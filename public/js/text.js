document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("transaction-form");
  const msg = document.getElementById("transaction-message");
  const historyDiv = document.getElementById("transaction-history");
  const balanceEl = document.getElementById("total-balance");
  const eusdtEl = document.getElementById("eusdt-balance");
  const ssInput = document.getElementById("screenshot");
  const ssPreview = document.getElementById("ss-preview");
  const depositBox = document.getElementById("deposit-number-box");
  const uploadBox = document.getElementById("ss-upload-box");
const email = localStorage.getItem("email");

if (!email) {
  console.warn("⚠️ No email found — redirecting to login...");
  window.location.href = "login.html";
  return;
}

  const USDT_TO_PKR = 300;
  const API = "https://royal-empire-backend.onrender.com"; // 🔥 FIXED BASE URL

  // Convert USDT → PKR
  const usdtInput = document.getElementById("amount");
  const convertedAmountEl = document.getElementById("converted-amount");

  if (usdtInput && convertedAmountEl) {
    usdtInput.addEventListener("input", () => {
      const val = parseFloat(usdtInput.value) || 0;
      const pkr = val * USDT_TO_PKR;
      convertedAmountEl.textContent = val
        ? `≈ Rs. ${pkr.toLocaleString()} PKR`
        : "≈ Rs. 0.00 PKR";
    });
  }

  // Screenshot preview
  if (ssInput && ssPreview) {
    ssInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        ssPreview.src = URL.createObjectURL(file);
        ssPreview.style.display = "block";
      }
    });
  }

  // Deposit visibility
  const txTypeSelect = document.getElementById("transaction-type");
  if (txTypeSelect) {
    txTypeSelect.addEventListener("change", (e) => {
      const isDeposit = e.target.value === "deposit";
      depositBox.style.display = isDeposit ? "block" : "none";
      uploadBox.style.display = isDeposit ? "block" : "none";
    });
  }

  // Load user data from backend
  async function loadUserData() {
    try {
      const res = await fetch(`${API}/api/user/${email}`);
      const data = await res.json();

      localStorage.setItem("balance", data.balance || 0);

      if (balanceEl) balanceEl.textContent = (data.balance || 0).toFixed(2);
      if (eusdtEl) eusdtEl.textContent = (data.balance * 10).toFixed(2);

      if (historyDiv && data.transactions?.length) {
        historyDiv.innerHTML = data.transactions
          .slice()
          .reverse()
          .map(
            (t) => `
              <div class="transaction-entry ${t.type}">
                <div class="left">
                  <strong>${t.type.toUpperCase()}</strong> - $${t.amount.toFixed(2)}
                </div>
                <div class="right">
                  <div>${new Date(t.createdAt).toLocaleString()}</div>
                  <div>Status: ${t.status}</div>
                </div>
              </div>`
          )
          .join("");
      } else {
        historyDiv.innerHTML = "<p>No transactions yet.</p>";
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Submit Transaction
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const type = document.getElementById("transaction-type").value;
      const method = document.getElementById("payment-method").value;
      const userNumber = document.getElementById("user-number").value.trim();
      const amount = parseFloat(document.getElementById("amount").value);
      const file = ssInput?.files[0];

      if (!type || !method || !userNumber || !amount) {
        msg.textContent = "⚠️ Please fill all fields.";
        msg.style.color = "red";
        return;
      }
      if (type === "deposit" && !file) {
        msg.textContent = "⚠️ Upload screenshot for deposit.";
        msg.style.color = "red";
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("type", type);
      formData.append("method", method);
      formData.append("userNumber", userNumber);
      formData.append("amount", amount);
      if (file && type === "deposit") formData.append("screenshot", file);

      msg.textContent = "Processing...";
      msg.style.color = "yellow";

      try {
        const res = await fetch(`${API}/api/transactions`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          msg.textContent = data.message;
          msg.style.color = "lime";
          form.reset();
          ssPreview.style.display = "none";
          loadUserData();
        } else {
          msg.textContent = data.message || "Transaction failed.";
          msg.style.color = "red";
        }
      } catch (err) {
        msg.textContent = "Server error.";
        msg.style.color = "red";
      }
    });
  }

  loadUserData();
  setInterval(loadUserData, 30000);
});
