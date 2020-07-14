const ethers = require('ethers')
const ArbEth = require('arb-provider-ethers')
const ProviderBridge = require('arb-ethers-web3-bridge')

const mnemonic = 'jar deny prosper gasp flush glass core corn alarm treat leg smart'

const fetch = require('node-fetch')
global.fetch = fetch

module.exports = {
  networks: {
      arbitrum: {
          provider: function () {

              // Provider to the L1 chain that the rollup is deployed on
              const provider = new ethers.providers.JsonRpcProvider(
                'http://localhost:7545'
              )
              const arbProvider = new ArbEth.ArbProvider(
                'http://localhost:1235', // Url to an Arbitrum validator with an open rpc interface
                provider
              )
              const wallet = new ethers.Wallet.fromMnemonic(mnemonic).connect(
                provider
              )
              return new ProviderBridge(
                arbProvider,
                new ArbEth.ArbWallet(wallet, arbProvider)
              )
          },
          network_id: "*",
          gasPrice: 0,
          networkCheckTimeout: 10000
      }
  }
};