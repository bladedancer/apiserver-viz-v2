import React from "react";
import { useSetSource, useSetSourceRefresh } from "../../hooks/useSettings.js";
import SlideToggle from "../utils/SlideToggle.jsx";
import { MdRefresh } from "react-icons/md";

const SourceControl = () => {
  const { source, setSource } = useSetSource();
  const { sourceRefresh, setSourceRefresh } = useSetSourceRefresh()
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
        <button className="refresh" title="Refresh" onClick={()=>{setSourceRefresh({ source: source() })}} disabled={sourceRefresh().busy}>
          <MdRefresh className={sourceRefresh().busy ? "busy" : ""}/>
        </button>
      </div>
    </>
  );
};

export default SourceControl;
