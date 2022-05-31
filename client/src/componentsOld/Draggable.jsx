import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSigma } from "@react-sigma/core";

const Draggable = ({ children }) => {
  const sigma = useSigma();
  let graph = sigma.getGraph();
  const [dragState, setDragState] = useState({
    dragging: false,
    node: null,
    x: null,
    y: null,
  });

  // TODO Use Event
  const updateableState = useRef(dragState);
  useEffect(() => {
    updateableState.current = dragState;
  });

  // Register the event handlers
  useEffect(() => {
    console.log("ADDING LISTENERS");
    const downNode = (e) => {
      const dragState = updateableState.current;
      let ds = {
        ...dragState,
        dragging: true,
        node: e.node,
      };
      setDragState(ds);

      // Prevent sigma to move camera:
      e.preventSigmaDefault();
      e.event.original.preventDefault();
      e.event.original.stopPropagation();
    };

    const mouseMoveBody = (e) => {
      const dragState = updateableState.current;
      if (!dragState.dragging || !dragState.node) {
        return;
      }
      const pos = sigma.viewportToGraph(e);
      setDragState({
        ...dragState,
        x: pos.x,
        y: pos.y,
      });
      // Prevent sigma to move camera:
      e.preventSigmaDefault();
      e.original.preventDefault();
      e.original.stopPropagation();
    };

    const mouseUp = () => {
      const dragState = updateableState.current;
      setDragState({
        ...dragState,
        x: null,
        y: null,
        dragging: false,
      });
    };

    const mouseDown = () => {
      if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    };

    sigma.on("downNode", downNode);
    sigma.getMouseCaptor().on("mousemovebody", mouseMoveBody);
    sigma.getMouseCaptor().on("mouseup", mouseUp);
    sigma.getMouseCaptor().on("mousedown", mouseDown);
  }, []);

  // Move the node
  useEffect(() => {
    const dragState = updateableState.current;
    if (dragState.dragging) {
      graph.setNodeAttribute(dragState.node, "highlighted", true);
      if (dragState.x != null) {
        graph.setNodeAttribute(dragState.node, "x", dragState.x);
        graph.setNodeAttribute(dragState.node, "y", dragState.y);
      }
    } else if (dragState.node) {
      graph.removeNodeAttribute(dragState.node, "highlighted");
    }
  }, [dragState, graph]);

  return <>{children}</>;
};

export default Draggable;
