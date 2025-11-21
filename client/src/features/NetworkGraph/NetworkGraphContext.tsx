import { type ReactNode, createContext, useContext } from 'react';
import { type NetworkGraphData } from '@/types/network-graph.types.ts';
import {useJsonFiles} from "@/features/NetworkGraph/hooks/useNetworkGraphJsonData.ts";

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

interface NetworkGraphContextValue {
    data: NetworkGraphData;
}

export function useNetworkGraph() {
    const ctx = useContext(NetworkGraphContext);

    if (!ctx) {
        throw new Error("useNetworkGraph must be used inside NetworkGraphProvider");
    }

    return ctx;
}

export function NetworkGraphProvider({ children }: { children: ReactNode }) {
    const data  = useJsonFiles();



    const value: NetworkGraphContextValue = {
        data
    };

    return (
        <NetworkGraphContext.Provider value={value}>
            {children}
        </NetworkGraphContext.Provider>
    );
}