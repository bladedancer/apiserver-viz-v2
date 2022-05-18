import React, { Component, useEffect, useState } from "react";
import {empty} from 'graphology-generators/classic';
import circularLayout from "graphology-layout/circular";
import Graph from "graphology";
import chroma from "chroma-js";
import {
    useSigma,
    useRegisterEvents,
    useLoadGraph,
    useSetSettings
} from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";

const LINK_TYPE_SCOPE = 'scope';

function nodify(definitions) {
    let scopeColor = {};

    let nodes = Object.values(definitions).map(def => {
        const isScope = !def.resource.spec.scope;
        return {
            id: def.resource.metadata.id,
            group: def.resource.metadata.scope.name,
            kind: def.resource.spec.kind,
            isScope,
            scope: isScope ? null : { name: def.resource.spec.scope.kind },
            size: isScope ? 15 : 5,
            links: [],
            color: isScope ?
                scopeColor[def.resource.spec.kind] = (scopeColor[def.resource.spec.kind] || chroma.random().hex())
                : scopeColor[def.resource.spec.scope.kind] = (scopeColor[def.resource.spec.scope.kind] || chroma.random().hex())
        }
    });

    // Resolve the scope ids.
    let scopes = nodes.filter(n => n.isScope);
    let scopeIds = scopes.reduce((acc, n) => {
        acc[n.kind] = n.id;
        return acc;
    }, {})

    nodes.filter(n => !n.isScope).forEach(n => {
        n.scope.id = scopeIds[n.scope.name];
    });

    // Node links
    nodes.forEach(n => {
        if (!n.isScope) {
            n.links.push({
                source: n.id,
                target: n.scope.id,
                type: LINK_TYPE_SCOPE,
                size: 2,
                label: '',
                type: 'line'
            });
        }
    });

    //
    return {
        nodes,
        scopes
    };
}

const APIServerGraph = ({definitions, children}) => {
    const sigma = useSigma();
    const registerEvents = useRegisterEvents();
    const loadGraph = useLoadGraph();
    const setSettings = useSetSettings();
    const [hoveredNode, setHoveredNode] = useState(null);

    useEffect(() => {
        let graph;

        if (Object.keys(definitions).length === 0) {
            graph = empty(Graph, 0);
        } else {

            graph = new Graph();
            let nodeData = nodify(definitions);
            nodeData.nodes.forEach(n => {
                graph.addNode(n.id, { size: n.size, color: n.color, label: n.kind });
            });

            nodeData.nodes.forEach(n => {
                n.links.forEach(l => {
                    graph.addEdge(l.source, l.target, { type: l.type, label: l.label, size: l.size });
                });
            });
        }

        circularLayout.assign(graph);
        loadGraph(graph);

        // Register the events
        registerEvents({
            enterNode: event => setHoveredNode(event.node),
            leaveNode: () => setHoveredNode(null),
        });
    }, [definitions]);

    useEffect(() => {
        setSettings({
            nodeReducer: (node, data) => {
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
