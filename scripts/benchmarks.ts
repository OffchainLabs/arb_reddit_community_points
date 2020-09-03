import {
    printTotalGasUsed,
    flattenResults,
    SubResults,
    initialSetup,
    setupConn
} from "./benchmark_lib";

import { generateConnection, randomWallet, ContractConnection } from "./contracts_lib";

import { ethers } from "ethers";

import child_process from 'child_process'

const util = require('util');
const exec = util.promisify(require('child_process').exec)

require("dotenv").config();
const chalk = require("chalk");

function promiseFromChildProcess(child) : Promise<SubResults> {
    return new Promise(function (resolve, reject) {
        child.addListener("error", reject);
        child.on('message', resolve)
    });
}

const args = process.argv.slice(2)
let processCountStr = "1"
let totalTxesStr = "3000"
if (args.length === 2) {
    [processCountStr, totalTxesStr] = process.argv.slice(2)
} else if (args.length !== 0) {
    console.error("Must call without arguments or with benchmarks [processCount] [totalTxes]")
    process.exit(0)
}

const processCount = parseInt(processCountStr)
const totalTxes = parseInt(totalTxesStr)

const totalClaimCount = totalTxes/3
const totalSubCount = totalTxes/12
const totalBurnCount = totalTxes/4
const totalTransferCount = totalTxes/3

const claimCount = totalClaimCount / processCount
const subCount = totalSubCount / processCount
const burnCount = totalBurnCount / processCount
const transferCount = totalTransferCount / processCount;

console.info(`Running benchmark for ${Math.floor(totalClaimCount)} claims, ${Math.floor(totalSubCount)} subscriptions, ${Math.floor(totalBurnCount)} burns, and ${Math.floor(totalTransferCount)} transfers`);

(async () => {
    await initialSetup()

    let privKeys = []
    let setups = []
    for (let i = 0; i < processCount; i++) {
        const wallet = randomWallet()
        const { privateKey } = wallet
        setups.push(setupConn(generateConnection(wallet)));
        privKeys.push(privateKey)
    }
    await Promise.all(setups)

    console.info("");
    console.info(chalk.blue("*** Running benchmarks ***"));
    console.info("");

    console.time("batchTransfers")

    let runs = []
    for (let i = 0; i < processCount; i++) {
        const child = child_process.fork(`${__dirname}/benchmarkSub.js`, [privKeys[i], claimCount, subCount, burnCount, transferCount])
        
        runs.push(promiseFromChildProcess(child))
    }
    const runResults = await Promise.all(runs)

    console.info(chalk.blue("*** All transactions sent to aggregator ***"))

    await printTotalGasUsed([].concat(...runResults.map(flattenResults)))
    console.timeEnd("batchTransfers")
})();
