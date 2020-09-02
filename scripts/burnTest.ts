import {
    setup,
    batchBurns
} from "./benchmark_lib";

import {
    l1Provider,
    arbProvider,
    generateConnection,
} from "./contracts_lib";

require("dotenv").config();
const chalk = require("chalk");

(async () => {
    const conn = generateConnection()
    const startBlock = await l1Provider.getBlockNumber();
    await setup(conn);
    const { Burned } = conn.PointsContract.interface.events;

    await batchBurns(conn, 1)

    const burnLogs = await arbProvider.getLogs({
        fromBlock: startBlock,
        topics: [Burned.topic],
        toBlock: 'latest',
    });
    const newBal = await conn.PointsContract.balanceOf(conn.arbWallet.address);
    console.info(`arbwallet now has ${newBal.toNumber()} tokens`);
    console.info(`${burnLogs.length} Burned events emitted`);
})();
