import {
    batchClaims,
    batchSubscribes,
    batchTransfers,
    setup,
    batchBurns,
    verifyUpdates,
} from "./benchmark_lib";

import { l1Provider } from "./contracts_lib";
require("dotenv").config();
const chalk = require("chalk");

(async () => {
    const startBlock = await l1Provider.getBlockNumber();

    await setup();

    console.info("");
    console.info(chalk.blue("*** Running benchmarks ***"));
    console.info("");

    await batchTransfers(1000);
    // await batchBurns(20);
    // await batchClaims(20);
    // await batchSubscribes(20);
    // await verifyUpdates();
})();
