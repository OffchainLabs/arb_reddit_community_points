import React from "react";
import ReactDOM from "react-dom";
import Web3Injector from "./Web3Injector";
import * as serviceWorker from "./serviceWorker";
// import LandingScreen from "./components/LandingScreen";
import Routes from "./Routes"

ReactDOM.render(
  <React.StrictMode>
    <Web3Injector />
    {/* <LandingScreen /> */}
    {/* <Routes /> */}
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
