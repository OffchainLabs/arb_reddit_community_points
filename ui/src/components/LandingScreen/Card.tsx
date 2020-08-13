import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import CardActionArea from "@material-ui/core/CardActionArea";
import Collapse from "@material-ui/core/Collapse";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { red } from "@material-ui/core/colors";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 300,
      // minHeight: 390,
      //   maxWidth: 345,
    },
    media: {
      height: 0,
      paddingTop: "56.25%", // 16:9
    },
    expand: {
      transform: "rotate(0deg)",
      marginLeft: "auto",
      transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
      }),
    },
    expandOpen: {
      transform: "rotate(180deg)",
    },
    avatar: {
      backgroundColor: red[500],
    },
  })
);

interface props {
  expandedText: string;
  imageUrl: string;
  secondaryText: string;
  title: string;
  subheader: string;
  onClick: () => any;
}

export default function RecipeReviewCard({
  expandedText,
  imageUrl,
  secondaryText,
  title,
  subheader,
  onClick,
}: props) {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className={classes.root}>
      <CardActionArea onClick={handleExpandClick} style={{outline: "none"}}>
        <CardHeader
          avatar={
            <Avatar aria-label="recipe" className={classes.avatar}>
              R
            </Avatar>
          }
          // action={
          //   <IconButton aria-label="settings">
          //     <MoreVertIcon />
          //   </IconButton>
          // }
          title={title}
          subheader={subheader}
        />

        <CardMedia className={classes.media} image={imageUrl} title="Image" />

        <CardContent>
          <Typography variant="body2" color="textSecondary" component="p">
            {secondaryText}
          </Typography>
        </CardContent>
      </CardActionArea>

      <CardActions disableSpacing>
        <IconButton aria-label="go" onClick={onClick}>
          <ExitToAppIcon />
          <Collapse in={expanded} timeout={300} unmountOnExit>
            <Typography style={{ paddingLeft: "5px" }}>
              Take me there
            </Typography>
          </Collapse>
        </IconButton>
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          style={{outline: "none"}}
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>

      <Collapse in={expanded} timeout={300} unmountOnExit>
        <CardContent>
          <Typography align="justify" variant="body2" >{expandedText}</Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
}
