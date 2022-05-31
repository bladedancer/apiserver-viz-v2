import { createContext, useContext } from "react";

/**
 * @hidden
 */
 export const CyContext = createContext(null);

 export const CyProvider = CyContext.Provider;

/**
 * React hook to retrieve the cytoscape instance (from the context).
 *
 * ```typescript
 * const sigma = useSigma();
 *```
 * @category Hook
 */
export function useCy() {
    const context = useContext(CyContext);
    if (context == null) {
        throw new Error("No context provided: useSigmaContext() can only be used in a descendant of <SigmaContainer>");
    }
    return useSigmaContext().sigma;
}
