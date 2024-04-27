const mongoose = require("mongoose");

const transactionsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  transactionHash: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
});

const transactionsModel = mongoose.model("Transaction", transactionsSchema);

module.exports = transactionsModel;
