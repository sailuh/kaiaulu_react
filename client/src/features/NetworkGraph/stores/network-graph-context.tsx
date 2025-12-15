import { type ReactNode, createContext, useContext, useState, type Dispatch, type SetStateAction, useRef,
    type RefObject, useEffect
} from 'react';

import type { Node, Link } from "@/features/NetworkGraph/types/network-graph.types.ts"
import { useNetworkGraphData } from "@/features/NetworkGraph/hooks/useNetworkGraphData.ts";
import { buildInitialTransparencyMap, buildRelationshipMap } from "@/features/NetworkGraph/lib/draw-network-graph.ts";

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);

interface NetworkGraphContextValue {
    nodes: Node[];
    links: Link[];
    canvasRef: RefObject<HTMLCanvasElement | null>
    overlayOn: boolean;
    setOverlayOn: Dispatch<SetStateAction<boolean>>;
    nodeRelationshipMapRef: RefObject<Map<string, Set<string>>>;
    transparentNodeMapRef: RefObject<Map<string, number>>;
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
    const { nodes, links }  = useNetworkGraphData();

    useEffect(() => {
        nodeRelationshipMapRef.current = buildRelationshipMap(nodes, links);
        transparentNodeMapRef.current = buildInitialTransparencyMap(nodes);
    }, [nodes, links]);

    const transparentNodeMapRef = useRef<Map<string, number>>(new Map());
    const nodeRelationshipMapRef = useRef<Map<string, Set<string>>>(new Map());

    const [ overlayOn, setOverlayOn ] = useState<boolean>(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const value: NetworkGraphContextValue = {
        nodes,
        links,
        canvasRef,
        overlayOn,
        setOverlayOn,
        nodeRelationshipMapRef,
        transparentNodeMapRef
    };

    return (
        <NetworkGraphContext.Provider value={value}>
            {children}
        </NetworkGraphContext.Provider>
    );
}