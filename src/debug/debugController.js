const { ServerErrorResponse } = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const {
  getCampaignDetailsFunction,
} = require("../blockchain/crowdfundingFunctions");

const getCampaignById = async (req, res) => {
  const { id } = req.params;
  if (!id) return new ServerErrorResponse(res);
  const response = await getCampaignDetailsFunction(id);
  return new SuccessResponse(
    res,
    "Campaign fetched successfully!",
    response.campaignDetails
  );
};

const getContractAddress = async (req, res) => {
  return new SuccessResponse(res, "Contract Address fetched successfully!", {
    address: process.env.CONTRACT_ADDRESS,
  });
};

module.exports = { getCampaignById, getContractAddress };
