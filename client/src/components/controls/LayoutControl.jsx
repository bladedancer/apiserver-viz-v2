import React, { useEffect, useState, useMemo } from 'react';
import { FaProjectDiagram } from "react-icons/fa";
import { useCy } from '../../hooks/useCy';
import Cytoscape from 'cytoscape';
import COSEBilkent from 'cytoscape-cose-bilkent';

Cytoscape.use(COSEBilkent);

const LayoutControl = () => {
    const cy = useCy();
    const [opened, setOpened] = useState(false);
    const [layout, setLayout] = useState("circle");

    const layouts = useMemo(()=> {
        return {
          circular: {
            name: 'circle',
          },
          'cose-bilkent': {
                name: "cose-bilkent",
                // other options
                padding: 50,
                nodeDimensionsIncludeLabels: true,
                 idealEdgeLength: 100,
                edgeElasticity: 0.1,
                 nodeRepulsion: 8500,
            }
        };
    });

    useEffect(async () => {
        cy.layout(layouts[layout]).run();
    }, [cy, layout]);

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
