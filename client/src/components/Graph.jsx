import React, { useState, useEffect } from 'react';
import {
    ControlsContainer,
    ForceAtlasControl,
    SearchControl,
    SigmaContainer,
    ZoomControl
} from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import APIServerGraph from "./APIServerGraph.jsx";

const Graph = () => {
    const [graphState, setGraphState] = useState({
        instances: {},
        definitions: {}
    });

    useEffect(async () => {
        let models = await Promise.all([
            fetch('/api/definitions').then(resp => resp.json()),
            fetch('/api/instances').then(resp => resp.json())
          ]);
        setGraphState({
            definitions: models[0],
            instances: models[1]
        });
      }, [setGraphState]);

    return (
        <SigmaContainer>
            <APIServerGraph definitions={graphState.definitions} />
            <ControlsContainer position={"bottom-right"}>
                <ZoomControl />
                <ForceAtlasControl autoRunFor={2000} settings={{
                    gravity: 1000,
                    strongGravityMode: true,
                    adjustSizes: true,
                    scalingRatio: 20
                }}/>
            </ControlsContainer>
            <ControlsContainer position={"top-right"}>
                <SearchControl />
            </ControlsContainer>
        </SigmaContainer>
    );
}

export default Graph;
