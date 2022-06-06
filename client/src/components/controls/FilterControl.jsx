import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCy } from "../../hooks/useCy.js";
import { useSetNodeFilter, useSetEdgeFilter } from "../../hooks/useSettings.js";
import Toggle from "../utils/Toggle.jsx";

const FilterControl = () => {
  const cy = useCy();
  const { nodeFilter, setNodeFilter } = useSetNodeFilter();
  const { edgeFilter, setEdgeFilter } = useSetEdgeFilter();

  useEffect(async () => {
    if (!cy) {
      return;
    }
    cy.batch(() => {
      let nf = nodeFilter();
      let ef = edgeFilter();

      cy.nodes().forEach((n) => {
        if (
          !nf.filter ||
          n
            .data("label")
            .toLowerCase()
            .match(nf.filter.toLowerCase() + ".*")
        ) {
          n.show();
        } else {
          n.hide();
        }
      });

      // This will leave nodes disconnected because edge filtering happens after this. Todo - successors/predecessors reachable by enabled edge types.
      if (nf.filter && nf.connected) {
        cy.elements(":visible")
          .predecessors()
          .forEach((n) => n.show());
        cy.elements(":visible")
          .successors()
          .forEach((n) => n.show());
      }

      cy.edges().forEach((e) => {
        let type = e.data("type");
        if (type == "scope") {
          ef.scope ? e.show() : e.hide();
        } else if (type == "hard") {
          ef.hard ? e.show() : e.hide();
        } else if (type == "soft") {
          ef.soft ? e.show() : e.hide();
        }
      });
    });
  }, [cy, nodeFilter(), edgeFilter()]);

  return (
    <>
      <div className="react-sigma-control filter-control">
        <div className="node-filter-control">
          <label>
            Filter:
            <input
              type="text"
              name="filter"
              placeholder="Filter displayed resources"
              value={nodeFilter().filter}
              onChange={ (e) => setNodeFilter({ filter: e.target.value })} // Need to debounce this
            />
          </label>
        </div>
        <Toggle
          checked={nodeFilter().connected}
          onChange={() => setNodeFilter({ connected: !nodeFilter().connected })}
        >
          Connected Nodes
        </Toggle>
        <div className="edge-filter-control">
          <Toggle
            checked={edgeFilter().scope}
            onChange={() => setEdgeFilter({ scope: !edgeFilter().scope })}
          >
            Scope
          </Toggle>
          <Toggle
            checked={edgeFilter().hard}
            onChange={() => setEdgeFilter({ hard: !edgeFilter().hard })}
          >
            Hard
          </Toggle>
          <Toggle
            checked={edgeFilter().soft}
            onChange={() => setEdgeFilter({ soft: !edgeFilter().soft })}
          >
            Soft
          </Toggle>
        </div>
      </div>
    </>
  );
};

export default FilterControl;
