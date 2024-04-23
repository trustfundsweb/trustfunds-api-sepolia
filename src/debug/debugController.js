const { ServerErrorResponse } = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const {
  getCampaignDetailsFunction,
} = require("../blockchain/crowdfundingFunctions");

const getCampaignById = async (req, res) => {
  const { id } = req.params;
  if (!id) return new ServerErrorResponse(res);
  const response = await getCampaignDetailsFunction(id);
  return new SuccessResponse(res, "Campaign fetched successfully!", response.campaignDetails);
};

module.exports = { getCampaignById };
