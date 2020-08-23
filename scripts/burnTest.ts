import {
    setup,
    batchBurns
} from "./benchmark_lib";

import {
    arbWallet,
    PointsContract,
    l1Provider,
    arbProvider,
} from "./contracts_lib";
require("dotenv").config();
const chalk = require("chalk");

(async () => {
    const startBlock = await l1Provider.getBlockNumber();
    await setup();
    const { Burned } = PointsContract.interface.events;

    await batchBurns(1)

    const burnLogs = await arbProvider.getLogs({
        fromBlock: startBlock,
        topics: [Burned.topic],
        toBlock: 'latest',
    });
    const newBal = await PointsContract.balanceOf(arbWallet.address);
    console.info(`arbwallet now has ${newBal.toNumber()} tokens`);
    console.info(`${burnLogs.length} Burned events emitted`);
})();
