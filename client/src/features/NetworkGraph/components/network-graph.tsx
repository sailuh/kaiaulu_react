import { useRef, useState } from 'react';
import './network-graph.css';
import { DndContext } from '@dnd-kit/core';
import { useNetworkGraph } from "../stores/network-graph-context.tsx";
import { useNetworkGraphSimulation } from "@/features/NetworkGraph/hooks/useNetworkGraphSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";
import {FloatingPanel} from "@/components/ui/floating-overlay/floating-overlay.tsx";

export const NetworkGraph = () => {
    const [ overlayOn, setOverlayOn ] = useState<boolean>(false);

    const { data } = useNetworkGraph();

    const { nodes, links } = data ?? { nodes: [], links: [] };

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useNetworkGraphSimulation({ nodes, links, canvasRef });
    useNetworkGraphInteractions({ nodes, links, canvasRef, setOverlayOn });

    return (
        <DndContext>
            <div
                className="graph-container" style={{
                position: "relative",
                width: "100%",
                height: "100%",
            }}>
                <canvas id={"graphCanvas"} ref={canvasRef}/>

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

            </div>
        </DndContext>
    )
}
