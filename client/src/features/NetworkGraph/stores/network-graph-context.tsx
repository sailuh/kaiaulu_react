import { type ReactNode, createContext, useContext, useState, type Dispatch, type SetStateAction, useRef,
    type RefObject, useEffect
} from 'react';

import type { Node, Link } from "@/features/NetworkGraph/types/network-graph.types.ts"
import { useNetworkGraphData } from "@/features/NetworkGraph/hooks/useNetworkGraphData.ts";
import { buildInitialTransparencyMap, buildRelationshipMap } from "@/features/NetworkGraph/lib/draw-network-graph.ts";

const NetworkGraphContext = createContext<NetworkGraphContextValue | null>(null);


/**
 *  This data is exposed to the children of the NetworkGraphProvider. It acts as a central source of truth for the Network Graph components.
 */
interface NetworkGraphContextValue {
    // Array of d3.js node objects that have been extended with additional properties
    nodes: Node[];

    // Array of d3.js link objects that have been extended with additional properties
    links: Link[];

    // Reference object to HTML Canvas upon which the Network Graph will be drawn, survives React DOM re-renders
    canvasRef: RefObject<HTMLCanvasElement | null>

    // Current highlight state, is determined by whether or whether not the subgraph overlay is active
    overlayOn: boolean;

    // Function to set the current highlight state
    setOverlayOn: Dispatch<SetStateAction<boolean>>;

    // Reference object to a map with each node's id as a key, and a set of their related nodes as values, survives React DOM re-renders
    nodeRelationshipMapRef: RefObject<Map<string, Set<string>>>;

    // Reference object to a map with each node's id as a key, and a number representing their current transparency (1 for transparent, 0 for opaque), survives React DOM re-renders
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