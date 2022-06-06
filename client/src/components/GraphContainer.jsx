import React, { useState, useEffect, useMemo } from "react";
import { SettingsProvider } from "../hooks/useSettings.js";

const GraphContainer = ({ children }) => {
  const [settings, setSettings] = useState({
      source: "definitions",
      nodes: {
        filter: "",
        connected: false
      },
      edges: {
        scope: true,
        hard: true,
        soft: true
      }
  });
  const context = useMemo(() => ({ settings, setSettings }), [settings]);

  return (
    <div>
      <SettingsProvider value={context}>{children}</SettingsProvider>
    </div>
  );
};

export default GraphContainer;
