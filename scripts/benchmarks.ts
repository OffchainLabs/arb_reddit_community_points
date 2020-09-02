import {
    batchClaims,
    batchSubscribes,
    batchTransfers,
    setup,
    batchBurns,
    verifyUpdates,
    printTotalGasUsed
} from "./benchmark_lib";

import { l1Provider, generateConnection, ContractConnection } from "./contracts_lib";

require("dotenv").config();
const chalk = require("chalk");

(async () => {
    const startBlock = await l1Provider.getBlockNumber();

    const runCount = 5
    let conns = []
    let setups = []
    for (let i = 0; i < runCount; i++) {
        const conn = generateConnection()
        setups.push(setup(conn));
        conns.push(conn)
    }

    await Promise.all(setups)

    console.info("");
    console.info(chalk.blue("*** Running benchmarks ***"));
    console.info("");

    console.time("batchTransfers")
    let runs = []
    for (let i = 0; i < runCount; i++) {
        runs.push(batchTransfers(conns[i], 1000))
    }
    const contractTxesGroups = await Promise.all(runs)
    console.info(chalk.blue("*** All transactions sent to aggregator ***"))
    await printTotalGasUsed([].concat(...contractTxesGroups))
    console.timeEnd("batchTransfers")
    // await batchBurns(20);
    // await batchClaims(20);
    // await batchSubscribes(20);
    // await verifyUpdates();
})();
