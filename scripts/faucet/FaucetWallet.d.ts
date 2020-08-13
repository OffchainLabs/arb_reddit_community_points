/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from "./common";

interface FaucetWalletInterface extends Interface {
  functions: {
    updateFaucet: TypedFunctionDescription<{
      encode([_token, _tokenAmount, _ethAmount]: [
        string,
        BigNumberish,
        BigNumberish
      ]): string;
    }>;

    transfer: TypedFunctionDescription<{ encode([to]: [string]): string }>;
  };

  events: {};
}

export class FaucetWallet extends Contract {
  connect(signerOrProvider: Signer | Provider | string): FaucetWallet;
  attach(addressOrName: string): FaucetWallet;
  deployed(): Promise<FaucetWallet>;

  on(event: EventFilter | string, listener: Listener): FaucetWallet;
  once(event: EventFilter | string, listener: Listener): FaucetWallet;
  addListener(
    eventName: EventFilter | string,
    listener: Listener
  ): FaucetWallet;
  removeAllListeners(eventName: EventFilter | string): FaucetWallet;
  removeListener(eventName: any, listener: Listener): FaucetWallet;

  interface: FaucetWalletInterface;

  functions: {
    updateFaucet(
      _token: string,
      _tokenAmount: BigNumberish,
      _ethAmount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    transfer(
      to: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  updateFaucet(
    _token: string,
    _tokenAmount: BigNumberish,
    _ethAmount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  transfer(
    to: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {};

  estimate: {
    updateFaucet(
      _token: string,
      _tokenAmount: BigNumberish,
      _ethAmount: BigNumberish
    ): Promise<BigNumber>;

    transfer(to: string): Promise<BigNumber>;
  };
}
