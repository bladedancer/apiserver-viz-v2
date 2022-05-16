import React, { Component, useEffect, useState } from "react";
import { UndirectedGraph } from "graphology";
import erdosRenyi from "graphology-generators/random/erdos-renyi";
import randomLayout from "graphology-layout/random";
import chroma from "chroma-js";
import {
    useSigma,
    useRegisterEvents,
    useLoadGraph,
    useSetSettings
} from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import faker from "@faker-js/faker";


const APIServerGraph = ({ children }) => {
    const sigma = useSigma();
    const registerEvents = useRegisterEvents();
    const loadGraph = useLoadGraph();
    const setSettings = useSetSettings();
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        // Create the graph
        console.log("useEffect");
        const graph = erdosRenyi(UndirectedGraph, { order: 100, probability: 0.2 });
        randomLayout.assign(graph);
        graph.nodes().forEach(node => {
            graph.mergeNodeAttributes(node, {
                label: faker.name.findName(),
                size: Math.max(4, Math.random() * 10),
                color: chroma.random().hex(),
            });
        });
        loadGraph(graph);

        // Register the events
        registerEvents({
            enterNode: event => setHoveredNode(event.node),
            leaveNode: () => setHoveredNode(null),
        });
    }, []);

    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
                console.log("nodeReducer");
                const graph = sigma.getGraph();
                const newData = { ...data, highlighted: data.highlighted || false };

                if (hoveredNode) {
                    if (node === hoveredNode || graph.neighbors(hoveredNode).includes(node)) {
                        newData.highlighted = true;
                    } else {
                        newData.color = "#E2E2E2";
                        newData.highlighted = false;
                    }
                }
                return newData;
            },
            edgeReducer: (edge, data) => {
                console.log("edgeReducer");
                const graph = sigma.getGraph();
                const newData = { ...data, hidden: false };

                if (hoveredNode && !graph.extremities(edge).includes(hoveredNode)) {
                    newData.hidden = true;
                }
                return newData;
            },
        });
    }, [hoveredNode]);

    return <>{children}</>;
};

export default APIServerGraph; 