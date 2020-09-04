# Arb-Reddit Points Benchmarks

### Setup

- [Launch arb validator](https://developer.offchainlabs.com/docs/Developer_Quickstart/)
- Add env variables to .env files; to use sample values, run `cp .env.sample .env`
- Edit `.env` and add required values:

    - **ETH_PROVIDER_URL**: Ethereum (Layer 1) node / RPC provider url
    - **ARB_PROVIDER_URL**: Arbitrum aggregator / RPC provider url
    - **ROLLUP_ADDRESS**: Arbitrum chain address
    - **MNEUMONIC**: MNEMONIC phrase for main ETH account (deploys contracts)


- Install dependencies: `yarn install`
- Deploy contracts: `yarn run deploy`


### Dev actions
- Run benchmarks: `yarn run benchmarks`
- Launch UI: `yarn run ui_dev`
- Generate "request tokens" twitter response `yarn run generate_response 0xyouraddresss` (outputts url to toking claiming route in UI)
