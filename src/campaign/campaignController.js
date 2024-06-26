const mongoose = require("mongoose");
const {
  CustomErrorResponse,
  ServerErrorResponse,
  ValidationErrorResponse,
  BadRequestErrorResponse,
} = require("../shared/error/errorResponse");
const SuccessResponse = require("../shared/success/successResponse");
const causesList = require("../campaign/campaignModel");
const campaignUpdationValidation = require("./validations/update-campaign");
const campaignCreationValidation = require("./validations/create-campaign");
const { campaignModel } = require("./campaignModel");
const { StatusCodes } = require("http-status-codes");
const { ethToWei } = require("../blockchain/utils/currencyConvert");
const { getMilestoneData } = require("./utils/milestonesData");
const {
  createCampaignFunction,
  getCampaignDetailsFunction,
  contributeToCampaignFunction,
} = require("../blockchain/crowdfundingFunctions");
const { addTransaction, actions } = require("../debug/transactionFunctions");

const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await campaignModel.find();
    if (!campaigns || campaigns.length <= 0)
      return new CustomErrorResponse(
        res,
        "No campaigns present. Create one!",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(
      res,
      "Campaigns fetched successfully!",
      campaigns
    );
  } catch (err) {
    console.error(err.message, err.status);
    return new ServerErrorResponse(res);
  }
};

const getCausesList = async (req, res) => {
  return new SuccessResponse(res, "Campaign causes fetched!", causesList);
};

const createCampaign = async (req, res) => {
  try {
    const { body, user } = req;
    const e = campaignCreationValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);

    let tempStory = body.story;
    tempStory = tempStory.filter((para) => para !== "");

    const recipient = body.creatorAddress;
    const newCampaign = new campaignModel({
      ...body,
      story: tempStory,
      creator: user.id,
    });
    console.log(newCampaign);

    // save to mongodb
    const saved = await newCampaign.save();

    // convert string date to time in seconds
    let numberFormatDate = new Date(body.endDate).getTime();
    let goalWei = ethToWei(body.goal);
    let mongoId = saved._id;
    let milestones = getMilestoneData(body.milestones);

    const response = await createCampaignFunction(
      mongoId,
      recipient,
      goalWei,
      numberFormatDate,
      milestones
    );
    console.log(response);
    if (!response.success) {
      console.log(response.error);
      await deleteCampaignWithId(saved._id);
      return new CustomErrorResponse(
        res,
        response.error ||
          "Something went wrong while writing blockchain transaction.",
        StatusCodes.BAD_REQUEST
      );
    }

    // recording transaction
    addTransaction(user.id, response.transactionHash, actions.CREATED);

    return new SuccessResponse(
      res,
      `Campaign created and smart contract modified successfully! Transaction Hash: ${response.transactionHash}`,
      newCampaign
    );
  } catch (err) {
    console.log(err);
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const fundCampaign = async (req, res) => {
  try {
    const userId = req.user.id;
    const campaignId = req.params.id;
    console.log("campaign just funded", campaignId);
    if (!campaignId)
      return new CustomErrorResponse(
        res,
        "Campaign not found!",
        StatusCodes.NOT_FOUND
      );

    const { value, sendersAddress } = req.body;
    console.log({ value, sendersAddress });
    if (!value || !sendersAddress)
      return new CustomErrorResponse(
        res,
        "Invalid inputs for value and sender account address",
        StatusCodes.BAD_REQUEST
      );

    // add the contributor id, count and updated balance to campaign module
    const campaign = await campaignModel.findById(campaignId);
    let alreadyDonated = campaign.contributors;
    if (!alreadyDonated) alreadyDonated = [userId];
    else if (!alreadyDonated.includes(userId)) alreadyDonated.push(userId);
    campaign.contributors = alreadyDonated;
    let newBalance = parseFloat(campaign.balance) + parseFloat(value);
    if (typeof newBalance === "number") campaign.balance = newBalance;
    let newCount = campaign.backersCount + 1;
    if (typeof newCount === "number") campaign.backersCount = newCount;
    await campaign.save();

    const result = await contributeToCampaignFunction(
      campaignId,
      value.toString(),
      sendersAddress
    );
    if (!result.success)
      return new CustomErrorResponse(
        res,
        result.error || "Something went wrong while confirming",
        StatusCodes.INTERNAL_SERVER_ERROR
      );

    // recording transaction
    addTransaction(userId, result.transactionHash, actions.FUND);

    return new SuccessResponse(
      res,
      "Campaign contribution verified successfully. Changes will be reflected shortly. Go to profile to view all transactions made by you."
    );
  } catch (err) {
    console.error(err);
    return new ServerErrorResponse(res);
  }
};

const getUserCampaigns = async (req, res) => {
  try {
    const { id } = req.user;

    const campaigns = await campaignModel.find({ creator: id });
    if (!campaigns || campaigns.length <= 0)
      return new SuccessResponse(
        res,
        "You have not created any campaigns. Head over to Create Campaign to create your first campaign!",
        []
      );

    return new SuccessResponse(
      res,
      "Campaigns fetched successfully!",
      campaigns
    );
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const getUserCampaign = async (req, res) => {
  try {
    const userId = req.user.id;

    const { id } = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const data = await campaignModel.findById(id);
    if (!data)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );
    if (data.creator != userId)
      return new CustomErrorResponse(
        res,
        "The campaign you requested was not created by you!",
        StatusCodes.FORBIDDEN
      );

    return new SuccessResponse(res, "Action completed successfully!", data);
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    if (!mongoose.isValidObjectId(id))
      return new CustomErrorResponse(
        res,
        "Invalid campaign ID",
        StatusCodes.BAD_REQUEST
      );

    const data = await campaignModel.findById(id);
    if (!data)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );

    return new SuccessResponse(res, "Action completed successfully!", data);
  } catch (err) {
    console.error(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const getCampaignBlockchainDetails = async (req, res) => {
  const { id } = req.params;
  if (!id) return new ServerErrorResponse(res);
  const response = await getCampaignDetailsFunction(id);
  if (response.success)
    return new SuccessResponse(
      res,
      "Campaign details fetched from blockchain successfully!",
      response.data
    );
  else
    return new CustomErrorResponse(
      res,
      response.error || "Failed to fetch data from the contract.",
      StatusCodes.NOT_FOUND
    );
};

const updateCampaign = async (req, res) => {
  try {
    const id = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const { body } = req;
    const e = campaignUpdationValidation(body);
    if (e.error) return new ValidationErrorResponse(res, e.error.message);

    const campaign = await campaignModel.findById(id);
    if (!campaign)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );

    campaign.name = body.name || campaign.name;
    campaign.title = body.title || campaign.title;
    campaign.story = body.story || campaign.story;
    campaign.goal = body.goal || campaign.goal;
    campaign.endDate = body.endDate || campaign.endDate;
    campaign.image = body.image || campaign.image;
    campaign.causeType = body.causeType || campaign.causeType;

    await campaign.save();
    return new SuccessResponse(res, "Action completed successfully!", data);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const deleteCampaignWithId = async (id) => {
  if (!id) throw new Error("Campaign not found. Id is missing.");
  const campaign = await campaignModel.deleteOne({ _id: id });
  if (campaign.deletedCount === 0) return false;
  return true;
};

const deleteCampaign = async (req, res) => {
  try {
    const id = req.params;
    if (!id)
      return new BadRequestErrorResponse(res, "Campaign id not present!");

    const success = deleteCampaignWithId(id);
    if (!success)
      return new CustomErrorResponse(
        res,
        "The campaign you requested does not exist!",
        StatusCodes.BAD_REQUEST
      );
    else return new SuccessResponse(res, "Campaign deleted successfully!");
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

const searchForCampaign = async (req, res) => {
  const { q } = req.query;
  console.log(q);
  try {
    const campaigns = await campaignModel
      .find({
        $or: [
          { title: { $regex: new RegExp(q, "i") } },
          { name: { $regex: new RegExp(q, "i") } },
          { causeType: { $regex: new RegExp(q, "i") } },
        ],
      })
      .exec();

    return new SuccessResponse(res, "Search results found!", [...campaigns]);
  } catch (err) {
    console.log(err.message, err.status || StatusCodes.INTERNAL_SERVER_ERROR);
    return new ServerErrorResponse(res);
  }
};

module.exports = {
  getAllCampaigns,
  getCausesList,
  createCampaign,
  getUserCampaigns,
  getUserCampaign,
  getCampaignById,
  getCampaignBlockchainDetails,
  fundCampaign,
  updateCampaign,
  deleteCampaign,
  searchForCampaign,
};
