import { useEffect, type RefObject } from "react";
import { forceSimulation, forceLink, forceX, forceY, forceCollide, forceManyBody } from "d3";
import type { Simulation } from "d3";
import type { Node, Link, HubLink, Group } from "@/types/network-graph.types.ts"

interface UseNetworkGraphSimulationArgs {
    nodes: Node[];
    links: Link[];
    canvasRef: RefObject<HTMLCanvasElement | null>;
}

type NodeGroupCenters = {
    people: [number, number];
    mail: [number, number];
    file: [number, number];
    issue: [number, number];
}

/**
 *  Runs physics simulation to determine initial position of nodes and links in the Network Graph
 *
 *  Note:
 *  - D3.js force simulation is used to calculate the positions of all nodes and links
 *  - Nodes and link objects are mutated by D3.js force simulation to contain position values x and y
 */
export function useNetworkGraphSimulation({ nodes, links, canvasRef }: UseNetworkGraphSimulationArgs) {
    useEffect(() => {
        if (!canvasRef.current) return;
        if (!nodes.length || !links.length) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const forceStrength = -100;
        const nodeRadiusMultiplier = 11;
        const nodePadding = 6;

        const c = calculateNodeGroupCenters(canvas.width, canvas.height);
        const hubs = buildHubs(nodes);
        const hubLinks: HubLink[] = buildHubLinks(nodes, hubs);

        const sim = forceSimulation(nodes)
            .force("link", forceLink<Node, Link>(links).id(d => d.id).distance(80).strength(0.05))
            .force("hubLinks", forceLink<Node, HubLink>(hubLinks).distance(40).strength(0.2))
            .force("x", forceX<Node>(d => c[d.group][0]).strength(0.2))
            .force("y", forceY<Node>(d => c[d.group][1]).strength(0.2))
            .force("collide", forceCollide<Node>().radius(d => d.value * nodeRadiusMultiplier + nodePadding))
            .force("charge", forceManyBody().strength(forceStrength));

        sim.alpha(1);
        for (let i = 0; i < 300; i++) sim.tick();
        clearForces(sim as Simulation<Node, Link>);
        sim.stop();

        return () => {
            clearForces(sim as Simulation<Node, Link>);
            sim.stop();
        };
    }, [nodes, links, canvasRef]);
}

function calculateNodeGroupCenters(canvasWidth: number, canvasHeight: number): NodeGroupCenters {
    return {
        people: [canvasWidth * 0.5, canvasHeight * 0.4],
        mail:   [canvasWidth * 0.8, canvasHeight * 0.3],
        file:   [canvasWidth * 0.25, canvasHeight * 0.4],
        issue:  [canvasWidth * 0.8, canvasHeight * 0.6],
    }
}

function buildHubs(nodes: Node[]) {
    const hubs: Partial<Record<Group, Node>> = {};

    for (const n of nodes) {
        const existing = hubs[n.group];
        if (!existing || n.value > existing.value) {
            hubs[n.group] = n;
        }
    }

    return hubs;
}

function buildHubLinks(nodes: Node[], hubs: Partial<Record<Group, Node>>) {
    return nodes
        .filter(n => hubs[n.group] && !isHub(n, hubs as Record<Group, Node>))
        .map(n => ({ source: hubs[n.group]!, target: n }));
}

function isHub (d: Node, hubs: Record<Group, Node>) {
    return hubs[d.group] === d;
}

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