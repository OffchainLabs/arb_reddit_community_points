import React from "react";
import {
    Redirect,
    Route,
    Switch,
    HashRouter,
    BrowserRouter,
} from "react-router-dom";
import LandingScreen from "./components/LandingScreen";
import Web3Injector from "./Web3Injector";

import App from "./App";

const Routes = (): any => {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" render={() => <LandingScreen />} exact />
                <Route path="/ui" render={() => <Web3Injector />} />
            </Switch>
        </HashRouter>
    );
};

export default Routes;
