require('dotenv').config()

export default  {
    consumerKey: process.env.CONSUMER_KEY,
    consumerSecret: process.env.CONSUMER_SECRET,
    accessTokenKey: process.env.ACCESS_TOKEN_KEY,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    arbProviderUrl: process.env.ARB_PROVIDER_URL,
    ethProviderUrl: process.env.ETH_PROVIDER_URL,
    privateKey: process.env.PRIVATE_KEY,
    tokenAddress: '0x123498761298467'
}
