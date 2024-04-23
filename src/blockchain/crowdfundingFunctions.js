const { parseEther } = require("ethers");
const { contract, signer, senderAddress } = require("./connectWeb3");

// Function to create a campaign
async function createCampaignFunction(
  mongoId,
  recipient,
  targetAmount,
  deadline,
  milestones
) {
  try {
    const contractWithSigner = contract.connect(signer);
    console.log({
      mongoId: mongoId.toString(),
      recipient,
      targetAmount: parseEther(targetAmount.toString()),
      deadline,
      milestones,
    });
    const result = await contractWithSigner.createCampaign(
      mongoId?.toString(),
      recipient,
      parseEther(targetAmount.toString()),
      deadline,
      milestones.deadlines,
      milestones.completionPercentages
    );
    console.log(result);
    await result.wait();
    return { success: true, transactionHash: result.hash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to contribute to a campaign
async function contributeToCampaignFunction(mongoId, value) {
  try {
    const contractWithSigner = contract.connect(signer);
    const result = await contractWithSigner
      .contributeToCampaign(mongoId)
      .send({ value: value, from: senderAddress, gas: "5000000" });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to vote on a campaign
async function voteFunction(mongoId) {
  try {
    const result = await contract.methods
      .vote(mongoId)
      .send({ from: senderAddress, gas: "5000000" });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to finalize milestone and disburse funds
async function finalizeMilestoneAndDisburseFundsFunction(mongoId) {
  try {
    const result = await contract.methods
      .finalizeMilestoneAndDisburseFunds(mongoId)
      .send({ from: senderAddress, gas: "5000000" });

    return { success: true, transactionHash: result.transactionHash };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Function to get campaign details
async function getCampaignDetailsFunction(mongoId) {
  try {
    const result = await contract.methods.getCampaignDetails(mongoId).call();
    console.log("getCampaignDetailsFunction");
    console.log(result);

    const campaignDetails = {
      recipient: result[0],
      targetAmount: result[1].toString(),
      deadline: result[2].toString(),
      totalRaised: result[3].toString(),
      completed: result[4],
      numberOfContributors: result[5].toString(),
      milestones: result[6].map((milestone) => ({
        deadline: milestone["0"].toString(),
        completionPercentage: milestone["1"].toString(),
        reached: milestone["2"],
      })),
    };
    console.log("filtered output");
    console.log(campaignDetails);

    return { success: true, campaignDetails };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Example usage:
// const targetAmount = 1000000000000000000; // 1 ETH in wei
// const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now in Unix timestamp
// const milestones = {
// deadlines: [deadline + 3600, deadline + 7200], // Two hours and three hours from now
// completionPercentages: [50, 100] // 50% and 100% completion
// };

module.exports = {
  createCampaignFunction,
  contributeToCampaignFunction,
  voteFunction,
  finalizeMilestoneAndDisburseFundsFunction,
  getCampaignDetailsFunction,
};
