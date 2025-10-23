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

        // Helper for determining hub nodes
        const isHub = (d: Node) => hubs[d.group] === d;

        const hubLinks: HubLink[] = nodes
            .filter(n => !isHub(n))
            .map(n => ({ source: hubs[n.group], target: n }));

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


        physicsSimulation.alpha(1);
        for (let i = 0; i < 300; i++) physicsSimulation.tick();
        clearForces(physicsSimulation);
        physicsSimulation.stop();

        const context = canvas.getContext("2d");
        if (!context) return;

        // Helper function for drawing a single node based on its group
        const drawNodeByGroup = (node: Node, context: CanvasRenderingContext2D) => {
            if (!node.x || !node.y) {
                return;
            }

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

            const label = (node as Node).id ?? node.id ?? "";
            if (!label) return;

            context.beginPath();
            context.moveTo(node.x + radius, node.y);
            context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
            context.fill();

            const px = Math.round(Math.max(10, Math.min(24, node.value * nodeRadiusMultiplier * 0.6)));
            context.font = `${px}px Roboto, sans-serif`;
            context.textAlign = "center";
            context.textBaseline = "middle";


            context.fillStyle = 'black';
            if (node.group == 'people' as Group) {
                context.fillStyle = 'white';
            }

            context.fillText(label, node.x, node.y);

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

        const dragBehavior = drag<HTMLCanvasElement, unknown>()
            .subject((event) => {
                const [x, y] = pointer(event, canvas);
                // find nearest node within ~2*radius
                const n = physicsSimulation.find(x, y, radius) as Node | undefined;

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

        // Double-click handler
        const onNodeDoubleClick = (node: Node) => {
            if (!hasPos(node)) return;
            context.fillStyle = 'green';
            context.beginPath();
            context.moveTo(node.x + radius, node.y);
            context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
            context.fill();
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
