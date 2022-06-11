import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCy } from "../../hooks/useCy.js";


const ExportControl = () => {
    const cy = useCy();

    const exportCy = useCallback(() => {
        let data = cy.png({
            bg: 'white',
            full: true,
            scale: 1      
        });
        let w = window.open('about:blank');
        let image = new Image();
        image.src = data;
        setTimeout(function(){
        w.document.write(image.outerHTML);
        }, 0);
    });

    return (
        <>
            <button onClick={exportCy}>Export PNG</button>
        </>
    )
}

export default ExportControl;