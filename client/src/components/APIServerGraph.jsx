import React, { Component, useEffect, useState } from "react";
import {empty} from 'graphology-generators/classic';
import circularLayout from "graphology-layout/circular";
import Graph, { DirectedGraph, UndirectedGraph } from "graphology";
import chroma from "chroma-js";
import { JSONPath } from "jsonpath-plus";

import {
    useSigma,
    useRegisterEvents,
    useLoadGraph,
    useSetSettings
} from "@react-sigma/core";

const LINK_TYPE_SCOPE = 'scope';
const LINK_TYPE_HARD = 'hard';
const LINK_TYPE_SOFT = 'soft';

function references(scopes, def) {
    let targets = new Set();

    def.versions.forEach(ver => {
        // For each version spec find the refs and create links
        let refs = JSONPath({
            path: "$..'x-amplify-kind-ref'",
            json: ver,
            resultType: "parent"
        });

        if (!refs || refs.length === 0) {
            return;
        }

        // Add reference links
        refs.forEach(ref => {
            let targetRef = ref['x-amplify-kind-ref'];
            let refType = ref['x-amplify-kind-ref-type'] || 'hard';

            let targetRefParts = targetRef.split("/");
            let group;
            let scope;
            let targetName;

            if (targetRefParts.length === 1) {
                group = def.resource.metadata.scope.name; // Same group
                scope = scopes.includes(targetRefParts[0]) ? null : def.resource.spec.scope.kind; // If not targetting scope then same scope
                targetName = targetRefParts[0];
            } else if (targetRefParts.length === 2) {
                if (targetRefParts[0] === targetRefParts[0].toLowerCase()) {
                    // Lower case is group/Kind
                    group = targetRefParts[0];
                    scope = null;
                    targetName = targetRefParts[1];
                } else {
                    // Otherwise it's Scope/Kind
                    group = def.resource.metadata.scope.name; // Same group
                    scope = targetRefParts[0];
                    targetName = targetRefParts[1];
                }
            } else if (targetRefParts.length === 3) {
                group = targetRefParts[0];
                scope = targetRefParts[1];
                targetName = targetRefParts[2];
            }

            targets.add({
                group,
                scope,
                kind: targetName,
                type: refType,
                sourceVersion: ver.spec.name
            });
        });
    });

    return targets;
}

function nodify(definitions) {
    let scopeColor = {};

    let scopeNames = Object.values(definitions)
        .filter(def => !def.resource.spec.scope)
        .map(def => def.resource.spec.kind);

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
            references: references(scopeNames, def),
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
                refType: LINK_TYPE_SCOPE,
                size: 1,
                label: '',
                type: 'line',
                color: chroma(n.color).alpha(0.9).hex(),
                weight: 10,
            });
        }

        // hard/soft (todo filtering)
        n.references.forEach(ref => {
            let targetNode = nodes.find(t =>
                (ref.kind === t.kind)
                && (ref.group === t.group)
                && (ref.scope === (t.scope ? t.scope.name : null)));

            n.links.push({
                source: n.id,
                target: targetNode.id,
                refType: ref.type,
                size: ref.type === LINK_TYPE_HARD ? 3 : 2,
                weight: ref.type === LINK_TYPE_HARD ? 5 : 1,
                label: '',
                type: 'arrow',
                color: chroma(targetNode.color).alpha(0.1).hex()
            });
        });
    });

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

            graph = new DirectedGraph();
            let nodeData = nodify(definitions);
            nodeData.nodes.forEach(n => {
                graph.addNode(n.id, { size: n.size, color: n.color, label: n.kind });
            });

            nodeData.nodes.forEach(n => {
                n.links.forEach((l,i) => {
                    graph.mergeEdge(l.source, l.target, { type: l.type, color: l.color, label: l.label, size: l.size });
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
