import { useRef, useEffect, useCallback } from 'react';
import './NetworkGraph.css';
import {
    forceX,
    forceY,
    forceSimulation,
    select,
    drag,
    pointer,
    forceCollide,
    forceManyBody,
    forceLink
} from "d3";
import type { Simulation } from "d3";
import type { Link, Node, Group } from "../../types/network-graph.types.ts";
import type { NetworkGraphProps } from "./types.ts";

export const NetworkGraph = ({ data } : NetworkGraphProps ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const simulationRef = useRef<Simulation<Node, Link>>(null);

    const links: Link[] = data.links.map((d) => ({ ...d }));
    const nodes: Node[] = data.nodes.map((d) => ({ ...d }));


    // Hub nodes that serve as the center of each group, determined by size of the node
    const hubs: Record<Group, Node> = {
        people: nodes.filter(n => n.group === 'people').reduce((a,b)=> a.value>b.value?a:b),
        mail:   nodes.filter(n => n.group === 'mail').reduce((a,b)=> a.value>b.value?a:b),
        file:   nodes.filter(n => n.group === 'file').reduce((a,b)=> a.value>b.value?a:b),
        issue:  nodes.filter(n => n.group === 'issue').reduce((a,b)=> a.value>b.value?a:b),
    };

    // Helper for determining hub nodes
    const isHub = useCallback((d: Node) => hubs[d.group] === d, []);

    type HubLink = { source: Node; target: Node };
    const hubLinks: HubLink[] = nodes
        .filter(n => !isHub(n))
        .map(n => ({ source: hubs[n.group], target: n }));

    const radius = 40;
    const forceStrength = -100;
    const nodeRadiusMultiplier = 11;
    const nodePadding = 6;

    // Helper that takes canvas width and height and returns center coordinate for each group
    const centers = (w: number, h: number) => ({
        people: [w * 0.5, h * 0.4],
        mail:   [w * 0.8, h * 0.3],
        file:   [w * 0.25, h * 0.4],
        issue:  [w * 0.8, h * 0.6],
    });

    // Initialize force simulation with nodes and links
    if (!simulationRef.current) {
        simulationRef.current = forceSimulation(nodes)
            .force('link', forceLink<Node, Link>(links).id((d) => d.id)
                .distance(80)          // tighter cluster around hub
                .strength(0.05))         // stronger pull to the hub)
            .force('hubLinks', forceLink<Node, HubLink>(hubLinks)
                .distance(40)          // tighter cluster around hub
                .strength(0.2)         // stronger pull to the hub
        );
    }

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

    // Function for drawing the network graph that is called on each tick of the simulation
    const drawGraph = useCallback((context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (!simulationRef.current) return;

        links.forEach((link) => {
            if (!isNode(link.source) || !isNode(link.target)) return;
            console.log("this link has a source and target");

            const s = link.source, t = link.target;
            if (!hasPos(s) || !hasPos(t)) return;

            console.log(s);
            console.log(t);

            context.beginPath();
            context.moveTo(s.x, s.y);
            context.lineTo(t.x, t.y);
            context.stroke();
            context.strokeStyle = "grey";
        });

        nodes.forEach((node) => {
            drawNodeByGroup(node, context);
        })

    }, []);

    // Helper function for drawing a single node based on its group
    const drawNodeByGroup = useCallback((node: Node, context: CanvasRenderingContext2D) => {
        if (!node.x || !node.y) {
            return;
        }

        switch (node.group) {
            case "people":
                context.fillStyle = 'black';
                break;
            case "mail":
                context.fillStyle = 'LightBlue';
                break;
            case 'file':
                context.fillStyle = 'yellow';
                break;
            case 'issue':
                context.fillStyle = 'blue';
        }

        const label = (node as Node).id ?? node.id ?? "";
        if (!label) return;

        context.beginPath();
        context.moveTo(node.x + radius, node.y);
        context.arc(node.x, node.y, node.value * nodeRadiusMultiplier, 0, 2 * Math.PI);
        context.fill();

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = '#fff';
        context.fillText(label, node.x, node.y);

    }, []);


    // Apply forces for simulation
    useEffect(() => {
        if (!simulationRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const container = canvas.parentElement;
        if (!container) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };
        resize();

        const c = centers(canvas.width, canvas.height);

        simulationRef.current
            .force("x", forceX<Node>(d => c[d.group][0]).strength(0.2))
            .force("y", forceY<Node>(d => c[d.group][1]).strength(0.2))
            .force('collide', forceCollide<Node>().radius(d => d.value * nodeRadiusMultiplier + nodePadding))
            .force('charge', forceManyBody().strength(forceStrength));

        simulationRef.current.alpha(1);
        for (let i = 0; i < 300; i++) simulationRef.current.tick();

        drawGraph(context, canvas);
        clearForces(simulationRef.current);

        simulationRef.current.on("tick", null);
        simulationRef.current.stop();


        const dragBehavior = drag<HTMLCanvasElement, unknown>()
            .subject((event) => {
                const [x, y] = pointer(event, canvas);
                if (!simulationRef.current) return;

                // find nearest node within ~2*radius
                const n = simulationRef.current.find(x, y, radius) as Node | undefined;

                if (n) {
                    n.fx = n.x ?? x;
                    n.fy = n.y ?? y;
                }

                return n;
            })
            .on('drag', (event) => {
                if (!simulationRef.current) return;
                const n = event.subject;
                n.x = event.x;
                n.y = event.y;
                drawGraph(context, canvas);
            });

        select(canvas).call(dragBehavior as any);

        const ro = new ResizeObserver(() => {
            resize();
            drawGraph(context, canvas);
        })

        ro.observe(container);
        return () => ro.disconnect();
    }, [canvasRef, simulationRef]);

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
