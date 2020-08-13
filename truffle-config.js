const wrapProvider = require('arb-ethers-web3-bridge').wrapProvider
const HDWalletProvider = require('@truffle/hdwallet-provider')
require('dotenv').config()

const mnemonic = process.env.MNEUMONIC
const arbProviderUrl= process.env.ARB_PROVIDER_URL
  

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },
    arbitrum: {
      provider: function () {
        return wrapProvider(
          new HDWalletProvider(mnemonic, arbProviderUrl)
        )
      },
      network_id: '*', // Match any network id
      gasPrice: 0,
    },
  },
  compilers: {
    solc: {
      version: '0.5.17', // Fetch exact version from solc-bin (default: truffle's version)
      docker: true, // Use "0.5.3" you've installed locally with docker (default: false)
      evmVersion: "istanbul",
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },
}
