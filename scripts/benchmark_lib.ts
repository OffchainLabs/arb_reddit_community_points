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
} from "./contracts_lib";
import { ethers, Wallet } from "ethers";
import { TransactionResponse, Log } from "ethers/providers";
import { BigNumber, formatEther } from "ethers/utils";

const chalk = require("chalk");

const karmaConstant = new BigNumber(1000);
const bigZero = new BigNumber(0);
const round = bigZero;

const updates = {
    initialMainBalance: bigZero,
    claims: {
        claimedAddresses: [],
        value: new BigNumber(1000),
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

const printTotalGasUsed = async (
    txnResponses: Promise<TransactionResponse>[],
    next?: () => any
) => {
    const startBlock = await l1Provider.getBlockNumber();

    Promise.all(txnResponses)
        .then((responses) => {
            const receiptPromises = responses.map((res) => res.wait());
            Promise.all(receiptPromises).then(async (receipts) => {
                const totalGasUsed = receipts.reduce(
                    (acc, current) => acc.add(current.gasUsed),
                    new BigNumber(0)
                );
                console.log(chalk.green(`Used ${totalGasUsed} ArbGas`));

                const endBlock = await l1Provider.getBlockNumber();

                printL1GasUsed(startBlock + 1, endBlock, next);
            });
        })
        .catch((err) => {
            console.warn(chalk.red("GAS CALC ERROR", err));
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

    let txCount = await arbWallet.getTransactionCount();
    const claims = [];
    for (let i = 0; i < count; i++) {
        const signedClaim = await randomSignedClaim();
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
};
export const batchTransfers = async (count: number, next?: () => any) => {
    console.info(chalk.blue(`broadcasting ${count} transfers...`));
    updates.transfers.count = new BigNumber(count);
    const rec = Wallet.createRandom().address;
    let txCount = await arbWallet.getTransactionCount();
    const transfers = [];
    for (let i = 0; i < count; i++) {
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
    console.info(chalk.blue("Verifying updates:"));
    const claimBalancePromises = updates.claims.claimedAddresses.map(
        (address) => PointsContract.balanceOf(address)
    );
    Promise.all(claimBalancePromises).then((balances) => {
        balances.every((balance) => balance.eq(updates.claims.value))
            ? console.info(chalk.green("Claims successful"))
            : console.info(chalk.red("Error: claims unsuccessful"));
    });

    updates.transfers.recipientAddresses.map((address) =>
        PointsContract.balanceOf(address)
    );
    Promise.all(claimBalancePromises).then((balances) => {
        balances.every((balance) => balance.eq(updates.transfers.value))
            ? console.info(chalk.green("Transfers successful"))
            : console.info(chalk.red("Error: Transfers unsuccessful"));
    });
    
    const { address } = arbWallet;
    const newBal = await PointsContract.balanceOf(address);
    const diff = updates.transfers.count
        .mul(updates.transfers.value)
        .add(updates.burns.count.mul(updates.burns.value))
        .add(updates.subscribes.count.mul(updates.subscribes.value));
    updates.initialMainBalance.sub(diff).eq(newBal)
        ? console.info(chalk.green("Subscribes and burns successful"))
        : console.info(chalk.red("Error: Subscribes/burns unsuccessful"));
};
