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

import child_process from 'child_process'

const util = require('util');
const exec = util.promisify(require('child_process').exec)

require("dotenv").config();
const chalk = require("chalk");


function promiseFromChildProcess(child) : Promise<{txHashes: string[]}> {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.on('message', resolve)
    });
}

(async () => {
    const runCount = 100
    let privKeys = []
    let setups = []
    for (let i = 0; i < runCount; i++) {
        const wallet = randomWallet()
        const { privateKey } = wallet
        setups.push(setup(generateConnection(wallet)));
        privKeys.push(privateKey)
    }
    await Promise.all(setups)

    console.info("");
    console.info(chalk.blue("*** Running benchmarks ***"));
    console.info("");

    console.time("batchTransfers")

    let runs = []
    for (let i = 0; i < runCount; i++) {
        const child = child_process.fork(`${__dirname}/benchmarkSub.js`, [privKeys[i]])
        
        runs.push(promiseFromChildProcess(child))
    }
    const runResults = await Promise.all(runs)

    console.info(chalk.blue("*** All transactions sent to aggregator ***"))

    await printTotalGasUsed([].concat(...runResults.map(res => res.txHashes)))
    console.timeEnd("batchTransfers")
})();
// (async () => {
//     const runCount = 5
    // let conns = []
    // let setups = []
    // for (let i = 0; i < runCount; i++) {
    //     const conn = generateConnection(randomWallet())
    //     setups.push(setup(conn));
    //     conns.push(conn)
    // }

    // await Promise.all(setups)

//     console.info("");
//     console.info(chalk.blue("*** Running benchmarks ***"));
//     console.info("");

//     console.time("batchTransfers")
//     let runs = []
//     for (let i = 0; i < runCount; i++) {
//         runs.push(batchTransfers(conns[i], 1000))
//     }
//     const contractTxesGroups = await Promise.all(runs)
//     console.info(chalk.blue("*** All transactions sent to aggregator ***"))
//     await printTotalGasUsed([].concat(...contractTxesGroups))
//     console.timeEnd("batchTransfers")
//     // await batchBurns(20);
//     // await batchClaims(20);
//     // await batchSubscribes(20);
//     // await verifyUpdates();
// })();
