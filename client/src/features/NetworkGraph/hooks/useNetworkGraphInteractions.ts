import { useEffect, type RefObject, type SetStateAction, type Dispatch } from "react";
import { highlightSubgraph } from "../lib/draw-network-graph.ts";
import { type Link, type Node } from "@/types/network-graph.types.ts"
import { drawGraph } from '../lib/draw-network-graph.ts'
import { drag, type DragBehavior, pointer, select } from "d3";

/**
 *  Allows a network graph that is rendered to a canvas to become interactable to the user.
 *
 *  Contains logic for the following user interactions:
 *  - Double-click detection
 *  - Drag detection
 *  - Redraws network graph whenever canvas size changes (user resizes window, user opens browser console, etc.)
 */
export function useNetworkGraphInteractions(
    { nodes, links, canvasRef, setOverlayOn }: { nodes: Node[]; links: Link[]; canvasRef: RefObject<HTMLCanvasElement | null>; setOverlayOn: Dispatch<SetStateAction<boolean>> }
) {

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Canvas parent container is stored, necessary for resizing 'drawing space' later
        const container = canvas.parentElement;
        if (!container) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        // Can be adjusted but is arbitrarily set to 11
        const nodeRadiusMultiplier = 11;

        // Map that stores every node's related nodes
        const nodeRelationshipMap = buildRelationshipMap(nodes, links);

        // Map that stores transparency status of every node
        const transparentNodeMap = buildInitialTransparencyMap(nodes);

        /**
         *  Helper function that resizes the drawing space for a canvas.
         *
         *  Note:
         *  - A canvas has size as an HTML element, but also has virtual size for its drawing space.
         *  - The virtual size is being adjusted by this function, not the element size.
         *  - If the virtual size of a canvas does not match its element size then drawing on the canvas will look 'wrong'
         */
        const resize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
        };

        resize();

        // Creates drag behavior
        const dragBehavior = createDragBehavior(context, canvas, nodes, nodeRadiusMultiplier, links, transparentNodeMap,);

        // Attaches drag behavior to the canvas
        select(canvas).call(dragBehavior as DragBehavior<HTMLCanvasElement, unknown, unknown>);

        /**
         * Double-click handler that captures the location of the mouse pointer and triggers the highlight interaction.
         *
         * Flow:
         * 1. Whenever the canvas is double-clicked, check the position of the mouse pointer.
         * 2. If the mouse pointer is over a node, then trigger the highlight logic.
         * 3. After running the highlight logic, redraw the network graph.
         */
        const handleDblClick = (event: MouseEvent) => {
            const [x, y] = pointer(event, canvas);
            const hit = findNodeAt(nodes, nodeRadiusMultiplier, x, y,);

            if (hit) {
                highlightSubgraph(hit, transparentNodeMap, nodeRelationshipMap, setOverlayOn);
                drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
            }
        };

        // Creates double-click listener that triggers double-click handler and attaches it to the canvas
        select(canvas).on("dblclick", handleDblClick);

        /**
         *  Observes for when an element is resized and triggers the resize helper function.
         *
         *  Note:
         *  - By attaching this observer to the parent container of the canvas, we ensure that its drawing space is adjusted
         *  whenever its element size changes.
         */
        const ro = new ResizeObserver(() => {
            resize();
        });

        // Observes the parent container of the canvas
        ro.observe(container);

        // Clean-up function that disconnects observer and listeners when the hook is no longer in use.
        return () => {
            ro.disconnect();
            select(canvas).on(".drag", null).on("dblclick", null);
        };
    }, [nodes, links, canvasRef, setOverlayOn]);
}

function createDragBehavior(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    nodes: Node[],
    nodeRadiusMultiplier: number,
    links: Link[],
    transparentNodeMap: Map<string, number>) {

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
            drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
        });
}

function buildInitialTransparencyMap(nodes: Node[]) {
    const map = new Map<Node["id"], number>();
    nodes.forEach(n => map.set(n.id, 0));
    return map;
}

function buildRelationshipMap(nodes: Node[], links: Link[]) {
    const map = new Map<Node["id"], Set<Node["id"]>>();

    nodes.forEach((node) => {
        const set = new Set<Node["id"]>();

        links.forEach((link) => {
            const sourceId = link.source.id;
            const targetId = link.target.id;

            if (sourceId === node.id) set.add(targetId);
            else if (targetId === node.id) set.add(sourceId);
        });

        map.set(node.id, set);
    });

    return map;
}

// Finds the topmost node under (x,y)
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
