import React, { useState, useEffect, useMemo } from "react";
import "./App.css";
import { useArbTokenBridge, TokenType } from "arb-token-bridge";
import { ethers, Contract, utils } from "ethers";
import { getInjectedWeb3 } from "./lib/web3";
import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "./components/Navbar";
import { abi as SubredditPoints_v0 } from "./abis/SubredditPoints_v0.json";
import { abi as Distributions_v0 } from "./abis/Distributions_v0.json";
import constants from "./lib/constants";
import Main from "./components/Main";
import Claim from "./components/Claim";
import About from "./components/About";
import { ClaimStatus } from "./lib/index";
import {
  Redirect,
  Route,
  Switch,
  HashRouter,
  BrowserRouter,
} from "react-router-dom";

const { validatorUrl, distributionAddress, tokenAddress } = constants;

if (!validatorUrl || !distributionAddress || !tokenAddress) {
  throw Error("Missing required env variable; see .env.sample");
}
interface AppProps {
  ethProvider: ethers.providers.JsonRpcProvider;
}
function App({ ethProvider }: AppProps) {
  const { validatorUrl, distributionAddress, tokenAddress } = constants;
  if (!validatorUrl || !distributionAddress || !tokenAddress) {
    throw Error("Missing required env variable; see .env.sample");
  }

  const {
    balances,
    bridgeTokens,
    token,
    arbWallet,
    walletAddress,
    cache,
  } = useArbTokenBridge(validatorUrl, ethProvider);

  // init contracts:
  const [PointsContract, DistributionContract] = useMemo(() => {
    if (!arbWallet) return [];
    return [
      new Contract(tokenAddress, SubredditPoints_v0, arbWallet),
      new Contract(distributionAddress, Distributions_v0, arbWallet),
    ];
  }, [arbWallet]);

  const [currentRound, setCurrentRound] = useState(0);
  const [userCanClaim, setUserCanClaim] = useState(ClaimStatus.LOADING);

  useEffect(() => {
    if (!DistributionContract || !walletAddress) return;
    const roundNum: utils.BigNumber = DistributionContract.lastRound().then(
      (round: utils.BigNumber) => {
        const lastRoundNum = +round.toString();
        setCurrentRound(lastRoundNum);
        DistributionContract.claimableRounds(walletAddress).then(
          (lastClaimedRound: utils.BigNumber) => {
            setUserCanClaim(
              round.eq(lastClaimedRound)
                ? ClaimStatus.UNCLAIMABLE
                : ClaimStatus.CLAIMABLE
            );
          }
        );
      }
    );
  }, [DistributionContract]);

  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenName, setTokenName] = useState("");

  useEffect(() => {
    if (PointsContract && !tokenSymbol) {
      PointsContract.symbol().then(setTokenSymbol);
    }
    if (DistributionContract && !tokenName) {
      DistributionContract.initialSupply().then((d: utils.BigNumber) => {
        console.warn("init supply", d.toString());

        setTokenName(d.toString());
      });
    }
  }, [PointsContract, DistributionContract, tokenSymbol]);

  useEffect(() => {
    if (!walletAddress) return;

    if (!cache.erc20.includes(tokenAddress)) {
      // token.add(tokenAddress, TokenType.ERC20);
    }
  }, [cache.erc20, walletAddress]);
  return (
    <div className="App">
      <TopNavbar />
      <main>
        <header className="App-header">
          <HashRouter>
            <Switch>
              <Route
                path="/"
                render={() => (
                  <Main
                    tokenSymbol={tokenSymbol}
                    tokenName={String(currentRound)}
                    currentRound={currentRound}
                    userCanClaim={userCanClaim}
                  />
                )}
                exact
              />
              <Route
                path="/claim/:round/:address/:sig"
                render={(props) => (
                  <Claim
                    currentRound={currentRound}
                    walletAddress={walletAddress}
                    claim={DistributionContract && DistributionContract.claim}
                    {...props}
                  />
                )}
                exact
              />
              <Route path="/about" component={About} exact />
            </Switch>
          </HashRouter>
        </header>
      </main>
    </div>
  );
}

export default App;
