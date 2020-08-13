import React, { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";
import CircularProgress from "@material-ui/core/CircularProgress";
import Paper from "@material-ui/core/Paper";
import Alert from "@material-ui/lab/Alert";
import Header from "./LandingScreen/Header";
import rollup from "../assets/images/logo.png";
import { ClaimStatus } from "../lib/index";
import { Redirect } from "react-router-dom";

const useStyles = makeStyles((theme) => {
    return {
        paper: {
            textAlign: "left",
            color: theme.palette.text.secondary,
            minHeight: "8rem",
        },
        list: {
            marginLeft: theme.spacing(2),
            marginRight: theme.spacing(2),
            minWidth: "500px",
        },
    };
});

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
    userCanClaim: ClaimStatus;
}

enum ReadyState {
    Waiting,
    Valid,
    InvalidAddress,
    InvalidRound,
    InvalidSignature,
    PreviouslyClaimed,
    JustClaimed,
    JustSubmitted,
}

enum SubmissionStatus {
    UNSUBMITTED,
    SUBMITTED,
    COMPLETE,
}
const Claim = ({
    match,
    walletAddress,
    claim,
    currentRound,
    userCanClaim,
}: ClaimProps) => {
    const { round, address, sig } = match.params;
    const classes = useStyles();
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>(
        SubmissionStatus.UNSUBMITTED
    );
    const [redirectHome, setRedirectHome] = useState(false);

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
        if (
            !walletAddress ||
            !claim ||
            currentRound === undefined ||
            userCanClaim === ClaimStatus.LOADING
        ) {
            return ReadyState.Waiting;
        } else if (walletAddress !== address) {
            return ReadyState.InvalidAddress;
        } else if (false /*TODO sig check? */) {
            return ReadyState.InvalidSignature;
        } else if (currentRound !== +round) {
            return ReadyState.InvalidRound;
        } else if (userCanClaim === ClaimStatus.UNCLAIMABLE) {
            return ReadyState.PreviouslyClaimed;
        } else {
            return ReadyState.Valid;
        }
    }, [walletAddress, claim, currentRound, userCanClaim, submissionStatus]);

    const claimCoins = useCallback(async () => {
        if (!claim || readyState !== ReadyState.Valid) return;
        try {
            setSubmissionStatus(SubmissionStatus.SUBMITTED);
            const tx = await claim(round, address, 1000, sig);
            await tx.wait();
            setSubmissionStatus(SubmissionStatus.COMPLETE);
            window.setTimeout(() => {
                setRedirectHome(true);
            }, 2000);
        } catch (err) {
            console.warn("err claiming", err);
        }
    }, [claim, readyState]);

    const render = (readyState: ReadyState) => {
        switch (readyState) {
            case ReadyState.InvalidAddress:
                return (
                    <Alert severity="error">{`Wrong address; make sure you're logged in with ${address}`}</Alert>
                );

            case ReadyState.InvalidRound:
                return (
                    <Alert severity="error">
                        Looks like this round has already passed!
                    </Alert>
                );

            case ReadyState.InvalidSignature:
                return <Alert severity="error">Invalid signaure</Alert>;
            case ReadyState.PreviouslyClaimed:
                return (
                    <Alert severity="info">
                        You've already claimed this round
                    </Alert>
                );

            case ReadyState.Waiting:
                return (
                    // <Button onClick={claimCoins}>
                    <CircularProgress />
                    // </Button>
                );
            case ReadyState.Valid:
                switch (submissionStatus) {
                    case SubmissionStatus.UNSUBMITTED:
                        return (
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={claimCoins}
                            >
                                Claim your points!
                            </Button>
                        );
                    case SubmissionStatus.SUBMITTED:
                        return <CircularProgress />;
                    case SubmissionStatus.COMPLETE: {
                        return (
                            <Alert severity="success">
                                Coins Claimed! Redirecting home...
                            </Alert>
                        );
                    }
                    default:
                        break;
                }

            default:
                break;
        }
    };

    const img = (
        <img
            draggable={false}
            src={rollup}
            alt="Arbitrum Rollup"
            style={{ height: "50px" }}
        ></img>
    );

    return (
        <>
            <Header title="Arbitrum Comunity Points" img={img} />
            <Grid
                container
                spacing={4}
                direction="column"
                alignItems="center"
                style={{
                    margin: 0,
                    width: "100%",
                }}
            >
                <Grid item />
                <Grid item component={Paper} className={classes.paper}>
                    <List className={classes.list}>
                        <ListItem>
                            <TextField
                                label="Round Number"
                                placeholder="Placeholder"
                                fullWidth
                                margin="normal"
                                disabled
                                value={round}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    disableUnderline: true,
                                }}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <TextField
                                label="Address"
                                fullWidth
                                margin="normal"
                                disabled
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    disableUnderline: true,
                                }}
                                value={address}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <TextField
                                label="Signature"
                                fullWidth
                                disabled
                                value={sig}
                                margin="normal"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                InputProps={{
                                    disableUnderline: true,
                                }}
                            />
                        </ListItem>
                    </List>
                </Grid>
                {redirectHome && <Redirect to="/ui" />}
                <Grid item>{render(readyState)}</Grid>
            </Grid>
        </>
    );
};
export default Claim;
