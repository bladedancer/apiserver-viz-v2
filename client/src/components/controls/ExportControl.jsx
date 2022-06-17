import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useCy } from "../../hooks/useCy.js";
import { saveAs } from 'file-saver';
import { FaSpinner, FaDownload } from "react-icons/fa";


const ExportControl = () => {
    const [ busy, setBusy ] = useState(false);
    const cy = useCy();

    const exportCy = useCallback(async () => {
        setBusy(true);
        let img = await cy.png({
            //bg: 'white',
            full: true,
            scale: 1,
            output: 'blob-promise'      
        });
        saveAs(img, "graph.png");
        setBusy(false);
    }, [cy, setBusy]);

    return (
        <>
            <div className="react-cy-control export-control">
                <button onClick={exportCy} disabled={busy}>
                    {busy && <FaSpinner/>}
                    {!busy && <FaDownload/>}
                    Export PNG
                </button>
            </div>
        </>
    )
}

export default ExportControl;