const Crowdfunding = artifacts.require("Crowdfunding");

module.exports = function (deployer) {
  const target = 500;
  const duration = 3600;
  deployer.deploy(Crowdfunding, target, duration);
};
