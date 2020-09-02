import { batchMint } from "./redditDataMint";
import { generateConnection } from './contracts_lib'
batchMint(generateConnection());
