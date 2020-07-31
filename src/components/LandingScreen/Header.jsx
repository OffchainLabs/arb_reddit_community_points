import { AppBar, Toolbar, Typography, Grid } from "@material-ui/core";

import React from "react";

import { makeStyles } from "@material-ui/core/styles";



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

const Header = ({title, img}) => {
  const classes = useStyles();

  return (
    // ie 11 doesn't support position="sticky"
    <AppBar position="sticky" className={classes.root}>
      <Toolbar>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>{img}</Grid>
          <Grid item>
            <Typography variant="h6" className={classes.title}>
              {title}
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
