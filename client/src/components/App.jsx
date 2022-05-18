import React, { useState, useEffect } from 'react';
import Graph from './Graph.jsx';
import WithLoading from './WithLoading.jsx';

const App = () => {
  const GraphWithLoading = WithLoading(Graph)
  const [appState, setAppState] = useState({
    loading: true
  });

  useEffect(() => {
    setAppState({ loading: true });
    fetch('/api/wait')
      .then(() => {
        setAppState({ loading: false });
      });
  }, [setAppState]);

  return (
      <GraphWithLoading isLoading={appState.loading} />
  );
}

export default App;