import ethers from 'ethers'
import { ArbProvider } from 'arb-provider-ethers'
import env from './env_variables'

const  ethereumProvider = new ethers.providers.JsonRpcProvider (env.ethProviderUrl)

const arbProvider = new ArbProvider(
    env.arbProviderUrl,
    ethereumProvider
  );