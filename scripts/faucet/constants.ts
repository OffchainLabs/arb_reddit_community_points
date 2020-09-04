require('dotenv').config()
import * as contractAddresses from "../../contract_addresses.json"
export default  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    arbProviderUrl: process.env.ARB_PROVIDER_URL,
    ethProviderUrl: process.env.ETH_PROVIDER_URL,
    privateKey: process.env.PRIVATE_KEY,
    tokenAddress: process.env.TOKEN_ADDRESS,
    distributionAddress: contractAddresses.distributionAddress,
    mnemonic: process.env.MNEMONIC,
    claimUrl: process.env.CLAIM_URL
}
