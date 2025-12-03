import {useEffect, type RefObject, type SetStateAction, type Dispatch } from "react";
import { type Link, type Node } from "@/types/network-graph.types.ts"
import {
    buildInitialTransparencyMap,
    buildRelationshipMap,
    createDragBehavior,
    drawGraph, findNodeAt, highlightSubgraph
} from "@/features/NetworkGraph/lib/network-graph-utils.ts";
import {type DragBehavior, pointer, select} from "d3";

export function useNetworkGraphInteractions(
    { nodes, links, canvasRef, setOverlayOn }: { nodes: Node[]; links: Link[]; canvasRef: RefObject<HTMLCanvasElement | null>; setOverlayOn: Dispatch<SetStateAction<boolean>> }
) {

    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const container = canvas.parentElement;
        if (!container) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const nodeRadiusMultiplier = 11;
        const nodeRelationshipMap = buildRelationshipMap(nodes, links);
        const transparentNodeMap = buildInitialTransparencyMap(nodes);

        const resize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
        };

        resize();

        const dragBehavior = createDragBehavior(context, canvas, nodes, nodeRadiusMultiplier, links, transparentNodeMap,);
        select(canvas).call(dragBehavior as DragBehavior<HTMLCanvasElement, unknown, unknown>);

        const handleDblClick = (event: MouseEvent) => {
            const [x, y] = pointer(event, canvas);
            const hit = findNodeAt(nodes, nodeRadiusMultiplier, x, y,);

            if (hit) {
                highlightSubgraph(hit, transparentNodeMap, nodeRelationshipMap, setOverlayOn);
                drawGraph(context, canvas, nodes, links, transparentNodeMap, nodeRadiusMultiplier);
            }
        };
        select(canvas).on("dblclick", handleDblClick);

        const ro = new ResizeObserver(() => {
            resize();
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            select(canvas).on(".drag", null).on("dblclick", null);
        };
    }, [nodes, links, canvasRef, setOverlayOn]);
}