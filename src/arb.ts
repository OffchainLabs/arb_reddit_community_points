import { ethers } from 'ethers'
import { ArbProvider } from 'arb-provider-ethers'
import env from './constants'
import { ArbERC20Factory } from 'arb-provider-ethers/dist/lib/abi/ArbERC20Factory'
import { FaucetWalletFactory } from './FaucetWalletFactory'

const ETH_AMOUNT = 1
const ARB_COIN_AMOUNT = 100

const  ethereumProvider = new ethers.providers.JsonRpcProvider (env.ethProviderUrl)

const arbProvider = new ArbProvider(
    env.arbProviderUrl,
    ethereumProvider
  );

const arbWallet = new ethers.Wallet(env.privateKey, arbProvider);
const arbFaucetWallet = FaucetWalletFactory.connect(
  env.faucetWalletAddress,
  arbWallet
)

export const transfer = (to: string)=> {
  return arbFaucetWallet.transfer(to)
}
