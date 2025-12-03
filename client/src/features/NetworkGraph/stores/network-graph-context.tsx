import { type ReactNode, createContext, useContext } from 'react';
import { type NetworkGraphData } from '@/types/network-graph.types.ts';
import {useNetworkGraphData} from "@/features/NetworkGraph/hooks/useNetworkGraphData.ts";

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

interface NetworkGraphContextValue {
    data: NetworkGraphData;
}

/**
 *  Allows a child component of the NetworkGraphProvider to use the context.
 */
export function useNetworkGraph() {
    const ctx = useContext(NetworkGraphContext);

    if (!ctx) {
        throw new Error("useNetworkGraph must be used inside NetworkGraphProvider");
    }

    return ctx;
}

/**
 *  Provider of context for the Network Graph
 *
 *  Calls useGraphJsonFiles to load and provide the .json data for the Network Graph.
 */
export function NetworkGraphProvider({ children }: { children: ReactNode }) {
    const data  = useNetworkGraphData();

    const value: NetworkGraphContextValue = {
        data
    };

    return (
        <NetworkGraphContext.Provider value={value}>
            {children}
        </NetworkGraphContext.Provider>
    );
}