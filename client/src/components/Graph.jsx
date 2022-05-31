import React, { useState, useEffect } from 'react';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import CytoscapeComponent from 'react-cytoscapejs';
import chroma from "chroma-js";
import { JSONPath } from "jsonpath-plus";
import { FaNs8 } from 'react-icons/fa';

Cytoscape.use(COSEBilkent);

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

function color(index, domain) {
    return chroma.scale(['yellow', 'navy']).mode('lch').colors(domain)[index];
}

function nodify(definitions) {
    let scopeNames = Object.values(definitions)
        .filter(def => !def.resource.spec.scope)
        .sort((a, b) =>
            a.resource.metadata.scope.name.localeCompare(a.resource.metadata.scope.name) ||
            a.resource.spec.kind.localeCompare(b.resource.spec.kind))
        .map(def => def.resource.spec.kind);

    let nodes = Object.values(definitions).map(def => {

        const isScope = !def.resource.spec.scope;
        return {
            id: def.resource.metadata.id,
            group: def.resource.metadata.scope.name,
            kind: def.resource.spec.kind,
            isScope,
            scope: isScope ? null : { name: def.resource.spec.scope.kind },
            size: isScope ? 10 : 5,
            links: [],
            references: references(scopeNames, def),
            color: isScope ? color(scopeNames.indexOf(def.resource.spec.kind), scopeNames.length)
                : color(scopeNames.indexOf(def.resource.spec.scope.kind), scopeNames.length)
        };
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
                type: 'line',
                color: chroma(n.color).alpha(0.5).hex(),
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
                color: chroma(targetNode.color).alpha(0.5).hex()
            });
        });
    });

    return {
        nodes,
        scopes
    };
}

const Graph = () => {
    const [graphState, setGraphState] = useState({
        instances: {},
        definitions: {}
    });
    const [elements, setElements] = useState([]);
    const [layout, setLayout] = useState({
        name: "cose-bilkent",
        // other options
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        // idealEdgeLength: 100,
        edgeElasticity: 0.1
        // nodeRepulsion: 8500,
    });
    const [cy, setCy] = useState(null);

    // Load Definitions and Instances
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

    // Convert to elements
    useEffect(async () => {
        let nodeData = nodify(graphState.definitions);
        let els = [];
        nodeData.nodes.forEach(n => {
            els.push({
                data: {
                    id: n.id,
                    label: n.kind,
                    color: n.color
                }
            });
        });
        nodeData.nodes.forEach(n => {
            n.links.forEach(l => {
                const targetNode = nodeData.nodes.find(tn => tn.id === l.target);
                console.log(targetNode);
                console.log(`${n.color} ${targetNode.color}`);
                els.push({
                    data: {
                        id: l.source + '-' + l.target,
                        source: l.source,
                        target: l.target,
                        parent: n.isScope ? '' : n.scope.id,
                        sourceColor: n.color,
                        targetColor: targetNode.color,
                        gradient: `${n.color} ${targetNode.color}`
                    }
                })
            });
        });
        setElements(els);
    }, [graphState]);

    useEffect(async () => {
        cy.layout(layout).run();
    }, [layout, elements]);

    const cytoscapeStylesheet = [
        {
            selector: "node",
            style: {
                "background-color": "data(color)",
                width: "label",
                height: "label",
                padding: "6px",
                shape: "round-rectangle"
            }
        },
        {
            selector: "node[label]",
            style: {
                label: "data(label)",
                "font-size": "12",
                color: "white",
                "text-halign": "center",
                "text-valign": "center"
            }
        },
        {
            selector: "edge",
            style: {
                "curve-style": "bezier",
                "target-arrow-shape": "triangle",
                "target-arrow-color": "data(targetColor)",
                "line-fill": "linear-gradient",
                "line-gradient-stop-colors": "data(gradient)",
                "line-gradient-stop-positions": "50",
                width: 1.5
            }
        },
        {
            selector: "edge[label]",
            style: {
                label: "data(label)",
                "font-size": "12",

                "text-background-color": "white",
                "text-background-opacity": 1,
                "text-background-padding": "2px",

                "text-border-color": "black",
                "text-border-style": "solid",
                "text-border-width": 0.5,
                "text-border-opacity": 1

                // "text-rotation": "autorotate"
            }
        }
    ]

    return (
        <CytoscapeComponent
            cy={(cy) => {
                setCy(cy);
                cy.on("select", (_x) => {
                    console.log("something was selected here");
                });
            }}
            elements={elements}
            layout={layout}
            style={{ top: 0, bottom: 0, position: "absolute", width: "100%" }}
            stylesheet={cytoscapeStylesheet}
        />
    );
}

export default Graph;
