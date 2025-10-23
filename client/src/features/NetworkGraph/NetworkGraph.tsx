import { useRef, useEffect } from 'react';
import { useDummyData } from "../../hooks/useDummyData.ts";
import './NetworkGraph.css';

import { forceX, forceY, forceSimulation, select, drag, pointer, forceCollide, forceManyBody,
    forceLink,
    type DragBehavior
} from "d3";

import type { Simulation } from "d3";
import type { Link, Node, Group, HubLink } from "../../types/network-graph.types.ts";

export const NetworkGraph = () => {
    const { data } = useDummyData();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const centers = (w: number, h: number) => ({
        people: [w * 0.5, h * 0.4],
        mail:   [w * 0.8, h * 0.3],
        file:   [w * 0.25, h * 0.4],
        issue:  [w * 0.8, h * 0.6],
    });

    // Helper function for clearing forces
    function clearForces(sim: Simulation<Node, Link>) {
        sim
            .force('x', null)
            .force('y', null)
            .force('collide', null)
            .force('charge', null)
            .force('link', null)
            .force('hubLinks', null)
            .velocityDecay(1); // stop inertia
    }

    // Apply forces for simulation
    useEffect(() => {
        const radius = 40;
        const forceStrength = -100;
        const nodeRadiusMultiplier = 11;
        const nodePadding = 6;

        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        const c = centers(canvas.width, canvas.height);

        const links: Link[] = data.links.map((d) => ({ ...d }));
        const nodes: Node[] = data.nodes.map((d) => ({ ...d }));

        const nodeHighlightMap = new Map();

        data.nodes.forEach((p) => {
           nodeHighlightMap.set(p.id, { highlightStatus: 0 });
        });

        const resize = () => {
            if (!container) return;
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resize();

        // Hub nodes that serve as the center of each group, determined by size of the node
        const hubs: Record<Group, Node> = {
            people: nodes.filter(n => n.group === 'people').reduce((a,b)=> a.value>b.value?a:b),
            mail:   nodes.filter(n => n.group === 'mail').reduce((a,b)=> a.value>b.value?a:b),
            file:   nodes.filter(n => n.group === 'file').reduce((a,b)=> a.value>b.value?a:b),
            issue:  nodes.filter(n => n.group === 'issue').reduce((a,b)=> a.value>b.value?a:b),
        };

        // Helper for determining if a node is a hub node
        const isHub = (d: Node) => hubs[d.group] === d;

        const hubLinks: HubLink[] = nodes
            .filter(n => !isHub(n))
            .map(n => ({ source: hubs[n.group], target: n }));

        // Initialize forces for physics simulation
        const physicsSimulation = forceSimulation(nodes)
            .force('link', forceLink<Node, Link>(links).id((d) => d.id)
                .distance(80)          // tighter cluster around hub
                .strength(0.05))         // stronger pull to the hub
            .force('hubLinks', forceLink<Node, HubLink>(hubLinks)
                .distance(40)          // tighter cluster around hub
                .strength(0.2)         // stronger pull to the hub
            )
            .force("x", forceX<Node>(d => c[d.group][0]).strength(0.2))
            .force("y", forceY<Node>(d => c[d.group][1]).strength(0.2))
            .force('collide', forceCollide<Node>().radius(d => d.value * nodeRadiusMultiplier + nodePadding))
            .force('charge', forceManyBody().strength(forceStrength));

        // Reset the simulation
        physicsSimulation.alpha(1);

        // Run the simulation for some time and then stop it
        for (let i = 0; i < 300; i++) physicsSimulation.tick();
        clearForces(physicsSimulation);
        physicsSimulation.stop();

        // Grab context (used for drawing) from canvas
        const context = canvas.getContext("2d");
        if (!context) return;

        // Helper function for drawing a single node based on its group
        const drawNodeByGroup = (node: Node, context: CanvasRenderingContext2D) => {
            if (!hasPos(node)) return;

            // Sets color of node according to group
            switch (node.group) {
                case "people":
                    context.fillStyle = 'black';
                    break;
                case "mail":
                    context.fillStyle = '#add8e6';
                    break;
                case 'file':
                    context.fillStyle = '#fafad2';
                    break;
                case 'issue':
                    context.fillStyle = '#0052cc';
            }


            // Creates a text label for the node
            const label = (node as Node).id ?? node.id ?? "";
            if (!label) return;

            // Draws the node
            context.save();
            if (nodeHighlightMap.get(node.id).highlightStatus == -1) {
                context.globalAlpha = 0.2;
            }

            context.beginPath();
            context.moveTo(node.x + radius, node.y);
            context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
            context.fill();


            // Set text attributes
            const px = Math.round(Math.max(10, Math.min(24, node.value * nodeRadiusMultiplier * 0.6)));
            context.font = `${px}px Roboto, sans-serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillStyle = 'black';

            // If the node is of group people, then set text color to white (to contrast the black node)
            if (node.group == 'people' as Group) {
                context.fillStyle = 'white';
            }

            // Draws the text
            context.fillText(label, node.x, node.y);
            context.restore();
        };

        // Function for drawing the network graph
        const drawGraph = (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
            context.clearRect(0, 0, canvas.width, canvas.height);

            links.forEach((link) => {
                if (!isNode(link.source) || !isNode(link.target)) return;

                const s = link.source, t = link.target;
                if (!hasPos(s) || !hasPos(t)) return;

                context.beginPath();
                context.moveTo(s.x, s.y);
                context.lineTo(t.x, t.y);
                context.stroke();
                context.strokeStyle = "grey";
            });

            nodes.forEach((node) => {
                drawNodeByGroup(node, context);
            })

        };

        drawGraph(context, canvas);

        // Finds the topmost node under (x,y)
        const findNodeAt = (x: number, y: number): Node | undefined => {
            // iterate in reverse draw order so on top wins
            for (let i = nodes.length - 1; i >= 0; i--) {
                const n = nodes[i];
                if (!hasPos(n)) continue;
                const r = n.value * nodeRadiusMultiplier;
                const dx = x - n.x!;
                const dy = y - n.y!;
                if (dx*dx + dy*dy <= r*r) return n;
            }
            return undefined;
        };

        const dragBehavior = drag<HTMLCanvasElement, unknown>()
            .subject((event) => {
                const [x, y] = pointer(event, canvas);

                // find nearest node within radius
                const n = findNodeAt(x, y);

                if (n) {
                    n.fx = n.x ?? x;
                    n.fy = n.y ?? y;
                }

                return n;
            })
            .on('drag', (event) => {
                const n = event.subject;
                n.x = event.x;
                n.y = event.y;
                drawGraph(context, canvas);
            });

        select(canvas).call(dragBehavior as DragBehavior<HTMLCanvasElement, unknown, unknown>);

        // Double-click handler
        const onNodeDoubleClick = (node: Node) => {
            if (!hasPos(node)) return;
            const selectedNode = nodeHighlightMap.get(node.id);
            if (selectedNode.highlightStatus == 0) {
                selectedNode.highlightStatus = 1;
                for (const [key, value] of nodeHighlightMap) {
                    if (key != node.id) {
                        value.highlightStatus = -1;
                    }
                }
            } else if (selectedNode.highlightStatus == 1) {
                selectedNode.highlightStatus = 0;
                for (const [key, value] of nodeHighlightMap) {
                    if (key != node.id) {
                        value.highlightStatus = 0;
                    }
                }
            }

            drawGraph(context, canvas);
        };


        // Double-click listener
        const handleDblClick = (event: MouseEvent) => {
            event.preventDefault();
            const [x, y] = pointer(event, canvas);
            const hit = findNodeAt(x, y);
            if (hit) onNodeDoubleClick(hit);
        };

        // Attach double-click listener to canvas
        select(canvas).on('dblclick', handleDblClick);

        const ro = new ResizeObserver(() => {
            resize();
            drawGraph(context, canvas);
        })

        if (!container) return;
        ro.observe(container);
        return () => ro.disconnect();

    }, [data]);

    return (
        <canvas id={"graphCanvas"} ref={canvasRef}/>
    )
}

function isNode(v: Link["source"]): v is Node {
    return typeof v === "object" && v !== null;
}

function hasPos(n: Node): n is Node & { x: number; y: number } {
    return n.x != null && n.y != null;
}
