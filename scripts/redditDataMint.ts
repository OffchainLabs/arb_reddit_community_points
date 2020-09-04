import fs from "fs";
const readline = require("readline");
import { utils } from "ethers";

import { masterArbWallet, MasterDistributionsContract } from "./contracts_lib";
import { printTotalGasUsed } from "./benchmark_lib";
const chalk = require("chalk");

const dirPath = "scripts/reddit-data/";

export const batchMint = async () => {
    console.info(chalk.blue("Batch-minting reddit data..."));
    console.info("");

    const files = fs.readdirSync(dirPath)

    let successes = [];
    let failures = [];
    let txHashes = []
    let nonce = await masterArbWallet.getTransactionCount()

    for (let file of files) {
        if (file.startsWith("FortNiteBR")) {
            break
        }
        let binaryData = fs.readFileSync(dirPath + file);
        const bytes = binaryData.toString().length;
        console.info(chalk.grey(`minting ${file}, ${bytes} bytes:`));
        const mintingTxHash = (await MasterDistributionsContract.batchMint(
            "0x" + binaryData.toString("hex"),
            {
                gasLimit: new utils.BigNumber(10000000000000),
                nonce,
                gasPrice: 0
            }
        )).hash;
        txHashes.push(mintingTxHash)
        nonce++
    }

    let receipts = await printTotalGasUsed(txHashes)

    let successCount = 0
    let failCount = 0
    for (const receipt of receipts) {
        if (receipt.status == 1) {
            successCount++
        } else {
            failCount++
        }
    }

    console.info("Done batch minting:");
    if (successCount > 0) {
        console.info(chalk.green(`${successCount} successful mints`))
    }
    if (failCount > 0) {
        console.info(chalk.red(`${failCount} failures:`))
    }
};
