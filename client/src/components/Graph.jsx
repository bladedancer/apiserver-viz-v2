import React, { useState, useLayoutEffect, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useSetContentModifiedTS } from "../hooks/useSettings.js";

const Graph = ({nodeData, children}) => {
    const [elements, setElements] = useState([]);
    const {contentModifiedTS, setContentModifiedTS} = useSetContentModifiedTS();

    // Convert to elements
    useEffect(() => {
        let els = [];
        nodeData.nodes.forEach(n => {
            els.push({
                data: {
                    id: n.id,
                    label: n.name ? `${n.name} (${n.kind})` : n.kind,
                    color: n.color,
                    linkType: n.refType,
                    root: n.isScope,
                    groupId: nodeData.scopes.findIndex(s => s.id === (n.isScope ? n.id : n.scope.id)),
                }
            });
        });
        nodeData.nodes.forEach(n => {
            n.links.forEach(l => {
                const targetNode = nodeData.nodes.find(tn => tn.id === l.target);
                els.push({
                    data: {
                        id: l.source + '-' + l.target,
                        source: l.source,
                        target: l.target,
                        sourceColor: n.color,
                        targetColor: targetNode.color,
                        gradient: `${n.color} ${targetNode.color}`,
                        type: l.refType
                    }
                })
            });
        });
        setElements(els);
    }, [nodeData]);

    useLayoutEffect(() => {
        setContentModifiedTS(Date.now());
    }, [elements])

    const cytoscapeStylesheet = [
        {
            selector: "node",
            style: {
                "background-color": "data(color)",
                width: "label",
                height: "label",
                padding: "8px",
                shape: "round-rectangle",
                'min-zoomed-font-size': 8,
            }
        },
        {
            selector: ':selected',
            css: {
                'underlay-color': '#00ffff',
                'underlay-padding': '5px',
                'underlay-opacity': '0.5'
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
                "text-border-opacity": 1,

                "text-rotation": "autorotate"
            }
        },
        {
            selector: ':parent',
            style: {
              'background-opacity': 0.333,
              'border-color': '#2B65EC'
            }
        }
    ]

    return (
        <CytoscapeComponent
            global='cy'
            cy={(cy) => {
                cy.on("select", (_x) => {
                    console.log("something was selected here");
                });
            }}
            elements={elements}
            style={{ top: 0, bottom: 0, position: "absolute", width: "100%" }}
            stylesheet={cytoscapeStylesheet}
        />
    );
}

export default Graph;
