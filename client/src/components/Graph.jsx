import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useSetSelection, useSetContentModifiedTS } from "../hooks/useSettings.js";
import { useCy } from "../hooks/useCy";

const Graph = ({nodeData, children}) => {
    const [elements, setElements] = useState([]);
    const { selection, setSelection } = useSetSelection();
    const cy = useCy();
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
                    groupIndex: nodeData.scopes.findIndex(s => s.id === (n.isScope ? n.id : n.scope.id)),
                    groupId: nodeData.scopes.find(s => s.id === (n.isScope ? n.id : n.scope.id)).id,
                },
                classes: `${n.hasFinalizer ? 'hasFinalizer ' : ''}${n.isScope ? 'scope ' : ''}`
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
            selector: "node.scope",
            style: {
                "shape": "hexagon"
            }
        },
        {
            selector: "node.hasFinalizer",
            style: {
                "shape": "ellipse"
                // 'background-image': "data:image/svg+xml;utf8,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%3C!DOCTYPE%20svg%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%3E%3Cg%3E%3Cpath%20d%3D%22M365.7%2C256v-73.1c0-60.6-49.1-109.7-109.7-109.7s-109.7%2C49.1-109.7%2C109.7V256H365.7z%20M36.6%2C256h36.6v-73.1%20C73.1%2C81.9%2C155%2C0%2C256%2C0s182.9%2C81.9%2C182.9%2C182.9V256h36.6v256H36.6V256z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
                // 'background-fit': 'none',
                // 'background-height': '40px',
                // 'background-width': '40px',
                // 'background-image-opacity': 1
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

    useEffect(() => {
        if (!cy) {
            return;
        }
        cy.on("select", () => {
            setSelection(cy.nodes().filter(":selected"));
        });
        cy.on("unselect", () => {
            setSelection(cy.nodes().filter(":selected"));
        });
        cy.on("boxselect", () => {
            setSelection(cy.nodes().filter(":selected"));
        });
    }, [cy])

    return (
        <CytoscapeComponent
            global='cy'
            elements={elements}
            style={{ top: 0, bottom: 0, position: "absolute", width: "100%" }}
            stylesheet={cytoscapeStylesheet}
        />
    );
}

export default Graph;
