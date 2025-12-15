import { useCallback, useEffect } from "react";

import Box from "@mui/material/Box";

import { useNetworkGraph } from "../../stores/network-graph-context.tsx";
import { useInitialPhysicsSimulation } from "@/features/NetworkGraph/hooks/useInitialPhysicsSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";

import { drawGraph } from "@/features/NetworkGraph/lib/draw-network-graph.ts";


export const NetworkGraphCanvas = () => {
    const { nodes, links, canvasRef, overlayOn, transparentNodeMapRef } = useNetworkGraph();

    const renderNetworkGraph = useCallback(() => {
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

    useInitialPhysicsSimulation(renderNetworkGraph);
    useNetworkGraphInteractions(renderNetworkGraph);

    useEffect(() => {
        renderNetworkGraph();
    }, [renderNetworkGraph, overlayOn]);

    return (
        <Box sx={{ flex: 1, display: 'flex' }}>
                <Box sx={{ flex: 1 }}>
                    <canvas ref={canvasRef} style={{ width: '100%', height: '100%'}}/>
                </Box>
        </Box>
    )
}

