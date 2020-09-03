import {
    batchClaims,
    batchSubscribes,
    batchTransfers,
    batchBurns,
    verifyUpdates,
    flattenResults,
    getReceipts,
    localSetup,
    verifyBurnLogs,
    verifyTransferLogs
} from "./benchmark_lib";

import { generateConnection, randomWallet, ContractConnection } from "./contracts_lib";

import { ethers } from "ethers";

require("dotenv").config();
const chalk = require("chalk");

const [privkey, claimCountStr, subCountStr, burnCountStr, transferCountStr] = process.argv.slice(2);

const claimCount = parseInt(claimCountStr);
const subCount = parseInt(subCountStr);
const burnCount = parseInt(burnCountStr);
const transferCount = parseInt(transferCountStr);

(async () => {
    const conn = generateConnection(new ethers.Wallet(privkey))
    await localSetup(conn)
    let claimHashes = []
    let subHashes = []
    let burnHashes = []
    let transferHashes = []

    let nonce = await conn.arbWallet.getTransactionCount()

    claimHashes = await batchClaims(conn, claimCount, nonce)
    nonce += claimCount
    subHashes = await batchSubscribes(conn, subCount, nonce)
    nonce += subCount
    burnHashes = await batchBurns(conn, burnCount, nonce)
    nonce += burnCount
    transferHashes = await batchTransfers(conn, transferCount, nonce)

    const ret = { claimHashes, subHashes, burnHashes, transferHashes }
    process.send(ret)

    console.log("Waiting for all tx receipts")
    // Pause to get all tx receipts before verifying the results

    await getReceipts(flattenResults(ret))
    await verifyUpdates(conn)
})();
