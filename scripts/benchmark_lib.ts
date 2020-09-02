import {
    generateSignature,
    l1Provider,
    globalInbox,
    arbProvider,
    ContractConnection
} from "./contracts_lib";
import { ethers, Wallet, ContractTransaction } from "ethers";
import { TransactionResponse, Log } from "ethers/providers";
import { BigNumber, formatEther } from "ethers/utils";

const chalk = require("chalk");

const karmaConstant = new BigNumber(100000000000);
const bigZero = new BigNumber(0);
const round = bigZero;
const updates = {
    initialBlockHeight: 0,
    initialMainBalance: bigZero,
    claims: {
        claimedAddresses: [],
        value: karmaConstant,
        count: bigZero,
    },
    transfers: {
        recipientAddresses: [],
        value: new BigNumber(1),
        count: bigZero,
    },
    burns: {
        count: bigZero,
        value: new BigNumber(1),
    },
    subscribes: {
        value: new BigNumber(1),
        count: bigZero,
    },
};

export const printTotalGasUsed = async (
    txHashes: string[]
) => {
    try {
        let receipts = []
        for (let i = 0; i < txHashes.length; i++) {
            receipts.push(await arbProvider.waitForTransaction(txHashes[i]))
        }
        const startBlock  = receipts.reduce((acc, curr)=> Math.min(acc,curr.blockNumber),Infinity)
        const endBlock  = receipts.reduce((acc, curr)=> Math.max(acc,curr.blockNumber),0)
        const totalGasUsed = receipts.reduce(
            (acc, current) => acc.add(current.gasUsed),
            new BigNumber(0)
        );
        console.log(chalk.green(`Used ${totalGasUsed} ArbGas`));

        await printL1GasUsed(startBlock , endBlock);
        console.info("");
        return receipts
    } catch(err) {
        console.warn(chalk.red("error getting txn responses", err));
        throw err
    }
};

const printL1GasUsed = async (
    startBlockHeight: number,
    endBlockHeight: number,
) => {
    const inbox = await globalInbox;
    const { MessageDeliveredFromOrigin } = inbox.interface.events;
    const topics = [MessageDeliveredFromOrigin.topic];
    const logs = await l1Provider.getLogs({
        topics,
        fromBlock: startBlockHeight,
        toBlock: endBlockHeight,
    });
    let totalGasUsed = new BigNumber(0);
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        const txnResp = await l1Provider.getTransaction(log.transactionHash);
        const txnReceipt = await txnResp.wait();
        console.info(chalk.green(`Make L1 aggregator tx`, log.transactionHash))
        totalGasUsed = totalGasUsed.add(txnReceipt.gasUsed);
    }
    console.info(
        chalk.green(
            `Used ${totalGasUsed} L1 gas over ${logs.length} ${
                logs.length === 1 ? "batch" : "batches"
            }`
        )
    );
};

const randomSignedClaim = async () => {
    const address = Wallet.createRandom().address;
    const signature = await generateSignature(address, round, karmaConstant);
    return {
        address,
        signature,
    };
};

export const batchClaims = async (conn: ContractConnection, count: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} claims...`));
    updates.claims.count = new BigNumber(count);
    let txCount = await conn.arbWallet.getTransactionCount();
    const claims = [];
    for (let i = 0; i < count; i++) {
        const signedClaim = await randomSignedClaim();
        updates.claims.claimedAddresses.push(signedClaim.address);
        claims.push(
            (await conn.DistributionsContract.claim(
                round,
                signedClaim.address,
                karmaConstant,
                signedClaim.signature,
                { nonce: txCount }
            )).hash
        );
        txCount++;
    }
    return printTotalGasUsed(claims);
};

export const batchSubscribes = async (conn: ContractConnection, count: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} subscribes...`));
    updates.subscribes.count = new BigNumber(count);
    let txCount = await conn.arbWallet.getTransactionCount();
    const subscribes = [];
    for (let i = 0; i < count; i++) {
        subscribes.push(
            (await conn.SubscriptionsContract.subscribe(conn.arbWallet.address, false, {
                nonce: txCount,
            })).hash
        );
        txCount++;
    }
    return printTotalGasUsed(subscribes);
};

export const setup = async (conn: ContractConnection) => {
    console.info("");
    console.info(chalk.blue("initializing..."));
    const { address } = conn.arbWallet;
    const bal = await conn.PointsContract.balanceOf(address);

    if (bal.isZero()) {
        console.info(chalk.blue("Transfering tokens to main account..."));
        const signature = await generateSignature(
            address,
            round,
            karmaConstant
        );
        try {
            const res = await conn.DistributionsContract.claim(
                round,
                address,
                karmaConstant,
                signature
            );
            await res.wait();
            const bal = await conn.PointsContract.balanceOf(address);
            updates.initialMainBalance = bal;
            console.info(
                chalk.green(
                    `Successfully claimed ${bal.toNumber()} tokens for main account; good to go!`
                )
            );
        } catch (err) {
            console.warn(chalk.red("Error claiming tokens for op:", err));
        }
    } else {
        updates.initialMainBalance = bal;
        console.info(
            chalk.green(
                `Main account has ${bal.toNumber()} tokens; good to go!`
            )
        );
    }
    console.info("");
    updates.initialBlockHeight = await l1Provider.getBlockNumber() + 1;
};
export const batchTransfers = async (conn: ContractConnection, count: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} transfers...`));
    updates.transfers.count = new BigNumber(count);
    let txCount = await conn.arbWallet.getTransactionCount();
    const transfers: string[] = [];
    for (let i = 0; i < count; i++) {
        const rec = Wallet.createRandom().address;
        updates.transfers.recipientAddresses.push(rec);
        transfers.push(
            (await conn.PointsContract.transfer(rec, updates.transfers.value, {
                nonce: txCount,
                gasPrice: 0,
                gasLimit: 150000,
            })).hash
        );
        txCount++;
    }
    return transfers;
};

export const batchBurns = async (conn: ContractConnection, count: number): Promise<string[]> => {
    updates.burns.count = new BigNumber(count);
    console.info(chalk.blue(`broadcasting ${count} burns...`));
    let txCount = await conn.arbWallet.getTransactionCount();
    const burns = [];
    for (let i = 0; i < count; i++) {
        burns.push(
            (await conn.PointsContract.burn(updates.burns.value, "0x", { nonce: txCount })).hash
        );
        txCount++;
    }
    return printTotalGasUsed(burns);
};

export const verifyUpdates = async (conn: ContractConnection) => {
    console.info(chalk.blue("Verifying updates and events:"));

    const claimBalancePromises = updates.claims.claimedAddresses.map(
        (address) => conn.PointsContract.balanceOf(address)
    );
    Promise.all(claimBalancePromises).then((balances) => {
        outputResult(
            balances.every((balance) => balance.eq(updates.claims.value)),
            `Balances updated from claims`,
            "Error: claims unsuccessful"
        );
    });

    const transferBalancePromises = updates.transfers.recipientAddresses.map(
        (address) => conn.PointsContract.balanceOf(address)
    );
    Promise.all(transferBalancePromises).then((balances) => {
        outputResult(
            balances.every((balance) => balance.eq(updates.transfers.value)),
            `Balances updated from transfers`,
            "Error: Transfers error"
        );
    });

    const { address } = conn.arbWallet;
    const newBal = await conn.PointsContract.balanceOf(address);
    const diff = updates.transfers.count
        .mul(updates.transfers.value)
        .add(updates.burns.count.mul(updates.burns.value))
        .add(updates.subscribes.count.mul(updates.subscribes.value));
    outputResult(
        updates.initialMainBalance.sub(diff).eq(newBal),
        "Balance updated from subscribes and burns",
        "Error: Subscribes/burns unsuccessful"
    );

    const { ClaimPoints } = conn.DistributionsContract.interface.events;
    const { Subscribed } = conn.SubscriptionsContract.interface.events;
    const { Transfer, Burned } = conn.PointsContract.interface.events;

    const claimLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        topics: [ClaimPoints.topic],
    });
    outputResult(
        claimLogs.length === updates.claims.count.toNumber(),
        `${claimLogs.length} claim events emited`,
        `Error emiting claim events events:${
            claimLogs.length
        } target:${updates.claims.count.toNumber()}`
    );

    const subscribedLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        topics: [Subscribed.topic],
    });
    outputResult(
        subscribedLogs.length === updates.subscribes.count.toNumber(),
        `${subscribedLogs.length} subscribe events emited`,
        `Error emiting subscribe events: events:${
            subscribedLogs.length
        }, target: ${updates.subscribes.count.toNumber()}`
    );

    const transferLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        topics: [Transfer.topic],
    });

    const transferTarget = updates.transfers.count
        .add(updates.burns.count)
        .add(updates.subscribes.count)
        .add(updates.claims.count)
        .toNumber();
    outputResult(
        transferLogs.length === transferTarget,
        `${transferTarget} transfer events emited`,
        `Error emiting transfer events. events:${transferLogs.length} target:${transferLogs.length}`
    );
    const burnLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        topics: [Burned.topic],
    });
    const burnTarget = updates.burns.count
        .add(updates.subscribes.count)
        .toNumber();
    outputResult(
        burnLogs.length === burnTarget,
        `${burnLogs.length} burns emited`,
        `Error: only ${burnLogs.length} Burned events emitted; target: ${burnTarget}`
    );
};

const outputResult = (bool: boolean, success: string, fail: string) => {
    bool ? console.info(chalk.green(success)) : console.info(chalk.red(fail));
};
