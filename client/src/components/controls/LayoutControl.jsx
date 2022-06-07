import React, { useEffect, useState, useMemo } from "react";
import { FaProjectDiagram } from "react-icons/fa";
import { useCy } from "../../hooks/useCy";
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import avsdf from "cytoscape-avsdf";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import cise from 'cytoscape-cise';
import klay from 'cytoscape-klay';
import euler from 'cytoscape-euler';

Cytoscape.use( euler );
Cytoscape.use( klay );
Cytoscape.use(cise);
Cytoscape.use(cola);
Cytoscape.use(fcose);
Cytoscape.use(avsdf);
Cytoscape.use(COSEBilkent);

function debounce(func, timeout = 100) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

const LayoutControl = () => {
  const cy = useCy();
  const [opened, setOpened] = useState(false);
  const [layout, setLayout] = useState("breadthfirst");
  const [activeLayout, setActiveLayout] = useState();

  const layouts = useMemo(() => {
    return {
      avsdf: {
        name: "avsdf",
        //https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf
      },
      breadthfirst: {
        name: "breadthfirst",
        circle: true,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        //https://js.cytoscape.org/#layouts/breadthfirst
      },
      circle: {
        name: "circle",
        nodeDimensionsIncludeLabels: true,
        //https://js.cytoscape.org/#layouts/circle
      },
      cola: {
        name: "cola",
        nodeDimensionsIncludeLabels: true,
        infinite: true,
        edgeLength: (e) => {
          let length =
            e.source().data("groupId") === e.target().data("groupId")
              ? 100
              : 300;
          return length;
        },
        convergenceThreshold: -1,
        avoidOverlap: false,

        //randomize: true,
        fit: false,
        //https://github.com/cytoscape/cytoscape.js-cola
      },
      concentric: {
        name: "concentric",
        nodeDimensionsIncludeLabels: true,
        concentric: (n) => {
          let id = +n.data("groupId");
          return id * id;
        },
        // todo: https://js.cytoscape.org/#layouts/concentric
      },
      cise: {
        name: "cise",
        clusters: (n) => n.data("groupId"),
        allowNodesInsideCircle: true,
        idealInterClusterEdgeLengthCoefficient: 10,
        fit: false
        // https://github.com/iVis-at-Bilkent/cytoscape.js-cise
      },
      cose: {
        name: "cose",
        nodeDimensionsIncludeLabels: true,
        // https://js.cytoscape.org/#layouts/cose
      },
      "cose-bilkent": {
        name: "cose-bilkent",
        // other options
        padding: 50,
        nodeDimensionsIncludeLabels: true,
        idealEdgeLength: 100,
        edgeElasticity: 0.1,
        nodeRepulsion: 8500,
      },
      // "d3-force": {
      //   name: "d3-force",
      //   link: (d) => d.data("id")


      //   // https://github.com/shichuanpo/cytoscape.js-d3-force
      // },
      euler: {
        name: "euler",
        springLength: e => {
          let type = e.data("type");
          if (e.type === "scope") {
            return 150;
          } else {
            return 300;
          }
        },
        mass: n => n.data("isScope") ? 20 : 4,
        movementThreshold: 0.1,
        maxIterations:  50000,
        fit: false,
        maxSimulationTime: 30000,
        gravity: -4,
        pull: 0.0005,

        // https://github.com/cytoscape/cytoscape.js-euler
      },
      fcose: {
        name: "fcose",
        nodeDimensionsIncludeLabels: true,
        //https://github.com/iVis-at-Bilkent/cytoscape.js-fcose
      },
      grid: {
        name: "grid",
      },
      klay: {
        name: "klay",
        nodeDimensionsIncludeLabels: true,
        fit: false,
        klay: {
          compactComponents: true,
          nodeLayering: "NETWORK_SIMPLEX",
          thoroughness: 20,
          fixedAlignment: "BALANCED"

        }
        //https://github.com/cytoscape/cytoscape.js-klay/blob/master/README.md
      },
      random: {
        name: "random",
      },
    };
  });

  // Layout on load ... needs work
  useEffect(async () => {
    if (!cy) {
      return;
    }
    let doLayout = debounce(() => {
        activeLayout && activeLayout.stop();
        if (cy && cy.nodes().length) {
          let lay = cy.layout(layouts[layout]);
          setActiveLayout(lay);
          lay.run();
        }
    });
    cy.on("add", doLayout);
  }, [cy]);

  // Update layout on change
  useEffect(async () => {
    activeLayout && activeLayout.stop();
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
              {Object.keys(layouts).map((name) => {
                return (
                  <li key={name}>
                    <button
                      className="btn btn-link"
                      style={{
                        fontWeight: layout === name ? "bold" : "normal",
                        width: "100%",
                        whiteSpace: "nowrap",
                      }}
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
};
export default LayoutControl;
