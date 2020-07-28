import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ethers, Contract, utils } from "ethers";
import { getInjectedWeb3 } from "../lib/web3";
import { secondsToReadableTime } from "../lib/index";
import "bootstrap/dist/css/bootstrap.min.css";
import constants from "../lib/constants";
import Tweet from "./Tweet";
import { Redirect, Route, Switch, HashRouter } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { ClaimStatus } from "../lib/index";
import { useStyles } from "../themes/styles";

const { validatorUrl, distributionAddress, tokenAddress } = constants;

interface props {
  tokenSymbol: string;
  tokenName: string;
  currentRound: number;
  userCanClaim: ClaimStatus;
  tokenBalance: number;
  transferToken: (account: string, value: number) => void;
}

function App({ tokenSymbol, tokenName, currentRound, userCanClaim,tokenBalance, transferToken }: props) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  const [addressValue, setAddressValue] = useState("");
  const [amountValue, setAmountValue] = useState("");

  const [timeRemaining, setTimeRemaining] = useState(9000);

  const updateTimeRemaining = useCallback(() => {
    setTimeRemaining((lastTimeRemaiing) => {
      return lastTimeRemaiing - 1;
    });
  }, [setTimeRemaining, timeRemaining]);

  useEffect(() => {
    window.setInterval(() => {
      setTimeRemaining((lastTimeRemaiing) => {
        return lastTimeRemaiing - 1;
      });
    }, 1000);
  }, []);
  const transfer = useCallback(
    (e) => {
      e.preventDefault();

      transferToken(addressValue, Number(amountValue))
    },
    [addressValue, amountValue]
  );

  const addressError = useMemo(() => {
    return !!(
      addressValue &&
      (!addressValue.startsWith("0x") || addressValue.length !== 42)
    );
  }, [addressValue]);

  const valueError = useMemo(()=>{
    return tokenBalance < Number(amountValue)
  }, [amountValue, tokenBalance])

  return (
    <div>
      <div className={classes.root}>
        <Grid
          justify="center"
          alignItems="center"
          container
          spacing={5}
          direction={"row"}
        >
          <Grid item xs={4} md={4} lg={4}>
            <div className={classes.demo}>
              <Paper className={classes.paper}>
                <List className={classes.list} dense={true}>
                  <ListItem>
                    <ListItemText primary={`Your Tokens: ${tokenBalance}`} />
                  </ListItem>
                  <ListItem>
                    <form noValidate autoComplete="off" onSubmit={transfer}>
                      <TextField
                        error={addressError}
                        label="Transfer"
                        variant="outlined"
                        placeholder="address"
                        value={addressValue}
                        onChange={(e) => setAddressValue(e.target.value)}
                        disabled={tokenBalance !== 0}
                      />
                          <TextField
                        error={valueError}
                        label="Value"
                        type="number"
                        variant="outlined"
                        placeholder="amount"
                        value={amountValue}
                        onChange={(e) => setAmountValue(e.target.value)}
                        disabled={tokenBalance !== 0}
                      />

                    </form>
                  </ListItem>
                </List>
              </Paper>
            </div>
          </Grid>
          <Grid item xs={4} md={4} lg={4}>
            <div className={classes.demo}>
              <Paper className={classes.paper}>
                <List className={classes.list} dense={true}>
                  <ListItem>
                    <ListItemText
                      primary={`Distribution Round: ${currentRound}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary={`Next Round in: ${secondsToReadableTime(
                        timeRemaining
                      )}`}
                    />
                  </ListItem>
                </List>
              </Paper>
            </div>
          </Grid>
        </Grid>
        <Grid
          justify="center"
          alignItems="center"
          container
          spacing={5}
          direction={"row"}
        >
          <Grid item>
            <Tweet userCanClaim={userCanClaim} />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
