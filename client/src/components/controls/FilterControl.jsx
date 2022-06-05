import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCy } from "../../hooks/useCy.js";
import { useSetFilter } from "../../hooks/useSettings.js";
import { useSetEdgeFilter } from "../../hooks/useSettings.js";
import Toggle from "../utils/Toggle.jsx"

const FilterControl = () => {
  const cy = useCy();
  const { filter, setFilter } = useSetFilter();
  const { edgeFilter, setEdgeFilter } = useSetEdgeFilter();

  useEffect(async () => {
    if (!cy) {
      return;
    }
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        if (!filter || n.data("label").match(filter() + ".*")) {
          n.show();
        } else {
          n.hide();
        }
      });

      cy.edges().forEach((e) => {
        let type = e.data("type");
        if (type == "scope") {
          edgeFilter().scope ? e.show() : e.hide();
        } else if (type == "hard") {
          edgeFilter().hard ? e.show() : e.hide();
        } else if (type == "soft") {
          edgeFilter().soft ? e.show() : e.hide();
        }
      });
    });
  }, [cy, filter(), edgeFilter()]);

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
              value={filter()}
              onChange={(e) => setFilter(e.target.value)}
            />
          </label>
        </div>
        <div className="edge-filter-control">
            <Toggle checked={edgeFilter().scope} onChange={() => setEdgeFilter({scope: !edgeFilter().scope})}>Scope</Toggle>
            <Toggle checked={edgeFilter().hard} onChange={() => setEdgeFilter({hard: !edgeFilter().hard})}>Hard</Toggle>
            <Toggle checked={edgeFilter().soft} onChange={() => setEdgeFilter({soft: !edgeFilter().soft})}>Soft</Toggle>
        </div>
      </div>
    </>
  );
};

export default FilterControl;
