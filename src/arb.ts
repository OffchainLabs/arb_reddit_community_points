import * as fetch from "node-fetch";
import { ethers } from 'ethers'
import { ArbProvider, ArbWallet } from 'arb-provider-ethers'
import env from './constants'
import { ArbERC20Factory } from 'arb-provider-ethers/dist/lib/abi/ArbERC20Factory'
import { FaucetWalletFactory } from './FaucetWalletFactory'

(global as any).fetch = fetch;

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

export const transfer = (to: string) => {
  return arbFaucetWallet.transfer(to)
}

export const resetFaucet = (ethValue: ethers.utils.BigNumber, tokenValue: ethers.utils.BigNumber) => {
	return arbFaucetWallet.updateFaucet(env.tokenAddress, tokenValue, ethValue)
}

export const getAssertion = async (txHash: string): Promise<string | null> => {
	let result = await arbProvider.getMessageResult(txHash)
	if (!result) {
		return null
	}
	return result.onChainTxHash
}