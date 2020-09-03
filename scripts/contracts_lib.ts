import * as fetch from "node-fetch";
import { ethers, Contract, utils } from "ethers";
import { abi as Distributions_v0 } from "../build/contracts/Distributions_v0.json";
import { abi as Subscriptions_v0 } from "../build/contracts/Subscriptions_v0.json";
import { abi as SubredditPoints_v0 } from "../build/contracts/SubredditPoints_v0.json";
import { L1Bridge, abi } from "arb-provider-ethers";

require("dotenv").config();

import * as contractAddresses from "../contract_addresses.json";

(global as any).fetch = fetch;

export const karmaConstant = new utils.BigNumber(1000);
const subredditLowerCase = "arbitrumreddit";

export const arbProvider = new ethers.providers.JsonRpcProvider(
    process.env.ARB_PROVIDER_URL
);

// arbProvider.on("debug", (data: any) => console.log(data))

const mnemonic = process.env.MNEUMONIC;
const ethereumWallet = ethers.Wallet.fromMnemonic(mnemonic);

const masterArbWallet = ethereumWallet.connect(arbProvider);

export const l1Provider = new ethers.providers.JsonRpcProvider(
    process.env.ETH_PROVIDER_URL
);

const arbRollup = abi.ArbRollupFactory.connect(process.env.ROLLUP_ADDRESS, l1Provider)
export const globalInbox = (async () => {
    const globalInboxAddress = await arbRollup.globalInbox()
    return abi.GlobalInboxFactory.connect(
        globalInboxAddress,
        l1Provider
    )
})()

export const MasterDistributionsContract = new Contract(
    contractAddresses.distributionAddress,
    Distributions_v0,
    masterArbWallet
);

const canClaim = async (address: string, lastRound: utils.BigNumber) =>{
    const lastClamedRound: utils.BigNumber = await  MasterDistributionsContract.claimableRounds(address)
    return lastClamedRound.lte(lastRound)
}

export const generateSignature = async (
    account: string,
    round: utils.BigNumber,
    karma?: utils.BigNumber
) => {
    const hash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
            ["string", "uint256", "address", "uint256"],
            [subredditLowerCase, round, account, karma || karmaConstant]
        )
    );
    return await masterArbWallet.signMessage(ethers.utils.arrayify(hash));
};

export const advanceRound = async () => {
    const currentRound = await MasterDistributionsContract.lastRound();
    const res = await MasterDistributionsContract.advanceToRound(
        currentRound.add(1),
        karmaConstant
    );
    res.wait();
    return currentRound.add(1);
};

export const generateResponse = async (address: string)=>{
    const lastRound = await MasterDistributionsContract.lastRound()
    const userCanClaim = await canClaim(address, lastRound)
    if (!userCanClaim){
        return "Looks like you've already claimed your coins this round; try again next round!"
    }
    const sig = await generateSignature(address, lastRound)

    return `Request approved! Click here to claim your coins: ${process.env.CLAIM_URL}/${lastRound}/${address}/${sig}`
}

export interface ContractConnection {
    arbWallet: ethers.Wallet
    DistributionsContract: Contract
    SubscriptionsContract: Contract
    PointsContract: Contract
}

export function randomWallet(): ethers.Wallet {
    return ethers.Wallet.createRandom()
}

export function generateConnection(wallet: ethers.Wallet) : ContractConnection {
    const arbWallet = wallet.connect(arbProvider);

    const DistributionsContract = new Contract(
        contractAddresses.distributionAddress,
        Distributions_v0,
        arbWallet
    );
    const SubscriptionsContract = new Contract(
        contractAddresses.subscriptionsAddress,
        Subscriptions_v0,
        arbWallet
    );
    const PointsContract = new Contract(
        contractAddresses.pointsAddress,
        SubredditPoints_v0,
        arbWallet
    );

    return {
        arbWallet,
        DistributionsContract,
        SubscriptionsContract,
        PointsContract
    }
}
