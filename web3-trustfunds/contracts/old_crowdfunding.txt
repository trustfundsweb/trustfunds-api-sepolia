// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
  struct Milestone {
    uint256 date;
    uint256 percentage;
    bool reached;
  }

  struct Campaign {
    address payable recipient;
    uint256 targetAmount;
    uint256 deadline;
    uint256 totalRaised;
    bool completed;
    mapping(address => uint256) contributions;
    address[] contributorAddress;
    mapping(address => bool) voted;
    uint256 noOfContributors;
    Milestone[] milestones;
  }

  mapping(uint256 => Campaign) public campaign;
  mapping(string => uint256) public campaignMongoId;
  uint256 public nextCampaignId;
  uint256 public campaignId;

  function createCampaign(
    string memory mongoId,
    address payable _recipient,
    uint256 _targetAmount,
    uint256 _deadline,
    uint256[] memory milestoneDates,
    uint256[] memory milestonePercentages
  ) public {
    Campaign storage newCampaign = campaign[nextCampaignId];
    newCampaign.recipient = _recipient;
    newCampaign.targetAmount = _targetAmount;
    newCampaign.deadline = _deadline;
    newCampaign.totalRaised = 0;
    newCampaign.completed = false;

    for (uint256 i = 0; i < milestoneDates.length; i++) {
      newCampaign.milestones.push(
        Milestone({
          date: milestoneDates[i],
          percentage: milestonePercentages[i],
          reached: false
        })
      );
    }

    campaignMongoId[mongoId] = nextCampaignId;
    nextCampaignId++;
  }

  function addContribution(string memory mongoId) public payable {
    campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp < campaign[campaignId].deadline,
      "Deadline has passed"
    );
    if (campaign[campaignId].contributions[msg.sender] == 0) {
      campaign[campaignId].noOfContributors++;
      campaign[campaignId].contributorAddress.push(msg.sender);
    }
    campaign[campaignId].contributions[msg.sender] += msg.value;
    campaign[campaignId].totalRaised += msg.value;
  }

  function viewContributions(
    string memory mongoId,
    address senderAddress
  ) public returns (uint256) {
    campaignId = campaignMongoId[mongoId];
    return campaign[campaignId].contributions[senderAddress];
  }

  function vote(string memory mongoId) public {
    campaignId = campaignMongoId[mongoId];
    require(
      campaign[campaignId].contributions[msg.sender] > 0,
      "You must be a contributor to vote"
    );

    if (campaign[campaignId].voted[msg.sender]) {
      campaign[campaignId].voted[msg.sender] = false;
    } else {
      campaign[campaignId].voted[msg.sender] = true;
    }
  }

  function majorityVote(string memory mongoId) public returns (bool) {
    campaignId = campaignMongoId[mongoId];
    uint256 votedCount = 0;

    for (uint256 i = 0; i < campaign[campaignId].noOfContributors; i++) {
      address contributor = campaign[campaignId].contributorAddress[i];
      if (campaign[campaignId].voted[contributor]) {
        votedCount++;
      }
    }

    return (votedCount * 2 > campaign[campaignId].noOfContributors);
  }

  function checkMilestone(string memory mongoId) public payable {
    campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp >= campaign[campaignId].deadline,
      "Deadline not reached yet"
    );

    Campaign storage currentCampaign = campaign[campaignId];
    require(!currentCampaign.completed, "Campaign already completed");

    uint256 goalAmount = currentCampaign.targetAmount;
    uint256 totalRaised = currentCampaign.totalRaised;

    if (totalRaised >= goalAmount) {
      for (uint256 i = 0; i < currentCampaign.milestones.length; i++) {
        Milestone storage milestone = currentCampaign.milestones[i];
        if (!milestone.reached && block.timestamp >= milestone.date) {
          milestone.reached = true;
          require(
            majorityVote(mongoId),
            "Majority of the contibutors are unhappy with this campaign"
          );
          uint256 amountToTransfer = (goalAmount * milestone.percentage) / 100;
          currentCampaign.recipient.transfer(amountToTransfer);
        }
      }
    } else {
      for (uint256 i = 0; i < currentCampaign.contributorAddress.length; i++) {
        address contributor = currentCampaign.contributorAddress[i];
        uint256 contribution = currentCampaign.contributions[contributor];
        uint256 refundAmount = (contribution * totalRaised) / goalAmount;
        payable(contributor).transfer(refundAmount);
      }
    }

    currentCampaign.completed = true;
  }
}
