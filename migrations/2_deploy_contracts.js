var SubredditPoints_v0 = artifacts.require("SubredditPoints_v0");
var Subscriptions_v0 = artifacts.require("Subscriptions_v0")
var Distributions_v0 = artifacts.require("Distributions_v0")
const fs = require('fs')
module.exports = async function(deployer, network, accounts) {
  const address = accounts[0]
  
  await deployer.deploy(SubredditPoints_v0);
  await deployer.deploy(Distributions_v0);
  await deployer.deploy(Subscriptions_v0)

  const points = await SubredditPoints_v0.deployed()
  const dist = await Distributions_v0.deployed()
  const subscriptions = await Subscriptions_v0.deployed() 

  await points.methods['initialize(address,address,address,string,string,string,address[])'](address,address,address,"ArbitrumReddit", "ArbCommunityPoints", "ARBC",[]);
  await dist.methods['initialize(address,address,address,address,uint256,uint256,uint256,uint256,uint256,address[],uint256[])'](address, points.address, address, address, '2000000', '1000000', '2000000', '1000', '5',[],[])
  await points.updateDistributionContract(dist.address)
  await subscriptions.methods['initialize(address,address,address,uint256,uint256,uint256)'](address,address,points.address,"1", "60","6")

  const symbol = await points.symbol.call()
  console.info(' *** SubredditPoints_v0 deployed: *** ', symbol);

  fs.writeFileSync('contract_addresses.json',JSON.stringify({
    distributionAddress: dist.address,
    subscriptionsAddress: subscriptions.address,
    pointsAddress: points.address
  }), 'utf-8');
  

};
