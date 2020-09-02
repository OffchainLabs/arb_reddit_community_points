import {
    batchClaims,
    batchSubscribes,
    batchTransfers,
    setup,
    batchBurns,
    verifyUpdates,
    printTotalGasUsed
} from "./benchmark_lib";

import { generateConnection, randomWallet, ContractConnection } from "./contracts_lib";

import { ethers } from "ethers";

require("dotenv").config();
const chalk = require("chalk");

const [privkey] = process.argv.slice(2);

(async () => {
    const conn = generateConnection(new ethers.Wallet(privkey))
    let txHashes = await batchTransfers(conn, 1000)
    process.send({ txHashes })
    
    // await batchBurns(20);
    // await batchClaims(20);
    // await batchSubscribes(20);
    // await verifyUpdates();
})();
