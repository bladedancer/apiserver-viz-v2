import React, { useCallback, useEffect, useState, useMemo } from "react";
import { FiGrid, FiPlay, FiPause } from "react-icons/fi";
import { useCy } from "../../hooks/useCy";
import { useSetContentModifiedTS } from "../../hooks/useSettings.js";
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import avsdf from "cytoscape-avsdf";
import fcose from "cytoscape-fcose";
import cola from "cytoscape-cola";
import cise from "cytoscape-cise";
import klay from "cytoscape-klay";
import euler from "cytoscape-euler";

Cytoscape.use(euler);
Cytoscape.use(klay);
Cytoscape.use(cise);
Cytoscape.use(cola);
Cytoscape.use(fcose);
Cytoscape.use(avsdf);
Cytoscape.use(COSEBilkent);

const LayoutControl = ({
  className,
  style,
  children
}) => {
  const cy = useCy();
  const [opened, setOpened] = useState(false);
  const [layout, setLayout] = useState("breadthfirst");
  const [activeLayout, setActiveLayout] = useState();
  const {contentModifiedTS} = useSetContentModifiedTS();

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-cy-control ${className || ""}`,
  };

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
        convergenceThreshold: 0.1,
        avoidOverlap: true,

        //randomize: true,
        fit: false,
        //https://github.com/cytoscape/cytoscape.js-cola
      },
      concentric: {
        name: "concentric",
        nodeDimensionsIncludeLabels: true,
        concentric: (n) => {
          return n.data("isScope") ? 20 : n.indegree() + 1;
        },
        levelWidth: (n) => 1,
        //equidistant: true
        // todo: https://js.cytoscape.org/#layouts/concentric
      },
      cise: {
        name: "cise",
        clusters: (n) => n.data("groupIndex"),
        allowNodesInsideCircle: true,
        idealInterClusterEdgeLengthCoefficient: 10,
        animate: true,
        fit: false,
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
        idealEdgeLength: 400,
        edgeElasticity: 0.1,
        nodeRepulsion: 8500,
        quality: 'proof',
        animate: 'during',
        //https://github.com/cytoscape/cytoscape.js-cose-bilkent
      },
      // "d3-force": {
      //   name: "d3-force",
      //   link: (d) => d.data("id")

      //   // https://github.com/shichuanpo/cytoscape.js-d3-force
      // },
      euler: {
        name: "euler",
        springLength: (e) => {
          let type = e.data("type");
          if (e.type === "scope") {
            return 200;
          } else {
            return 300;
          }
        },
        mass: (n) => (n.data("isScope") ? 20 : 1),
        movementThreshold: 0.1,
        maxIterations: 50000,
        fit: false,
        maxSimulationTime: 30000,
        gravity: -10,
        //pull: 0.0005,

        // https://github.com/cytoscape/cytoscape.js-euler
      },
      fcose: {
        name: "fcose",
        nodeDimensionsIncludeLabels: true,
        packComponents: false,
        nodeRepulsion: (n) => n.data('isScope') ? 8000 : 4500,
        idealEdgeLength: (e) => {
          let type = e.data("type");
          if (e.type === "scope") {
            return 50;
          } else if (e.type === "soft") {
            return 100;
          } else {
            return 300;
          }
        },
        edgeElasticity: (e) => {
          let type = e.data("type");
          if (e.type === "scope") {
            return 0.1;
          } else if (e.type === "soft") {
            return 0.9;
          } else {
            return 0.45;
          }
        },
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
          fixedAlignment: "BALANCED",
        },
        //https://github.com/cytoscape/cytoscape.js-klay/blob/master/README.md
      },
      random: {
        name: "random",
      },
    };
  });

  const runLayout = useCallback(async () => {
    if (activeLayout) {
      activeLayout.stop();
      await activeLayout.pon("layoutstop"); // Think there's a race wiith the disable effect.
    }

    let lay = cy.elements(":visible").layout(layouts[layout]);
    if (lay.options.animate) {
      setActiveLayout(lay);
    } else {
      setActiveLayout(null);
    }
    lay.run();
  }, [cy, layout, activeLayout, setActiveLayout]);

  const stopLayout = useCallback(() => {
    activeLayout && activeLayout.stop();
    setActiveLayout(null);
  }, [cy, activeLayout, setActiveLayout]);


  // Update layout on change
  useEffect(async () => {
    if (!cy) {
      return;
    }
    await stopLayout();
    await runLayout()
  }, [cy, contentModifiedTS(), layout]);

  // Disable stop button when layout auto-stops
  useEffect(async () => {
    if (!activeLayout) {
      return;
    }
    await activeLayout.pon("layoutstop");
    activeLayout.stop(); // Explicitly stop it anyway
    setActiveLayout(null);
  }, [activeLayout, setActiveLayout]);


  return (
    <>
      <div {...htmlProps}>
        <button onClick={() => setOpened((e) => !e)} title="Select layout">
          <FiGrid />
        </button>
        {opened === true && (
          <ul
            style={{
              position: "absolute",
              bottom: 0,
              right: "35px",
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
      <div {...htmlProps}>
        <button onClick={() => runLayout()} title="Re-run layout" disabled={activeLayout}>
          <FiPlay />
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={() => stopLayout()} title="Stop layout" disabled={!activeLayout || !activeLayout.options.animate}>
          <FiPause />
        </button>
      </div>
    </>
  );
};
export default LayoutControl;
