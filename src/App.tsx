import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { useArbTokenBridge } from "arb-token-bridge";
import { ethers, Contract, utils } from "ethers";
import { UnclaimedTokens } from "./lib";
import { getInjectedWeb3 } from "./lib/web3";
import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "./components/Navbar";
import { abi as SubredditPoints_v0 } from "./abis/SubredditPoints_v0.json";
import { abi as Distributions_v0 } from "./abis/Distributions_v0.json";
import constants from "./lib/constants";
import Tweet from "./components/Tweet";

const { validatorUrl, distributionAddress, tokenAddress } = constants;

if (!validatorUrl || !distributionAddress || !tokenAddress) {
  throw Error("Missing required env variable; see .env.sample");
}

function App() {
  const { balances, bridgeTokens, token, arbWallet } = useArbTokenBridge(
    process.env.REACT_APP_ARB_VALIDATOR_URL || "",
    getInjectedWeb3()
  );

  // init contracts:
  const [PointsContract, DistributionContract] = useMemo(() => {
    if (!arbWallet) return [];
    return [
      new Contract(tokenAddress, SubredditPoints_v0, arbWallet),
      new Contract(distributionAddress, Distributions_v0, arbWallet),
    ];
  }, [arbWallet]);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");

  // vars:

  const [tokenBalance, setTokenBalance] = useState(0); // maybe just use directly from token bridge
  const [currentRound, setCurrentRound] = useState(0);
  const [unclaimedTokens, setUnclaimedTokens] = useState<UnclaimedTokens[]>([]);
  console.warn(DistributionContract);

  useEffect(() => {
    if (PointsContract && !tokenSymbol) {
      PointsContract.symbol().then(setTokenSymbol);
    }
    if (DistributionContract && !tokenName) {
      DistributionContract.karmaSource().then((d: utils.BigNumber) => {

        setTokenName(d.toString());

      });
    }
  }, [PointsContract]);
  return (
    <div className="App">
      <TopNavbar />
      <header className="App-header">
        <p>Token Symbol {tokenSymbol}</p>
        <p>Token Supply {tokenName}</p>
        <Tweet />
      </header>
    </div>
  );
}

export default App;
