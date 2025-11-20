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

// -------------------------------------
// ✅ CORS (Allow your two frontend sites)
// -------------------------------------
app.use(
  cors({
    origin: [
      "https://royal-empire.onrender.com",
      "https://royal-empire-11.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// -------------------------------------
// ✅ Create HTTP + Socket.IO server
// -------------------------------------
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use("/uploads", express.static("uploads"));
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "public")));

// -------------------------------------
// ✅ MongoDB Connection
// -------------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// -------------------------------------
// 🧱 Schemas
// -------------------------------------
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

// -------------------------------------
// 🧰 Multer
// -------------------------------------
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

// -------------------------------------
// 📧 EMAIL ROUTE (Merged correctly)
// -------------------------------------
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "Missing email details" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    res.json({ message: "Email sent successfully!" });
  } catch (err) {
    console.error("❌ Email error:", err);
    res.status(500).json({ message: "Email failed" });
  }
});

// -------------------------------------
// 🟢 Register Route
// -------------------------------------
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, referralCode } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ email, password: hashedPassword });

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
      message: "Registration successful",
      referralCode: user.referralCode,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// -------------------------------------
// 🟢 Login
// -------------------------------------
app.post("/api/login", async (req, res) => {
  try {
    const { contact, password } = req.body;

    const user = await User.findOne({ email: contact });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      email: user.email,
      username: user.username,
      balance: user.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// -------------------------------------
// 🟢 Get User Full Info (only once)
// -------------------------------------
app.get("/api/user/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        email,
        balance: 0,
        totalEarning: 0,
        referralEarning: 0,
        totalInvestment: 0,
        eusdt: 0,
      });
    }

    const eusdt = Math.floor(user.balance * 10);

    res.json({
      email: user.email,
      username: user.username || user.email.split("@")[0],
      balance: user.balance,
      totalEarning: user.totalEarning,
      referralEarning: user.referralEarning,
      totalInvestment: user.totalInvestment,
      eusdt,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
});

// -------------------------------------
// 🟢 Transactions (deposit / withdraw)
// -------------------------------------
app.post("/api/transactions", upload.single("screenshot"), async (req, res) => {
  try {
    const { email, type, method, amount } = req.body;

    if (!email || !type || !method || !amount)
      return res.status(400).json({ message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const numericAmount = Number(amount);

    const newTx = {
      type,
      amount: numericAmount,
      method,
      status: "Pending",
      createdAt: new Date(),
      screenshotUrl: req.file ? `/uploads/${req.file.filename}` : null,
    };

    user.transactions.push(newTx);
    await user.save();

    res.json({ message: "Transaction submitted!" });
  } catch (err) {
    res.status(500).json({ message: "Transaction error" });
  }
});

// -------------------------------------
// 🟢 Package Buy
// -------------------------------------
app.post("/api/packages/buy", async (req, res) => {
  try {
    const { email, amount, packageName } = req.body;

    const numericAmount = Number(amount);
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.balance < numericAmount)
      return res.status(400).json({ message: "Insufficient balance" });

    user.balance -= numericAmount;
    user.totalInvestment += numericAmount;
    user.eusdt = Math.floor(user.balance * 10);

    user.transactions.push({
      type: "investment",
      amount: numericAmount,
      method: packageName || "Package",
      status: "completed",
      createdAt: new Date(),
    });

    await user.save();

    res.json({
      message: "Package bought successfully!",
      balance: user.balance,
    });
  } catch (err) {
    res.status(500).json({ message: "Buy error" });
  }
});

// -------------------------------------
// 🟢 Serve Frontend
// -------------------------------------
const publicDir = path.join(__dirname, "public");
fs.readdirSync(publicDir)
  .filter((file) => file.endsWith(".html"))
  .forEach((file) => {
    const route =
      file === "index.html" ? "/" : "/" + file.replace(".html", "");
    app.get(route, (req, res) =>
      res.sendFile(path.join(publicDir, file))
    );
  });

app.get("/", (req, res) =>
  res.sendFile(path.join(publicDir, "index.html"))
);

// -------------------------------------
// 🚀 Start Server
// -------------------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
