import React, { useCallback, useEffect, useState, useMemo } from "react";
import './summarycontrol.css';

const DefinitionsSummaryControl = ({ nodeData }) => {
    let resourcesByScopeId = nodeData.nodes.reduce((acc, current) => {
        if (current.isScope) {
            return acc;
        }
        acc[current.scope.id] = acc[current.scope.id] || [];
        acc[current.scope.id].push(current);
        return acc;
    }, {});

    Object.keys(resourcesByScopeId)
        .forEach(s => {
            resourcesByScopeId[s].sort(
                (a, b) => a.kind.localeCompare(b.kind)
            );
        });

    nodeData.scopes.sort((a, b) => a.kind.localeCompare(b.kind));

    return (
        <>
            {nodeData.scopes.map((s) => {
                return (
                    <div key={s.id} className="scope-title">
                        {`${s.kind} (${resourcesByScopeId[s.id].length})`}
                    </div>
                );
            })}
        </>
    );
};

const InstancesSummaryControl = ({ resources, nodeData }) => {
    return (
        <>
            <div>Instances</div>
        </>
    );
};

const SummaryControl = ({ resources, nodeData }) => {
    return (
       <>
        <div className="react-sigma-control summary-control">
            {nodeData.source === "definitions" && <DefinitionsSummaryControl nodeData={nodeData} />}
            {nodeData.source === "instances" && <InstancesSummaryControl  resources={resources} nodeData={nodeData} />}
        </div>
       </> 
    )
}

export default SummaryControl;