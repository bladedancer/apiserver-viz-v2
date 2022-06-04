import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSetSource } from "../../hooks/useSettings.js";
import SlideToggle from "../utils/SlideToggle.jsx";

const SettingsControl = () => {
  const {source, setSource} = useSetSource();

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
    </>
  );
};

export default SettingsControl;
