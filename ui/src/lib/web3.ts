import * as ethers from "ethers";
import constants from "./constants";
// const { networkId } = constants;

interface InjectedEthereumProvider
  extends ethers.ethers.providers.AsyncSendable {
  enable?: () => Promise<string[]>;
  on: any;
  networkVersion: string;
}

declare global {
  interface Window {
    ethereum?: InjectedEthereumProvider;
    reloadListenerSet: boolean;
  }
}

export function web3Injected(
  e: InjectedEthereumProvider | undefined
): e is InjectedEthereumProvider {
  return e !== undefined;
}

export enum Web3Error {
  BAD_NETWORK_ID,
  NO_CONNECTION,
}

export async function getInjectedWeb3(): Promise<
  ethers.providers.JsonRpcProvider | Web3Error
> {
  if (web3Injected(window.ethereum)) {
    try {
      (await window.ethereum.enable?.()) ??
        console.warn("No window.ethereum.enable function");
    } catch (e) {
      return Web3Error.NO_CONNECTION;
    }

    window.ethereum &&
      !window.reloadListenerSet &&
      window.ethereum.on("networkChanged", (chainId: number) => {
        window.reloadListenerSet = true;
        window.location.reload();
      });

    // if (window.ethereum.networkVersion !== networkId) {
    //   return Web3Error.BAD_NETWORK_ID;
    // }

    return new ethers.providers.Web3Provider(window.ethereum);
  }

  return Web3Error.NO_CONNECTION;
}

export const netoworkIdToName = {
  "44010": "Arb Testnet",
  "3": "Ropsten",
};
