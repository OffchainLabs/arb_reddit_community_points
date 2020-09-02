import * as fetch from "node-fetch";
import { ethers, Contract, utils } from "ethers";
import { abi as Distributions_v0 } from "../build/contracts/Distributions_v0.json";
import { abi as Subscriptions_v0 } from "../build/contracts/Subscriptions_v0.json";
import { abi as SubredditPoints_v0 } from "../build/contracts/SubredditPoints_v0.json";
import { L1Bridge } from "arb-provider-ethers";

require("dotenv").config();

import * as contractAddresses from "../contract_addresses.json";

(global as any).fetch = fetch;

export const karmaConstant = new utils.BigNumber(1000);
const subredditLowerCase = "arbitrumreddit";

export const arbProvider = new ethers.providers.JsonRpcProvider(
    process.env.ARB_PROVIDER_URL
);

// const ethereumWallet = new ethers.Wallet(env.privateKey, arbProvider);
const mnemonic = process.env.MNEUMONIC;
const ethereumWallet = ethers.Wallet.fromMnemonic(mnemonic);

export const masterArbWallet = ethereumWallet.connect(arbProvider);
export const arbWallet =   ethers.Wallet.createRandom().connect(arbProvider);

export const l1Provider = new ethers.providers.JsonRpcProvider(
    process.env.ETH_PROVIDER_URL
);
const l1Wallet = ethers.Wallet.fromMnemonic(mnemonic);

const l1Signer = l1Wallet.connect(l1Provider);

export const l1Bridge = new L1Bridge(l1Signer, process.env.ROLLUP_ADDRESS);

export const DistributionsContract = new Contract(
    contractAddresses.distributionAddress,
    Distributions_v0,
    arbWallet
);
export const SubscriptionsContract = new Contract(
    contractAddresses.subscriptionsAddress,
    Subscriptions_v0,
    arbWallet
);
export const PointsContract = new Contract(
    contractAddresses.pointsAddress,
    SubredditPoints_v0,
    arbWallet
);
export const getLastRound = async (): Promise<utils.BigNumber> => {
    return await DistributionsContract.lastRound();
};

export const advanceRound = async () => {
    const currentRound = await getLastRound();
    const res = await DistributionsContract.advanceToRound(
        currentRound.add(1),
        karmaConstant
    );
    res.wait();
    return currentRound.add(1);
};

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

export const batchMint = (data: string) => {
    DistributionsContract.batchMint(data);
};

export const authorizeOp = async () =>{
    const txn = await PointsContract.authorizeOperator(contractAddresses.subscriptionsAddress)
    await txn.wait()
}

const canClaim = async (address: string, lastRound: utils.BigNumber) =>{
    const lastClamedRound: utils.BigNumber = await  DistributionsContract.claimableRounds(address)
    return lastClamedRound.lte(lastRound)
}

export const generateResponse = async (address: string)=>{
    const lastRound = await getLastRound()
    const userCanClaim = await canClaim(address, lastRound)
    if (!userCanClaim){
        return "Looks like you've already claimed your coins this round; try again next round!"
    }
    const sig = await generateSignature(address, lastRound)

    return `Request approved! Click here to claim your coins: ${process.env.CLAIM_URL}/${lastRound}/${address}/${sig}`

}
