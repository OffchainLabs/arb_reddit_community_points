import {
    batchClaims,
    batchSubscribes,
    batchTransfers,
    setup,
    batchBurns,
    verifyUpdates,
} from "./benchmark_lib";

import { l1Provider, generateConnection, ContractConnection } from "./contracts_lib";

require("dotenv").config();
const chalk = require("chalk");


async function runBatch() {
    const conn = generateConnection()
    await setup(conn);

    console.info("");
    console.info(chalk.blue("*** Running benchmarks ***"));
    console.info("");

    console.time("batchTransfers")
    await batchTransfers(conn, 1000)
    console.timeEnd("batchTransfers")
}

(async () => {
    const startBlock = await l1Provider.getBlockNumber();

    let runs = []
    for (let i = 0; i < 1; i++) {
        runs.push(runBatch())
    }
    await Promise.all(runs)
    // await batchBurns(20);
    // await batchClaims(20);
    // await batchSubscribes(20);
    // await verifyUpdates();
})();
