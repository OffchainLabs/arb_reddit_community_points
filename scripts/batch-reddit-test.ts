import { batchMint } from "./redditDataMint";
import { generateConnection, randomWallet } from './contracts_lib'
batchMint(generateConnection(randomWallet()));
