import React, { useCallback, useEffect, useState, useMemo } from "react";
import Multiselect from 'multiselect-react-dropdown';
import { useSetNodeFilter, useSetEdgeFilter } from "../../hooks/useSettings.js";
import './summarycontrol.css';

const DefinitionsSummaryControl = ({ nodeData }) => {
    let [selectedValues, setSelectedValues] = useState([]);
    const { nodeFilter, setNodeFilter } = useSetNodeFilter();

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

    let scopes = nodeData.scopes
        .map((s,i) => ({name: `${s.kind} (${resourcesByScopeId[s.id].length})`, id: s.id}));

    const onSelect = useCallback((e) => {
        setNodeFilter({
            ...nodeFilter,
            ids: e.map(filterNode => nodeData.nodes.filter(anode => (filterNode.id === anode.id) || (!anode.isScope &&  anode.scope.id === filterNode.id))).flatMap(s=>s).map(n => n.id)
        })
    }, [nodeFilter, setNodeFilter]);

    return (
        <Multiselect
            options={scopes} // Options to display in the dropdown
            placeholder="Select Scopes"
            selectedValues={selectedValues} // Preselected value to persist in dropdown
            onSelect={onSelect} // Function will trigger on select event
            onRemove={onSelect} // Function will trigger on remove event
            displayValue="name" // Property name to display in the dropdown options
            avoidHighlightFirstOption={true}
            emptyRecordMsg="No scopes found"
        />
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
        <div className="summary-control">
            {nodeData.source === "definitions" && <DefinitionsSummaryControl nodeData={nodeData} />}
            {nodeData.source === "instances" && <InstancesSummaryControl  resources={resources} nodeData={nodeData} />}
        </div>
       </>
    )
}

export default SummaryControl;
