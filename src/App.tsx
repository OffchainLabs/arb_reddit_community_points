import React, { useState, useEffect } from "react";
import "./App.css";
import { useArbTokenBridge } from "arb-token-bridge";
import { ethers } from "ethers";
import { UnclaimedTokens } from "./lib";

function App() {
  const { balances, bridgeTokens } = useArbTokenBridge(
    process.env.REACT_APP_ARB_VALIDATOR_URL || "",
    new ethers.providers.Web3Provider(window.ethereum),
    process.env.REACT_APP_ARB_AGGREGATOR_URL,
    true,
    0,
    true
  );
  // state constants:
  const [tokenName, setTokenName] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  // vars:

  const [tokenBalance, setTokenBalance] = useState(0); // maybe just use directly from token bridge
  const [currentRound, setCurrentRound] = useState(0);
  const [unclaimedTokens, setUnclaimedTokens] = useState<UnclaimedTokens[]>([]);

  return (
    <div className="App">
      <header className="App-header">
        <p>arb reddit distributor</p>
      </header>
    </div>
  );
}

export default App;
