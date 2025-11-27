import { useRef } from 'react';
import './NetworkGraph.css';
import { DndContext } from '@dnd-kit/core';
import { useNetworkGraph } from "../NetworkGraphContext.tsx";
import { useNetworkGraphSimulation } from "@/features/NetworkGraph/hooks/useNetworkGraphSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";
import {FloatingPanel} from "@/components/ui/FloatingOverlay/FloatingOverlay.tsx";

export const NetworkGraph = () => {
    const { data } = useNetworkGraph();

    const { nodes, links } = data ?? { nodes: [], links: [] };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useNetworkGraphSimulation({ nodes, links, canvasRef });
    useNetworkGraphInteractions({ nodes, links, canvasRef });

    return (
        <DndContext>
            <div
                className="graph-container" style={{
                position: "relative",
                width: "100%",
                height: "100%",
            }}>
                <canvas id={"graphCanvas"} ref={canvasRef}/>

                {}
                <FloatingPanel id="subgraphOverlay" title="Node details">
                </FloatingPanel>
            </div>
        </DndContext>
    )
}
