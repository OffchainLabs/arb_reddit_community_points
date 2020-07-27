import React, { useMemo } from "react";
import { ClaimStatus } from "../lib/index";
import CircularProgress from "@material-ui/core/CircularProgress";

interface tweetProps {
  userCanClaim: ClaimStatus;
}
const TweetButton = ({ userCanClaim }: tweetProps) => {
  const text = `Gimmie tokens`.split(" ").join("%20");

  const handleClick = (e: any) => {
    e.preventDefault();
    if (userCanClaim !== ClaimStatus.CLAIMABLE) return;
    window.open("https://twi" + `tter.com/intent/tweet?text=${text}`);
  };
  const message = useMemo(() => {
    switch (userCanClaim) {
      case ClaimStatus.LOADING:
        return <CircularProgress />;
      case ClaimStatus.UNCLAIMABLE:
        return "Looks like you already claimed your funds this round";
      case ClaimStatus.CLAIMABLE:
        return "Click to claim to tokens via our twitter faucet";
    }
  }, [userCanClaim]);
  return (
    <a className="tweet-message" target="_blank" onClick={handleClick}>
      {message}
    </a>
  );
};

export default TweetButton;
