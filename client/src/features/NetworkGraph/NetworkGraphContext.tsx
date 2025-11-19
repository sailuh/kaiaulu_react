import { type ReactNode, createContext, useContext, useCallback, useState, useEffect } from 'react';
import { type NetworkGraphData } from '@/types/network-graph.types.ts';

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

interface NetworkGraphContextValue {
    data: NetworkGraphData;
    loadFromFiles: (files: FileList | File[]) => Promise<void>;
}

const STORAGE_KEY = "networkGraphData";

function saveGraphToStorage(data: NetworkGraphData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
        console.error("Failed to save graph to localStorage", err);
    }
}

function loadGraphFromStorage(): NetworkGraphData | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as NetworkGraphData;
    } catch (err) {
        console.error("Failed to load graph from localStorage", err);
        return null;
    }
}

export function useNetworkGraph() {
    const ctx = useContext(NetworkGraphContext);

    if (!ctx) {
        throw new Error("useNetworkGraph must be used inside NetworkGraphProvider");
    }

    return ctx;
}

export function NetworkGraphProvider({ children }: { children: ReactNode }) {
    const initialData: NetworkGraphData = { nodes: [], links: [] };
    const [data, setGraph] = useState<NetworkGraphData>(initialData);

    useEffect(() => {
        const stored = loadGraphFromStorage();
        if (stored) {
            setGraph(stored);
        }
    }, []);

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

            const graph: NetworkGraphData = { nodes: allNodes, links: allLinks };

            setGraph(graph);
            saveGraphToStorage(graph);

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