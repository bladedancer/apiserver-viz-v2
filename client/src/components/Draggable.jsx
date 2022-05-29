import React, { useState, useEffect, useCallback } from 'react';
import { useSigma } from "@react-sigma/core";
import { Children } from 'react/cjs/react.production.min';

const Draggable = ({children}) => {
    const sigma = useSigma();
    let graph = sigma.getGraph();
    const [dragState, setDragState] = useState({
        dragging: false,
        node: null,
        x: null,
        y: null
    });

    useEffect(() => {
        if (dragState.dragging) {
            graph.setNodeAttribute(dragState.node, "highlighted", true);
            if (dragState.x != null) {
                graph.setNodeAttribute(dragState.node, "x", dragState.x);
                graph.setNodeAttribute(dragState.node, "y", dragState.y);
            }
        } else if (dragState.node) {
            graph.removeNodeAttribute(dragState.node, "highlighted");
        }
    }, [dragState]);

    const downNode = useCallback((e) => {
        console.log(sigma.viewportToGraph(e))
        setDragState({
            ...dragState,
            dragging: true,
            node: e.node
        })
      }, [setDragState])

    const mouseMoveBody = useCallback((e) => {
        if (!dragState.dragging || !dragState.node) {
            return;
        }
        const pos = sigma.viewportToGraph(e);
        setDragState({
            ...dragState,
            x: pos.x,
            y: pos.y
        });
        // Prevent sigma to move camera:
        e.preventSigmaDefault();
        e.original.preventDefault();
        e.original.stopPropagation();
    }, [setDragState])

    const mouseUp = useCallback(() => {
        setDragState({
            ...dragState,
            dragging: false
        });
      }, [setDragState])

    const mouseDown = useCallback(() => {
        if (!sigma.getCustomBBox()) sigma.setCustomBBox(sigma.getBBox());
    }, [sigma]);

    useEffect(() => {
        console.log("ADDING LISTENERS")
        sigma.on("downNode", downNode);
        sigma.getMouseCaptor().on("mousemovebody", mouseMoveBody);
        sigma.getMouseCaptor().on("mouseup", mouseUp);
        sigma.getMouseCaptor().on("mousedown", mouseDown);
    }, [sigma, downNode, mouseMoveBody, mouseUp, mouseDown]);
    return <>{children}</>;
}

export default Draggable;
