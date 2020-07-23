import React, { useState, useEffect, useMemo } from "react";
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

const useStyles = makeStyles((theme) => {
  console.warn("theme", theme);

  return {
    root: {
      flexGrow: 1,
      width: "100%",
    },
    paper: {
      padding: theme.spacing(2),
      textAlign: "left",
      color: theme.palette.text.secondary,
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    demo: {
      backgroundColor: theme.palette.background.paper,
      color: "black",
    },
    list: {
      width: "35rem",
      marginTop: 15,
      border: "1px solid black",
    },
  };
});

console.warn(
  ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ["string", "string"],
      ["Hello", "world"]
    )
  )
);

const { validatorUrl, distributionAddress, tokenAddress } = constants;

if (!validatorUrl || !distributionAddress || !tokenAddress) {
  throw Error("Missing required env variable; see .env.sample");
}
interface props {
  tokenSymbol: string;
  tokenName: string;
  currentRound: number;
}

function App({ tokenSymbol, tokenName, currentRound }: props) {
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <div>
      <div className={classes.root}>
        <Grid container spacing={1} direction={"column"} alignItems={"center"}>
          <Grid item xs={12} md={12} lg={12}>
            <div className={classes.demo}>
              <List className={classes.list} dense={true}>
                <ListItem>
                  <ListItemText primary="Your Tokens: 123" />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary={`Distribution Round: ${currentRound}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Next Round in: 234" />
                </ListItem>
              </List>
            </div>
          </Grid>
          <Grid item xs={12} md={12} lg={12}>
            <div className={classes.demo}>
              <List className={classes.list} dense={true}>
                <ListItem>You have 50 points to claim this round:</ListItem>
                <ListItem>
                  <Tweet />
                </ListItem>
              </List>
            </div>
          </Grid>
          <Grid item xs={12}>
            <div> </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default App;
