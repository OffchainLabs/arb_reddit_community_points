import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => {

  return {
    root: {
      flexGrow: 1,
      width: "100%",
    },
    paper: {
      textAlign: "left",
      color: theme.palette.text.secondary,
      minHeight: "8rem",
    },
    bullet: {
      display: "inline-block",
      margin: "0 2px",
      transform: "scale(0.8)",
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
    demo: {
      backgroundColor: theme.palette.background.paper,
      color: "black",
      marginBottom: 20,
    },
    list: {
      width: "30rem",
      marginTop: 25,
    },
    el: {
      border: "1px solid black",
      marginTop: "20px",
      backgroundColor: "white",
      color: "black",
    },
    claimRoot: {
      display: "flex",
      flexWrap: "wrap",
      width: "30rem",
    },
  };
});
