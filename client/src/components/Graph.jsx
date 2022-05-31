import React, { useState, useEffect } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

const Graph = ({nodeData, children}) => {
    const [elements, setElements] = useState([]);

    // Convert to elements
    useEffect(async () => {
        let els = [];
        nodeData.nodes.forEach(n => {
            els.push({
                data: {
                    id: n.id,
                    label: n.kind,
                    color: n.color,
                    //parent: n.isScope ? '' : n.scope.id,
                }
            });
        });
        nodeData.nodes.forEach(n => {
            n.links.forEach(l => {
                // if (!n.isScope && (l.target === n.scope.id)) {
                //     // No scope links
                //     return;
                // }

                const targetNode = nodeData.nodes.find(tn => tn.id === l.target);
                els.push({
                    data: {
                        id: l.source + '-' + l.target,
                        source: l.source,
                        target: l.target,
                        sourceColor: n.color,
                        targetColor: targetNode.color,
                        gradient: `${n.color} ${targetNode.color}`
                    }
                })
            });
        });
        setElements(els);
    }, [nodeData]);

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
                color: "black",
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
