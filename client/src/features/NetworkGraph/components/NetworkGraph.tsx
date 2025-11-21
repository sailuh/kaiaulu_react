import { useRef } from 'react';
import './NetworkGraph.css';
import { useNetworkGraph } from "../NetworkGraphContext.tsx";
import { useNetworkGraphSimulation } from "@/features/NetworkGraph/hooks/useNetworkGraphSimulation.ts";
import { useNetworkGraphInteractions } from "@/features/NetworkGraph/hooks/useNetworkGraphInteractions.ts";

export const NetworkGraph = () => {
    const { data } = useNetworkGraph();

    const { nodes, links } = data ?? { nodes: [], links: [] };

    const canvasRef = useRef<HTMLCanvasElement>(null);
    useNetworkGraphSimulation({ nodes, links, canvasRef });
    useNetworkGraphInteractions({ nodes, links, canvasRef });

    return (
        <div className="graph-container" style={{
                position: "relative",
                width: "100%",
                height: "100%",
            }}>
            <canvas id={"graphCanvas"} ref={canvasRef}/>

            {/*{popup && (<div  style={{*/}
            {/*    color: "black",*/}
            {/*    backgroundColor: "darkgrey",*/}
            {/*    border: "2px",*/}
            {/*    position: "absolute",*/}
            {/*    left: popup.x,*/}
            {/*    top: popup.y,*/}
            {/*    transform: "translate(-50%, -110%)", // center above node*/}
            {/*    zIndex: 10,*/}
            {/*    pointerEvents: "auto",*/}
            {/*}}> Heres a popup</div>)}*/}

        </div>
    )
}
