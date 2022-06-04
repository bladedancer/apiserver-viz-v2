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

export function useSetSource() {
    const { settings, setSettings } = useSettingsContext();
    const getSource = useCallback(() => settings.source, [settings]);

    return {
        source: getSource,
        setSource: (source) => setSettings({...settings, source})
    };
}