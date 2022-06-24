import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";
import { FiGrid, FiPlay, FiPause, FiSettings } from "react-icons/fi";
import Form from "@rjsf/core";
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
import Button from "../utils/Button.jsx"
import { async } from "regenerator-runtime";

Cytoscape.use(euler);
Cytoscape.use(klay);
Cytoscape.use(cise);
Cytoscape.use(cola);
Cytoscape.use(fcose);
Cytoscape.use(avsdf);
Cytoscape.use(COSEBilkent);

const supportedLayouts = {
  avsdf: {
    name: "avsdf",
    refresh: 30,
    fit: true,
    padding: 10,
    ungrabifyWhileSimulating: false,
    animate: "end",
    animationDuration: 500,
    nodeSeparation: 60,
    schema: {
      title: "avsdf",
      type: "object",
      properties: {
        animate: {
          type: "string",
          title: "Animate",
          default: "end",
          enum: ["during", "end"],
          description: "Type of layout animation"
        },
        animationDuration: {
          type: "number",
          title: "Animation Duration",
          default: 500,
          description: "Duration for animate:end"
        },
        fit: {
          type: "boolean",
          title: "Fit",
          default: true,
          description: "Whether to fit the network view after when done"
        },
        nodeSeparation: {
          type: "number",
          title: "Node Separation",
          default: 60,
        },
        padding: {
          type: "number",
          title: "Padding",
          default: 10,
          description: "Padding on fit"
        },
        refresh: {
          type: "number",
          title: "Refresh",
          description: "Number of ticks per frame; higher is faster but more jerky",
          default: 10,
        },
        ungrabifyWhileSimulating: {
          type: "boolean",
          title: "Ungrabify While Simulating",
          default: false,
          description: "Prevent the user grabbing nodes during the layout"
        },
      }
    }
    //https://github.com/iVis-at-Bilkent/cytoscape.js-avsdf
  },
  breadthfirst: {
    name: "breadthfirst",
    fit: true,
    directed: false,
    padding: 30,
    circle: true,
    grid: false,
    spacingFactor: 1.75,
    avoidOverlap: true,
    maximal: false,
    nodeDimensionsIncludeLabels: true,
    spacingFactor: 1,
    animate: false,
    animationDuration: 500,
    schema: {
      title: "breadthfirst",
      type: "object",
      properties: {
        animate: {
          type: "boolean",
          title: "Animate",
          default: false,
        },
        animationDuration: {
          type: "number",
          title: "Animation Duration",
          default: 500,
        },
        avoidOverlap: {
          type: "boolean",
          title: "Avoid Overlap",
          default: true,
        },
        circle: {
          type: "boolean",
          title: "Circle",
          default: true,
        },
        directed: {
          type: "boolean",
          title: "Directed",
          default: false,
        },
        fit: {
          type: "boolean",
          title: "Fit",
          default: true,
        },
        grid: {
          type: "boolean",
          title: "Grid",
          default: true,
        },
        maximal: {
          type: "boolean",
          title: "Maximal",
          default: true,
        },
        nodeDimensionsIncludeLabels: {
          type: "boolean",
          title: "Node Dimensions Include Labels",
          default: true,
        },
        padding: {
          type: "number",
          title: "Padding",
          default: 30,
        },
        spacingFactor: {
          type: "number",
          title: "Spacing Factor",
          default: 1.75,
        },
      }
    }
    //https://js.cytoscape.org/#layouts/breadthfirst
  },
  circle: {
    name: "circle",
    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
    clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    fit: true, // whether to fit the viewport to the graph
    nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
    padding: 30, // the padding on fit
    radius: 100, // the radius of the circle
    spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    startAngle: 3 / 2 * Math.PI, // where nodes start in radians
    sweep: 2 * Math.PI, // how many radians should be between the first and last node (defaults to full circle)
    schema: {
      title: "circle",
      type: "object",
      properties: {
        animate: {
          type: "boolean",
          title: "Animate",
          default: false,
        },
        animationDuration: {
          type: "number",
          title: "Animation Duration",
          default: 500,
        },
        avoidOverlap: {
          type: "boolean",
          title: "Avoid Overlap",
          default: true,
        },
        clockwise: {
          type: "boolean",
          title: "Clockwise",
          default: true,
        },
        fit: {
          type: "boolean",
          title: "Fit",
          default: true,
        },
        nodeDimensionsIncludeLabels: {
          type: "boolean",
          title: "Node Dimensions Include Labels",
          default: true,
        },
        padding: {
          type: "number",
          title: "Padding",
          default: 30,
        },
        radius: {
          type: "number",
          title: "Radius",
        },
        spacingFactor: {
          type: "number",
          title: "Spacing Factor",
          default: 1.75,
        },
        startAngle: {
          type: "number",
          title: "Start Angle",
          default:  3 / 2 * Math.PI,
        },
        sweep: {
          type: "number",
          title: "Sweep",
          default: 2 * Math.PI,
        },
      }
    }
    //https://js.cytoscape.org/#layouts/circle
  },
  cola: {
    name: "cola",
    edgeLength: (e) => {
      let length =
        e.source().data("groupId") === e.target().data("groupId")
          ? supportedLayouts.cola.edgeLengthInScope || 100
          : supportedLayouts.cola.edgeLengthCrossScope || 300;
      return length;
    },

    animate: true, // whether to show the layout as it's running
    infinite: true,
    refresh: 1, // number of ticks per frame; higher is faster but more jerky
    maxSimulationTime: 4000, // max length in ms to run the layout
    ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
    edgeLengthInScope: 100,
    edgeLengthCrossScope: 300,
    fit: false, // on every layout reposition of nodes, fit the viewport
    padding: 30, // padding around the simulation
    nodeDimensionsIncludeLabels: true, // whether labels should be included in determining the space used by a node
    randomize: false, // use random node positions at beginning of layout
    avoidOverlap: true, // if true, prevents overlap of node bounding boxes
    handleDisconnected: true, // if true, avoids disconnected components from overlapping
    convergenceThreshold: 0.01, // when the alpha value (system energy) falls below this value, the layout stops
    centerGraph: false, // adjusts the node positions initially to center the graph (pass false if you want to start the layout from the current position)

    schema: {
      title: "circle",
      type: "object",
      properties: {
        animate: {
          type: "boolean",
          title: "Animate",
          default: false,
        },
        avoidOverlap: {
          type: "boolean",
          title: "Avoid Overlap",
          default: true,
        },
        centerGraph: {
          type: "boolean",
          title: "Center Graph",
          default: false,
        },
        convergenceThreshold: {
          type: "number",
          title: "Convergence Threshold",
          default: 0.01,
        },
        edgeLengthCrossScope: {
          type: "number",
          title: "Edge Length Cross Scope",
          default: 300,
        },
        edgeLengthInScope: {
          type: "number",
          title: "Edge Length In Scope",
          default: 100,
        },
        fit: {
          type: "boolean",
          title: "Fit",
          default: false,
        },
        handleDisconnected: {
          type: "boolean",
          title: "Handle Disconnected",
          default: true,
        },
        infinite: {
          type: "boolean",
          title: "Infinite",
          default: true,
        },
        maxSimulationTime: {
          type: "number",
          title: "Max Simulation Time",
          default: 4000,
        },
        nodeDimensionsIncludeLabels: {
          type: "boolean",
          title: "Node Dimensions Include Labels",
          default: true,
        },
        padding: {
          type: "number",
          title: "Padding",
          default: 30,
        },
        randomize: {
          type: "boolean",
          title: "Randomize",
          default: false,
        },
        refresh: {
          type: "number",
          title: "Refresh",
          default: 1,
        },
        ungrabifyWhileSimulating: {
          type: "boolean",
          title: "Ungrabify While Simulating",
          default: false,
        },
      }
    }
    //https://github.com/cytoscape/cytoscape.js-cola
  },
  concentric: {
    name: "concentric",

    animate: false, // whether to transition the node positions
    animationDuration: 500, // duration of animation in ms if enabled
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
    concentric: (n) => {
      let con = 1;
      switch(supportedLayouts.concentric.concentricAlgo) {
        case "indegree":
          con = n.indegree() + 1;
          break;
        case "outdegree":
          con = n.outdegree() + 1;
          break;
        case "fixedScope":
          con = n.data("root") ? 20 : n.degree() + 1;
          break;
        default:
          con = n.degree() + 1;
      }
      console.log(con);
      return con;
    },
    equidistant: false, // whether levels have an equal radial distance betwen them, may cause bounding box overflow
    fit: true, // whether to fit the viewport to the graph
    levelWidth: (n) => supportedLayouts.concentric.levelWidthValue || 2,
    minNodeSpacing: 10, // min spacing between outside of nodes (used for radius adjustment)
    nodeDimensionsIncludeLabels: true, // Excludes the label when calculating node bounding boxes for the layout algorithm
    padding: 30, // the padding on fit
    startAngle: 3 / 2 * Math.PI, // where nodes start in radians
    spacingFactor: 1, // Applies a multiplicative factor (>0) to expand or compress the overall area that the nodes take up
    sweep: 2 * Math.PI, // how many radians should be between the first and last node (defaults to full circle)
    schema: {
      title: "concentric",
      type: "object",
      properties: {
        animate: {
          type: "boolean",
          title: "Animate",
          default: false,
        },
        animationDuration: {
          type: "number",
          title: "Animation Duration",
          default: 500,
        },
        avoidOverlap: {
          type: "boolean",
          title: "Avoid Overlap",
          default: true,
        },
        clockwise: {
          type: "boolean",
          title: "Clockwise",
          default: true,
        },
        concentricAlgo: {
          type: "string",
          title: "Concentric",
          enum: ["degree", "indegree", "outdegree", "fixedScope"],
          default: "degree"
        },
        equidistant: {
          type: "boolean",
          title: "Equidistant",
          default: false,
        },
        fit: {
          type: "boolean",
          title: "Fit",
          default: true,
        },
        levelWidthValue: {
          type: "number",
          title: "Level Width",
          default: 2,
        },
        minNodeSpacing: {
          type: "number",
          title: "Min Node Spacing",
          default: 10,
        },
        nodeDimensionsIncludeLabels: {
          type: "boolean",
          title: "Node Dimensions Include Labels",
          default: true,
        },
        padding: {
          type: "number",
          title: "Padding",
          default: 30,
        },
        spacingFactor: {
          type: "number",
          title: "Spacing Factor",
          default: 1,
        },
        startAngle: {
          type: "number",
          title: "Start Angle",
          default:  3 / 2 * Math.PI,
        },
        sweep: {
          type: "number",
          title: "Sweep",
          default: 2 * Math.PI,
        },
      }
    }
    // https://js.cytoscape.org/#layouts/concentric
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
  }
};

const LayoutControl = ({
  className,
  style,
  children
}) => {
  const cy = useCy();
  const [opened, setOpened] = useState(false);
  const [layoutConfigOpened, setLayoutConfigOpened] = useState(false);
  const [layoutOverrides, setLayoutOverrides] = useState({});
  const [layout, setLayout] = useState("breadthfirst");
  const [activeLayout, setActiveLayout] = useState();
  const {contentModifiedTS} = useSetContentModifiedTS();
  const isMounted = useRef(false);

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-cy-control ${className || ""}`,
  };

  const layouts = useMemo(() => {
    // Merge the overrides with the defaults
    Object.keys(layoutOverrides).forEach(k => {
      supportedLayouts[k] = {...supportedLayouts[k], ...layoutOverrides[k]}
    });
    return supportedLayouts;
  }, [layoutOverrides]);

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

  // When the overrides whindow closes rerun layout
  useEffect(async () => {
    if (isMounted.current) {
      !layoutConfigOpened && runLayout();
    } else {
      isMounted.current = true;
    }
  }, [layoutConfigOpened, setLayoutConfigOpened])

  return (
    <>
      <div {...htmlProps}>
        <button onClick={() => {
          setOpened(!opened);
          setLayoutConfigOpened(false);
        }} title="Select layout">
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
              const hasSchema = !!layouts[layout].schema;
              return (
                <li key={name} className="layout-option">
                <Button
                  title={name}
                  active={layout == name}
                  action={() => {
                    setLayout(name);
                    setOpened(false);
                    setLayoutConfigOpened(false);
                  }}
                  altIcon={hasSchema && <FiSettings />}
                  altEnabled={hasSchema && (layout == name)}
                  altAction={hasSchema && (() => {
                    setLayoutConfigOpened(true);
                    setOpened(false);
                  })} />
                  </li>);
            })}
          </ul>
        )}
        {layoutConfigOpened === true && (
          <div className="layout-config">
            <Form
              schema={layouts[layout].schema}
              formData={layouts[layout]}
              onSubmit={({formData}, e) => {
                setLayoutOverrides({
                  [layout]: formData
                });
                setLayoutConfigOpened(false);
              }}
            />
          </div>
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
