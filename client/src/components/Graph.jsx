import React, { useState, useEffect } from 'react';
import {
    SigmaContainer,
    ControlsContainer,
    SearchControl,
    ZoomControl,
    FullScreenControl
} from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import APIServerGraph from "./APIServerGraph.jsx";
import { LayoutsControl } from "./LayoutsControl.jsx";
import Draggable from './Draggable.jsx';

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
        <SigmaContainer initialSettings={{
            renderEdgeLabels: true,
            defaultNodeType: "circle"
        }}>
            <APIServerGraph definitions={graphState.definitions}>
                <Draggable />
            </APIServerGraph>
            <ControlsContainer position={"bottom-right"}>
                <ZoomControl />
                <FullScreenControl />
                <LayoutsControl />
            </ControlsContainer>
            <ControlsContainer position={"top-right"}>
                <SearchControl />
            </ControlsContainer>
        </SigmaContainer>
    );
}

export default Graph;
