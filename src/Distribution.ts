import * as fetch from "node-fetch";
import { ethers, Contract, utils } from 'ethers'
import { ArbProvider, ArbWallet } from 'arb-provider-ethers'
import env from './constants'
import { abi as Distributions_v0 } from "./abis/Distributions_v0.json";

(global as any).fetch = fetch;

// TODO
const karmaConstant = new utils.BigNumber(20)
const subredditLowerCase = "arbreddit"
const rootUrl = "https://www.qqq.com#claim/"

const ethereumProvider = new ethers.providers.JsonRpcProvider(env.ethProviderUrl)

const arbProvider = new ArbProvider(
    env.arbProviderUrl,
    ethereumProvider,
    "http://104.248.7.183:1237",
    true
  );

const ethereumWallet = new ethers.Wallet(env.privateKey, ethereumProvider);
export const arbWallet = new ArbWallet(ethereumWallet, arbProvider);

const DistributionsContract = new Contract('0xabc', Distributions_v0, arbWallet)

const getLastRound = async (): Promise<utils.BigNumber> =>{
    return await DistributionsContract.lastRound()

}

const canClaim = async (address: string, lastRound: utils.BigNumber) =>{
    const lastClamedRound: utils.BigNumber = await  DistributionsContract.claimableRounds(address)
    return lastClamedRound.lte(lastRound)
}

export const advanceRound = async () => {
    const currentRound = await getLastRound();
    await DistributionsContract.advanceToRound( currentRound.add(1), karmaConstant)

}


export const generateSignature = async (account: string, round: utils.BigNumber)=> {
    // subredditLowerCase, uint256(round), account, karma
    const hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode([ "string", "uint256","address", "uint256"  ], [ subredditLowerCase,  round, account, karmaConstant]))
    return await arbWallet.signMessage(ethers.utils.arrayify(hash));
}


export const generateResponse = async (address: string)=>{
    const lastRound = await getLastRound()
    const userCanClaim = await canClaim(address, lastRound)
    if (!userCanClaim){
        return "Looks like you've already claimed your coins this round; try again next round!"
    }
    const sig = await generateSignature(address, lastRound)

    return `Request approved! Click here to claim your coins: ${rootUrl}${lastRound}/${address}/${sig}`

}

