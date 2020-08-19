import {
    arbWallet,
    generateSignature,
    DistributionsContract,
    PointsContract,
    SubscriptionsContract,
    batchMint,
    getLastRound,
    l1Provider,
    l1Bridge,
    arbProvider,
} from "./contracts_lib";
import { ethers, Wallet } from "ethers";
import { TransactionResponse, Log } from "ethers/providers";
import { BigNumber, formatEther } from "ethers/utils";

const chalk = require("chalk");

const karmaConstant = new BigNumber(1000);
const bigZero = new BigNumber(0);
const round = bigZero;
const updates = {
    initialBlockHeight: 0,
    initialMainBalance: bigZero,
    claims: {
        claimedAddresses: [],
        value: new BigNumber(1000),
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
    txnResponses: Promise<TransactionResponse>[],
    next?: () => any
) => {
    const startBlock = await l1Provider.getBlockNumber();

    Promise.all(txnResponses)
        .then((responses) => {
            const receiptPromises = responses.map((res) => res.wait());
            Promise.all(receiptPromises)
                .then(async (receipts) => {
                    const totalGasUsed = receipts.reduce(
                        (acc, current) => acc.add(current.gasUsed),
                        new BigNumber(0)
                    );
                    console.log(chalk.green(`Used ${totalGasUsed} ArbGas`));

                    const endBlock = await l1Provider.getBlockNumber();

                    printL1GasUsed(startBlock + 1, endBlock, next);
                })
                .catch((err) => {
                    console.warn("error getting receipts", err);
                    next && next();
                });
        })
        .catch((err) => {
            console.warn(chalk.red("error getting txn responses", err));
            next && next();
        });
};

const printL1GasUsed = async (
    startBlockHeight: number,
    endBlockHeight: number,
    next?: () => any
) => {
    const inbox = await l1Bridge.globalInboxConn();
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
        totalGasUsed = totalGasUsed.add(txnReceipt.gasUsed);
    }
    console.info(
        chalk.green(
            `Used ${totalGasUsed} L1 gas over ${logs.length} ${
                logs.length === 1 ? "batch" : "batches"
            }`
        )
    );
    console.info("");
    next && next();
};

const randomSignedClaim = async () => {
    const address = Wallet.createRandom().address;
    const signature = await generateSignature(address, round, karmaConstant);
    return {
        address,
        signature,
    };
};

export const batchClaims = async (count: number, next?: () => any) => {
    console.info(chalk.blue(`broadcasting ${count} claims...`));
    updates.claims.count = new BigNumber(count);
    let txCount = await arbWallet.getTransactionCount();
    const claims = [];
    for (let i = 0; i < count; i++) {
        const signedClaim = await randomSignedClaim();
        updates.claims.claimedAddresses.push(signedClaim.address);
        claims.push(
            DistributionsContract.claim(
                round,
                signedClaim.address,
                karmaConstant,
                signedClaim.signature,
                { nonce: txCount }
            )
        );
        txCount++;
    }
    printTotalGasUsed(claims, next);
};

export const batchSubscribes = async (count: number, next?: () => any) => {
    console.info(chalk.blue(`broadcasting ${count} subscribes...`));
    updates.subscribes.count = new BigNumber(count);
    let txCount = await arbWallet.getTransactionCount();
    const subscribes = [];
    for (let i = 0; i < count; i++) {
        subscribes.push(
            SubscriptionsContract.subscribe(arbWallet.address, false, {
                nonce: txCount,
            })
        );
        txCount++;
    }
    printTotalGasUsed(subscribes, next);
};

export const setup = async () => {
    console.info("");
    console.info(chalk.blue("initializing..."));
    const { address } = arbWallet;
    const bal = await PointsContract.balanceOf(address);

    if (bal.isZero()) {
        console.info(chalk.blue("Transfering tokens to main account..."));
        const signature = await generateSignature(
            address,
            round,
            karmaConstant
        );
        try {
            const res = await DistributionsContract.claim(
                round,
                address,
                karmaConstant,
                signature
            );
            await res.wait();
            const bal = await PointsContract.balanceOf(address);
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
export const batchTransfers = async (count: number, next?: () => any) => {
    console.info(chalk.blue(`broadcasting ${count} transfers...`));
    updates.transfers.count = new BigNumber(count);
    let txCount = await arbWallet.getTransactionCount();
    const transfers = [];
    for (let i = 0; i < count; i++) {
        const rec = Wallet.createRandom().address;
        updates.transfers.recipientAddresses.push(rec);
        transfers.push(
            PointsContract.transfer(rec, updates.transfers.value, {
                nonce: txCount,
            })
        );
        txCount++;
    }
    printTotalGasUsed(transfers, next);
};

export const batchBurns = async (count: number, next?: () => any) => {
    updates.burns.count = new BigNumber(count);
    console.info(chalk.blue(`broadcasting ${count} burns...`));
    let txCount = await arbWallet.getTransactionCount();
    const burns = [];
    for (let i = 0; i < count; i++) {
        burns.push(
            PointsContract.burn(updates.burns.value, "0x", { nonce: txCount })
        );
        txCount++;
    }
    printTotalGasUsed(burns, next);
};

export const verifyUpdates = async () => {
    console.info(chalk.blue("Verifying updates and events:"));

    const claimBalancePromises = updates.claims.claimedAddresses.map(
        (address) => PointsContract.balanceOf(address)
    );
    Promise.all(claimBalancePromises).then((balances) => {
        outputResult(
            balances.every((balance) => balance.eq(updates.claims.value)),
            `Balances updated from claims`,
            "Error: claims unsuccessful"
        );
    });

    const transferBalancePromises = updates.transfers.recipientAddresses.map(
        (address) => PointsContract.balanceOf(address)
    );
    Promise.all(transferBalancePromises).then((balances) => {
        outputResult(
            balances.every((balance) => balance.eq(updates.transfers.value)),
            `Balances updated from transfers`,
            "Error: Transfers error"
        );
    });

    const { address } = arbWallet;
    const newBal = await PointsContract.balanceOf(address);
    const diff = updates.transfers.count
        .mul(updates.transfers.value)
        .add(updates.burns.count.mul(updates.burns.value))
        .add(updates.subscribes.count.mul(updates.subscribes.value));
    outputResult(
        updates.initialMainBalance.sub(diff).eq(newBal),
        "Balance updated from subscribes and burns",
        "Error: Subscribes/burns unsuccessful"
    );

    const { ClaimPoints } = DistributionsContract.interface.events;
    const { Subscribed } = SubscriptionsContract.interface.events;
    const { Transfer, Burned } = PointsContract.interface.events;

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
