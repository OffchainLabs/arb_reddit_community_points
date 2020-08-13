import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Content from "./Content";
import Header from "./Header";
import rollup from "../../assets/images/logo.png";

const Index = (): any => {
    document.title = "Arbitrum Reddit Portal";
    const img = (
        <img
            draggable={false}
            src={rollup}
            alt="Arbitrum Rollup"
            style={{ height: "50px" }}
        ></img>
    );

    return (
        <>
            <Header title="Arbitrum Reddit Portal" img={img} />
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
