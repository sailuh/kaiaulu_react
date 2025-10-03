import { useRef, useEffect } from 'react';
import './NetworkGraph.css';
import * as d3 from "d3";
import type { Link, Node } from "../../types/network-graph.types.ts";
import type { NetworkGraphProps } from "./types.ts";

export const NetworkGraph = ({ data } : NetworkGraphProps ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const links: Link[] = data.links.map((d) => ({ ...d }));
    const nodes: Node[] = data.nodes.map((d) => ({ ...d }));

    const width = 400;
    const height = 400;
    const radius = 10;

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!context) {
            return;
        }

        // run d3-force to find the position of nodes on the canvas
        d3.forceSimulation(nodes)

            // list of forces we apply to get node positions
            .force(
                'link',
                d3.forceLink<Node, Link>(links).id((d) => d.id)
            )
            .force('collide', d3.forceCollide().radius(radius))
            .force('charge', d3.forceManyBody())
            .force('center', d3.forceCenter(width / 2, height / 2))

            // at each iteration of the simulation, draw the network diagram with the new node positions
            .on('tick', () => {
                context.clearRect(0, 0, width, height);

                links.forEach((link) => {
                    context.beginPath();
                    context.moveTo(link.source.x, link.source.y);
                    context.lineTo(link.target.x, link.target.y);
                    context.stroke();
                    context.strokeStyle = "white";
                });

                nodes.forEach((node) => {
                    if (!node.x || !node.y) {
                        return;
                    }

                    context.beginPath();
                    context.moveTo(node.x + radius, node.y);
                    context.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                    context.fillStyle = 'white';
                    context.fill();
                });
            });
    }, [nodes, links])

    return (
        <div id={"networkGraph"}>
            <canvas id={"graphCanvas"} ref={canvasRef} width={400} height={400} />
        </div>
    )
}