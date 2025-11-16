
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  email: { type: String, required: true },
  type: { type: String, enum: ["deposit", "withdraw"], required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);

