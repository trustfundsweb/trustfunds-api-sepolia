// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Crowdfunding {
  struct Milestone {
    uint256 deadline;
    uint256 completionPercentage;
    bool reached;
  }

  struct Campaign {
    address payable recipient;
    uint256 targetAmount;
    uint256 deadline;
    uint256 totalRaised;
    bool completed;
    mapping(address => uint256) contributions;
    address[] contributorAddresses;
    mapping(address => bool) voted;
    uint256 numberOfContributors;
    Milestone[] milestones;
  }

  mapping(uint256 => Campaign) public campaigns;
  mapping(string => uint256) public campaignMongoId;
  uint256 public nextCampaignId;

  function createCampaign(
    string memory mongoId,
    address payable _recipient,
    uint256 _targetAmount,
    uint256 _deadline,
    uint256[] memory milestoneDeadlines,
    uint256[] memory milestoneCompletionPercentages
  ) public payable {
    require(_targetAmount > 0, "Target amount must be greater than zero");
    require(_deadline > block.timestamp, "Deadline must be in the future");

    Campaign storage currentCampaign = campaigns[nextCampaignId];
    currentCampaign.recipient = _recipient;
    currentCampaign.targetAmount = _targetAmount;
    currentCampaign.deadline = _deadline;
    currentCampaign.totalRaised = 0;
    currentCampaign.completed = false;

    require(
      milestoneDeadlines.length == milestoneCompletionPercentages.length,
      "Mismatch in milestone data"
    );

    for (uint256 i = 0; i < milestoneDeadlines.length; i++) {
      currentCampaign.milestones.push(
        Milestone({
          deadline: milestoneDeadlines[i],
          completionPercentage: milestoneCompletionPercentages[i],
          reached: false
        })
      );
    }

    campaignMongoId[mongoId] = nextCampaignId;
    nextCampaignId++;
  } 

  function contributeToCampaign(
    string memory mongoId,
    address payable _sender,
    uint256 _value
  ) public payable {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp < campaigns[campaignId].deadline,
      "Contribution period has ended"
    );

    require(
      !campaigns[campaignId].completed,
      "Campaign has already been completed"
    );

    Campaign storage currentCampaign = campaigns[campaignId];
    if (currentCampaign.contributions[_sender] == 0) {
      currentCampaign.contributorAddresses.push(_sender);
      currentCampaign.numberOfContributors++;
    }
    currentCampaign.contributions[_sender] += _value;
    currentCampaign.totalRaised += _value;
  }

  function getContributionAmount(
    string memory mongoId,
    address senderAddress
  ) public view returns (uint256) {
    uint256 campaignId = campaignMongoId[mongoId];
    return campaigns[campaignId].contributions[senderAddress];
  }

  function vote(string memory mongoId) public {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      campaigns[campaignId].contributions[msg.sender] > 0,
      "You must be a contributor to vote"
    );

    if (campaigns[campaignId].voted[msg.sender]) {
      campaigns[campaignId].voted[msg.sender] = false;
    } else {
      campaigns[campaignId].voted[msg.sender] = true;
    }
  }

  function isMajorityInFavor(string memory mongoId) public view returns (bool) {
    uint256 campaignId = campaignMongoId[mongoId];
    uint256 votedContributorsCount = 0;

    for (uint256 i = 0; i < campaigns[campaignId].numberOfContributors; i++) {
      address contributor = campaigns[campaignId].contributorAddresses[i];
      if (campaigns[campaignId].voted[contributor]) {
        votedContributorsCount++;
      }
    }

    return (votedContributorsCount * 2 >
      campaigns[campaignId].numberOfContributors);
  }

  function finalizeMilestoneAndDisburseFunds(
    string memory mongoId
  ) public payable {
    uint256 campaignId = campaignMongoId[mongoId];
    require(
      block.timestamp >= campaigns[campaignId].deadline,
      "Deadline has not been reached yet"
    );

    Campaign storage currentCampaign = campaigns[campaignId];
    require(!currentCampaign.completed, "Campaign already completed");

    uint256 goalAmount = currentCampaign.targetAmount;
    uint256 totalRaised = currentCampaign.totalRaised;

    if (totalRaised >= goalAmount) {
      for (uint256 i = 0; i < currentCampaign.milestones.length; i++) {
        Milestone storage milestone = currentCampaign.milestones[i];
        if (!milestone.reached && block.timestamp >= milestone.deadline) {
          milestone.reached = true;
          require(
            isMajorityInFavor(mongoId),
            "Majority of the contributors are unhappy with this campaign"
          );
          uint256 amountToTransfer = (goalAmount *
            milestone.completionPercentage) / 100;
          currentCampaign.recipient.transfer(amountToTransfer);
        }
      }
    } else {
      for (
        uint256 i = 0;
        i < currentCampaign.contributorAddresses.length;
        i++
      ) {
        address contributor = currentCampaign.contributorAddresses[i];
        uint256 contribution = currentCampaign.contributions[contributor];
        uint256 refundAmount = (contribution * totalRaised) / goalAmount;
        payable(contributor).transfer(refundAmount);
      }
    }

    currentCampaign.completed = true;
  }

  function getCampaignDetails(
    string memory mongoId
  )
    public
    view
    returns (
      address payable recipient,
      uint256 targetAmount,
      uint256 deadline,
      uint256 totalRaised,
      bool completed,
      uint256 numberOfContributors,
      Milestone[] memory milestones
    )
  {
    uint256 campaignId = campaignMongoId[mongoId];

    Campaign storage currentCampaign = campaigns[campaignId];
    return (
      currentCampaign.recipient,
      currentCampaign.targetAmount,
      currentCampaign.deadline,
      currentCampaign.totalRaised,
      currentCampaign.completed,
      currentCampaign.numberOfContributors,
      currentCampaign.milestones
    );
  }
}
