import React from "react";
import {
    ControlsContainer,
    ForceAtlasControl,
    SearchControl,
    SigmaContainer,
    ZoomControl
} from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import APIServerGraph from "./APIServerGraph.jsx"

const Graph = () => {
    return (
        <SigmaContainer>
            <APIServerGraph />
            <ControlsContainer position={"bottom-right"}>
                <ZoomControl />
                <ForceAtlasControl autoRunFor={2000} />
            </ControlsContainer>
            <ControlsContainer position={"top-right"}>
                <SearchControl />
            </ControlsContainer>
        </SigmaContainer>
    );
}

export default Graph;