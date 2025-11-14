import { type ReactNode, createContext, useContext, useCallback, useState } from 'react';
import { type NetworkGraphData } from '../../types/network-graph.types.ts';

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

interface NetworkGraphContextValue {
    data: NetworkGraphData | null;
    loadFromFiles: (files: FileList | File[]) => Promise<void>;
}

export function useNetworkGraph() {
    const ctx = useContext(NetworkGraphContext);

    if (!ctx) {
        throw new Error("useNetworkGraph must be used inside NetworkGraphProvider");
    }
    return ctx;
}

export function NetworkGraphProvider({ children }: { children: ReactNode }) {
    const [data, setGraph] = useState<NetworkGraphData | null>(null);

    const loadFromFiles = useCallback(async (filesLike : FileList | File[]) => {
        try {
            const files = Array.from(filesLike);

            const allNodes: NetworkGraphData["nodes"] = [];
            const allLinks: NetworkGraphData["links"] = [];

            for (const file of files) {
                if (!file.name.toLowerCase().endsWith(".json")) continue;

                const text = await file.text();
                const json = JSON.parse(text) as NetworkGraphData; // or a smaller "chunk" type

                allNodes.push(...json.nodes);
                allLinks.push(...json.links);
            }

            console.log(allNodes);
            console.log(allLinks);

            setGraph({ nodes: allNodes, links: allLinks });
        } catch (err) {
            console.error(err);
        }
    }, []);

    const value: NetworkGraphContextValue = {
        data,
        loadFromFiles,
    };

    return (
        <NetworkGraphContext.Provider value={value}>
            {children}
        </NetworkGraphContext.Provider>
    );
}