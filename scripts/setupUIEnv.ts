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
    `REACT_APP_POINTS_CONTRACT_ADDRESS=${contractAddresses.subscriptionsAddress}`
].join('\n')
, 'utf-8');

console.info('Generated frontend env file at ui/.env')
