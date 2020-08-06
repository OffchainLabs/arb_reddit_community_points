import * as fetch from "node-fetch";
import { ethers, Contract, utils } from 'ethers'
import { abi as Distributions_v0 } from "../build/contracts/Distributions_v0.json";
import { abi as Subscriptions_v0 } from "../build/contracts/Subscriptions_v0.json";
import { abi as SubredditPoints_v0 } from "../build/contracts/SubredditPoints_v0.json";
require('dotenv').config();

import * as contractAddresses from "../contract_addresses.json"

(global as any).fetch = fetch;

export const karmaConstant = new utils.BigNumber(20)
const subredditLowerCase = "arbitrumreddit"

const ethereumProvider = new ethers.providers.JsonRpcProvider(process.env.ARB_PROVIDER_URL)



// const ethereumWallet = new ethers.Wallet(env.privateKey, ethereumProvider);
const mnemonic = process.env.MNEUMONIC
const ethereumWallet = ethers.Wallet.fromMnemonic(mnemonic)

export const arbWallet  = ethereumWallet.connect(ethereumProvider)

export const DistributionsContract = new Contract(contractAddresses.distributionAddress, Distributions_v0, arbWallet)
export const SubscriptionsContract = new Contract(contractAddresses.subscriptionsAddress, Subscriptions_v0, arbWallet)
export const PointsContract = new Contract(contractAddresses.pointsAddress, SubredditPoints_v0, arbWallet)
export const getLastRound =
async (): Promise<utils.BigNumber> =>{
    return await DistributionsContract.lastRound()
}


export const advanceRound = async () => {
    const currentRound = await getLastRound();
    const res = await DistributionsContract.advanceToRound( currentRound.add(1), karmaConstant)
    res.wait()
    return  currentRound.add(1)
}


export const generateSignature = async (account: string, round: utils.BigNumber, karma?: utils.BigNumber)=> {
    const hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([ "string", "uint256","address", "uint256"  ], [ subredditLowerCase,  round, account, karma || karmaConstant]))
    return await arbWallet.signMessage(ethers.utils.arrayify(hash));
}




export const batchMint = (data: string) =>{
    DistributionsContract.batchMint(data)
}
