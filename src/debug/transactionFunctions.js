const { transactionsModel } = require("./transactionsModel");

const actions = {
  CREATED: "Campaign creation",
  FUND: "Campaign Funded",
  VOTE: "Campaign Voted",
  DISBURSE: "Campaign Fund Disbursed",
};

const addTransaction = async (userId, transactionHash, action) => {
  try {
    if (!userId || !transactionHash || !action)
      throw new Error("The details to add in transaction record are missing.");
    const newTransaction = new transactionsModel({
      userId,
      transactionHash,
      action,
    });
    const savedTransaction = await newTransaction.save();
    if (savedTransaction) return true;
  } catch (err) {
    console.error("Error while adding transaction record: ", err);
  }
  return false;
};

module.exports = { addTransaction, actions };
