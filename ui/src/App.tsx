import React, { useState, useEffect, useMemo, useCallback } from "react";
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
    useRouteMatch,
    useLocation,
} from "react-router-dom";
import LandingScreen from "./components/LandingScreen";
// import { ArbErc20Factory } from 'arb-provider-ethers/dist/lib/abi/ArbErc20Factory'

interface AppProps {
    ethProvider: ethers.providers.JsonRpcProvider;
}
function App({ ethProvider }: AppProps) {
    const { distributionAddress, tokenAddress } = constants;

    const [PointsContract, DistributionContract, wallet] = useMemo(() => {
        if (!ethProvider) return [];
        const wallet = ethProvider.getSigner(0);

        return [
            new Contract(tokenAddress, SubredditPoints_v0, wallet),
            new Contract(distributionAddress, Distributions_v0, wallet),
            wallet,
        ];
    }, [ethProvider]);

    const [walletAddress, setWalletAddress] = useState("");
    useEffect(() => {
        wallet && wallet.getAddress().then(setWalletAddress);
    }, [wallet]);

    const [currentRound, setCurrentRound] = useState(0);
    const [userCanClaim, setUserCanClaim] = useState(ClaimStatus.LOADING);
    const location = useLocation();
    useEffect(() => {
        if (!DistributionContract || !walletAddress) return;
        DistributionContract.lastRound().then((round: utils.BigNumber) => {
            const lastRoundNum = +round.toString();
            setCurrentRound(lastRoundNum);
            DistributionContract.claimableRounds(walletAddress).then(
                (lastClaimedRound: utils.BigNumber) => {
                    console.info(
                        "LAST CLAIMED ROUND",
                        lastClaimedRound.toString()
                    );
                    console.info("Last Round", lastRoundNum.toString());

                    setUserCanClaim(
                        round.gte(lastClaimedRound)
                            ? ClaimStatus.CLAIMABLE
                            : ClaimStatus.UNCLAIMABLE
                    );
                }
            );
        });
    }, [DistributionContract, walletAddress, location.pathname]);

    const [tokenSymbol, setTokenSymbol] = useState("");
    const [tokenName, setTokenName] = useState("");

    useEffect(() => {
        if (PointsContract && !tokenSymbol) {
            PointsContract.symbol().then(setTokenSymbol);
        }
        if (DistributionContract && !tokenName) {
            DistributionContract.initialSupply().then((d: utils.BigNumber) => {
                setTokenName(d.toString());
            });
        }
    }, [PointsContract, DistributionContract, tokenSymbol]);

    const [tokenBalance, setTokenBalance] = useState(0);
    const updateTokenBalance = useCallback(() => {
        if (!PointsContract || !walletAddress) return;
        PointsContract.balanceOf(walletAddress).then((bal: any) =>
            setTokenBalance(bal.toNumber())
        );
    }, [PointsContract, walletAddress]);
    // TODO polling update
    useEffect(updateTokenBalance, [PointsContract, walletAddress]);

    const transferToken = useCallback(
        async (account: string, value: number) => {
            if (PointsContract) {
                const txReceipt = await PointsContract.transfer(
                    account,
                    value
                ).catch((e: any) => alert("Error: " + e.message));
                return txReceipt;
            }
        },
        [PointsContract]
    );
    let match = useRouteMatch();
    const mainRoute = match.path + "/";
    const claimRoute = match.path + "/claim/:round/:address/:sig";
    const aboutRoute = match.path + "/about";

    return (
        <Switch>
            <Route
                path={mainRoute}
                render={() => (
                    <Main
                        tokenSymbol={tokenSymbol}
                        tokenName={String(currentRound)}
                        currentRound={currentRound}
                        userCanClaim={userCanClaim}
                        tokenBalance={tokenBalance}
                        setTokenBalance={setTokenBalance}
                        transferToken={transferToken}
                        walletAddress={walletAddress}
                    />
                )}
                exact
            />
            <Route
                path={claimRoute}
                render={(props) => (
                    <Claim
                        currentRound={currentRound}
                        walletAddress={walletAddress}
                        claim={
                            DistributionContract && DistributionContract.claim
                        }
                        userCanClaim={userCanClaim}
                        {...props}
                    />
                )}
                exact
            />
            <Route path={aboutRoute} component={About} />
        </Switch>
    );
}

export default App;
