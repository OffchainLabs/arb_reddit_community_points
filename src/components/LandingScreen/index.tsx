import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Content from "./Content";
import Header from "./Header";

const Index = (): any => {
  return (
    <>
      <Header />
      <Grid
        container
        direction="column"
        spacing={2}
        justify="center"
        alignItems="center"
        style={{ maxWidth: "100%" }}
      >
        <Grid item />
        <Grid item>
          <Content />
        </Grid>
        <Grid item />
      </Grid>
    </>
  );
};

export default Index;
