import React, { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Card from "@material-ui/core/Card";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import { useStyles } from "../themes/styles";

interface ClaimProps {
  match: {
    params: {
      round: string;
      address: string;
      sig: string;
    };
  };
  walletAddress: string;
  claim: any;
  currentRound: number | undefined;
}

enum ReadyState {
  Waiting,
  Valid,
  InvalidAddress,
  InvalidRound,
  InvalidSignature,
}

const Claim = ({ match, walletAddress, claim, currentRound }: ClaimProps) => {
  const { round, address, sig } = match.params;
  const classes = useStyles();

  const invalidMessage = useCallback(
    (readyState: ReadyState) => {
      switch (readyState) {
        case ReadyState.InvalidAddress:
          return `Wrong address; make sure you're logged in with $address`;
        case ReadyState.InvalidRound:
          return "Looks like this round has already passed!";
        case ReadyState.InvalidSignature:
          return "Invalid signaure, try again.";
        default:
          throw new Error("Not an invalid readystate");
      }
    },
    [address]
  );

  const readyState: ReadyState = useMemo(() => {
    if (!walletAddress || !claim || currentRound === undefined) {
      return ReadyState.Waiting;
    } else if (walletAddress !== address) {
      return ReadyState.InvalidAddress;
    } else if (false /*TODO sig check? */) {
      return ReadyState.InvalidSignature;
    } else if (currentRound !== +round) {
      return ReadyState.InvalidRound;
    } else {
      return ReadyState.Valid;
    }
  }, [walletAddress]);

  const claimCoins = useCallback(() => {
    if (!claim) return;
    // TODO: karma constant
    claim(round, address, 20, sig);
  }, [claim]);

  const render = (readyState: ReadyState) => {
    switch (readyState) {
      case ReadyState.InvalidAddress:
        return `Wrong address; make sure you're logged in with ${address}`;
      case ReadyState.InvalidRound:
        return "Looks like this round has already passed!";
      case ReadyState.InvalidSignature:
        return "Invalid signaure, try again.";
      case ReadyState.Waiting:
        return "loading...";
      case ReadyState.Valid:
        return (
          <div>
            Claim your points <Button onClick={claimCoins}>Claim</Button>
          </div>
        );

      default:
        break;
    }
  };

  return (
    <div>
      <Grid container spacing={1} direction={"column"} alignItems={"center"}>
        <Grid className={classes.el} item xs={12} md={12} lg={12}>
          <div className={classes.claimRoot}>
            <TextField
              id="standard-full-width"
              label="Round Number"
              style={{ margin: 8 }}
              placeholder="Placeholder"
              fullWidth
              margin="normal"
              disabled
              value={round}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="standard-full-width"
              label="Address"
              style={{ margin: 8 }}
              fullWidth
              margin="normal"
              disabled
              InputLabelProps={{
                shrink: true,
              }}
              value={address}
            />
            <TextField
              id="standard-full-width"
              label="Signature"
              style={{ margin: 8 }}
              fullWidth
              disabled
              value={sig}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        </Grid>
        <Grid className={classes.el} item xs={12} md={12} lg={12}>
          {render(readyState)}
        </Grid>
      </Grid>
    </div>
  );
};
export default Claim;
