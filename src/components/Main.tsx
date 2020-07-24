import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ethers, Contract, utils } from "ethers";
import { getInjectedWeb3 } from "../lib/web3";
import "bootstrap/dist/css/bootstrap.min.css";
import TopNavbar from "./Navbar";
import { abi as SubredditPoints_v0 } from "../abis/SubredditPoints_v0.json";
import { abi as Distributions_v0 } from "../abis/Distributions_v0.json";
import constants from "../lib/constants";
import Tweet from "./Tweet";
import { Redirect, Route, Switch, HashRouter } from "react-router-dom";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import TextField from "@material-ui/core/TextField";
import { ClaimStatus } from "../lib/index";
import { useStyles } from "../themes/styles";

const { validatorUrl, distributionAddress, tokenAddress } = constants;

if (!validatorUrl || !distributionAddress || !tokenAddress) {
  throw Error("Missing required env variable; see .env.sample");
}
interface props {
  tokenSymbol: string;
  tokenName: string;
  currentRound: number;
  userCanClaim: ClaimStatus;
}

function App({ tokenSymbol, tokenName, currentRound }: props) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;
  const [addressValue, setAddressValue] = useState("");

  const transfer = useCallback(
    (e) => {
      e.preventDefault();
      console.log("transfering", addressValue);
    },
    [addressValue]
  );

  const addressError = useMemo(() => {
    return !!(
      addressValue &&
      (!addressValue.startsWith("0x") || addressValue.length !== 42)
    );
  }, [addressValue]);

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
                    <ListItemText primary="Your Tokens: 43" />
                  </ListItem>
                  <ListItem>
                    <form noValidate autoComplete="off" onSubmit={transfer}>
                      <TextField
                        error={addressError}
                        id="outlined-basic"
                        label="Transfer"
                        variant="outlined"
                        placeholder="address"
                        value={addressValue}
                        onChange={(e) => setAddressValue(e.target.value)}
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
                    <ListItemText primary="Next Round in: 234" />
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
            <Tweet />
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
