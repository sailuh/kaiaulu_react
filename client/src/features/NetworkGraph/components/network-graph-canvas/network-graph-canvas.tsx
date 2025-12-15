import { useCallback, useEffect } from "react";

import Box from "@mui/material/Box";

import { useNetworkGraph } from "../../stores/network-graph-context.tsx";
import { useInitialPhysicsSimulation } from "@/features/NetworkGraph/hooks/useInitialPhysicsSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";

import { drawGraph } from "@/features/NetworkGraph/lib/draw-network-graph.ts";


/**
 *  Provides an HTML canvas for the Network Graph feature and exposes a function that draws a network graph to that canvas
 */
export const NetworkGraphCanvas = () => {
    const { nodes, links, canvasRef, overlayOn, transparentNodeMapRef } = useNetworkGraph();

    /**
     *  Function called by network graph hooks whenever they have mutated relevant data (node position changed by user, highlight mode, etc.)
     *  that draws the current state of the network graph to the canvas.
     */
    const renderNetworkGraph = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        const container = canvas.parentElement;
        if (!container) return;

        //Before every draw, canvas 'draw space' needs to be the same as its parent container, else the drawing will appear distorted
        const rect = container.getBoundingClientRect();
        const nextW = Math.max(1, Math.floor(rect.width));
        const nextH = Math.max(1, Math.floor(rect.height));

        if (canvas.width !== nextW) canvas.width = nextW;
        if (canvas.height !== nextH) canvas.height = nextH;

        // Helper function from draw-network-graph library, runs the canvas + context logic for drawing
        drawGraph(canvas, nodes, links, transparentNodeMapRef.current,
            11,
            'gray',
            'gray');

    }, [canvasRef, links, nodes, transparentNodeMapRef]);

    /**
     *  Calculates the initial positions of nodes and links in the Network Graph by running a d3.js simulation.
     *  Renders the Network Graph after simulation has completed.
     */
    useInitialPhysicsSimulation(renderNetworkGraph);

    /**
     *  Allows user to interface with the network graph and also applies interaction specific logic
     *  Renders the Network Graph whenever user interaction has changed anything about the graph visually (dragged nodes, highlight mode).
     */
    useNetworkGraphInteractions(renderNetworkGraph);

    /**
     * If a DOM re-render happens and the subgraph overlay state has changed, then draw the network graph to the canvas
     */
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

