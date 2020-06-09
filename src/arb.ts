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
    ethereumProvider,
    "http://104.248.7.183:1237"
  );

const ethereumWallet = new ethers.Wallet(env.privateKey, ethereumProvider);
const arbWallet = new ArbWallet(ethereumWallet, arbProvider);
const arbFaucetWallet = FaucetWalletFactory.connect(
  env.faucetWalletAddress,
  arbWallet
)

const arbTokenContract = ArbERC20Factory.connect(
	env.tokenAddress,
	arbWallet
)

export const transfer = (to: string) => {
  return arbFaucetWallet.transfer(to)
}

export const resetFaucet = (ethValue: ethers.utils.BigNumber, tokenValue: ethers.utils.BigNumber) => {
	return arbFaucetWallet.updateFaucet(env.tokenAddress, tokenValue, ethValue)
}

export const getWalletAddress = (): Promise<string> => {
	return arbWallet.getAddress()
}

export const getFaucetAddress = (): string => {
	return env.faucetWalletAddress
}

export const getTokenBalance = (): Promise<ethers.utils.BigNumber> => {
	return arbTokenContract.balanceOf(env.faucetWalletAddress)
}

export const getEthBalance = async (): Promise<ethers.utils.BigNumber> => {
	return arbProvider.getBalance(env.faucetWalletAddress)
}

export const getWalletEthBalance = async (): Promise<ethers.utils.BigNumber> => {
	return arbProvider.getBalance(await arbWallet.getAddress())
}

export const getAssertion = async (txHash: string): Promise<string | null> => {
	let result = await arbProvider.getMessageResult(txHash)
	if (!result) {
		return null
	}
	return result.nodeInfo?.l1TxHash
}