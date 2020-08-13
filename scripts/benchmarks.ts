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

    batchTransfers(20, () => {
        batchBurns(20, () => {
            batchClaims(20, () => {
                batchSubscribes(20, verifyUpdates);
            });
        });
    });
})();
