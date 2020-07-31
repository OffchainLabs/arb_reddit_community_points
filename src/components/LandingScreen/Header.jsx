import { AppBar, Toolbar, Typography, Grid } from "@material-ui/core";

import React from "react";

import { makeStyles } from "@material-ui/core/styles";

import rollup from "../../assets/images/logo.png";


const useStyles = makeStyles((theme) => ({
  root: {
    userSelect: "none",
    backgroundColor: theme.palette.primary,
    // backgroundColor: theme.palette.background.default,
  },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
}));

const Header = () => {
  const classes = useStyles();
  const img = <img draggable={false} src={rollup} alt="Arbitrum Rollup" style={{ height: "50px" }}></img>;

  return (
    // ie 11 doesn't support position="sticky"
    <AppBar position="sticky" className={classes.root}>
      <Toolbar>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>{img}</Grid>
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              Arbitrum Reddit Portal
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
