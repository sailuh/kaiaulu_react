import { useEffect } from "react";
import { type Node } from "@/features/NetworkGraph/types/network-graph.types.ts"
import { drag, type DragBehavior, pointer, select } from "d3";
import {
    setAllNodesToBeOpaque,
    setAllNodesToBeTransparent,
    setNodeNeighborhoodToBeOpaque
} from "@/features/NetworkGraph/utils/transparent-node-map.ts";
import {useNetworkGraph} from "@/features/NetworkGraph/stores/network-graph-context.tsx";

/**
 *  Allows a network graph that is rendered to a canvas to become interactable to the user.
 *  It creates the listeners for user interaction and also runs the logic for each listener.
 *
 *  Currently supported user interactions
 *  - Double-click detection
 *  - Drag detection
 */
export function useNetworkGraphInteractions(renderNetworkGraph: () => void)  {

    const {
        nodes,
        links,
        canvasRef,
        overlayOn,
        setOverlayOn,
        nodeRelationshipMapRef,
        transparentNodeMapRef,
    } = useNetworkGraph();

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Can be adjusted but is arbitrarily set to 11
        const nodeRadiusMultiplier = 11;

        // Creates drag behavior
        const dragBehavior = createDragBehavior(canvas, nodes, nodeRadiusMultiplier, renderNetworkGraph);

        // Attaches drag behavior to the canvas
        select(canvas).call(dragBehavior as DragBehavior<HTMLCanvasElement, unknown, unknown>);

        /**
         * Double-click handler that captures the location of the mouse pointer and triggers the highlight interaction.
         *
         * Flow:
         * 1. Whenever the canvas is double-clicked, check the position of the mouse pointer.
         * 2. If the mouse pointer is over a node, then target that node and its related nodes according to the relationship map
         * 3. Update transparency values depending on current highlight state (is the overlay enabled? or is it disabled)
         */
        const handleDblClick = (event: MouseEvent) => {
            const [x, y] = pointer(event, canvas);
            const hit = findNodeAt(nodes, nodeRadiusMultiplier, x, y,);

            if (hit) {
                if (!overlayOn) {
                    setAllNodesToBeTransparent(transparentNodeMapRef.current);
                    setNodeNeighborhoodToBeOpaque(hit.id, transparentNodeMapRef.current, nodeRelationshipMapRef.current);
                    setOverlayOn(true);
                } else {
                    setAllNodesToBeOpaque(transparentNodeMapRef.current)
                    setOverlayOn(false);
                }
            }
        };

        // Creates double-click listener that triggers double-click handler and attaches it to the canvas
        select(canvas).on("dblclick", handleDblClick);

        // Clean-up function that disconnects listener when the hook is no longer in use.
        return () => {
            select(canvas).on(".drag", null).on("dblclick", null);
        };
    }, [nodes, links, canvasRef, setOverlayOn, transparentNodeMapRef, nodeRelationshipMapRef, overlayOn, renderNetworkGraph ]);
}

/**
 *  Helper function that creates a D3.js drag behavior
 *  - Updates node position to position of pointer while the node is being dragged
 *  - Renders the graph with each tick of a drag
 */
function createDragBehavior(
    canvas: HTMLCanvasElement,
    nodes: Node[],
    nodeRadiusMultiplier: number,
    renderNetworkGraph: () => void) {

    return drag<HTMLCanvasElement, unknown>()
        .subject((event) => {
            const [x, y] = pointer(event, canvas);

            // find nearest node within radius
            const n = findNodeAt(nodes, nodeRadiusMultiplier, x, y);

            if (n) {
                n.fx = n.x ?? x;
                n.fy = n.y ?? y;
            }

            return n;
        })
        .on('drag', (event) => {
            const n = event.subject;
            n.x = event.x;
            n.y = event.y;
            renderNetworkGraph();
        });
}


/**
 *  Helper function that finds the topmost node under (x,y)
 */
function findNodeAt(nodes: Node[], nodeRadiusMultiplier: number, x: number, y: number) {
    for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];

        const r = n.value * nodeRadiusMultiplier;
        const dx = x - n.x!;
        const dy = y - n.y!;

        if (dx*dx + dy*dy <= r*r) return n;
    }
    return undefined;
}
