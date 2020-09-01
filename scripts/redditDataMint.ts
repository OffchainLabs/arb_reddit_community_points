import fs from "fs";
const readline = require("readline");
import { utils } from "ethers";

import { DistributionsContract, arbWallet } from "./contracts_lib";
import { printTotalGasUsed } from "./benchmark_lib";
const chalk = require("chalk");

const dirPath = "scripts/reddit-data/";

export const batchMint = async () => {
    console.info(chalk.blue("Batch-minting reddit data..."));

    const files = fs.readdirSync(dirPath)

    let successes = [];
    let failures = [];
    for (let file of files) {
        if (file.startsWith("FortNiteBR")) {
            break
        }
        let binaryData = fs.readFileSync(dirPath + file);
        const bytes = binaryData.toString().length;
        console.info(chalk.grey(`minting ${file}, ${bytes} bytes:`));
        const minting = await DistributionsContract.batchMint(
            "0x" + binaryData.toString("hex"),
            {
                gasLimit: new utils.BigNumber(1000000000000),
            }
        );

        let [receipt] = await printTotalGasUsed([minting])

        if (receipt.status == 1) {
            successes.push(file)
        } else {
            failures.push(file)
        }
    }
    console.info("Done batch minting:");
    console.info(chalk.green(`${successes.length} successful mints:`))
    console.info(chalk.green(successes.join(",")))

    console.info(chalk.red(`${failures.length} failures:`))
    console.info(chalk.red(failures.join(",")))
};
