import React, { useCallback } from "react";

import ZoomInIcon from "../../assets/icons/plus.svg";
import ZoomOutIcon from "../../assets/icons/minus.svg";
import ZoomResetIcon from "../../assets/icons/dot-circle.svg";
import { useCy } from "../../hooks/useCy";

/**
 * The `ZoomControl` create three UI buttons that allows the user to
 * - zoom in
 * - zoom out
 * - reset zoom (ie. see the whole graph)
 *
 * ```jsx
 * <GraphContainer>
 *   <ControlsContainer>
 *     <ZoomControl />
 *   </ControlsContainer>
 * </GraphContainer>
 * ```
 *
 * @category Component
 */
const ZoomControl = ({
  className,
  style,
  duration,
  children,
}) => {
  const cy = useCy();

  duration = duration || 200;

  // Common html props for the div wrapper
  const htmlProps = {
    style,
    className: `react-cy-control ${className || ""}`,
  };

  const zoomIn = useCallback(() => {
    cy.animate({
      zoom: {
        level: cy.zoom() * 1.2,
        renderedPosition: {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }
      }
    }, {
      duration
    });
  }, [cy]);

  const zoomOut = useCallback(() => {
    cy.animate({
      zoom: {
        level: cy.zoom() * 0.8,
        renderedPosition: {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        }
      }
    }, {
      duration
    });
  }, [cy]);

  const fit = useCallback(() => {
    cy.animate({
      fit: {
        else: cy.nodes()
      }
    }, {
      duration
    });
  }, [cy]);

  return (
    <>
      <div {...htmlProps}>
        <button onClick={zoomIn} title="Zoom In">
          {children ? children[0] : <ZoomInIcon style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={zoomOut} title="Zoom Out">
          {children ? children[1] : <ZoomOutIcon style={{ width: "1em" }} />}
        </button>
      </div>
      <div {...htmlProps}>
        <button onClick={fit} title="See whole graph">
          {children ? children[2] : <ZoomResetIcon style={{ width: "1em" }} />}
        </button>
      </div>
    </>
  );
};

export default ZoomControl;
