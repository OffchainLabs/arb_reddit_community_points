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
import { Button } from "react-bootstrap";
import Header from "./LandingScreen/Header"
import rollup from "../assets/images/logo.png";


const useStyles = makeStyles((theme) => {
  return {
    paper: {
      textAlign: "left",
      color: theme.palette.text.secondary,
      minHeight: "17rem",
      minWidth: "25rem",
      width: "100%",
      height: "100%"
    },
  }
})

const { distributionAddress, tokenAddress } = constants;

interface props {
  tokenSymbol: string;
  tokenName: string;
  currentRound: number;
  userCanClaim: ClaimStatus;
  tokenBalance: number;
  transferToken: (account: string, value: number) => any;
  setTokenBalance: (value: number | ((prevVar: number) => number)) => void;
}

const Distribution = (props: any) => {
  const classes = useStyles();
  // TODO: destructure
  props = props.props
  return (
    <Paper className={classes.paper}>
      <List dense={true}>
        <ListItem>
          <ListItemText
            primary={`Distribution Round: ${props.currentRound}`}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`Next Round in: ${secondsToReadableTime(
              props.timeRemaining
            )}`}
          />
        </ListItem>
      </List>
    </Paper>
  )
}

const UserTokens = (props: any) => {
  const classes = useStyles();
  // TODO: destructure
  props = props.props
  return (
    <Paper className={classes.paper} >
      <List>
        <ListItem>
          <ListItemText primary={`Your Tokens: ${props.tokenBalance}`} />
        </ListItem>
        <ListItem>
          {/* <form noValidate autoComplete="off" onSubmit={props.transfer}> */}
          <Grid container spacing={3} direction="row">
            <Grid item xs={12} md={6}>
              <TextField
                error={props.addressError}
                label="Transfer"
                variant="outlined"
                placeholder="Address"
                value={props.addressValue}
                onChange={(e) => props.setAddressValue(e.target.value)}
                disabled={props.tokenBalance === 0}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                error={props.valueError}
                label="Value"
                type="number"
                variant="outlined"
                placeholder="Amount"
                value={props.amountValue}
                onChange={(e) => props.setAmountValue(e.target.value)}
                disabled={props.tokenBalance === 0}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              { props.txHash && (
                <Typography noWrap >Success.<br/>Transaction hash: {props.txHash}</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Button color="primary" onClick={props.transfer} >Submit</Button>
            </Grid>
          </Grid>
          {/* </form> */}
        </ListItem>
      </List>
    </Paper>
  );
};

function App({ tokenSymbol, tokenName, currentRound, userCanClaim,tokenBalance, transferToken, setTokenBalance }: props) {
  const classes = useStyles();
  // const bull = <span className={classes.bullet}>•</span>;
  const [addressValue, setAddressValue] = useState("");
  const [amountValue, setAmountValue] = useState("");
  const [txHash, setTxHash] = useState(null);

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
    async (e) => {
      e.preventDefault();

      const txReceipt = await transferToken(addressValue, Number(amountValue))
      if(txReceipt) {
        setTxHash(txReceipt.hash)
        setTokenBalance(balance => balance - Number(amountValue))
      }
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


  const img = <img draggable={false} src={rollup} alt="Arbitrum Rollup" style={{ height: "50px" }}></img>;

  return (
    <>
    <Header title="Arbitrum Community Points" img={img} />
    <Grid
      container
      spacing={5}
      direction="row"
      style={{
        padding: 30,
        margin: 0,
        width: '100%',
      }}
      component="div"
      alignItems="center"
      justify="center"
    >
      <Grid item xs={12} md={6}>
        <UserTokens
          props={{
            tokenBalance,
            transfer,
            addressError,
            addressValue,
            valueError,
            amountValue,
            setAmountValue,
            setAddressValue,
            txHash
          }} />
      </Grid>
      <Grid item xs={12} md={6}>
          <Distribution props={{ currentRound, timeRemaining }} />
      </Grid>
      <Grid item xs={12} container direction="row" alignItems="center" justify="center">
          <Tweet userCanClaim={userCanClaim} />
      </Grid>
    </Grid>
    </>
  );
}

export default App;
