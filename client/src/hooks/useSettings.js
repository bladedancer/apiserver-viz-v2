import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const SettingsContext = createContext({
    settings: {},
    setSettings: () => {}
});

export const SettingsProvider = SettingsContext.Provider;

export function useSettingsContext() {
    const context = useContext(SettingsContext);
    if (context == null) {
        throw new Error("No context provided: useSettingsContext() can only be used in a descendant of <GraphContainer>");
    }
    return context;
}

export function useSetContentModifiedTS() {
    const { settings, setSettings } = useSettingsContext();
    const get = useCallback(() => settings.contentModifiedTS, [settings]);

    return {
        contentModifiedTS: get,
        setContentModifiedTS: (contentModifiedTS) => setSettings({...settings, contentModifiedTS})
    };
}

export function useSetSource() {
    const { settings, setSettings } = useSettingsContext();
    const getSource = useCallback(() => settings.source, [settings]);

    return {
        source: getSource,
        setSource: (source) => setSettings({...settings, source})
    };
}

export function useSetNodeFilter() {
    const { settings, setSettings } = useSettingsContext();
    const getNodeFilter = useCallback(() => settings.nodes, [settings]);

    return {
        nodeFilter: getNodeFilter,
        setNodeFilter: (nodeFilter) => setSettings({
            ...settings, 
            nodes: { 
                ...settings.nodes, 
                ...nodeFilter
            }
        })
    };
}

export function useSetEdgeFilter() {
    const { settings, setSettings } = useSettingsContext();
    const getEdgeFilter = useCallback(() => settings.edges, [settings]);

    return {
        edgeFilter: getEdgeFilter,
        setEdgeFilter: (edgeFilter) => setSettings({
            ...settings, 
            edges: {
                ...settings.edges,
                ...edgeFilter
            }
        })
    };
}