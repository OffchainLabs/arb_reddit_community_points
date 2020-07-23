import React from "react";

const TweetButton = () => {
  const text = `Gimmie tokens`.split(" ").join("%20");
  const handleClick = () => {
    window.open("https://twi" + `tter.com/intent/tweet?text=${text}`);
  };
  return (
    <a className="tweet-message" target="_blank" onClick={handleClick}>
      Click to claim to tokens via our twitter faucet
    </a>
  );
};

export default TweetButton;
