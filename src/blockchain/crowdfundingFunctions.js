const { parseEther } = require("ethers");
const { contract, signer, senderAddress } = require("./connectWeb3");

// blockchain interaction function
async function interactWithContract(method, ...args) {
  try {
    const contractWithSigner = contract.connect(signer);
    const result = await contractWithSigner[method](...args);
    console.log(result);
    return {
      success: true,
      transactionHash: result.hash || result.transactionHash,
      // data: result
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createCampaign(
  mongoId,
  recipient,
  targetAmount,
  deadline,
  milestones
) {
  const args = [
    mongoId?.toString(),
    recipient,
    parseEther(targetAmount.toString()),
    deadline,
    milestones.deadlines,
    milestones.completionPercentages,
  ];
  const result = interactWithContract("createCampaign", ...args);
  return result;
}

async function contributeToCampaign(mongoId, value) {
  const args = [mongoId, value, senderAddress];
  const result = interactWithContract("contributeToCampaign", ...args);
  return result;
}

async function vote(mongoId) {
  const result = interactWithContract("vote", mongoId);
  return result;
}

async function finalizeMilestoneAndDisburseFunds(mongoId) {
  const result = interactWithContract(
    "finalizeMilestoneAndDisburseFunds",
    mongoId
  );
  return result;
}

async function getCampaignDetails(mongoId) {
  const result = await interactWithContract("getCampaignDetails", mongoId);
  if (result.success) {
    const [
      recipient,
      targetAmount,
      deadline,
      totalRaised,
      completed,
      numberOfContributors,
      milestones,
    ] = result.campaignDetails;
    const formattedMilestones = milestones.map((milestone) => ({
      deadline: milestone[0].toString(),
      completionPercentage: milestone[1].toString(),
      reached: milestone[2],
    }));
    return {
      ...result,
      data: {
        recipient,
        targetAmount: targetAmount.toString(),
        deadline: deadline.toString(),
        totalRaised: totalRaised.toString(),
        completed,
        numberOfContributors: numberOfContributors.toString(),
        milestones: formattedMilestones,
      },
    };
  }
  return result;
}

module.exports = {
  createCampaign,
  contributeToCampaign,
  vote,
  finalizeMilestoneAndDisburseFunds,
  getCampaignDetails,
};
