
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Create server and socket
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use("/uploads", express.static("uploads"));
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// ✅ MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/investpro", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ Mongo Error:", err));

// 🧱 Schemas
const transactionSchema = new mongoose.Schema({
  type: String,
  amount: Number,
  method: String,
  status: String,
  createdAt: { type: Date, default: Date.now },
  screenshotUrl: String,
});

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  totalEarning: { type: Number, default: 0 },
  referralEarning: { type: Number, default: 0 },
  referralCode: String,
  referredBy: { type: String, default: null },
  referrals: [{ type: String }],
  balance: { type: Number, default: 0 },
  availableBalance: { type: Number, default: 0 },
  totalInvestment: { type: Number, default: 0 },
  todayEarnings: { type: Number, default: 0 },
  eusdt: { type: Number, default: 0 },
  transactions: [transactionSchema],
});

const User = mongoose.model("User", userSchema);

// 🧰 Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Register Route
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });

    // Link referral if code valid
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        user.referredBy = referrer.email;
        referrer.referrals.push(user.email);
        await referrer.save();
      }
    }

    user.referralCode = "ROYAL-" + Math.floor(10000 + Math.random() * 90000);
    await user.save();
    res.json({
      message: "✅ Registration successful",
      referralCode: user.referralCode,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Login
app.post("/api/login", async (req, res) => {
  try {
    const { contact, password } = req.body;
    const user = await User.findOne({ email: contact });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "✅ Login successful",
      email: user.email,
      username: user.username,
      balance: user.balance || 0,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ✅ Get user info
app.get("/api/user/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.json({ balance: 0, transactions: [] });
  res.json(user);
});

// ✅ Transactions
app.post("/api/transactions", upload.single("screenshot"), async (req, res) => {
  try {
    const { email, type, method, amount } = req.body;
    const file = req.file;
    if (!email || !type || !method || !amount)
      return res.status(400).json({ message: "Missing required fields" });

    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const numericAmount = parseFloat(amount);
    const newTx = {
      type,
      amount: numericAmount,
      method,
      status: "Pending",
      createdAt: new Date(),
      screenshotUrl: file ? `/uploads/${file.filename}` : null,
    };
    user.transactions.push(newTx);
    await user.save();

    if (type === "deposit") {
      setTimeout(async () => {
        const dbUser = await User.findOne({ email });
        if (!dbUser) return;

        dbUser.balance += numericAmount;
        dbUser.totalEarning += numericAmount;

        if (dbUser.referredBy) {
          const referrer = await User.findOne({ email: dbUser.referredBy });
          if (referrer) {
            const bonus = numericAmount * 0.02;
            referrer.referralEarning += bonus;
            referrer.balance += bonus;
            await referrer.save();
            console.log(`🎁 Referral bonus $${bonus} added to ${referrer.email}`);
          }
        }

        const tx = dbUser.transactions.find(
          (t) =>
            t.createdAt.getTime() === newTx.createdAt.getTime() &&
            t.amount === numericAmount
        );
        if (tx) tx.status = "Completed";

        await dbUser.save();
        console.log(`💰 Deposit of $${numericAmount} completed for ${email}`);
      }, 10000);
    } else if (type === "withdraw") {
      setTimeout(async () => {
        const dbUser = await User.findOne({ email });
        if (!dbUser) return;
        if (dbUser.balance < numericAmount) return;

        dbUser.balance -= numericAmount;
        const tx = dbUser.transactions.find(
          (t) =>
            t.createdAt.getTime() === newTx.createdAt.getTime() &&
            t.amount === numericAmount
        );
        if (tx) tx.status = "Completed";

        await dbUser.save();
        console.log(`🏦 Withdraw of $${numericAmount} completed for ${email}`);
      }, 10000);
    }

    res.json({
      message:
        type === "deposit"
          ? "Deposit submitted! Balance will update after processing."
          : "Withdrawal submitted! Processing shortly.",
    });
  } catch (err) {
    console.error("Transaction error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Get Balance
// ✅ Get Full User Info (Balance + Earnings + Referrals)
// ✅ Unified User Data API
app.get("/api/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({
        message: "User not found",
        email,
        balance: 0,
        totalEarning: 0,
        referralEarning: 0,
        totalInvestment: 0,
        eusdt: 0,
        username: "User",
      });

    // 🧮 Compute eUSDT dynamically (for example: $1 = 10 eUSDT)
    const eusdt = Math.floor((user.balance || 0) * 10);

    // 🧩 Clean & consistent response
    res.json({
      email: user.email,
      username: user.username || user.name || user.email.split("@")[0],
      balance: Number(user.balance || 0),
      totalEarning: Number(user.totalEarning || 0),
      referralEarning: Number(user.referralEarning || 0),
      totalInvestment: Number(user.totalInvestment || 0),
      eusdt,
    });
  } catch (err) {
    console.error("❌ Error in /api/user/:email:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ✅ Invest Route
/// 🟢 POST /api/invest — user buys a package
app.post("/api/packages/buy", async (req, res) => {
  try {
    console.log("📩 /api/packages/buy body:", req.body); // 👈 add this
    const { email, amount, packageName } = req.body;
    if (!email || !amount)
      return res.status(400).json({ message: "Missing email or amount" });

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.balance < numericAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    // rest of logic...


    // Deduct and update
    user.balance -= numericAmount;
    user.totalInvestment += numericAmount;
    user.eusdt = Math.floor(user.balance * 10);

    // Record investment transaction
    user.transactions.push({
      type: "investment",
      amount: numericAmount,
      status: "completed",
      method: packageName || "Package Purchase",
      createdAt: new Date(),
    });

    await user.save();

    // Schedule daily profit (1%)
    // Schedule daily profit safely
const dailyProfit = numericAmount * 0.01;
setInterval(async () => {
  const dbUser = await User.findOne({ email });
  if (!dbUser) return;

  dbUser.balance += dailyProfit;
  dbUser.totalEarning += dailyProfit;
  dbUser.eusdt = Math.floor(dbUser.balance * 10);
  await dbUser.save();

  console.log(`💰 Added $${dailyProfit.toFixed(2)} daily to ${email}`);
}, 86400000);


    res.json({
      message: "✅ Package purchased successfully! Daily 1% profit will be added.",
      newBalance: user.balance,
      totalInvestment: user.totalInvestment,
      totalEarning: user.totalEarning,
    });
  } catch (err) {
    console.error("❌ /api/packages/buy error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Profile API — unified for dashboard/profile/balance page
app.get("/api/profile/:email", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.json({
        email: req.params.email,
        username: "Unknown User",
        balance: 0,
        totalEarning: 0,
        totalInvestment: 0,
        referralEarning: 0,
        eusdt: 0,
      });
    }

    res.json({
      email: user.email,
      username: user.username || user.name || "Unnamed",
      balance: user.balance,
      totalEarning: user.totalEarning,
      referralEarning: user.referralEarning || 0,
      totalInvestment: user.totalInvestment,
      eusdt: user.eusdt || 0,
    });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Referrals
app.get("/api/referrals/:email", async (req, res) => {
  const user = await User.findOne({ email: req.params.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const level1 = await User.find({ referredBy: user.email });
  const level2 = await User.find({ referredBy: { $in: level1.map((u) => u.email) } });
  const level3 = await User.find({ referredBy: { $in: level2.map((u) => u.email) } });

  res.json({
    referralCode: user.referralCode,
    referralEarning: user.referralEarning,
    levels: {
      level1: level1.map((u) => ({ email: u.email })),
      level2: level2.map((u) => ({ email: u.email })),
      level3: level3.map((u) => ({ email: u.email })),
    },
  });
});

// 💬 Live Chat with Assistant
io.on('connection', (socket) => {
  console.log(`💬 New user connected: ${socket.id}`);

  socket.on('chatMessage', (msg) => {
    console.log(`📨 User says: ${msg}`);

    // 1️⃣ Send user message back so it appears in their own chat box
    socket.emit('chatMessage', { sender: 'user', text: msg });

    // 2️⃣ Generate assistant reply (you can make this smarter later)
    const reply = generateBotReply(msg);

    // 3️⃣ Send bot reply back to same user
    setTimeout(() => {
      socket.emit('chatMessage', { sender: 'bot', text: reply });
    }, 800); // small delay for realism
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// 🤖 Simple Bot Logic (you can replace this with AI later)
function generateBotReply(userMsg) {
  const msg = userMsg.toLowerCase();

  if (msg.includes('hello') || msg.includes('hi')) {
    return '👋 Hello! How can I assist you today?';
  }
  if (msg.includes('deposit')) {
    return '💰 To make a deposit, go to the Dashboard → Deposit section and follow the instructions.';
  }
  if (msg.includes('withdraw')) {
    return '🏦 Withdrawals are processed within 24 hours. Please use the Withdraw section on your dashboard.';
  }
  if (msg.includes('help') || msg.includes('support')) {
    return '🛠️ I’m here to help! Please tell me your issue in detail.';
  }
 
  // default reply
  return '🤖 I’m not sure I understand that yet — but our team will get back to you shortly.';
}
   
// ✅ Frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🚀 Start server
const PORT = 5000;
server.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
