import fs from 'fs'

process.on('uncaughtException', (err) => {
    console.error('There was an uncaught error', err.message)
    console.error("If contract_addresses.json hasn't yet been generated, run `yarn run deploy`")
    process.exit(1)
})

//@ts-ignore
import * as contractAddresses from "../contract_addresses.json";
require("dotenv").config();

fs.writeFileSync('ui/.env',
[
    `REACT_APP_LOCAL_VALIDATOR_URL=${process.env.ARB_PROVIDER_URL}`,
    `REACT_APP_DISTRIBUTION_CONTRACT_ADDRESS=${contractAddresses.distributionAddress}`,
    `REACT_APP_POINTS_CONTRACT_ADDRESS=${contractAddresses.pointsAddress}`
].join('\n')
, 'utf-8');



fs.copyFile('build/contracts/SubredditPoints_v0.json', 'ui/src/abis/SubredditPoints_v0.json', (err)=>{
    if (err) throw err;
    fs.copyFile('build/contracts/Distributions_v0.json', 'ui/src/abis/Distributions_v0.json', (err)=>{
        if (err) throw err;
        console.info('Generated frontend env file at ui/.env and contract build files at ui/src/abis')

    });
});
