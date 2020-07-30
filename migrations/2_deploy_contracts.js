var SubredditPoints_v0 = artifacts.require("SubredditPoints_v0");
var Subscriptions_v0 = artifacts.require("Subscriptions_v0")
var Distributions_v0 = artifacts.require("Distributions_v0")

module.exports = async function(deployer, network, accounts) {
  const address = accounts[0]
  
  await deployer.deploy(SubredditPoints_v0);
  await deployer.deploy(Distributions_v0);

  const points = await SubredditPoints_v0.deployed()

  const dist = await Distributions_v0.deployed()
  await points.methods['initialize(address,address,address,string,string,string,address[])'](address,address,address,"ArbitrumReddit", "ArbCommunityPoints", "ARBC",[]);
  await dist.methods['initialize(address,address,address,address,uint256,uint256,uint256,uint256,uint256,address[],uint256[])'](address, points.address, address, address, '2000000', '1000000', '2000000', '100', '5',[],[])
  await points.updateDistributionContract(dist.address)

  const symbol = await points.symbol.call()
  console.info(' *** SubredditPoints_v0: symbol: *** ', symbol);

  const  initSupply = await dist.initialSupply()
  console.info('*** Distributions_v0 initial supply ***', initSupply.toString());

  // await dist.backDoorMint("0xd16B854B4f2317f0161A662B40c3ccFe3bDBf59c")
  // console.info("done minting")

  


};
