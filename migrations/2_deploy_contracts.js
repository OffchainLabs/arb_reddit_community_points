var SubredditPoints_v0 = artifacts.require("SubredditPoints_v0");
var Subscriptions_v0 = artifacts.require("Subscriptions_v0")
var Distributions_v0 = artifacts.require("Distributions_v0")

module.exports = function(deployer) {
  deployer.deploy(SubredditPoints_v0);
  deployer.deploy(Subscriptions_v0);
  deployer.deploy(Distributions_v0);
};
