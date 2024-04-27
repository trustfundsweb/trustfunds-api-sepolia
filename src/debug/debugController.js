const {
  ServerErrorResponse,
  AuthorizationErrorResponse,
  CustomErrorResponse,
} = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const { transactionsModel } = require("../debug/transactionsModel");

const getContractAddress = async (req, res) => {
  return new SuccessResponse(res, "Contract Address fetched successfully!", {
    address: process.env.CONTRACT_ADDRESS,
  });
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return new AuthorizationErrorResponse(
        res,
        "Sign in and try again later."
      );

    const transactions = await transactionsModel
      .find({ userId })
      .sort({ timestamp: "desc" })
      .exec();

    if (!transactions)
      return new CustomErrorResponse(
        res,
        "Something went wrong while fetching transactions.",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(
      res,
      "Messages fetched successfully!",
      transactions
    );
  } catch (err) {
    console.error(err);
    return new ServerErrorResponse(res);
  }
};

module.exports = { getContractAddress, getTransactions };
