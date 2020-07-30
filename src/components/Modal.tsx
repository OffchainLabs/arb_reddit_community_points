import React from 'react';
import { createStyles, Theme, withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { Link } from '@material-ui/core';



const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

// Hook
function useLocalStorage(key: string, initialValue: any) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = React.useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);



export default function WelcomeModal() {
  const [beenHere, setBeenHere ] = useLocalStorage("beenHere", null);
  const [displayWelcome, setDisplayWelcome] = React.useState(!beenHere);

  const handleClose = () => {
    setBeenHere(true)
    setDisplayWelcome(false);
  };

  return (
    <div>

      <Dialog onClose={handleClose} aria-labelledby="customized-dialog-title" open={displayWelcome}>
        <DialogTitle id="customized-dialog-title" onClose={handleClose}>
          Welcome to Arb Community Points
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Here you are able to take part in the distribution rounds as well as transfer your current tokens.
          </Typography>
          <Typography gutterBottom>
            If you don't have any tokens yet, head over to the <Link href="#">faucet</Link>.
          </Typography>
          <Typography gutterBottom>
            This website is intended to be used for demonstration purposes for <Link href="https://www.reddit.com/r/ethereum/comments/hbjx25/the_great_reddit_scaling_bakeoff/" target="_blank" rel="noreferrer">
            The Great Reddit Scaling Bake-Off</Link>. Have fun and don't hesitate to send us feedback and your thoughts.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Proceed
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

