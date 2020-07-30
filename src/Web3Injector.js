import React, { useState, useEffect, useMemo } from "react";
import { getInjectedWeb3, Web3Error, netoworkIdToName } from "./lib/web3";

import WelcomeModal from "./components/Modal/index.jsx";
import { useLocalStorage } from "@rehooks/local-storage";

import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "./components/Navbar";
import constants from "./lib/constants";
import { ethers } from "ethers";
import App from "./App";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";

import Grid from "@material-ui/core/Grid";

const { validatorUrl, distributionAddress, tokenAddress } = constants;

if (!validatorUrl || !distributionAddress || !tokenAddress) {
  throw Error("Missing required env variable; see .env.sample");
}

const Web3Injector = () => {
  const [shouldOpenModalCache, setShouldOpenModalCache] = useLocalStorage(
    "welcomeModal",
    false
  );
  const [renderedContent, setRenderedContent] = useState(
    <Grid container justify="center" alignItems="center">
      <CircularProgress />
    </Grid>
  );

  const {
    validatorUrl,
    distributionAddress,
    tokenAddress,
    networkId,
  } = constants;
  if (
    !validatorUrl ||
    !distributionAddress ||
    !tokenAddress ||
    networkId === undefined
  ) {
    throw Error("Missing required env variable; see .env.sample");
  }
  const [ethProvider, setEthProvider] = useState(
    undefined,
    ethers.providers.JsonRpcProvider | Web3Error | undefined
  );

  useEffect(() => {
    getInjectedWeb3().then(setEthProvider);
  }, []);

  useEffect(() => {
    if (ethProvider instanceof ethers.providers.JsonRpcProvider) {
      setRenderedContent(<App ethProvider={ethProvider} />);

      // ethProvider.getNetwork().then((network) => {
      //   if (network["chainId"] !== networkId) {
      //     setRenderedContent(
      //       <Grid container justify="center" alignItems="center">
      //        <Alert severity="error">
      //          Wrong network! Make sure you are usign an Arbitrum provider with Metamask.
      //        </Alert>
      //      </Grid>
      //     )
      //   }
      // })
    } else if (ethProvider === Web3Error.NO_CONNECTION) {
      setRenderedContent(
        <Grid container justify="center" alignItems="center">
          <Alert severity="error">
            Ethereum provider not found;{" "}
            <a href="https://metamask.io/" target="_blank">
              install metamask
            </a>{" "}
            and try again
          </Alert>
        </Grid>
      );
    } else if (ethProvider === Web3Error.BAD_NETWORK_ID) {
      setRenderedContent(
        <Grid container justify="center" alignItems="center">
          <Alert severity="error">
            Please connect to {netoworkIdToName[networkId]}{" "}
          </Alert>
        </Grid>
      );
    }
  }, [ethProvider]);

  return (
    <>
      <WelcomeModal
        shouldOpenModalCache={shouldOpenModalCache}
        setShouldOpenModalCache={setShouldOpenModalCache}
      />
      <TopNavbar />
      {renderedContent}
    </>
  );
};

export default Web3Injector;
