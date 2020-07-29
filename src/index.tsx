import React from "react";
import ReactDOM from "react-dom";
import Web3Injector from "./Web3Injector";
import * as serviceWorker from "./serviceWorker";
import WelcomeModal from "./components/Modal"


ReactDOM.render(
  <React.StrictMode>
    <WelcomeModal />
    <Web3Injector />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
