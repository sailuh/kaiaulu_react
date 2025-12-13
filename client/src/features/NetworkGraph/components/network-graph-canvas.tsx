import { DndContext } from '@dnd-kit/core';
import { useNetworkGraph } from "../stores/network-graph-context.tsx";
import { useInitialPhysicsSimulation } from "@/features/NetworkGraph/hooks/useInitialPhysicsSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";
import { FloatingPanel } from "@/components/ui/floating-overlay/floating-overlay.tsx";
import Box from "@mui/material/Box";
import { useCallback, useEffect } from "react";
import { drawGraph } from "@/features/NetworkGraph/lib/draw-network-graph.ts";

export const NetworkGraphCanvas = () => {

    const {
        nodes,
        links,
        canvasRef,
        overlayOn,
        setOverlayOn,
        nodeRelationshipMapRef,
        transparentNodeMapRef,
    } = useNetworkGraph();

    const drawToCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        const container = canvas.parentElement;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const nextW = Math.max(1, Math.floor(rect.width));
        const nextH = Math.max(1, Math.floor(rect.height));

        if (canvas.width !== nextW) canvas.width = nextW;
        if (canvas.height !== nextH) canvas.height = nextH;

        drawGraph(canvas, nodes, links, transparentNodeMapRef.current,
            11,
            'gray',
            'gray');

    }, [canvasRef, links, nodes, transparentNodeMapRef]);

    useInitialPhysicsSimulation({ nodes, links, canvasRef, drawToCanvas: drawToCanvas });

    useNetworkGraphInteractions({
        nodes, links, canvasRef, overlayOn, setOverlayOn,
        nodeRelationshipMap: nodeRelationshipMapRef.current,
        transparentNodeMap: transparentNodeMapRef.current,
        drawToCanvas: drawToCanvas });

    useEffect(() => {
        drawToCanvas();
    }, [drawToCanvas, overlayOn]);

    return (
        <Box bgcolor="secondary.main" sx={{ flex: 1, display: 'flex' }}>
            <DndContext>
                <Box sx={{ flex: 1 }}>
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%'}}/>

                    {overlayOn ? (
                        <FloatingPanel id="subgraphOverlay" title="Subgraph Details">
                            <div>
                                Total nodes:
                            </div>
                            <div>
                                Show More
                            </div>
                        </FloatingPanel>
                    ) : null}
                </Box>
            </DndContext>
        </Box>
    )
}

