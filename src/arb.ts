import ethers from 'ethers'
import { ArbProvider, } from 'arb-provider-ethers'
import env from './constants'
import { ArbERC20Factory } from 'arb-provider-ethers/dist/lib/abi/ArbERC20Factory'

const ETH_AMOUNT = 1
const ARB_COIN_AMOUNT = 100

const  ethereumProvider = new ethers.providers.JsonRpcProvider (env.ethProviderUrl)

const arbProvider = new ArbProvider(
    env.arbProviderUrl,
    ethereumProvider
  );

const  arbWallet = new ethers.Wallet(env.privateKey, arbProvider);
const arbERC20 = ArbERC20Factory.connect(
  env.tokenAddress,
  arbWallet
)

export const sendEther = (to: string) => {
  const value = ethers.utils.parseEther('1.0');
  return arbWallet.sendTransaction({to, value })
}

export const sendERC20 = (to: string)=> {
  return arbERC20.transfer(to, 100)
}
