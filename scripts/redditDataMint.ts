import fs from "fs";
const readline = require("readline");
import { utils } from "ethers";

import { DistributionsContract, arbWallet } from "./contracts_lib";
import { printTotalGasUsed } from "./benchmark_lib";
const chalk = require("chalk");

const dirPath = "scripts/reddit-data/";

export const batchMint = (next?: () => any) => {
    console.info(chalk.blue("Batch-minting reddit data..."));

    fs.readdir(dirPath, async (err, files) => {
        if (err) {
            console.error("Coult not load files:", err);
            process.exit(1);
        }
        files.reverse();

        let successes = [];
        let failures = [];

        const batchMintRec = async (index = 0) => {
            let file = files[index];
            // skip fortnight files:
            while (file && file.startsWith("FortNiteBR")) {
                index++;
                file = files[index];
            }
            if (!file) {
                console.info("Done batch minting:");
                console.info(chalk.green(`${successes.length} successful mints:`))
                console.info(chalk.green(successes.join(",")))

                console.info(chalk.red(`${failures.length} failures:`))
                console.info(chalk.red(failures.join(",")))

                next && next();
            }
            let binaryData = fs.readFileSync(dirPath + file);
            const bytes = binaryData.toString().length;
            console.info(chalk.grey(`minting ${file}, ${bytes} bytes:`));
            const minting = DistributionsContract.batchMint(
                "0x" + binaryData.toString("hex"),
                {
                    gasLimit: new utils.BigNumber(1000000000000),
                }
            );

            printTotalGasUsed([minting], (success?: boolean) => {
                if (success) {
                    successes.push(file)
                } else {
                    failures.push(file)
                }
                batchMintRec(index + 1);
            });
        };
        batchMintRec();
    });
};
