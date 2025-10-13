// import { useRef, useEffect, useCallback } from 'react';
// import './NetworkGraph.css';
// import {
//     forceSimulation,
//     select,
//     drag,
//     pointer,
//     forceCollide,
//     forceManyBody,
//     forceLink,
//     forceCenter,
//     type ForceLink
// } from "d3";
// import type { Simulation } from "d3";
// import type { Link, Node } from "../../types/network-graph.types.ts";
// import type { NetworkGraphProps } from "./types.ts";
//
// export const NetworkGraph = ({ data } : NetworkGraphProps ) => {
//     const canvasRef = useRef<HTMLCanvasElement>(null);
//
//     const simulationArrayRef = useRef<Array<Simulation<Node, Link>>>(null);
//     const simulationRef = useRef<Simulation<Node, Link>>(null);
//
//     const peopleNodes: Node[] = data.nodes.filter(n => n.group === "people").map(n => ({ ...n }));
//     const mailNodes: Node[] = data.nodes.filter(n => n.group === "mail").map(n => ({ ...n }));
//     const fileNodes: Node[] = data.nodes.filter(n => n.group === "file").map(n => ({ ...n }));
//     const issueNodes: Node[] = data.nodes.filter(n => n.group === "issue").map(n => ({ ...n }));
//
//
//     const links: Link[] = data.links.map((d) => ({ ...d }));
//     const nodes: Node[] = data.nodes.map((d) => ({ ...d }));
//
//     const radius = 30;
//     const forceStrength = -10;
//     const nodeRadiusMultiplier = 10;
//
//     if (!simulationArrayRef.current) {
//         simulationArrayRef.current = new Array<Simulation<Node, Link>>();
//         simulationArrayRef.current.push(forceSimulation(peopleNodes));
//         simulationArrayRef.current.push(forceSimulation(mailNodes));
//         simulationArrayRef.current.push(forceSimulation(fileNodes));
//         simulationArrayRef.current.push(forceSimulation(issueNodes));
//     }
//
//
//
//     // // New draw function called on every tick of a simulation
//     // const newDrawGraph = useCallback((context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
//     //     context.clearRect(0, 0, canvas.width, canvas.height);
//     //     if (!simulationArrayRef.current) return;
//     //
//     //     links.forEach((link) => {
//     //         if (!isNode(link.source) || !isNode(link.target)) return;
//     //
//     //         const s = link.source, t = link.target;
//     //         if (!hasPos(s) || !hasPos(t)) return;
//     //
//     //         context.beginPath();
//     //         context.moveTo(s.x, s.y);
//     //         context.lineTo(t.x, t.y);
//     //         context.stroke();
//     //         context.strokeStyle = "green";
//     //     });
//     //
//     //     peopleNodes.forEach((node) => {
//     //         if (!node.x || !node.y) {
//     //             return;
//     //         }
//     //
//     //         context.beginPath();
//     //         context.moveTo(node.x + radius, node.y);
//     //         context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//     //         context.fillStyle = 'black';
//     //         context.fill();
//     //     });
//     //
//     //     mailNodes.forEach((node) => {
//     //         if (!node.x || !node.y) {
//     //             return;
//     //         }
//     //
//     //         context.beginPath();
//     //         context.moveTo(node.x + radius, node.y);
//     //         context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//     //         context.fillStyle = 'LightBlue';
//     //         context.fill();
//     //     });
//     //
//     //     fileNodes.forEach((node) => {
//     //         if (!node.x || !node.y) {
//     //             return;
//     //         }
//     //
//     //         context.beginPath();
//     //         context.moveTo(node.x + radius, node.y);
//     //         context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//     //         context.fillStyle = 'yellow';
//     //         context.fill();
//     //     });
//     //
//     //     issueNodes.forEach((node) => {
//     //         if (!node.x || !node.y) {
//     //             return;
//     //         }
//     //
//     //         context.beginPath();
//     //         context.moveTo(node.x + radius, node.y);
//     //         context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//     //         context.fillStyle = 'blue';
//     //         context.fill();
//     //     });
//
//
//
//
//         // nodes.forEach((node) => {
//         //     if (!node.x || !node.y) {
//         //         return;
//         //     }
//         //
//         //     context.beginPath();
//         //     context.moveTo(node.x + radius, node.y);
//         //     context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//         //
//         //     switch (node.group) {
//         //         case "mail":
//         //             context.fillStyle = 'LightBlue';
//         //             break;
//         //         case "issue":
//         //             context.fillStyle = 'blue';
//         //             break;
//         //         case "people":
//         //             context.fillStyle = 'black';
//         //             break;
//         //         case "file":
//         //             context.fillStyle = 'yellow';
//         //     }
//         //
//         //     context.fill();
//         //
//         // });
//
//     // }, []);
//
//
//     // Apply forces for each simulation
//     // useEffect(() => {
//     //     if (!simulationArrayRef.current) return;
//     //
//     //     if (!canvasRef.current) return;
//     //     const canvas = canvasRef.current;
//     //     const context = canvas.getContext("2d");
//     //
//     //     const container = canvas.parentElement;
//     //     if (!container) return;
//     //
//     //     if (!context) return;
//     //
//     //     simulationArrayRef.current.forEach((simulation) => {
//     //             simulation
//     //                 .force('collide', forceCollide().radius(radius))
//     //                 .force('charge', forceManyBody().strength(forceStrength))
//     //                 .force('center', forceCenter(canvas.width/2, canvas.height/2))
//     //                 .on('tick', () => {
//     //                     newDrawGraph(context, canvas)
//     //                     if (!simulationRef.current) return;
//     //                     simulationRef.current.force('center', null as any);
//     //                     simulationRef.current.force('link', null as any);
//     //                 });
//     //         }
//     //     );
//     //
//     //     const resize = () => {
//     //         const rect = container.getBoundingClientRect();
//     //         canvas.width = rect.width;
//     //         canvas.height = rect.height;
//     //     };
//     //
//     //     const ro = new ResizeObserver(resize);
//     //     ro.observe(container);
//     //     resize();
//     //
//     //     return () => ro.disconnect();
//     // }, [canvasRef, simulationArrayRef]);
//
//     if (!simulationRef.current) {
//         simulationRef.current = forceSimulation(nodes).force(
//             'link',
//             forceLink<Node, Link>(links).id((d) => d.id)
//         )
//             .force('collide', forceCollide().radius(radius))
//             .force('charge', forceManyBody().strength(forceStrength));
//     }
//
//     // Helper function called every tick of the simulation, draws the nodes and links at their calculated position on that tick
//     const drawGraph = useCallback((context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
//         context.clearRect(0, 0, canvas.width, canvas.height);
//         if (!simulationRef.current) return;
//
//         links.forEach((link) => {
//             if (!isNode(link.source) || !isNode(link.target)) return;
//
//             const s = link.source, t = link.target;
//             if (!hasPos(s) || !hasPos(t)) return;
//
//             context.beginPath();
//             context.moveTo(s.x, s.y);
//             context.lineTo(t.x, t.y);
//             context.stroke();
//             context.strokeStyle = "green";
//         });
//
//         nodes.forEach((node) => {
//             if (!node.x || !node.y) {
//                 return;
//             }
//
//             context.beginPath();
//             context.moveTo(node.x + radius, node.y);
//             context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
//
//             switch (node.group) {
//                 case "mail":
//                     context.fillStyle = 'LightBlue';
//                     break;
//                 case "issue":
//                     context.fillStyle = 'blue';
//                     break;
//                 case "people":
//                     context.fillStyle = 'black';
//                     break;
//                 case "file":
//                     context.fillStyle = 'yellow';
//             }
//
//             context.fill();
//
//         });
//
//     }, []);
//
//     useEffect(() => {
//
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//
//         const container = canvas.parentElement;
//         if (!container) return;
//
//         if (!simulationRef.current) return;
//         simulationRef.current.force('center', forceCenter(canvas.width/2, canvas.height/2));
//
//         const resize = () => {
//             const rect = container.getBoundingClientRect();
//             canvas.width = rect.width;
//             canvas.height = rect.height;
//         };
//
//         const ro = new ResizeObserver(resize);
//         ro.observe(container);
//         resize();
//
//         return () => ro.disconnect();
//     }, [canvasRef]);
//     //
//
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;
//
//         const context = canvas.getContext("2d");
//         if (!context) return;
//
//         if (!simulationRef.current) return;
//
//
//
//         simulationRef.current.on('tick', () => {
//             drawGraph(context, canvas)
//             if (!simulationRef.current) return;
//                 simulationRef.current.force('center', null as any);
//                 simulationRef.current.force('link', null as any);
//         });
//
//         const dragBehavior = drag<HTMLCanvasElement, unknown>()
//             .subject((event) => {
//                 const [x, y] = pointer(event, canvas);
//                 if (!simulationRef.current) return;
//
//                 // find nearest node within ~2*radius
//                 const n = simulationRef.current.find(x, y, radius * 2) as Node | undefined;
//
//                 if (n) {
//                     n.fx = n.x ?? x;
//                     n.fy = n.y ?? y;
//                 }
//
//                 return n;
//             })
//             .on('drag', (event) => {
//                 if (!simulationRef.current) return;
//                 const n = event.subject;
//                 n.fx = event.x;
//                 n.fy = event.y;
//
//                 if (simulationRef.current.alpha() < 0.03) simulationRef.current.alpha(0.03).restart();
//             })
//             .on('end', (event) => {
//                 if (!simulationRef.current) return;
//
//                 const n = event.subject;
//                 n.fx = null;
//                 n.fy = null;
//
//                 const linkForce = simulationRef.current.force<ForceLink<Node, Link>>('link');
//                 if (linkForce) {
//                     linkForce.strength(0.1);
//                 }
//
//                 simulationRef.current.alpha(Math.max(simulationRef.current.alpha(), 0.05)).alphaTarget(0);
//             });
//
//         select(canvas).call(dragBehavior as any);
//
//
//     }, [canvasRef, nodes, links]);
//
//     return (
//         <canvas id={"graphCanvas"} ref={canvasRef}/>
//     )
// }
//
// function isNode(v: Link["source"]): v is Node {
//     return typeof v === "object" && v !== null;
// }
//
// function hasPos(n: Node): n is Node & { x: number; y: number } {
//     return n.x != null && n.y != null;
// }
