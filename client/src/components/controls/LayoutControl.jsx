import React, { useEffect, useState, useMemo } from 'react';
import { FaProjectDiagram } from "react-icons/fa";
import { useCy } from '../../hooks/useCy';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';
import avsdf from 'cytoscape-avsdf';
import fcose from 'cytoscape-fcose';
import cola from 'cytoscape-cola';

Cytoscape.use( cola );
Cytoscape.use( fcose );
Cytoscape.use( avsdf );
Cytoscape.use(COSEBilkent);

const LayoutControl = () => {
    const cy = useCy();
    const [opened, setOpened] = useState(false);
    const [layout, setLayout] = useState("circle");
    const [activeLayout, setActiveLayout] = useState();

    const layouts = useMemo(()=> {
        return {
          avsdf: {
            name: 'avsdf',
            //https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf
          },
          breadthfirst: {
            name: 'breadthfirst',
            circle: true,
            nodeDimensionsIncludeLabels: true,
            //https://js.cytoscape.org/#layouts/breadthfirst
          },
          circle: {
            name: 'circle',
            nodeDimensionsIncludeLabels: true
            //https://js.cytoscape.org/#layouts/circle
          },
          'cola': {
            name: 'cola',
            nodeDimensionsIncludeLabels: true,
            infinite: true,
            edgeLength: (e) => {
                let length = e.source().data("color") === e.target().data("color") ? 100 : 300;
                return length;
            },
            convergenceThreshold: -1,
            avoidOverlap: false,

            //randomize: true,
            fit: false,
            //https://github.com/cytoscape/cytoscape.js-cola
          },
          concentric: {
            name: 'concentric',
            nodeDimensionsIncludeLabels: true,
            // todo: https://js.cytoscape.org/#layouts/concentric
          },
          'cose': {
            name: 'cose',
            nodeDimensionsIncludeLabels: true,
            // https://js.cytoscape.org/#layouts/cose
          },
          'cose-bilkent': {
                name: "cose-bilkent",
                // other options
                padding: 50,
                nodeDimensionsIncludeLabels: true,
                idealEdgeLength: 100,
                edgeElasticity: 0.1,
                nodeRepulsion: 8500,
            },
            'fcose': {
                name: 'fcose',
                nodeDimensionsIncludeLabels: true,
                //https://github.com/iVis-at-Bilkent/cytoscape.js-fcose
            },
            'grid': {
                name: 'grid'
            },
            'random': {
                name: 'random'
            }
        };
    });

    // Layout on load ... needs work
    useEffect(async () => {
        cy && cy.on("add", ()=> {
            activeLayout && activeLayout.stop();
            let lay = cy.layout(layouts[layout]);
            setActiveLayout(lay);
            lay.run();
        });
    }, [cy, setActiveLayout]);

    // Update layout on change
    useEffect(async () => {
        activeLayout && activeLayout.stop()
        if (cy && cy.nodes().length) {
            let lay = cy.layout(layouts[layout]);
            setActiveLayout(lay);
            lay.run();
        }
    }, [cy, layout, setActiveLayout]);

    return (
        <>
            <div>
                <div className="react-sigma-control">
                    <button onClick={() => setOpened((e) => !e)}>
                        <FaProjectDiagram />
                    </button>
                    {opened === true && (
                        <ul
                            style={{
                                position: "absolute",
                                bottom: 0,
                                right: "35px",
                                backgroundColor: "#e7e9ed",
                                margin: 0,
                                padding: 0,
                                listStyle: "none",
                            }}
                        >
                            {Object.keys(layouts).map(name => {
                                return (
                                    <li key={name}>
                                        <button
                                            className="btn btn-link"
                                            style={{ fontWeight: layout === name ? "bold" : "normal", width: "100%", "whiteSpace": "nowrap" }}
                                            onClick={() => {
                                                setLayout(name);
                                                setOpened(false);
                                            }}
                                        >
                                            {name}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );

}
export default LayoutControl;
