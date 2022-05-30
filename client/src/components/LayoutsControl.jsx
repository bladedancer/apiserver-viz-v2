import React, { useEffect,useMemo,  useState } from "react";
import { FaProjectDiagram } from "react-icons/fa";

import { animateNodes } from "sigma/utils/animate";

import { useSigma } from "@react-sigma/core";
import { WorkerLayoutControl } from "@react-sigma/layout-core";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { useLayoutCirclepack } from "@react-sigma/layout-circlepack";
import { useLayoutRandom } from "@react-sigma/layout-random";
import { useLayoutNoverlap, useWorkerLayoutNoverlap } from "@react-sigma/layout-noverlap";
import { useLayoutForce, useWorkerLayoutForce } from "@react-sigma/layout-force";
import { useLayoutForceAtlas2, useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";

export const LayoutsControl = () => {
  const sigma = useSigma();
  const [layout, setLayout] = useState("forceAtlas");
  const [opened, setOpened] = useState(false);
  const layoutCircular = useLayoutCircular();
  const layoutCirclepack = useLayoutCirclepack({
    hierarchyAttributes: ["color"],
    scale: 5
  });
  const layoutRandom = useLayoutRandom();
  const layoutNoverlap = useLayoutNoverlap({
    maxIterations: 100,
    settings: {
      expansion: 3,
      gridSize: 4,
      margin: 10 
    }
  });
  const layoutForce = useLayoutForce({
    maxIterations: 100,
    settings: {
      repulsion: 1,
      attraction: .2,
      gravity: 1,
      inertia: 4
    }  
  });

  const layoutForceAtlas2 = useLayoutForceAtlas2({
    iterations: 100,
    settings: {
      adjustSizes: true,
      barnesHutOptimize: true,
      barnesHutTheta: 10,
      edgeWeightInfluence: 1,
      gravity: 1,
      linLogMode: false,
      outboundAttractionDistribution: false,
      scalingRatio: 10,
      slowDown: 1,
      strongGravityMode: false
    }
  });

  const layouts = useMemo(()=> {
    return {
      circular: {
        layout: layoutCircular,
      },
      circlepack: {
        layout: layoutCirclepack,
      },
      random: {
        layout: layoutRandom,
      },
      noverlaps: {
        layout: layoutNoverlap,
        worker: useWorkerLayoutNoverlap
      },
      forceDirected: {
        layout: layoutForce,
        worker: useWorkerLayoutForce
      },
      forceAtlas: {
        layout: layoutForceAtlas2,
        worker: useWorkerLayoutForceAtlas2,
        settings: {
          adjustSizes: true,
          barnesHutOptimize: true,
          barnesHutTheta: 10,
          edgeWeightInfluence: 1,
          gravity: 0,
          linLogMode: false,
          outboundAttractionDistribution: false,
          scalingRatio: 10,
          slowDown: 1,
          strongGravityMode: false
        }
      },
    }
  }, [layoutCircular,
      layoutCirclepack,
      layoutRandom,
      layoutNoverlap,
      layoutForce,
      layoutForceAtlas2,]);

  useEffect(() => {
    const { positions } = layouts[layout].layout;
    animateNodes(sigma.getGraph(), positions(), { duration: 2000 });
  }, [layout, layouts, sigma]);

  useEffect(() => {
    const close = () => setOpened(false);
    if (opened === true) {
      document.addEventListener("click", close);
    }
    return () => document.removeEventListener("click", close);
  }, [opened]);

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
                      style={{ fontWeight: layout === name ? "bold" : "normal", width:"100%" }}
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
        <div>
        {layouts[layout] && layouts[layout].worker && (
          <WorkerLayoutControl layout={layouts[layout].worker} settings={layouts[layout].settings} />
        )}
      </div>
      </div>
    </>
  );
};
