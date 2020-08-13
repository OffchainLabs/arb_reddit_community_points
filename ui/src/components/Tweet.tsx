import React, { useMemo } from "react";
import { ClaimStatus } from "../lib/index";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Typography, Button, makeStyles } from "@material-ui/core";

const useStyle = makeStyles((theme) => {
    return {
        tweetMessage: {
            // position: "relative",
            // boxSizing: "border-box",
            // padding: "1px 8px 1px 6px",
            // backgroundColor: "#4abaff",
            // color: "white",
            // borderRadius: "3px",
            // fontWeight: "500",
            // cursor: "pointer",
            // textDecoration: "none",
            // fontFamily: "Helvetica",
            fontSize: "16px",
            // padding: "20px",
        },
    };
});

interface tweetProps {
    userCanClaim: ClaimStatus;
}
const TweetButton = ({ userCanClaim }: tweetProps) => {
    const classes = useStyle();
    const text = `Gimmie tokens`.split(" ").join("%20");

    const handleClick = (e: any) => {
        e.preventDefault();
        if (userCanClaim !== ClaimStatus.CLAIMABLE) return;
        window.open("https://twi" + `tter.com/intent/tweet?text=${text}`);
    };
    const message = useMemo(() => {
        switch (userCanClaim) {
            case ClaimStatus.LOADING:
                return "Loading, please wait a moment.";
            case ClaimStatus.UNCLAIMABLE:
                return "Looks like you already claimed your funds this round";
            case ClaimStatus.CLAIMABLE:
                return "Claim tokens via twitter faucet";
        }
    }, [userCanClaim]);
    return userCanClaim === ClaimStatus.LOADING ? (
        <CircularProgress />
    ) : (
        <Button
            color="primary"
            variant="contained"
            onClick={handleClick}
            className={classes.tweetMessage}
        >
            {message}
        </Button>
    );
};

export default TweetButton;
