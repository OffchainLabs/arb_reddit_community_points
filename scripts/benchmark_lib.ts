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
        value: new BigNumber(2), // value should be unique to identify transfer
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

export const getReceipts = async(
    txHashes: string[]
): Promise<ethers.providers.TransactionReceipt[]> => {
    try {
        let receipts: ethers.providers.TransactionReceipt[] = []
        for (let i = 0; i < txHashes.length; i++) {
            receipts.push(await arbProvider.waitForTransaction(txHashes[i]))
        }
        return receipts
    } catch(err) {
        console.warn(chalk.red("error getting txn responses", err));
        return []
    }
}

export const printTotalGasUsed = async (
    txHashes: string[]
) => {
    try {
        let receipts = await getReceipts(txHashes)
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

export const initialSetup = async () => {
    console.info("");
    console.info(chalk.blue("initializing..."));
    updates.initialBlockHeight = await l1Provider.getBlockNumber() + 1;
}

export const setupConn = async (conn: ContractConnection) => {
    const { address } = conn.arbWallet;
    const bal = await conn.PointsContract.balanceOf(address);

    // authorize subscriptions contract for subscribes:
    const tx = await conn.PointsContract.authorizeOperator(conn.SubscriptionsContract.address)
    await tx.wait()

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
        } catch (err) {
            console.warn(chalk.red("Error claiming tokens for op:", err));
        }
    }
};

export const localSetup = async(conn: ContractConnection) => {
    const { address } = conn.arbWallet;
    const bal = await conn.PointsContract.balanceOf(address);
    updates.initialMainBalance = bal;
    updates.initialBlockHeight = await l1Provider.getBlockNumber() + 1;
    console.info(
        chalk.green(
            `Account has ${bal.toNumber()} tokens; good to go!`
        )
    );
}

export const setup = async(conn: ContractConnection) => {
    await initialSetup()
    await setupConn(conn)
    await localSetup(conn)
}

export const batchClaims = async (conn: ContractConnection, count: number, nonce?: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} claims...`));
    updates.claims.count = new BigNumber(count);
    if (nonce === undefined) {
        nonce = await conn.arbWallet.getTransactionCount();
    }
    const claims: string[] = [];
    for (let i = 0; i < count; i++) {
        const signedClaim = await randomSignedClaim();
        updates.claims.claimedAddresses.push(signedClaim.address);
        claims.push(
            (await conn.DistributionsContract.claim(
                round,
                signedClaim.address,
                karmaConstant,
                signedClaim.signature,
                { 
                    nonce,
                    gasPrice: 0,
                    gasLimit: 10000000,
                }
            )).hash
        );
        nonce++;
    }
    return claims;
};

export const batchSubscribes = async (conn: ContractConnection, count: number, nonce?: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} subscribes...`));
    updates.subscribes.count = new BigNumber(count);
    if (nonce === undefined) {
        nonce = await conn.arbWallet.getTransactionCount();
    }
    const subscribes: string[] = [];
    for (let i = 0; i < count; i++) {
        subscribes.push(
            (await conn.SubscriptionsContract.subscribe(conn.arbWallet.address, false, {
                nonce,
                gasPrice: 0,
                gasLimit: 10000000,
            })).hash
        );
        nonce++;
    }
    return subscribes;
};

export const batchTransfers = async (conn: ContractConnection, count: number, nonce?: number): Promise<string[]> => {
    console.info(chalk.blue(`broadcasting ${count} transfers...`));
    updates.transfers.count = new BigNumber(count);
    if (nonce === undefined) {
        nonce = await conn.arbWallet.getTransactionCount();
    }
    const transfers: string[] = [];
    for (let i = 0; i < count; i++) {
        const rec = Wallet.createRandom().address;
        updates.transfers.recipientAddresses.push(rec);
        transfers.push(
            (await conn.PointsContract.transfer(rec, updates.transfers.value, {
                nonce,
                gasPrice: 0,
                gasLimit: 10000000,
            })).hash
        );
        nonce++;
    }
    return transfers;
};

export const batchBurns = async (conn: ContractConnection, count: number, nonce?: number): Promise<string[]> => {
    updates.burns.count = new BigNumber(count);
    console.info(chalk.blue(`broadcasting ${count} burns...`));
    if (nonce === undefined) {
        nonce = await conn.arbWallet.getTransactionCount();
    }
    const burns: string[] = [];
    for (let i = 0; i < count; i++) {
        burns.push(
            (await conn.PointsContract.burn(updates.burns.value, "0x", {
                nonce,
                gasPrice: 0,
                gasLimit: 10000000,
            })).hash
        );
        nonce++;
    }
    return burns;
};

export const verifyUpdates = async (conn: ContractConnection) => {
    console.info(chalk.blue("Verifying updates and events:"));

    const claimBalances = []
    for (const address of updates.claims.claimedAddresses) {
        claimBalances.push(await conn.PointsContract.balanceOf(address))
    }

    outputResult(
        claimBalances.every((balance) => balance.eq(updates.claims.value)),
        `Balances updated from claims`,
        "Error: claims unsuccessful"
    )

    const transferBalance = []
    for (const address of updates.transfers.recipientAddresses) {
        transferBalance.push(await conn.PointsContract.balanceOf(address))
    }

    outputResult(
        transferBalance.every((balance) => balance.eq(updates.transfers.value)),
        `Balances updated from transfers`,
        "Error: Transfers error"
    )

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

    await verifyClaimLogs(conn)
    await verifySubscribeLogs(conn)
    await verifyBurnLogs(conn)
    await verifyTransferLogs(conn)
}


export const verifyClaimLogs = async (conn: ContractConnection) => {
    for (const address of updates.claims.claimedAddresses) {
        const claimLogs = await arbProvider.getLogs({
            fromBlock: updates.initialBlockHeight,
            ...conn.DistributionsContract.filters.ClaimPoints(null, address),
        });

        if (claimLogs.length == 0) {
            console.info(chalk.red(`Couldn't find claim log for claim to ${address}`))
            return
        }

        if (claimLogs.length > 1) {
            console.info(chalk.red(`Too many claim logs for ${address}`))
            return
        }
    }
}

export const verifySubscribeLogs = async (conn: ContractConnection) => {
    const { address } = conn.arbWallet
    const subscribedLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        ...conn.SubscriptionsContract.filters.Subscribed(address),
    });
    outputResult(
        subscribedLogs.length === updates.subscribes.count.toNumber(),
        `${subscribedLogs.length} subscribe events emited`,
        `Error emiting subscribe events: events:${
            subscribedLogs.length
        }, target: ${updates.subscribes.count.toNumber()}`
    );
}

export const verifyBurnLogs = async (conn: ContractConnection) => {
    const { address } = conn.arbWallet
    const burnLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        ...conn.PointsContract.filters.Burned(null, address)
    });
    const burnTarget = updates.burns.count
        .add(updates.subscribes.count)
        .toNumber();
    outputResult(
        burnLogs.length === burnTarget,
        `${burnLogs.length} burns emited`,
        `Error: only ${burnLogs.length} Burned events emitted; target: ${burnTarget}`
    );
}

export const verifyTransferLogs = async (conn: ContractConnection) => {
    const { address } = conn.arbWallet
    const transferLogs = await arbProvider.getLogs({
        fromBlock: updates.initialBlockHeight,
        ...conn.PointsContract.filters.Transfer(address)
    });

    let transferCount = 0
    for (const log of transferLogs) {
        if (updates.transfers.value.eq(log.data)) {
            transferCount++
        }
    }
    const transferTarget = updates.transfers.count.toNumber();
    outputResult(
        transferCount === transferTarget,
        `${transferTarget} transfer events emited`,
        `Error emiting transfer events. events:${transferCount} target:${transferTarget}`
    );
}

const outputResult = (bool: boolean, success: string, fail: string) => {
    bool ? console.info(chalk.green(success)) : console.info(chalk.red(fail));
};

export interface SubResults {
    claimHashes: string[]
    subHashes: string[]
    burnHashes: string[]
    transferHashes: string[]
}

export function flattenResults(results: SubResults): string[] {
    return [].concat([...results.claimHashes, ...results.subHashes, ...results.burnHashes, ...results.transferHashes])
}
