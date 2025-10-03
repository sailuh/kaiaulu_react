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
    const forceStrength = -10;


    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext("2d");

        if (!context) {
            return;
        }

        // run d3-force to find the position of nodes on the canvas
        const simulation = d3.forceSimulation(nodes)

            // list of forces we apply to get node positions
            .force(
                'link',
                d3.forceLink<Node, Link>(links).id((d) => d.id)
            )
            .force('collide', d3.forceCollide().radius(10))
            .force('charge', d3.forceManyBody().strength(forceStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))

            // at each iteration of the simulation, draw the network diagram with the new node positions
            .on('tick', () => {
                context.clearRect(0, 0, width, height);

                links.forEach((link) => {
                    if (!isNode(link.source) || !isNode(link.target)) return;
                    const s = link.source, t = link.target;
                    if (!hasPos(s) || !hasPos(t)) return;

                    context.beginPath();
                    context.moveTo(s.x, s.y);
                    context.lineTo(t.x, t.y);
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

                const drag = d3
                    .drag<HTMLCanvasElement, unknown>()
                    .subject((event) => {
                        const [x, y] = d3.pointer(event, canvas);

                        // find nearest node within ~2*radius
                        const n = simulation.find(x, y, radius * 2) as Node | undefined;

                        if (n) {
                            n.fx = n.x ?? x;
                            n.fy = n.y ?? y;
                        }

                        return n;
                    })
                    .on('start', (event) => {
                        if (!event.active) simulation.alphaTarget(0.3).restart();
                    })
                    .on('drag', (event) => {
                        const n = event.subject;
                        n.fx = event.x;
                        n.fy = event.y;
                    })
                    .on('end', (event) => {
                        if (!event.active) simulation.alphaTarget(0);
                        const n = event.subject;
                        n.fx = null;
                        n.fy = null;
                    });

                d3.select(canvas).call(drag as any);
            });
    }, [nodes, links])

    return (
        <div id={"networkGraph"}>
            <canvas id={"graphCanvas"} ref={canvasRef} width={400} height={400} />
        </div>
    )
}

function isNode(v: Link["source"]): v is Node {
    return typeof v === "object" && v !== null;
}

function hasPos(n: Node): n is Node & { x: number; y: number } {
    return n.x != null && n.y != null;
}
