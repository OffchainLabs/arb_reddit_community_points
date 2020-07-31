import React from "react";
import Grid from "@material-ui/core/Grid";
import Card from "./Card";
import img from "../../assets/images/rollup.png";
import Web3Injector from "../../Web3Injector";

const Content = (): any => {
  return (
    <Grid
      container
      direction="row"
      alignItems="center"
      justify="center"
      spacing={3}
    >
      <Grid item>
        <Card
          title="Block Explorer"
          subheader="Live on testnet"
          secondaryText="Look at your transactions"
          expandedText="Our block explorer allows you to view all incoming transactions, live."
          imageUrl={img}
          onClick={() =>
            window.open("https://explorer.offchainlabs.com/", "_blank")
          }
        />
      </Grid>
      <Grid item>
        <Card
          title="Reddit Community Points"
          subheader="Live on testnet"
          secondaryText="Claim and transfer your points"
          expandedText="The Reddit Community Points dashboard allows you to claim different points as well as transfer it to different accounts, all using Arbitrum Rollup technology."
          imageUrl={img}
          onClick={() => alert("oops gotta route to that")}
        />
      </Grid>
    </Grid>
  );
};

// const Content = (): any => {
  
// };

export default Content;
