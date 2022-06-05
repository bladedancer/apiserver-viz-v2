import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCy } from "../../hooks/useCy.js";
import { useSetSource, useSetFilter } from "../../hooks/useSettings.js";
import SlideToggle from "../utils/SlideToggle.jsx";

const SettingsControl = () => {
  const cy = useCy();
  const { source, setSource } = useSetSource();
  const { filter, setFilter } = useSetFilter();

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
      })
    });
  }, [cy, filter()]);

  return (
    <>
      <div className="react-sigma-control source-control">
        <SlideToggle
          className="source-toggle"
          selected={source()}
          onChange={setSource}
          options={[
            {
              value: "definitions",
              label: "Definitions",
            },
            {
              value: "instances",
              label: "Instances",
            },
          ]}
        />
      </div>
      <div className="react-sigma-control filter-control">
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
    </>
  );
};

export default SettingsControl;
