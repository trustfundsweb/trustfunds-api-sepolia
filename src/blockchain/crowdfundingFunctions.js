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
      data: result
    };
  } catch (error) {
    console.log(error)
    return { success: false, error: error.message };
  }
}

async function createCampaignFunction(
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

async function contributeToCampaignFunction(mongoId, value, senderAddress) {
  const args = [mongoId, senderAddress, parseEther(value)];
  const result = interactWithContract("contributeToCampaign", ...args);
  return result;
}

async function voteFunction(mongoId) {
  const result = interactWithContract("vote", mongoId);
  return result;
}

async function finalizeMilestoneAndDisburseFundsFunction(mongoId) {
  const result = interactWithContract(
    "finalizeMilestoneAndDisburseFunds",
    mongoId
  );
  return result;
}

async function getCampaignDetailsFunction(mongoId) {
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
    ] = result.data;
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
  createCampaignFunction,
  contributeToCampaignFunction,
  voteFunction,
  finalizeMilestoneAndDisburseFundsFunction,
  getCampaignDetailsFunction,
};
