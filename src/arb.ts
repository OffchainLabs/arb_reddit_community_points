import { ethers } from 'ethers'
import { ArbProvider } from 'arb-provider-ethers'
import env from './constants'
import { ArbERC20Factory } from 'arb-provider-ethers/dist/lib/abi/ArbERC20Factory'
import { FaucetWalletFactory } from './FaucetWalletFactory'

const ethereumProvider = new ethers.providers.JsonRpcProvider(env.ethProviderUrl)

const arbProvider = new ArbProvider(
    env.arbProviderUrl,
    ethereumProvider
  );

const ethereumWallet = new ethers.Wallet(env.privateKey, ethereumProvider);
const arbWallet = new ArbWallet(ethereumWallet, arbProvider);
const arbFaucetWallet = FaucetWalletFactory.connect(
  env.faucetWalletAddress,
  arbWallet
)

export const transfer = (to: string)=> {
  return arbFaucetWallet.transfer(to)
}
